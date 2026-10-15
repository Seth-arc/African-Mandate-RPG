import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { TextContainerMeasurementSchema } from "@african-mandate/tooling";

const minimumViewport = { width: 1024, height: 768 } as const;

const enableTextZoom = async (page: Page) => {
  await page.locator("html").evaluate((element) => {
    element.style.fontSize = "200%";
  });
};

const measureTextContainers = async (page: Page) =>
  page.evaluate(() => {
    const candidates = [
      ...document.querySelectorAll<HTMLElement>(
        "h1, h2, h3, h4, h5, p, li, button, a, label, dt, dd",
      ),
    ].filter((element) => {
      const style = getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        element.getClientRects().length > 0 &&
        element.closest(".am-sr-only, .maplibregl-map") === null
      );
    });
    const horizontalOverflow = candidates
      .filter((element) => element.scrollWidth > element.clientWidth + 1)
      .map((element) => element.textContent?.trim().slice(0, 80) ?? "");
    const clippedText = candidates
      .filter((element) => element.scrollHeight > element.clientHeight + 1)
      .map((element) => ({
        text: element.textContent?.trim().slice(0, 80) ?? "",
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      }));
    return {
      route: window.location.href,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      textScalePercent: 200,
      containerCount: candidates.length,
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow,
      clippedText,
    };
  });

const openDecisionJournal = async (page: Page) => {
  const link = page.getByRole("link", { name: "Decision journal" });
  await link.focus();
  await page.keyboard.press("Enter");
};

const commitWithKeyboard = async (page: Page, label: string) => {
  const option = page.locator(".am-action-options > li").filter({
    has: page.getByRole("heading", { name: label, exact: true }),
  });
  const add = option.getByRole("button", { name: "Add to draft tray" });
  await add.focus();
  await page.keyboard.press("Enter");
  const commit = page
    .locator(".am-draft-tray")
    .getByRole("listitem")
    .filter({ hasText: label })
    .getByRole("button", { name: "Commit decision" });
  await commit.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Commit decision" });
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: `Commit ${label}`, exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
};

test("measures every current major surface at the minimum viewport and 200 percent text", async ({
  page,
}) => {
  await page.setViewportSize(minimumViewport);
  await page.goto("/?testRoute=1");
  await enableTextZoom(page);
  await expect(page.locator("[data-map-status='ready']")).toBeVisible();

  for (const [linkName, screenshotName] of [
    ["Strategic map", "strategic-map"],
    ["Monthly brief", "documents"],
    ["Decision journal", "decision-workflow"],
  ] as const) {
    const link = page.getByRole("link", { name: linkName });
    await link.focus();
    await page.keyboard.press("Enter");
    const measurement = await measureTextContainers(page);
    const artifact = TextContainerMeasurementSchema.parse({
      route: measurement.route,
      viewportWidth: measurement.viewportWidth,
      viewportHeight: measurement.viewportHeight,
      textScalePercent: measurement.textScalePercent,
      containerCount: measurement.containerCount,
      horizontalOverflowCount: measurement.horizontalOverflow.length,
      clippedTextCount: measurement.clippedText.length,
      screenshotPath: `docs/build/screenshots/24/${screenshotName}-1024x768-text-zoom-200.png`,
    });
    console.log("PB2-24 measurement", JSON.stringify(measurement));
    expect(measurement.viewportWidth).toBe(minimumViewport.width);
    expect(measurement.viewportHeight).toBe(minimumViewport.height);
    expect(measurement.documentWidth).toBeLessThanOrEqual(
      minimumViewport.width,
    );
    expect(measurement.horizontalOverflow).toEqual([]);
    expect(measurement.clippedText).toEqual([]);
    expect(artifact.containerCount).toBeGreaterThan(0);
    await page.screenshot({
      path: `docs/build/screenshots/24/${screenshotName}-1024x768-text-zoom-200.png`,
      fullPage: true,
    });
  }
});

test("completes one month by keyboard with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?testRoute=1");
  await openDecisionJournal(page);

  for (const label of [
    "Task access verification",
    "Consult the AU Commission",
    "Adopt the access assessment",
  ]) {
    await commitWithKeyboard(page, label);
  }

  const endMonth = page.getByRole("button", {
    name: "End month",
    exact: true,
  });
  await endMonth.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "End month" });
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "End month", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#ledger-title")).toBeFocused();
  await expect(page.locator(".am-resolution-ledger li")).toHaveCount(5);

  const activeMotion = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("body *")]
      .filter(
        (element) =>
          element.getClientRects().length > 0 &&
          element.closest(".maplibregl-map") === null,
      )
      .map((element) => {
        const style = getComputedStyle(element);
        return {
          className: element.className,
          animation: style.animationName,
          transition: style.transitionDuration,
        };
      })
      .filter(
        ({ animation, transition }) =>
          animation !== "none" ||
          transition.split(",").some((duration) => duration.trim() !== "0s"),
      ),
  );
  expect(activeMotion).toEqual([]);
  await page.screenshot({
    path: "docs/build/screenshots/24/keyboard-reduced-motion-ledger.png",
    fullPage: true,
  });
});

test("keeps simulation markers, plain summaries, and dates consistent", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?testRoute=1");
  await expect(
    page.getByRole("heading", { name: "Simulation notice" }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /events, quotes, and figures are invented unless a source is shown/iu,
    ),
  ).toBeVisible();
  await page.getByRole("link", { name: "Monthly brief" }).click();
  await expect(page.getByText("Simulated · Test-only document")).toBeVisible();
  await expect(page.getByText("1 October 2025").first()).toBeVisible();
  await expect(page.getByText("2025-10-01")).toHaveCount(0);
  await expect(
    page.getByText(
      "Two synthetic reports disagree about access. Review the evidence and office assessment before choosing a response.",
    ),
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("retains local fallback surfaces with the browser offline", async ({
  context,
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?testRoute=1");
  await expect(page.locator("[data-map-status='ready']")).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("link", { name: "Monthly brief" }).click();
  await expect(
    page.getByRole("heading", { name: "Opening test brief" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Decision journal" }).click();
  await expect(
    page.getByRole("heading", { name: "Available decisions" }),
  ).toBeVisible();
  await expect(page.getByText("Saved locally; sync unavailable")).toBeVisible();
});
