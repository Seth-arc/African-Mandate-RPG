import { expect, test, type Page } from "@playwright/test";

const readState = async (page: Page) =>
  page.evaluate(() => {
    const render = (
      globalThis as typeof globalThis & {
        render_game_to_text?: () => string;
      }
    ).render_game_to_text;
    if (render === undefined)
      throw new Error("Production text projection is missing");
    return JSON.parse(render()) as {
      revision: number;
      turn: number;
      decisionsRemaining: number;
    };
  });

const actionOption = (page: Page, label: string) =>
  page.locator(".am-action-options > li").filter({
    has: page.getByRole("heading", { name: label, exact: true }),
  });

const commitAction = async (page: Page, label: string) => {
  await page.getByRole("link", { name: "Decision journal" }).click();
  const option = actionOption(page, label);
  await option.getByRole("button", { name: "Add to draft tray" }).click();
  await page
    .locator(".am-draft-tray")
    .getByRole("button", { name: "Commit decision" })
    .click();
  const dialog = page.getByRole("dialog", { name: "Commit decision" });
  await dialog
    .getByRole("button", {
      name: `Commit ${label}`,
      exact: true,
    })
    .click();
  await expect(dialog).toBeHidden();
};

const endMonth = async (page: Page) => {
  await page.getByRole("button", { name: "End month", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "End month" });
  await dialog.getByRole("button", { name: "End month", exact: true }).click();
  await expect(dialog).toBeHidden();
};

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Verified local strategic map" }),
  ).toBeVisible();
});

test("production campaign commits, ends a turn, and reloads exactly", async ({
  page,
}) => {
  await expect(
    page.getByText("Simulated · Local production campaign"),
  ).toBeVisible();
  await expect(page.getByText(/test-only interface/iu)).toHaveCount(0);
  expect(await readState(page)).toMatchObject({
    revision: 0,
    turn: 1,
    decisionsRemaining: 3,
  });

  await commitAction(page, "Collect verified evidence");
  expect(await readState(page)).toMatchObject({
    revision: 1,
    turn: 1,
    decisionsRemaining: 2,
  });
  await endMonth(page);
  expect(await readState(page)).toMatchObject({
    revision: 2,
    turn: 2,
    decisionsRemaining: 3,
  });

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Verified local strategic map" }),
  ).toBeVisible();
  expect(await readState(page)).toMatchObject({
    revision: 2,
    turn: 2,
    decisionsRemaining: 3,
  });
  const snapshot = await page.evaluate(async () => {
    const request = indexedDB.open("african-mandate-production-v1");
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const value = await new Promise<Record<string, unknown>>(
      (resolve, reject) => {
        const transaction = database.transaction(
          "campaign_current",
          "readonly",
        );
        const get = transaction
          .objectStore("campaign_current")
          .get("campaign_local_primary");
        get.onsuccess = () => resolve(get.result as Record<string, unknown>);
        get.onerror = () => reject(get.error);
      },
    );
    database.close();
    return value;
  });
  expect(snapshot).toMatchObject({ snapshotVersion: 2, campaignRevision: 2 });
  expect(snapshot["artifacts"]).toBeTruthy();
});

test("corrupt current state recovers the last valid snapshot", async ({
  page,
}) => {
  await commitAction(page, "Collect verified evidence");
  await endMonth(page);
  await page.evaluate(async () => {
    const request = indexedDB.open("african-mandate-production-v1");
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction("campaign_current", "readwrite");
      transaction.objectStore("campaign_current").put(
        {
          snapshotVersion: 2,
          campaignId: "campaign_local_primary",
          corrupt: true,
        },
        "campaign_local_primary",
      );
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  });

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Verified local strategic map" }),
  ).toBeVisible();
  expect(await readState(page)).toMatchObject({
    revision: 1,
    turn: 1,
    decisionsRemaining: 2,
  });
  await expect(
    page.getByTitle(/Recovered and restored the last valid local snapshot/iu),
  ).toBeVisible();
});

test("simulated authorization enforces consultation, lead time, and the approved resource ceiling", async ({
  page,
}) => {
  await commitAction(page, "Advance simulated authorization");
  await expect(
    actionOption(page, "Advance simulated authorization").getByRole("button", {
      name: "Add to draft tray",
    }),
  ).toBeDisabled();

  await commitAction(page, "Consult a regional counterpart");
  await expect(
    actionOption(page, "Advance simulated authorization").getByRole("button", {
      name: "Add to draft tray",
    }),
  ).toBeDisabled();

  await endMonth(page);
  await page.getByRole("link", { name: "Decision journal" }).click();
  await expect(
    actionOption(page, "Advance simulated authorization").getByRole("button", {
      name: "Add to draft tray",
    }),
  ).toBeDisabled();
  await endMonth(page);

  await commitAction(page, "Advance simulated authorization");
  const authorizationSteps = await page.evaluate(async () => {
    const request = indexedDB.open("african-mandate-production-v1");
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const snapshot = await new Promise<{
      authoritativeState: {
        domainEvents: Array<{
          eventType: string;
          payload: { step?: string };
        }>;
      };
    }>((resolve, reject) => {
      const transaction = database.transaction("campaign_current", "readonly");
      const get = transaction
        .objectStore("campaign_current")
        .get("campaign_local_primary");
      get.onsuccess = () => resolve(get.result);
      get.onerror = () => reject(get.error);
    });
    database.close();
    return snapshot.authoritativeState.domainEvents
      .filter(({ eventType }) => eventType === "simulated_authorization_step")
      .map(({ payload }) => payload.step);
  });
  expect(authorizationSteps).toEqual([
    "commission_submission",
    "psc_game_review",
  ]);
  await actionOption(page, "Advance simulated authorization")
    .getByRole("button", { name: "Add to draft tray" })
    .click();
  await page
    .locator(".am-draft-tray")
    .getByRole("button", { name: "Commit decision" })
    .click();
  const finalDialog = page.getByRole("dialog", { name: "Commit decision" });
  await finalDialog
    .getByRole("button", {
      name: "Commit Advance simulated authorization",
      exact: true,
    })
    .click();
  await expect(finalDialog.getByRole("alert")).toContainText(
    "KNOWN_COST_UNAFFORDABLE",
  );
  expect(await readState(page)).toMatchObject({
    revision: 5,
    turn: 3,
    decisionsRemaining: 2,
  });
});
