import { hashCanonicalJson } from "@african-mandate/simulation";
import { z } from "zod";

import { MapArtifactManifestSchema } from "./artifact-registry.js";
import { CampaignProjectionSchema } from "./projections.js";

export const MAP_DOCUMENT_SCHEMA_VERSION = 1 as const;
export const MAP_DOCUMENT_CONTRACT_VERSION = "0.1.0-test.1" as const;

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/u);
const NonEmptyStringSchema = z.string().min(1);

export const MapSubjectKindSchema = z.enum([
  "territory",
  "zone",
  "asset",
  "corridor",
]);

export const MapKnowledgeStatusSchema = z.enum([
  "known",
  "estimated",
  "unknown",
  "missing",
  "stale",
  "contested",
]);

export const MapFeaturePropertiesSchema = z
  .object({
    subject_kind: MapSubjectKindSchema,
    subject_id: NonEmptyStringSchema,
    source_layer: NonEmptyStringSchema,
    display_label: NonEmptyStringSchema,
    knowledge_status: MapKnowledgeStatusSchema,
  })
  .strict();

const PositionSchema = z.tuple([z.number().finite(), z.number().finite()]);
const PointGeometrySchema = z
  .object({
    type: z.literal("Point"),
    coordinates: PositionSchema,
  })
  .strict();
const LineGeometrySchema = z
  .object({
    type: z.literal("LineString"),
    coordinates: z.array(PositionSchema).min(2),
  })
  .strict();
const PolygonGeometrySchema = z
  .object({
    type: z.literal("Polygon"),
    coordinates: z.array(z.array(PositionSchema).min(4)).min(1),
  })
  .strict();

export const TestMapFeatureSchema = z
  .object({
    type: z.literal("Feature"),
    id: NonEmptyStringSchema,
    properties: MapFeaturePropertiesSchema,
    geometry: z.discriminatedUnion("type", [
      PointGeometrySchema,
      LineGeometrySchema,
      PolygonGeometrySchema,
    ]),
  })
  .strict()
  .superRefine((feature, context) => {
    if (feature.id !== feature.properties.subject_id) {
      context.addIssue({
        code: "custom",
        path: ["id"],
        message: "Feature ID must equal subject_id",
      });
    }
    if (
      feature.geometry.type === "Polygon" &&
      feature.geometry.coordinates.some((ring) => {
        const first = ring[0];
        const last = ring.at(-1);
        return first?.[0] !== last?.[0] || first?.[1] !== last?.[1];
      })
    ) {
      context.addIssue({
        code: "custom",
        path: ["geometry", "coordinates"],
        message: "Synthetic polygon rings must be closed",
      });
    }
  });

export const TestMapGeometrySchema = z
  .object({
    type: z.literal("FeatureCollection"),
    features: z.array(TestMapFeatureSchema).min(1),
  })
  .strict();

export const DossierSectionSchema = z
  .object({
    heading: z.enum([
      "Role",
      "Known position",
      "Estimated position",
      "What is contested",
      "Commitments",
      "What you can do",
      "What remains unknown",
    ]),
    statements: z.array(NonEmptyStringSchema).min(1),
  })
  .strict();

export const SubjectDossierProjectionSchema = z
  .object({
    subject_id: NonEmptyStringSchema,
    title: NonEmptyStringSchema,
    summary: NonEmptyStringSchema,
    sourceConfidence: z.enum([
      "Known",
      "Estimated",
      "Not known",
      "Information unavailable",
      "Last confirmed; may have changed",
      "Contested",
    ]),
    sections: z.array(DossierSectionSchema).min(1),
    evidenceIds: z.array(NonEmptyStringSchema),
    assessmentIds: z.array(NonEmptyStringSchema),
  })
  .strict();

export const MapSubjectProjectionSchema = z
  .object({
    subject_kind: MapSubjectKindSchema,
    subject_id: NonEmptyStringSchema,
    display_label: NonEmptyStringSchema,
    knowledge_status: MapKnowledgeStatusSchema,
    dossier: SubjectDossierProjectionSchema,
  })
  .strict()
  .superRefine((subject, context) => {
    if (subject.subject_id !== subject.dossier.subject_id) {
      context.addIssue({
        code: "custom",
        path: ["dossier", "subject_id"],
        message: "Dossier subject ID must match its map subject",
      });
    }
  });

export const DocumentMetadataProjectionSchema = z
  .object({
    reference: NonEmptyStringSchema,
    date: z.string().date(),
    preparer: NonEmptyStringSchema,
    status: z.enum(["Draft", "Issued", "Superseded"]),
    sourceConfidence: z.enum([
      "Known",
      "Estimated",
      "Not known",
      "Information unavailable",
      "Last confirmed; may have changed",
      "Contested",
    ]),
    classification: z.literal("SIMULATED"),
  })
  .strict();

export const DocumentEvidenceProjectionSchema = z
  .object({
    evidenceId: NonEmptyStringSchema,
    heading: NonEmptyStringSchema,
    statement: NonEmptyStringSchema,
    sourceLabel: NonEmptyStringSchema,
    observedDate: z.string().date().optional(),
    confidence: MapKnowledgeStatusSchema,
  })
  .strict();

export const DocumentAssessmentProjectionSchema = z
  .object({
    assessmentId: NonEmptyStringSchema,
    heading: NonEmptyStringSchema,
    statement: NonEmptyStringSchema,
    declaredConfidence: z.enum(["Low", "Moderate", "High"]),
  })
  .strict();

export const KnowledgeDocumentProjectionSchema = z
  .object({
    documentId: NonEmptyStringSchema,
    kind: z.enum([
      "brief",
      "dossier",
      "intelligence_report",
      "instrument",
      "summary",
    ]),
    metadata: DocumentMetadataProjectionSchema,
    title: NonEmptyStringSchema,
    summary: NonEmptyStringSchema,
    subjectIds: z.array(NonEmptyStringSchema).min(1),
    evidence: z.array(DocumentEvidenceProjectionSchema),
    assessments: z.array(DocumentAssessmentProjectionSchema),
    unknowns: z.array(NonEmptyStringSchema),
  })
  .strict();

export const MapDocumentProjectionSchema = z
  .object({
    schemaVersion: z.literal(MAP_DOCUMENT_SCHEMA_VERSION),
    contractVersion: z.literal(MAP_DOCUMENT_CONTRACT_VERSION),
    classification: z.enum([
      "TEST_ONLY_MAP_DOCUMENT_PROJECTION",
      "SIMULATED_PRODUCTION_MAP_DOCUMENT_PROJECTION",
    ]),
    campaignId: CampaignProjectionSchema.shape.campaignId,
    campaignRevision: CampaignProjectionSchema.shape.campaignRevision,
    mapArtifactManifest: MapArtifactManifestSchema,
    renderTransport: z.enum([
      "test_inline_geojson",
      "verified_local_json_bundle",
    ]),
    geometryHash: Sha256Schema,
    geometry: TestMapGeometrySchema,
    labelGlyphProbe: NonEmptyStringSchema,
    subjects: z.array(MapSubjectProjectionSchema).min(1),
    documents: z.array(KnowledgeDocumentProjectionSchema).min(1),
    productionGates: z
      .object({
        realGeography: z.enum(["BLOCKED", "VERIFIED_LOCAL_ARTIFACT"]),
        pmtilesPublication: z.enum(["BLOCKED", "NOT_REQUIRED"]),
        assetTemporalAdmission: z.enum(["BLOCKED", "NOT_IN_INITIAL_SLICE"]),
      })
      .strict(),
  })
  .strict()
  .superRefine((projection, context) => {
    if (hashCanonicalJson(projection.geometry) !== projection.geometryHash) {
      context.addIssue({
        code: "custom",
        path: ["geometryHash"],
        message: "Map geometry hash mismatch",
      });
    }

    const sourceLayers = new Map(
      projection.mapArtifactManifest.sourceLayers.map((layer) => [
        layer.sourceLayer,
        layer,
      ]),
    );
    const subjects = new Map<string, MapSubjectProjection>();
    projection.subjects.forEach((subject, index) => {
      if (subjects.has(subject.subject_id)) {
        context.addIssue({
          code: "custom",
          path: ["subjects", index, "subject_id"],
          message: `Duplicate subject_id: ${subject.subject_id}`,
        });
      }
      subjects.set(subject.subject_id, subject);
    });

    const featureIds = new Set<string>();
    projection.geometry.features.forEach((feature, index) => {
      const properties = feature.properties;
      if (featureIds.has(properties.subject_id)) {
        context.addIssue({
          code: "custom",
          path: ["geometry", "features", index, "properties", "subject_id"],
          message: `Duplicate map subject_id: ${properties.subject_id}`,
        });
      }
      featureIds.add(properties.subject_id);
      const subject = subjects.get(properties.subject_id);
      if (
        subject === undefined ||
        subject.subject_kind !== properties.subject_kind ||
        subject.display_label !== properties.display_label ||
        subject.knowledge_status !== properties.knowledge_status
      ) {
        context.addIssue({
          code: "custom",
          path: ["geometry", "features", index, "properties"],
          message: "Map feature and subject-list projection must be equivalent",
        });
      }
      const layer = sourceLayers.get(properties.source_layer);
      if (
        layer === undefined ||
        !layer.selectable ||
        layer.subjectKind !== properties.subject_kind ||
        layer.idProperty !== "subject_id" ||
        !["subject_kind", "subject_id"].every((property) =>
          layer.requiredProperties.includes(property),
        )
      ) {
        context.addIssue({
          code: "custom",
          path: ["geometry", "features", index, "properties", "source_layer"],
          message: "Feature does not match a selectable manifest source layer",
        });
      }
    });

    projection.subjects.forEach((subject, index) => {
      if (!featureIds.has(subject.subject_id)) {
        context.addIssue({
          code: "custom",
          path: ["subjects", index, "subject_id"],
          message: "Subject list contains an item that is absent from the map",
        });
      }
    });

    const documentIds = new Set<string>();
    projection.documents.forEach((document, documentIndex) => {
      if (documentIds.has(document.documentId)) {
        context.addIssue({
          code: "custom",
          path: ["documents", documentIndex, "documentId"],
          message: `Duplicate document ID: ${document.documentId}`,
        });
      }
      documentIds.add(document.documentId);
      document.subjectIds.forEach((subjectId, subjectIndex) => {
        if (!subjects.has(subjectId)) {
          context.addIssue({
            code: "custom",
            path: ["documents", documentIndex, "subjectIds", subjectIndex],
            message: `Document references unknown subject ID: ${subjectId}`,
          });
        }
      });
    });
  });

export type MapSubjectKind = z.infer<typeof MapSubjectKindSchema>;
export type MapKnowledgeStatus = z.infer<typeof MapKnowledgeStatusSchema>;
export type TestMapFeature = z.infer<typeof TestMapFeatureSchema>;
export type TestMapGeometry = z.infer<typeof TestMapGeometrySchema>;
export type MapSubjectProjection = z.infer<typeof MapSubjectProjectionSchema>;
export type SubjectDossierProjection = z.infer<
  typeof SubjectDossierProjectionSchema
>;
export type KnowledgeDocumentProjection = z.infer<
  typeof KnowledgeDocumentProjectionSchema
>;
export type MapDocumentProjection = z.infer<typeof MapDocumentProjectionSchema>;

export class MapDocumentArtifactError extends Error {}

export const mapSubjectKey = (subject: {
  readonly subject_kind: MapSubjectKind;
  readonly subject_id: string;
}): string => `${subject.subject_kind}\0${subject.subject_id}`;

export const selectMapSubjectById = (
  projectionValue: MapDocumentProjection,
  subjectId: string,
): MapSubjectProjection => {
  const projection = MapDocumentProjectionSchema.parse(projectionValue);
  const subject = projection.subjects.find(
    (candidate) => candidate.subject_id === subjectId,
  );
  if (subject === undefined) {
    throw new MapDocumentArtifactError(`Unknown subject_id: ${subjectId}`);
  }
  return structuredClone(subject);
};

export const verifyMapDocumentArtifact = (
  value: unknown,
  expectedHash: string,
): MapDocumentProjection => {
  const hash = Sha256Schema.parse(expectedHash);
  const projection = MapDocumentProjectionSchema.parse(value);
  const actualHash = hashCanonicalJson(projection);
  if (actualHash !== hash) {
    throw new MapDocumentArtifactError(
      `Map/document artifact hash mismatch: expected ${hash}, received ${actualHash}`,
    );
  }
  return structuredClone(projection);
};

export const hashMapDocumentArtifact = (value: MapDocumentProjection): string =>
  hashCanonicalJson(MapDocumentProjectionSchema.parse(value));
