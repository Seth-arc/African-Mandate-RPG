import { useEffect, useRef, type RefObject } from "react";
import type {
  DecisionActionOption,
  DecisionWorkspaceProjection,
  ResolutionLedgerEntry,
} from "@african-mandate/application";

export type DecisionDialogState =
  | { readonly kind: "commit"; readonly optionId: string }
  | { readonly kind: "end_month" };

const costLabel = (
  cost: DecisionActionOption["preview"]["action"]["preview"]["knownCosts"][number],
  locale: string,
): string => {
  if (cost.costType === "budget" && cost.money !== undefined) {
    return `${new Intl.NumberFormat(locale, {
      style: "currency",
      currency: cost.money.currency,
      maximumFractionDigits: 0,
    }).format(cost.money.amount)} (${cost.certainty})`;
  }
  return `${cost.costType.replaceAll("_", " ")}: ${new Intl.NumberFormat(locale).format(cost.amount ?? 0)} (${cost.certainty})`;
};

const Preview = ({
  option,
  locale,
}: {
  readonly option: DecisionActionOption;
  readonly locale: string;
}) => {
  const preview = option.preview.action.preview;
  return (
    <div className="am-decision-preview" aria-label={`${option.label} preview`}>
      <div>
        <h4>Known costs</h4>
        {preview.knownCosts.length === 0 ? (
          <p>None recorded in the accepted projection.</p>
        ) : (
          <ul>
            {preview.knownCosts.map((cost, index) => (
              <li key={`${cost.costType}-${String(index)}`}>
                {costLabel(cost, locale)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h4>Important unknowns</h4>
        {preview.intelligenceGaps.length === 0 ? (
          <p>No unresolved intelligence gaps are cited.</p>
        ) : (
          <ul>
            {preview.intelligenceGaps.map((gapId) => (
              <li key={gapId}>{gapId}</li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <h4>Known dependencies</h4>
        {preview.implementationDependencies.length === 0 ? (
          <p>None recorded in the accepted projection.</p>
        ) : (
          <ul>
            {preview.implementationDependencies.map((dependency) => (
              <li key={dependency}>{dependency}</li>
            ))}
          </ul>
        )}
      </div>
      <p className="am-preview-disclosure">
        Preview uses player-known projection fields only. It does not show a
        success probability, hidden red line, or hidden availability condition.
      </p>
    </div>
  );
};

export const DecisionWorkspaceView = ({
  workspace,
  draftOptionIds,
  locale,
  disabled,
  onAdd,
  onMove,
  onRemove,
  onCommit,
}: {
  readonly workspace: DecisionWorkspaceProjection;
  readonly draftOptionIds: readonly string[];
  readonly locale: string;
  readonly disabled: boolean;
  readonly onAdd: (optionId: string) => void;
  readonly onMove: (index: number, direction: -1 | 1) => void;
  readonly onRemove: (index: number) => void;
  readonly onCommit: (optionId: string, trigger: HTMLButtonElement) => void;
}) => {
  const options = new Map(
    workspace.actionOptions.map((option) => [option.optionId, option]),
  );
  return (
    <div className="am-decision-workspace">
      <section aria-labelledby="available-actions-title">
        <h3 id="available-actions-title">Available decisions</h3>
        <ul className="am-action-options">
          {workspace.actionOptions.map((option) => {
            const available = option.preview.action.eligibility.available;
            const alreadyDrafted = draftOptionIds.includes(option.optionId);
            return (
              <li key={option.optionId}>
                <div className="am-action-options__heading">
                  <h4>{option.label}</h4>
                  <button
                    className="am-button am-button--secondary"
                    type="button"
                    disabled={disabled || !available || alreadyDrafted}
                    aria-describedby={`eligibility-${option.optionId}`}
                    onClick={() => onAdd(option.optionId)}
                  >
                    {alreadyDrafted ? "In draft tray" : "Add to draft tray"}
                  </button>
                </div>
                <p id={`eligibility-${option.optionId}`}>
                  {available
                    ? "Known requirements are met in this projection."
                    : `Unavailable: ${option.preview.action.eligibility.reasonCode}.`}
                </p>
                <Preview option={option} locale={locale} />
              </li>
            );
          })}
        </ul>
      </section>

      <section className="am-draft-tray" aria-labelledby="draft-tray-title">
        <p className="am-meta">Draft only · no campaign state changes</p>
        <h3 id="draft-tray-title">Decision tray</h3>
        {draftOptionIds.length === 0 ? (
          <p>No draft decisions. Add an available decision to compare it.</p>
        ) : (
          <ol>
            {draftOptionIds.map((optionId, index) => {
              const option = options.get(optionId);
              if (option === undefined) return null;
              return (
                <li key={optionId}>
                  <span>{option.label}</span>
                  <div className="am-draft-tray__controls">
                    <button
                      className="am-button am-button--secondary"
                      type="button"
                      disabled={disabled || index === 0}
                      onClick={() => onMove(index, -1)}
                      aria-label={`Move ${option.label} earlier`}
                    >
                      Earlier
                    </button>
                    <button
                      className="am-button am-button--secondary"
                      type="button"
                      disabled={disabled || index === draftOptionIds.length - 1}
                      onClick={() => onMove(index, 1)}
                      aria-label={`Move ${option.label} later`}
                    >
                      Later
                    </button>
                    <button
                      className="am-button am-button--secondary"
                      type="button"
                      disabled={disabled}
                      onClick={() => onRemove(index)}
                    >
                      Remove
                    </button>
                    <button
                      className="am-button am-button--primary"
                      type="button"
                      disabled={disabled}
                      onClick={(event) =>
                        onCommit(optionId, event.currentTarget)
                      }
                    >
                      Commit decision
                    </button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section aria-labelledby="decision-journal-title">
        <p className="am-meta">Immutable committed history</p>
        <h3 id="decision-journal-title" tabIndex={-1}>
          Decision journal
        </h3>
        {workspace.journal.length === 0 ? (
          <p>No decisions have been committed.</p>
        ) : (
          <ol className="am-decision-journal">
            {workspace.journal.map((entry) => (
              <li key={entry.entryId}>
                <h4>{entry.actionLabel}</h4>
                <p>{entry.outcomeSummary}</p>
                <p className="am-meta">
                  Month {entry.turn}, decision {entry.sequenceWithinTurn} ·
                  revision {entry.campaignRevision}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
};

const categoryLabel: Record<ResolutionLedgerEntry["category"], string> = {
  implementation: "Implementation",
  institutions: "Institutions",
  regional_conditions: "Regional conditions",
  intelligence: "Intelligence",
  watch: "Watch",
};

export const ResolutionLedgerView = ({
  workspace,
}: {
  readonly workspace: DecisionWorkspaceProjection;
}) => (
  <section className="am-resolution-ledger" aria-labelledby="ledger-title">
    <p className="am-meta">Known month-end outcomes</p>
    <h3 id="ledger-title" tabIndex={-1}>
      Resolution ledger
    </h3>
    {workspace.resolutionLedger.length === 0 ? (
      <p>No month has been resolved.</p>
    ) : (
      <ol>
        {workspace.resolutionLedger.map((entry) => (
          <li key={entry.entryId}>
            <p className="am-meta">
              Month {entry.resolvedTurn} · {categoryLabel[entry.category]}
            </p>
            <p>{entry.summary}</p>
          </li>
        ))}
      </ol>
    )}
  </section>
);

export const DecisionConfirmationDialog = ({
  dialog,
  workspace,
  busy,
  error,
  returnFocusRef,
  onCancel,
  onConfirm,
}: {
  readonly dialog: DecisionDialogState;
  readonly workspace: DecisionWorkspaceProjection;
  readonly busy: boolean;
  readonly error?: string;
  readonly returnFocusRef: RefObject<HTMLButtonElement | null>;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const option =
    dialog.kind === "commit"
      ? workspace.actionOptions.find(
          ({ optionId }) => optionId === dialog.optionId,
        )
      : undefined;
  useEffect(() => {
    cancelRef.current?.focus();
    const priorOverflow = globalThis.document.body.style.overflow;
    globalThis.document.body.style.overflow = "hidden";
    return () => {
      globalThis.document.body.style.overflow = priorOverflow;
      returnFocusRef.current?.focus();
    };
  }, [returnFocusRef]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && !busy) {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = [
      ...(containerRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ) ?? []),
    ];
    if (controls.length === 0) return;
    const first = controls[0]!;
    const last = controls.at(-1)!;
    if (event.shiftKey && globalThis.document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && globalThis.document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const heading =
    dialog.kind === "commit" ? "Commit decision?" : "End this month?";
  const body =
    dialog.kind === "commit"
      ? `${option?.label ?? "This decision"} will be written as one irreversible campaign decision.`
      : "Month-end resolution will run and the current month cannot be reopened.";
  return (
    <div className="am-dialog-scrim">
      <div
        ref={containerRef}
        className="am-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-dialog-title"
        aria-describedby="decision-dialog-description"
        onKeyDown={handleKeyDown}
      >
        <h2 id="decision-dialog-title">{heading}</h2>
        <p id="decision-dialog-description">{body}</p>
        {error === undefined ? null : <p role="alert">{error}</p>}
        <div className="am-dialog__actions">
          <button
            ref={cancelRef}
            className="am-button am-button--secondary"
            type="button"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="am-button am-button--primary"
            type="button"
            disabled={busy}
            onClick={onConfirm}
          >
            {busy
              ? "Saving…"
              : error === undefined
                ? dialog.kind === "commit"
                  ? "Commit"
                  : "End month"
                : "Retry save"}
          </button>
        </div>
      </div>
    </div>
  );
};
