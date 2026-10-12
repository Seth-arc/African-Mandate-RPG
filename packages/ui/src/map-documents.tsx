import {
  MapDocumentProjectionSchema,
  selectMapSubjectById,
  type KnowledgeDocumentProjection,
  type MapDocumentProjection,
  type MapKnowledgeStatus,
  type MapSubjectProjection,
  type TestMapFeature,
} from "@african-mandate/application";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type {
  ExpressionSpecification,
  GeoJSONSourceSpecification,
  Map as MapLibreMap,
  Marker as MapLibreMarker,
  StyleSpecification,
} from "maplibre-gl";
import mapLibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";

import "maplibre-gl/dist/maplibre-gl.css";

export const MAPLIBRE_DISCLOSABLE_STYLE_PROPERTIES = [
  "knowledge_status",
] as const;

const mapSourceId = "am-test-geometry";
const mapLayerIds = [
  "am-test-territory-fill",
  "am-test-zone-fill",
  "am-test-corridor-line",
  "am-test-asset-point",
] as const;

const knowledgeLabels: Readonly<Record<MapKnowledgeStatus, string>> = {
  known: "Known",
  estimated: "Estimated",
  unknown: "Not known",
  missing: "Missing from test artifact",
  stale: "Last confirmed; may have changed",
  contested: "Contested",
};

export const knowledgeStatusLabel = (status: MapKnowledgeStatus): string =>
  knowledgeLabels[status];

const formatPlayerDate = (value: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));

const resolveTokenColor = (host: HTMLElement, token: string): string => {
  const probe = globalThis.document.createElement("span");
  probe.style.color = `var(${token})`;
  probe.hidden = true;
  host.append(probe);
  const color = globalThis.getComputedStyle(probe).color;
  probe.remove();
  return color;
};

const mapStyle = (
  host: HTMLElement,
  projection: MapDocumentProjection,
): StyleSpecification => {
  const color = (token: string) => resolveTokenColor(host, token);
  const selected = color("--color-selected-edge");
  const known = color("--color-map-ramp-2");
  const estimated = color("--color-map-ramp-1");
  const contested = color("--color-warning-mark");
  const unknown = color("--color-fog-unknown-fill");
  const missing = color("--color-surface-sunken");
  const stale = color("--color-fog-stale-text");
  const boundary = color("--color-map-boundary-on-fill");
  const corridor = color("--color-map-corridor");

  const knowledgeColor: ExpressionSpecification = [
    "match",
    ["get", "knowledge_status"],
    "known",
    known,
    "estimated",
    estimated,
    "contested",
    contested,
    "stale",
    stale,
    "missing",
    missing,
    unknown,
  ];
  const selectedColor: ExpressionSpecification = [
    "case",
    ["boolean", ["feature-state", "selected"], false],
    selected,
    boundary,
  ];

  return {
    version: 8,
    sources: {
      [mapSourceId]: {
        type: "geojson",
        data: projection.geometry as GeoJSONSourceSpecification["data"],
        promoteId: "subject_id",
      },
    },
    layers: [
      {
        id: "am-test-background",
        type: "background",
        paint: { "background-color": color("--color-map-water") },
      },
      {
        id: mapLayerIds[0],
        type: "fill",
        source: mapSourceId,
        filter: ["==", ["get", "subject_kind"], "territory"],
        paint: {
          "fill-color": knowledgeColor,
          "fill-opacity": 0.54,
          "fill-outline-color": selectedColor,
        },
      },
      {
        id: mapLayerIds[1],
        type: "fill",
        source: mapSourceId,
        filter: ["==", ["get", "subject_kind"], "zone"],
        paint: {
          "fill-color": knowledgeColor,
          "fill-opacity": 0.72,
          "fill-outline-color": selectedColor,
        },
      },
      {
        id: mapLayerIds[2],
        type: "line",
        source: mapSourceId,
        filter: ["==", ["get", "subject_kind"], "corridor"],
        paint: {
          "line-color": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            selected,
            corridor,
          ],
          "line-dasharray": [2, 2],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            5,
            3,
          ],
        },
      },
      {
        id: mapLayerIds[3],
        type: "circle",
        source: mapSourceId,
        filter: ["==", ["get", "subject_kind"], "asset"],
        paint: {
          "circle-color": knowledgeColor,
          "circle-radius": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            9,
            7,
          ],
          "circle-stroke-color": selectedColor,
          "circle-stroke-width": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            4,
            2,
          ],
        },
      },
    ],
  };
};

const featureAnchor = (feature: TestMapFeature): [number, number] => {
  if (feature.geometry.type === "Point") return feature.geometry.coordinates;
  if (feature.geometry.type === "LineString") {
    return feature.geometry.coordinates.at(-1) ?? [0, 0];
  }
  const positions = feature.geometry.coordinates[0];
  if (positions === undefined || positions.length === 0) return [0, 0];
  if (feature.properties.subject_kind === "territory") {
    return positions.at(-2) ?? positions[0] ?? [0, 0];
  }
  const bounds = positions.reduce(
    (current, position) => ({
      minX: Math.min(current.minX, position[0]),
      minY: Math.min(current.minY, position[1]),
      maxX: Math.max(current.maxX, position[0]),
      maxY: Math.max(current.maxY, position[1]),
    }),
    {
      minX: positions[0]?.[0] ?? 0,
      minY: positions[0]?.[1] ?? 0,
      maxX: positions[0]?.[0] ?? 0,
      maxY: positions[0]?.[1] ?? 0,
    },
  );
  return [(bounds.minX + bounds.maxX) / 2, (bounds.minY + bounds.maxY) / 2];
};

const featureLabelAnchor = (feature: TestMapFeature) => {
  switch (feature.properties.subject_kind) {
    case "territory":
      return "left" as const;
    case "zone":
      return "bottom" as const;
    case "asset":
      return "top" as const;
    case "corridor":
      return "right" as const;
  }
};

interface MapHostProps {
  readonly projection: MapDocumentProjection;
  readonly selectedSubjectId: string;
  readonly onSelectSubject: (subjectId: string) => void;
}

export const MapHost = ({
  projection,
  selectedSubjectId,
  onSelectSubject,
}: MapHostProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, MapLibreMarker>>(new Map());
  const selectRef = useRef(onSelectSubject);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  selectRef.current = onSelectSubject;

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    let cancelled = false;
    let mountedMap: MapLibreMap | null = null;

    void import("maplibre-gl")
      .then(({ Map: MapLibre, Marker, setWorkerUrl }) => {
        if (cancelled) return;
        setWorkerUrl(mapLibreWorkerUrl);
        const map = new MapLibre({
          container: host,
          style: mapStyle(host, projection),
          center: [0, 0],
          zoom: 5,
          attributionControl: false,
          dragRotate: false,
          pitchWithRotate: false,
        });
        mountedMap = map;
        mapRef.current = map;
        map.once("load", () => {
          if (cancelled) return;
          const canvas = map.getCanvas();
          canvas.tabIndex = -1;
          canvas.setAttribute("aria-hidden", "true");

          for (const feature of projection.geometry.features) {
            const markerButton = globalThis.document.createElement("button");
            markerButton.type = "button";
            markerButton.className = "am-map-label";
            markerButton.dataset["subjectId"] = feature.properties.subject_id;
            markerButton.textContent = `${feature.properties.display_label} · ${knowledgeStatusLabel(feature.properties.knowledge_status)}`;
            markerButton.setAttribute(
              "aria-label",
              `Select ${feature.properties.display_label} from map`,
            );
            markerButton.setAttribute(
              "aria-pressed",
              String(feature.properties.subject_id === selectedSubjectId),
            );
            markerButton.addEventListener("click", () => {
              selectRef.current(feature.properties.subject_id);
            });
            const marker = new Marker({
              element: markerButton,
              anchor: featureLabelAnchor(feature),
            })
              .setLngLat(featureAnchor(feature))
              .addTo(map);
            markersRef.current.set(feature.properties.subject_id, marker);
          }

          map.on("click", (event) => {
            const feature = map.queryRenderedFeatures(event.point, {
              layers: [...mapLayerIds],
            })[0];
            const subjectId = feature?.properties?.["subject_id"];
            if (typeof subjectId === "string") selectRef.current(subjectId);
          });
          setStatus("ready");
        });
        map.on("error", () => {
          if (!cancelled) setStatus("error");
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      markersRef.current.clear();
      mountedMap?.remove();
      if (mapRef.current === mountedMap) mapRef.current = null;
    };
  }, [projection]);

  useEffect(() => {
    const map = mapRef.current;
    projection.subjects.forEach((subject) => {
      const marker = markersRef.current.get(subject.subject_id);
      marker
        ?.getElement()
        .setAttribute(
          "aria-pressed",
          String(subject.subject_id === selectedSubjectId),
        );
      if (map !== null && map.isStyleLoaded()) {
        map.setFeatureState(
          { source: mapSourceId, id: subject.subject_id },
          { selected: subject.subject_id === selectedSubjectId },
        );
      }
    });
  }, [projection, selectedSubjectId, status]);

  return (
    <section className="am-map-host" aria-labelledby="map-title">
      <header className="am-map-host__header">
        <div>
          <p className="am-meta">MapLibre host</p>
          <h3 id="map-title">Synthetic strategic map</h3>
        </div>
        <span className="am-watermark">
          Simulated · Synthetic test geometry
        </span>
      </header>
      <p id="map-description" className="am-map-description">
        Abstract geometry only. It is not a Mopti polygon, an inferred zone or a
        production geographic assertion. Use the synchronized subject list for
        complete keyboard access.
      </p>
      <div
        ref={hostRef}
        className="am-map-canvas"
        aria-describedby="map-description"
        data-map-status={status}
      />
      <p className="am-map-status" role="status" aria-live="polite">
        {status === "loading"
          ? "Loading synthetic map."
          : status === "error"
            ? "The synthetic map could not be rendered. The equivalent subject list remains available."
            : "Synthetic map ready. Map and list selection use subject IDs."}
      </p>
    </section>
  );
};

export const MapLegend = ({ glyphProbe }: { readonly glyphProbe: string }) => (
  <section className="am-map-legend" aria-labelledby="map-legend-title">
    <h3 id="map-legend-title">Map legend</h3>
    <ul>
      {(Object.keys(knowledgeLabels) as MapKnowledgeStatus[]).map((status) => (
        <li key={status}>
          <span
            aria-hidden="true"
            className={`am-map-legend__mark am-map-legend__mark--${status}`}
          />
          <span>{knowledgeStatusLabel(status)}</span>
        </li>
      ))}
    </ul>
    <p className="am-map-glyph-probe">
      Label glyph check: <span lang="fr">{glyphProbe}</span>
    </p>
  </section>
);

interface SubjectListProps {
  readonly subjects: readonly MapSubjectProjection[];
  readonly selectedSubjectId: string;
  readonly onSelectSubject: (subjectId: string) => void;
}

export const SubjectList = ({
  subjects,
  selectedSubjectId,
  onSelectSubject,
}: SubjectListProps) => {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("en-GB");
  const visible = useMemo(
    () =>
      subjects.filter(
        (subject) =>
          normalizedQuery.length === 0 ||
          subject.display_label
            .toLocaleLowerCase("en-GB")
            .includes(normalizedQuery) ||
          subject.subject_id
            .toLocaleLowerCase("en-GB")
            .includes(normalizedQuery),
      ),
    [normalizedQuery, subjects],
  );

  return (
    <section className="am-subject-list" aria-labelledby="subject-list-title">
      <h3 id="subject-list-title">Map subjects</h3>
      <label htmlFor="subject-search">Search subjects</label>
      <input
        id="subject-search"
        className="am-input"
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
        }}
      />
      {visible.length === 0 ? (
        <p>No map subjects match this search.</p>
      ) : (
        <ul>
          {visible.map((subject) => (
            <li key={subject.subject_id}>
              <button
                className="am-subject-list__button"
                type="button"
                aria-pressed={subject.subject_id === selectedSubjectId}
                data-subject-id={subject.subject_id}
                onClick={() => {
                  onSelectSubject(subject.subject_id);
                }}
              >
                <span>{subject.display_label}</span>
                <span className="am-subject-list__status">
                  {knowledgeStatusLabel(subject.knowledge_status)}
                </span>
                <span className="am-subject-list__id">
                  {subject.subject_id}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export const DossierView = ({
  subject,
}: {
  readonly subject: MapSubjectProjection;
}) => (
  <article
    className="am-document am-dossier"
    aria-labelledby="dossier-title"
    aria-live="polite"
  >
    <header>
      <p className="am-meta">Simulated · Knowledge-safe dossier</p>
      <h3 id="dossier-title">{subject.dossier.title}</h3>
      <p>{subject.dossier.summary}</p>
      <dl className="am-document-metadata">
        <div>
          <dt>Subject ID</dt>
          <dd>{subject.subject_id}</dd>
        </div>
        <div>
          <dt>Information state</dt>
          <dd>{subject.dossier.sourceConfidence}</dd>
        </div>
      </dl>
    </header>
    {subject.dossier.sections.map((section) => (
      <section key={section.heading}>
        <h4>{section.heading}</h4>
        <ul>
          {section.statements.map((statement) => (
            <li key={statement}>{statement}</li>
          ))}
        </ul>
      </section>
    ))}
  </article>
);

const DocumentSection = ({
  heading,
  children,
}: {
  readonly heading: string;
  readonly children: ReactNode;
}) => (
  <section className="am-document__section">
    <h4>{heading}</h4>
    {children}
  </section>
);

export const KnowledgeDocumentView = ({
  document,
}: {
  readonly document: KnowledgeDocumentProjection;
}) => (
  <article className="am-document" aria-labelledby="document-title">
    <header>
      <p className="am-watermark">Simulated · Test-only document</p>
      <h3 id="document-title">{document.title}</h3>
      <p>{document.summary}</p>
      <dl className="am-document-metadata">
        <div>
          <dt>Reference</dt>
          <dd>{document.metadata.reference}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{formatPlayerDate(document.metadata.date)}</dd>
        </div>
        <div>
          <dt>Preparer</dt>
          <dd>{document.metadata.preparer}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{document.metadata.status}</dd>
        </div>
        <div>
          <dt>Source confidence</dt>
          <dd>{document.metadata.sourceConfidence}</dd>
        </div>
      </dl>
    </header>
    <DocumentSection heading="Evidence">
      {document.evidence.length === 0 ? (
        <p>No evidence is available in this test document.</p>
      ) : (
        <ul className="am-document-records">
          {document.evidence.map((evidence) => (
            <li key={evidence.evidenceId}>
              <h5>{evidence.heading}</h5>
              <p>{evidence.statement}</p>
              <p className="am-document-records__source">
                Evidence ID: {evidence.evidenceId} · {evidence.sourceLabel}
                {evidence.observedDate === undefined
                  ? ""
                  : ` · ${formatPlayerDate(evidence.observedDate)}`}{" "}
                · {knowledgeStatusLabel(evidence.confidence)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DocumentSection>
    <DocumentSection heading="Assessment">
      {document.assessments.length === 0 ? (
        <p>No office assessment has been adopted for this test document.</p>
      ) : (
        <ul className="am-document-records">
          {document.assessments.map((assessment) => (
            <li key={assessment.assessmentId}>
              <h5>{assessment.heading}</h5>
              <p>{assessment.statement}</p>
              <p className="am-document-records__source">
                Declared confidence: {assessment.declaredConfidence}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DocumentSection>
    <DocumentSection heading="What remains unknown">
      <ul>
        {document.unknowns.map((unknown) => (
          <li key={unknown}>{unknown}</li>
        ))}
      </ul>
    </DocumentSection>
  </article>
);

export const MapDocumentsWorkspace = ({
  projection: inputProjection,
}: {
  readonly projection: MapDocumentProjection;
}) => {
  const projection = MapDocumentProjectionSchema.parse(inputProjection);
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    projection.subjects[0]?.subject_id ?? "",
  );
  const subject = selectMapSubjectById(projection, selectedSubjectId);

  return (
    <div className="am-map-documents">
      <div className="am-map-documents__map-row">
        <MapHost
          projection={projection}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={setSelectedSubjectId}
        />
        <div className="am-map-documents__side">
          <SubjectList
            subjects={projection.subjects}
            selectedSubjectId={selectedSubjectId}
            onSelectSubject={setSelectedSubjectId}
          />
          <MapLegend glyphProbe={projection.labelGlyphProbe} />
        </div>
      </div>
      <DossierView subject={subject} />
    </div>
  );
};

export const DocumentWorkspace = ({
  projection: inputProjection,
}: {
  readonly projection: MapDocumentProjection;
}) => {
  const projection = MapDocumentProjectionSchema.parse(inputProjection);
  const [selectedDocumentId, setSelectedDocumentId] = useState(
    projection.documents[0]?.documentId ?? "",
  );
  const document =
    projection.documents.find(
      (candidate) => candidate.documentId === selectedDocumentId,
    ) ?? projection.documents[0];
  if (document === undefined) return null;

  return (
    <div className="am-document-workspace">
      <nav aria-label="Simulated documents">
        <p className="am-meta">Documents</p>
        <ul>
          {projection.documents.map((candidate) => (
            <li key={candidate.documentId}>
              <button
                className="am-document-workspace__button"
                type="button"
                aria-pressed={candidate.documentId === document.documentId}
                onClick={() => {
                  setSelectedDocumentId(candidate.documentId);
                }}
              >
                {candidate.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <KnowledgeDocumentView document={document} />
    </div>
  );
};
