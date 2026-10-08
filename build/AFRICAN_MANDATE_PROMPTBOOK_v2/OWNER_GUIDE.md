# Owner guide: how to execute one prompt

1. Attach the exact repository and canonical source directory to the coding agent. Provide Build Preparation v1 and this v2 promptbook in the repository.
2. Start at Prompt 00. Paste one `prompts/NN_*.md` file, plus COMMON_AGENT_RULES if agent cannot read the repository. Do not send the entire numbered series as one task.
3. The agent must create real code/artifacts and provide tests; `READY_FOR_REVIEW` is not acceptance.
4. Review the handoff: files touched, exact commands/results, tests intentionally not run, unexpected changes and blockers. Confirm tests with an independent reviewer or separate verification agent.
5. Record ACCEPTED in BUILD_STATE only after verification and approval; then submit the next prompt. If BLOCKED, address the named dependency rather than authorizing fabricated substitutes.
6. Prompts 00–24 target synthetic engineering and a provisional UI; 25–29 are separate, approval-dependent production and release tracks. An early prototype may be demoed as TEST_ONLY, never as a validated Sahel baseline.

**Review questions:** Does the delivered feature actually work? Did the agent use approved definitions? Are historical and synthetic data distinct? Are tests independently grounded? Were dependencies and negative cases exercised? What remains unproven?
