import copy
import hashlib
import json
import re
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
STATE_PATH = REPO_ROOT / "docs" / "build" / "BUILD_STATE.json"
SCHEMA_PATH = REPO_ROOT / "docs" / "build" / "schemas" / "build-state.schema.json"
MANIFEST_PATH = REPO_ROOT / "docs" / "build" / "SOURCE_MANIFEST.md"


def load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def validate_state(state: dict, schema: dict) -> list[str]:
    errors: list[str] = []
    expected_prompts = {f"{number:02d}" for number in range(30)}
    statuses = set(schema["$defs"]["promptState"]["properties"]["status"]["enum"])

    if set(state) != {"schemaVersion", "sourceManifestHash", "prompts"}:
        errors.append("root fields do not match the public schema")
    if state.get("schemaVersion") != schema["properties"]["schemaVersion"]["const"]:
        errors.append("schemaVersion is not supported")
    if not re.fullmatch(r"[0-9a-f]{64}", state.get("sourceManifestHash", "")):
        errors.append("sourceManifestHash must be lowercase SHA-256")

    prompts = state.get("prompts")
    if not isinstance(prompts, dict) or set(prompts) != expected_prompts:
        errors.append("prompts must contain exactly 00 through 29")
        return errors

    for prompt_id, prompt in prompts.items():
        required = {"status", "approvedCommit", "evidencePath", "approver"}
        if not isinstance(prompt, dict) or set(prompt) != required:
            errors.append(f"{prompt_id}: fields do not match the public schema")
            continue

        status = prompt["status"]
        if status not in statuses:
            errors.append(f"{prompt_id}: invalid status {status!r}")

        is_approved = status in {"ACCEPTED", "DEFERRED_APPROVED"}
        if is_approved:
            if not re.fullmatch(r"[0-9a-f]{40}", prompt["approvedCommit"] or ""):
                errors.append(f"{prompt_id}: approved state requires a commit SHA")
            if not prompt["approver"]:
                errors.append(f"{prompt_id}: approved state requires an approver")
            if not prompt["evidencePath"]:
                errors.append(f"{prompt_id}: approved state requires evidence")
        elif prompt["approvedCommit"] is not None or prompt["approver"] is not None:
            errors.append(f"{prompt_id}: unapproved state cannot claim approval")

        evidence = prompt["evidencePath"]
        if evidence is not None and not evidence.startswith("docs/build/"):
            errors.append(f"{prompt_id}: evidence must stay under docs/build")

    return errors


def transition_allowed(schema: dict, old_status: str, new_status: str) -> bool:
    return new_status in schema["x-allowedTransitions"].get(old_status, [])


def satisfies_hard_prerequisite(status: str) -> bool:
    return status == "ACCEPTED"


class BuildStateContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.state = load_json(STATE_PATH)
        cls.schema = load_json(SCHEMA_PATH)

    def test_current_state_matches_public_contract(self) -> None:
        self.assertEqual([], validate_state(self.state, self.schema))

    def test_source_manifest_hash_is_current(self) -> None:
        digest = hashlib.sha256(MANIFEST_PATH.read_bytes()).hexdigest()
        self.assertEqual(digest, self.state["sourceManifestHash"])

    def test_only_accepted_satisfies_hard_prerequisite(self) -> None:
        for status in self.schema["$defs"]["promptState"]["properties"]["status"]["enum"]:
            with self.subTest(status=status):
                expected = status == "ACCEPTED"
                self.assertEqual(expected, satisfies_hard_prerequisite(status))

    def test_required_transition_paths(self) -> None:
        cases = {
            "BLOCKED": ("IN_PROGRESS", "BLOCKED"),
            "FAILED": ("IN_PROGRESS", "FAILED"),
            "PARTIAL": ("IN_PROGRESS", "PARTIAL"),
            "ACCEPTED": ("READY_FOR_REVIEW", "ACCEPTED"),
        }
        for label, (old_status, new_status) in cases.items():
            with self.subTest(path=label):
                self.assertTrue(transition_allowed(self.schema, old_status, new_status))

    def test_direct_self_approval_is_rejected(self) -> None:
        self.assertFalse(transition_allowed(self.schema, "IN_PROGRESS", "ACCEPTED"))
        self.assertFalse(transition_allowed(self.schema, "NOT_STARTED", "ACCEPTED"))

    def test_accepted_without_independent_record_is_rejected(self) -> None:
        candidate = copy.deepcopy(self.state)
        candidate["prompts"]["12"]["status"] = "ACCEPTED"
        errors = validate_state(candidate, self.schema)
        self.assertIn("12: approved state requires a commit SHA", errors)
        self.assertIn("12: approved state requires an approver", errors)

    def test_unapproved_state_cannot_carry_approval(self) -> None:
        candidate = copy.deepcopy(self.state)
        candidate["prompts"]["12"]["approvedCommit"] = "0" * 40
        candidate["prompts"]["12"]["approver"] = "self"
        errors = validate_state(candidate, self.schema)
        self.assertIn("12: unapproved state cannot claim approval", errors)


if __name__ == "__main__":
    unittest.main()
