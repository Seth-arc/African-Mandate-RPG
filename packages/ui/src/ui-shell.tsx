import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  DecisionWorkspaceProjectionSchema,
  type DecisionCommitOutcome,
  type DecisionWorkspaceProjection,
  type EndMonthOutcome,
  type MapDocumentProjection,
} from "@african-mandate/application";

import {
  DecisionConfirmationDialog,
  DecisionWorkspaceView,
  ResolutionLedgerView,
  type DecisionDialogState,
} from "./decision-workspace.js";
import { DocumentWorkspace, MapDocumentsWorkspace } from "./map-documents.js";
import {
  UiShellModelSchema,
  type UiAttentionItem,
  type UiShellModel,
} from "./ui-shell-model.js";

export type UiShellViewState = "ready" | "loading" | "error" | "partial";

export interface UiShellProps {
  readonly model: UiShellModel;
  readonly state?: UiShellViewState;
  readonly locale?: string;
  readonly onRetry?: () => void;
  readonly mapDocuments?: MapDocumentProjection;
  readonly decisionWorkflow?: UiDecisionWorkflow;
}

export interface UiDecisionWorkflow {
  readonly initialProjection: DecisionWorkspaceProjection;
  commit(
    prior: DecisionWorkspaceProjection,
    request: DecisionWorkspaceProjection["actionOptions"][number]["request"],
  ): Promise<DecisionCommitOutcome>;
  endMonth(
    prior: DecisionWorkspaceProjection,
    request: DecisionWorkspaceProjection["endMonth"]["request"],
  ): Promise<EndMonthOutcome>;
}

type Severity = "neutral" | "info" | "success" | "warning" | "critical";

const navigation = [
  { id: "strategic-map", label: "Strategic map" },
  { id: "monthly-brief", label: "Monthly brief" },
  { id: "mandate-portfolio", label: "Mandate portfolio" },
  { id: "decision-journal", label: "Decision journal" },
  { id: "resolution-ledger", label: "Resolution ledger" },
] as const;
type NavigationId = (typeof navigation)[number]["id"];

const attentionOrder = { critical: 0, warning: 1, info: 2 } as const;
const minimumSupportedViewportWidth = 1024;

const StatusGlyph = ({ severity }: { readonly severity: Severity }) => {
  const mark = {
    neutral: (
      <>
        <circle cx="10" cy="10" r="7" />
        <circle cx="10" cy="10" r="2" />
      </>
    ),
    info: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="M10 9v5M10 6h.01" />
      </>
    ),
    success: (
      <>
        <circle cx="10" cy="10" r="7" />
        <path d="m6.5 10 2.25 2.25L13.5 7.5" />
      </>
    ),
    warning: (
      <>
        <path d="M10 3 18 17H2Z" />
        <path d="M10 8v4M10 14.5h.01" />
      </>
    ),
    critical: (
      <>
        <path d="m10 2 8 8-8 8-8-8Z" />
        <path d="m7 7 6 6M13 7l-6 6" />
      </>
    ),
  }[severity];
  return (
    <svg
      aria-hidden="true"
      className={`am-status-glyph am-status-glyph--${severity}`}
      viewBox="0 0 20 20"
    >
      {mark}
    </svg>
  );
};

const StatusLabel = ({
  children,
  severity,
}: {
  readonly children: ReactNode;
  readonly severity: Severity;
}) => (
  <span className={`am-status-label am-status-label--${severity}`}>
    <StatusGlyph severity={severity} />
    {children}
  </span>
);

const Notice = ({
  heading,
  children,
  severity,
  role,
}: {
  readonly heading: string;
  readonly children: ReactNode;
  readonly severity: Exclude<Severity, "neutral">;
  readonly role?: "alert" | "status";
}) => (
  <section
    className={`am-notice am-notice--${severity}`}
    {...(role === undefined ? {} : { role })}
  >
    <StatusGlyph severity={severity} />
    <div>
      <h3>{heading}</h3>
      <p>{children}</p>
    </div>
  </section>
);

const saveLabel = (model: UiShellModel): string => {
  if (model.saveState.localStatus === "saving") return "Saving";
  if (model.saveState.localStatus === "failed") return "Save failed";
  if (
    model.saveState.localStatus === "offline" ||
    model.saveState.syncStatus === "unavailable"
  ) {
    return "Saved locally; sync unavailable";
  }
  if (model.saveState.syncStatus === "synced") return "Saved";
  if (model.saveState.syncStatus === "syncing") {
    return "Saved locally; syncing";
  }
  if (model.saveState.syncStatus === "conflict") {
    return "Saved locally; sync conflict";
  }
  return "Saved locally";
};

const saveSeverity = (model: UiShellModel): Severity => {
  if (model.saveState.localStatus === "failed") return "critical";
  if (
    model.saveState.localStatus === "offline" ||
    model.saveState.syncStatus === "unavailable" ||
    model.saveState.syncStatus === "conflict"
  ) {
    return "warning";
  }
  return model.saveState.localStatus === "saving" ? "info" : "success";
};

const StatusStrip = ({
  model,
  locale,
}: {
  readonly model: UiShellModel;
  readonly locale: string;
}) => {
  const date = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${model.currentDate}T00:00:00.000Z`));
  const number = new Intl.NumberFormat(locale);
  const saved = saveLabel(model);

  return (
    <section className="am-status-strip" aria-label="Campaign status">
      <dl>
        <div>
          <dt>Turn</dt>
          <dd>
            {number.format(model.currentTurn)} of{" "}
            {number.format(model.maxTurns)}
          </dd>
        </div>
        <div>
          <dt>Act</dt>
          <dd>Not available</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{date}</dd>
        </div>
        <div>
          <dt>Strategic decisions</dt>
          <dd>
            {number.format(model.decisionsRemaining)} of{" "}
            {number.format(model.decisionsPerTurn)} available
          </dd>
        </div>
        <div>
          <dt>Save</dt>
          <dd aria-live="polite" title={model.saveState.detail}>
            <StatusLabel severity={saveSeverity(model)}>{saved}</StatusLabel>
          </dd>
        </div>
      </dl>
    </section>
  );
};

const AttentionQueue = ({
  items,
  locale,
}: {
  readonly items: UiAttentionItem[];
  readonly locale: string;
}) => {
  const ordered = [...items].sort(
    (left, right) =>
      attentionOrder[left.severity] - attentionOrder[right.severity],
  );
  return (
    <section
      className="am-panel am-attention"
      aria-labelledby="attention-title"
    >
      <header className="am-panel__header">
        <div>
          <p className="am-meta">Attention queue</p>
          <h2 id="attention-title">Needs your attention</h2>
        </div>
        <span aria-live="polite">
          <StatusLabel severity={ordered.length === 0 ? "neutral" : "warning"}>
            {new Intl.NumberFormat(locale).format(ordered.length)} open
          </StatusLabel>
        </span>
      </header>
      {ordered.length === 0 ? (
        <p className="am-empty">
          No attention items are open. New items appear here when a campaign
          surface requires review.
        </p>
      ) : (
        <ol className="am-attention__list">
          {ordered.map((item) => (
            <li key={item.id}>
              <StatusGlyph severity={item.severity} />
              <span>{item.title}</span>
              <a
                className="am-link am-link--standalone"
                href={`#${item.destinationId}`}
              >
                Review item <span aria-hidden="true">→</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
};

const WorkspaceState = ({
  state,
  viewId,
  viewLabel,
  locale,
  mapDocuments,
  decisionWorkspace,
  draftOptionIds,
  transactionBusy,
  onAddDraft,
  onMoveDraft,
  onRemoveDraft,
  onCommitDraft,
  onRetry,
}: {
  readonly state: UiShellViewState;
  readonly viewId: NavigationId;
  readonly viewLabel: string;
  readonly locale: string;
  readonly mapDocuments?: MapDocumentProjection;
  readonly decisionWorkspace?: DecisionWorkspaceProjection;
  readonly draftOptionIds: readonly string[];
  readonly transactionBusy: boolean;
  readonly onAddDraft: (optionId: string) => void;
  readonly onMoveDraft: (index: number, direction: -1 | 1) => void;
  readonly onRemoveDraft: (index: number) => void;
  readonly onCommitDraft: (
    optionId: string,
    trigger: HTMLButtonElement,
  ) => void;
  readonly onRetry?: () => void;
}) => {
  if (state === "loading") {
    return (
      <Notice heading="Loading campaign view" severity="info" role="status">
        The latest local campaign projection is being prepared.
      </Notice>
    );
  }
  if (state === "error") {
    return (
      <>
        <Notice
          heading="Campaign view could not load"
          severity="critical"
          role="alert"
        >
          The local projection was unavailable. Retry without changing the
          campaign.
        </Notice>
        <button
          className="am-button am-button--secondary"
          type="button"
          onClick={onRetry}
        >
          Retry campaign view
        </button>
      </>
    );
  }
  const partialNotice =
    state === "partial" ? (
      <Notice heading="Partial campaign view" severity="warning" role="status">
        Some projection fields are unavailable. Available campaign facts remain
        visible and unavailable values are not estimated.
      </Notice>
    ) : null;
  if (mapDocuments !== undefined && viewId === "strategic-map") {
    return (
      <>
        {partialNotice}
        <MapDocumentsWorkspace projection={mapDocuments} />
      </>
    );
  }
  if (mapDocuments !== undefined && viewId === "monthly-brief") {
    return (
      <>
        {partialNotice}
        <DocumentWorkspace projection={mapDocuments} />
      </>
    );
  }
  if (decisionWorkspace !== undefined && viewId === "decision-journal") {
    return (
      <>
        {partialNotice}
        <DecisionWorkspaceView
          workspace={decisionWorkspace}
          draftOptionIds={draftOptionIds}
          locale={locale}
          disabled={transactionBusy}
          onAdd={onAddDraft}
          onMove={onMoveDraft}
          onRemove={onRemoveDraft}
          onCommit={onCommitDraft}
        />
      </>
    );
  }
  if (decisionWorkspace !== undefined && viewId === "resolution-ledger") {
    return (
      <>
        {partialNotice}
        <ResolutionLedgerView workspace={decisionWorkspace} />
      </>
    );
  }
  return (
    <>
      {partialNotice}
      <div className="am-workspace-placeholder">
        <p className="am-meta">Selected view</p>
        <h2 id="workspace-heading">{viewLabel}</h2>
        <p>
          This test-only shell reserves the campaign workspace without rendering
          simulation state or unapproved map and document content.
        </p>
      </div>
    </>
  );
};

export const UiShell = ({
  model: inputModel,
  state = "ready",
  locale = "en-GB",
  onRetry,
  mapDocuments,
  decisionWorkflow,
}: UiShellProps) => {
  const model = UiShellModelSchema.parse(inputModel);
  const production = model.classification === "SIMULATED_PRODUCTION_UI_SHELL";
  const [decisionWorkspace, setDecisionWorkspace] = useState<
    DecisionWorkspaceProjection | undefined
  >(() =>
    decisionWorkflow === undefined
      ? undefined
      : DecisionWorkspaceProjectionSchema.parse(
          decisionWorkflow.initialProjection,
        ),
  );
  const [draftOptionIds, setDraftOptionIds] = useState<string[]>([]);
  const [dialog, setDialog] = useState<DecisionDialogState>();
  const [transactionState, setTransactionState] = useState<
    "idle" | "saving" | "failed"
  >("idle");
  const [transactionError, setTransactionError] = useState<string>();
  const [announcement, setAnnouncement] = useState("");
  const [focusAfterSuccess, setFocusAfterSuccess] = useState<string>();
  const dialogReturnFocusRef = useRef<HTMLButtonElement>(null);
  const [activeView, setActiveView] =
    useState<(typeof navigation)[number]["id"]>("strategic-map");
  const selected =
    navigation.find((item) => item.id === activeView) ?? navigation[0];
  const minimumWidth = new Intl.NumberFormat(locale).format(
    minimumSupportedViewportWidth,
  );
  const displayedModel = UiShellModelSchema.parse({
    ...model,
    ...(decisionWorkspace === undefined
      ? {}
      : {
          campaignRevision: decisionWorkspace.campaign.campaignRevision,
          currentTurn: decisionWorkspace.campaign.currentTurn,
          maxTurns: decisionWorkspace.campaign.maxTurns,
          currentDate: decisionWorkspace.campaign.currentDate,
          decisionsRemaining: decisionWorkspace.campaign.decisionsRemaining,
          decisionsPerTurn: decisionWorkspace.campaign.decisionsPerTurn,
          campaignStatus: decisionWorkspace.campaign.campaignStatus,
        }),
    ...(transactionState === "saving"
      ? {
          saveState: {
            ...model.saveState,
            localStatus: "saving",
            detail: "The campaign transaction is being saved locally.",
          },
        }
      : transactionState === "failed"
        ? {
            saveState: {
              ...model.saveState,
              localStatus: "failed",
              detail:
                "The campaign save failed. The prior durable state is unchanged.",
            },
          }
        : {}),
  });
  useEffect(() => {
    if (focusAfterSuccess === undefined) return;
    globalThis.document.getElementById(focusAfterSuccess)?.focus();
    setFocusAfterSuccess(undefined);
  }, [focusAfterSuccess]);

  const openCommitDialog = (optionId: string, trigger: HTMLButtonElement) => {
    dialogReturnFocusRef.current = trigger;
    setTransactionError(undefined);
    setDialog({ kind: "commit", optionId });
  };
  const openEndMonthDialog = (trigger: HTMLButtonElement) => {
    dialogReturnFocusRef.current = trigger;
    setTransactionError(undefined);
    setDialog({ kind: "end_month" });
  };
  const closeDialog = () => {
    if (transactionState === "saving") return;
    setDialog(undefined);
    setTransactionError(undefined);
    if (transactionState === "failed") setTransactionState("idle");
  };
  const confirmTransaction = async () => {
    if (
      dialog === undefined ||
      decisionWorkflow === undefined ||
      decisionWorkspace === undefined
    ) {
      return;
    }
    setTransactionState("saving");
    setTransactionError(undefined);
    try {
      if (dialog.kind === "commit") {
        const option = decisionWorkspace.actionOptions.find(
          ({ optionId }) => optionId === dialog.optionId,
        );
        if (option === undefined) throw new Error("Draft action is stale");
        const outcome = await decisionWorkflow.commit(
          decisionWorkspace,
          option.request,
        );
        if (outcome.result.status === "rejected") {
          setTransactionState("idle");
          setTransactionError(
            `Commit rejected (${outcome.result.reasonCode}). Campaign state is unchanged.`,
          );
          return;
        }
        setDecisionWorkspace(outcome.projection);
        setDraftOptionIds((current) =>
          current.filter((optionId) => optionId !== dialog.optionId),
        );
        setAnnouncement(
          `${option.label} is saved and appears in the immutable decision journal.`,
        );
        setFocusAfterSuccess("decision-journal-title");
      } else {
        const outcome = await decisionWorkflow.endMonth(
          decisionWorkspace,
          decisionWorkspace.endMonth.request,
        );
        if (outcome.result.status === "rejected") {
          setTransactionState("idle");
          setTransactionError(
            `End month rejected (${outcome.result.reasonCode}). Campaign state is unchanged.`,
          );
          return;
        }
        setDecisionWorkspace(outcome.projection);
        setDraftOptionIds([]);
        setAnnouncement(
          `Month ${decisionWorkspace.campaign.currentTurn} is saved and its known outcomes appear in the resolution ledger.`,
        );
        setActiveView("resolution-ledger");
        setFocusAfterSuccess("ledger-title");
      }
      setTransactionState("idle");
      setDialog(undefined);
    } catch {
      setTransactionState("failed");
      setTransactionError(
        "Save failed. The prior campaign state is unchanged. Retry will use the same command.",
      );
    }
  };

  const moveDraft = (index: number, direction: -1 | 1) => {
    setDraftOptionIds((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const sourceValue = next[index]!;
      next[index] = next[target]!;
      next[target] = sourceValue;
      return next;
    });
  };

  return (
    <>
      <a className="am-skip-link" href="#campaign-workspace">
        Skip to campaign workspace
      </a>
      <div className="am-viewport-message" role="status">
        <h1>A larger screen is required</h1>
        <p>
          African Mandate currently supports landscape screens at least{" "}
          {minimumWidth} CSS pixels wide. Continue on a larger screen.
        </p>
      </div>
      <div className="am-shell">
        <header className="am-shell__masthead">
          <div>
            <p className="am-meta">
              {production
                ? "Simulated · Local production campaign"
                : "Simulated · Test-only interface"}
            </p>
            <h1>African Mandate</h1>
          </div>
          <p className="am-shell__office">Office of the AU Strategic Envoy</p>
        </header>

        <StatusStrip model={displayedModel} locale={locale} />

        <div className="am-shell__layout">
          <nav className="am-navigation" aria-label="Campaign navigation">
            <p className="am-meta">Campaign views</p>
            <ul>
              {navigation.map((item) => (
                <li key={item.id}>
                  <a
                    href="#campaign-workspace"
                    aria-current={activeView === item.id ? "page" : undefined}
                    onClick={() => {
                      setActiveView(item.id);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="am-end-month">
              <button
                className="am-button am-button--primary"
                type="button"
                disabled={
                  decisionWorkspace === undefined ||
                  !decisionWorkspace.endMonth.available ||
                  transactionState === "saving"
                }
                aria-describedby="end-month-reason"
                onClick={(event) => openEndMonthDialog(event.currentTarget)}
              >
                End month
              </button>
              <p id="end-month-reason">
                {decisionWorkspace === undefined
                  ? "End month is unavailable until the decision interface is connected to the application coordinator."
                  : decisionWorkspace.endMonth.available
                    ? "Ends the current month after one durable save. This cannot be undone."
                    : decisionWorkspace.endMonth.reason}
              </p>
            </div>
          </nav>

          <main
            id="campaign-workspace"
            className="am-panel am-workspace"
            tabIndex={-1}
            aria-busy={state === "loading"}
          >
            <header className="am-panel__header">
              <div>
                <p className="am-meta">Campaign workspace</p>
                <h2>{selected.label}</h2>
              </div>
              <StatusLabel severity="info">Projection only</StatusLabel>
            </header>
            <div className="am-panel__body">
              <Notice heading="Simulation notice" severity="info" role="status">
                {production
                  ? "This is a simulation. Institutional positions, procedures, balances, and outcomes are fictional game design. Historical observations are shown only with an attributable source and date; the game does not predict real events."
                  : "This is a simulation. Events, quotes, and figures are invented unless a source is shown. The test interface does not predict real events."}
              </Notice>
              <WorkspaceState
                state={state}
                viewId={selected.id}
                viewLabel={selected.label}
                locale={locale}
                {...(mapDocuments === undefined ? {} : { mapDocuments })}
                {...(decisionWorkspace === undefined
                  ? {}
                  : { decisionWorkspace })}
                draftOptionIds={draftOptionIds}
                transactionBusy={transactionState === "saving"}
                onAddDraft={(optionId) => {
                  setDraftOptionIds((current) =>
                    current.includes(optionId)
                      ? current
                      : [...current, optionId],
                  );
                }}
                onMoveDraft={moveDraft}
                onRemoveDraft={(index) => {
                  setDraftOptionIds((current) =>
                    current.filter((_, candidate) => candidate !== index),
                  );
                }}
                onCommitDraft={openCommitDialog}
                {...(onRetry === undefined ? {} : { onRetry })}
              />
            </div>
          </main>

          <AttentionQueue items={model.attentionItems} locale={locale} />
        </div>
      </div>
      <p className="am-sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
      {dialog === undefined || decisionWorkspace === undefined ? null : (
        <DecisionConfirmationDialog
          dialog={dialog}
          workspace={decisionWorkspace}
          busy={transactionState === "saving"}
          {...(transactionError === undefined
            ? {}
            : { error: transactionError })}
          returnFocusRef={dialogReturnFocusRef}
          onCancel={closeDialog}
          onConfirm={() => void confirmTransaction()}
        />
      )}
    </>
  );
};
