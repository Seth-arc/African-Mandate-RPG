import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  MapDocumentProjectionSchema,
  selectMapSubjectById,
  verifyMapDocumentArtifact,
} from "@african-mandate/application";
import {
  DocumentWorkspace,
  MAPLIBRE_DISCLOSABLE_STYLE_PROPERTIES,
  MapDocumentsWorkspace,
} from "@african-mandate/ui";
import mapDocumentArtifact from "../../apps/web/src/test-map-document-artifact.json";

const artifactHash =
  "55b38466a3ce3e58367592749ade0295a1bef36588b63b1c204090bb6b8a8c8f";

const projection = () =>
  verifyMapDocumentArtifact(mapDocumentArtifact, artifactHash);

describe("Prompt 22 map, dossiers, and documents", () => {
  it("verifies the immutable TEST_ONLY artifact and canonical map manifest", () => {
    const result = projection();
    expect(result.classification).toBe("TEST_ONLY_MAP_DOCUMENT_PROJECTION");
    expect(result.renderTransport).toBe("test_inline_geojson");
    expect(result.mapArtifactManifest.crsSource).toBe("EPSG:4326");
    expect(
      result.mapArtifactManifest.sourceLayers.every(
        (layer) =>
          layer.idProperty === "subject_id" &&
          layer.requiredProperties.includes("subject_kind") &&
          layer.requiredProperties.includes("subject_id"),
      ),
    ).toBe(true);
    expect(result.productionGates).toEqual({
      realGeography: "BLOCKED",
      pmtilesPublication: "BLOCKED",
      assetTemporalAdmission: "BLOCKED",
    });
  });

  it("selects only by subject ID and never falls back to display name", () => {
    const result = projection();
    expect(
      selectMapSubjectById(result, "zone_test_epreuve").display_label,
    ).toBe("Synthetic zone Épreuve");
    expect(() =>
      selectMapSubjectById(result, "Synthetic zone Épreuve"),
    ).toThrow(/Unknown subject_id/u);
  });

  it("requires exact map/list equivalence", () => {
    const result = projection();
    const missingListSubject = structuredClone(result);
    missingListSubject.subjects.pop();
    expect(() => MapDocumentProjectionSchema.parse(missingListSubject)).toThrow(
      /equivalent|absent from the map/u,
    );
  });

  it("rejects hidden-state styling fields and exposes only knowledge status", () => {
    const result = projection();
    const hiddenStyle = structuredClone(result);
    Object.assign(hiddenStyle.geometry.features[0]!.properties, {
      hidden_state: "private_actor_intent",
    });
    expect(() => MapDocumentProjectionSchema.parse(hiddenStyle)).toThrow();
    expect(MAPLIBRE_DISCLOSABLE_STYLE_PROPERTIES).toEqual(["knowledge_status"]);
  });

  it("renders synchronized subjects, unknown and missing legend entries, glyphs, and watermark", () => {
    const html = renderToStaticMarkup(
      <MapDocumentsWorkspace projection={projection()} />,
    );
    expect(html).toContain("Simulated · Synthetic test geometry");
    expect(html).toContain("Synthetic territory A");
    expect(html).toContain("Synthetic zone Épreuve");
    expect(html).toContain("Not known");
    expect(html).toContain("Missing from test artifact");
    expect(html).toContain("Burkinabè · Tillabéri · Ŋ");
    expect(html).toContain('data-subject-id="zone_test_epreuve"');
  });

  it("keeps document evidence and office assessment in separate sections", () => {
    const html = renderToStaticMarkup(
      <DocumentWorkspace projection={projection()} />,
    );
    expect(html).toContain("TEST-BRIEF-001");
    expect(html).toContain("Source confidence");
    expect(html).toContain(">Evidence<");
    expect(html).toContain(">Assessment<");
    expect(html).toContain("evidence_test_access_restricted");
    expect(html).toContain("Declared confidence: Moderate");
  });

  it("rejects artifact and geometry hash mismatches", () => {
    expect(() =>
      verifyMapDocumentArtifact(mapDocumentArtifact, "0".repeat(64)),
    ).toThrow(/artifact hash mismatch/u);

    const result = projection();
    const tampered = structuredClone(result);
    tampered.geometry.features[0]!.properties.display_label = "Tampered label";
    expect(() => MapDocumentProjectionSchema.parse(tampered)).toThrow(
      /geometry hash mismatch/u,
    );
  });
});
