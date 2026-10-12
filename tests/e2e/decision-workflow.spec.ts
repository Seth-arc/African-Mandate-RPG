import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const monthActions = [
  [
    "Task access verification",
    "Consult the AU Commission",
    "Adopt the access assessment",
  ],
  [
    "Consult the civic channel",
    "Consult the AES liaison",
    "Respond to the access case",
  ],
  [
    "Negotiate monitoring terms",
    "Open the civilian access case",
    "Open the corridor case",
  ],
  ["Revise the access assessment", "Revise the case scope"],
] as const;

const openDecisionJournal = async (page: Page) => {
  await page.getByRole("link", { name: "Decision journal" }).click();
  await expect(
    page.getByRole("heading", { name: "Available decisions" }),
  ).toBeVisible();
};

const addDraft = async (page: Page, label: string) => {
  const option = page.locator(".am-action-options > li").filter({
    has: page.getByRole("heading", { name: label, exact: true }),
  });
  await option.getByRole("button", { name: "Add to draft tray" }).click();
};

const commitDraft = async (page: Page, label: string) => {
  await addDraft(page, label);
  const tray = page.locator(".am-draft-tray");
  const draft = tray.getByRole("listitem").filter({ hasText: label });
  await draft.getByRole("button", { name: "Commit decision" }).click();
  const dialog = page.getByRole("dialog", { name: "Commit decision" });
  await dialog
    .getByRole("button", { name: `Commit ${label}`, exact: true })
    .click();
  await expect(dialog).toBeHidden();
  await expect(page.locator(".am-sr-only")).toContainText(
    "saved and appears in the immutable decision journal",
  );
};

const endMonth = async (page: Page, resolvedTurn: number) => {
  await page.getByRole("button", { name: "End month", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "End month" });
  await dialog.getByRole("button", { name: "End month", exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator(".am-sr-only")).toContainText(
    `Month ${String(resolvedTurn)} is saved`,
  );
  await expect(page.locator("#ledger-title")).toBeFocused();
  if (resolvedTurn < 4) {
    await page.getByRole("link", { name: "Decision journal" }).click();
  }
};

const completeFourMonths = async (page: Page) => {
  for (let monthIndex = 0; monthIndex < monthActions.length; monthIndex += 1) {
    for (const label of monthActions[monthIndex]!) {
      await commitDraft(page, label);
    }
    await endMonth(page, monthIndex + 1);
  }
};

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
});

test("draft operations are reversible and do not change campaign state", async ({
  page,
}) => {
  await page.goto("/");
  await openDecisionJournal(page);
  await addDraft(page, "Task access verification");
  await addDraft(page, "Consult the AU Commission");

  await expect(page.getByText("3 of 3 available")).toBeVisible();
  await expect(
    page.getByText("No committed decisions appear in the journal."),
  ).toBeVisible();
  const tray = page.locator(".am-draft-tray");
  await tray
    .getByRole("button", { name: "Move Task access verification later" })
    .click();
  await tray
    .getByRole("listitem")
    .filter({ hasText: "Task access verification" })
    .getByRole("button", { name: "Remove draft" })
    .click();
  await expect(page.getByText("3 of 3 available")).toBeVisible();
  await expect(
    page.getByText("No committed decisions appear in the journal."),
  ).toBeVisible();
});

test("confirmation traps focus, returns it, and announces durable commitment", async ({
  page,
}) => {
  await page.goto("/");
  await openDecisionJournal(page);
  await addDraft(page, "Task access verification");
  const commit = page.getByRole("button", { name: "Commit decision" });
  await commit.click();
  const dialog = page.getByRole("dialog", { name: "Commit decision" });
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", {
      name: "Commit Task access verification",
      exact: true,
    }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(commit).toBeFocused();

  await commit.click();
  await dialog
    .getByRole("button", {
      name: "Commit Task access verification",
      exact: true,
    })
    .click();
  await expect(page.getByText("2 of 3 available")).toBeVisible();
  await expect(
    page.locator(".am-decision-journal").getByRole("heading", {
      name: "Task access verification",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("#decision-journal-title")).toBeFocused();
  await expect(page.locator(".am-sr-only")).toContainText(
    "saved and appears in the immutable decision journal",
  );
});

test("failed save keeps prior state and retry reuses the draft", async ({
  page,
}) => {
  await page.goto("/?decisionScenario=adverse");
  await openDecisionJournal(page);
  await addDraft(page, "Task access verification");
  await page.getByRole("button", { name: "Commit decision" }).click();
  const dialog = page.getByRole("dialog", { name: "Commit decision" });
  await dialog
    .getByRole("button", {
      name: "Commit Task access verification",
      exact: true,
    })
    .click();

  await expect(dialog.getByRole("alert")).toContainText(
    "prior campaign state is unchanged",
  );
  await expect(page.getByText("3 of 3 available")).toBeVisible();
  await expect(
    page.getByText("No committed decisions appear in the journal."),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Retry save" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("2 of 3 available")).toBeVisible();
  await expect(
    page.locator(".am-decision-journal").getByText("Task access verification"),
  ).toBeVisible();
});

test("last slot stays reserved for the known mandatory response", async ({
  page,
}) => {
  await page.goto("/");
  await openDecisionJournal(page);
  for (const label of monthActions[0]) await commitDraft(page, label);
  await endMonth(page, 1);
  await commitDraft(page, "Consult the civic channel");
  await commitDraft(page, "Consult the AES liaison");

  await expect(page.getByText("1 of 3 available")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "End month", exact: true }),
  ).toBeDisabled();
  const optional = page.locator(".am-action-options > li").filter({
    hasText: "Consult the humanitarian office",
  });
  await expect(
    optional.getByRole("button", { name: "Add to draft tray" }),
  ).toBeDisabled();
  await expect(
    page.getByText(
      /known mandatory response must use the final decision slot/u,
    ),
  ).toBeVisible();
  await expect(
    page
      .locator(".am-action-options > li")
      .filter({
        hasText: "Respond to the access case",
      })
      .getByRole("button", { name: "Add to draft tray" }),
  ).toBeEnabled();
});

test("completes the four-month happy path and preserves ordered history", async ({
  page,
}) => {
  await page.goto("/");
  await openDecisionJournal(page);
  await completeFourMonths(page);

  await expect(page.getByText("Turn").locator("..")).toContainText("5 of 20");
  await page.getByRole("link", { name: "Resolution ledger" }).click();
  await expect(page.locator(".am-resolution-ledger li")).toHaveCount(20);
  await expect(page.locator(".am-resolution-ledger li").first()).toContainText(
    "Month 1",
  );
  await expect(page.locator(".am-resolution-ledger li").last()).toContainText(
    "Month 4",
  );
  await page.screenshot({
    path: "docs/build/screenshots/23/four-month-resolution-ledger.png",
    fullPage: true,
  });
});

test("completes the adverse path after a visible save failure", async ({
  page,
}) => {
  await page.goto("/?decisionScenario=adverse");
  await openDecisionJournal(page);
  await addDraft(page, "Task access verification");
  await page.getByRole("button", { name: "Commit decision" }).click();
  const dialog = page.getByRole("dialog", { name: "Commit decision" });
  await dialog
    .getByRole("button", {
      name: "Commit Task access verification",
      exact: true,
    })
    .click();
  await expect(dialog.getByRole("alert")).toBeVisible();
  await dialog.getByRole("button", { name: "Retry save" }).click();
  for (const label of monthActions[0].slice(1)) await commitDraft(page, label);
  await endMonth(page, 1);
  for (let monthIndex = 1; monthIndex < monthActions.length; monthIndex += 1) {
    for (const label of monthActions[monthIndex]!)
      await commitDraft(page, label);
    await endMonth(page, monthIndex + 1);
  }
  await expect(page.getByText("Turn").locator("..")).toContainText("5 of 20");
  await expect(
    page.getByRole("button", { name: "End month", exact: true }),
  ).toBeDisabled();
});

test("decision and dialog surfaces pass accessibility smoke", async ({
  page,
}) => {
  await page.goto("/");
  await openDecisionJournal(page);
  await addDraft(page, "Task access verification");
  await page.getByRole("button", { name: "Commit decision" }).click();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
