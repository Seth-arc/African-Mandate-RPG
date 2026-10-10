import {
  AttentionItemIdSchema,
  type AttentionItem,
  type AttentionItemId,
  type CampaignState,
} from "@african-mandate/domain";

export const blockingMandatoryAttentionItems = (
  state: CampaignState,
): AttentionItem[] =>
  Object.values(state.attention.items)
    .filter(
      (item) =>
        item.level === "decision_required" && item.blocking && !item.resolved,
    )
    .sort((left, right) =>
      left.attentionItemId.localeCompare(right.attentionItemId),
    );

export const reservedMandatoryDecisionSlots = (state: CampaignState): number =>
  blockingMandatoryAttentionItems(state).length;

export const mandatoryResponseItem = (
  state: CampaignState,
  itemIdValue: unknown,
): AttentionItem | undefined => {
  const itemId = AttentionItemIdSchema.safeParse(itemIdValue);
  if (!itemId.success) return undefined;
  const item = state.attention.items[itemId.data];
  if (
    item === undefined ||
    item.level !== "decision_required" ||
    !item.blocking ||
    item.resolved
  ) {
    return undefined;
  }
  return item;
};

export const resolveMandatoryAttentionItem = (
  state: CampaignState,
  itemId: AttentionItemId,
): void => {
  const item = mandatoryResponseItem(state, itemId);
  if (item === undefined) {
    throw new TypeError("Mandatory response item is not active and blocking");
  }
  state.attention.items[itemId] = {
    ...item,
    resolved: true,
    resolvedTurn: state.meta.currentTurn,
  };
};
