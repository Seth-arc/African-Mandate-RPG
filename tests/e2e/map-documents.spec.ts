import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?testRoute=1");
});

test("renders a MapLibre host with an equivalent ID-driven subject list", async ({
  page,
}) => {
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  await expect(page.locator("[data-map-status='ready']")).toBeVisible();
  await expect(page.locator(".am-subject-list__button")).toHaveCount(4);
  await expect(page.locator(".am-map-label")).toHaveCount(4);

  const zoneMapControl = page.getByRole("button", {
    name: "Select Synthetic zone Épreuve from map",
  });
  await zoneMapControl.click();
  await expect(
    page.getByRole("heading", { name: /Épreuve dossier/u }),
  ).toBeVisible();
  await expect(
    page.locator(
      '.am-subject-list__button[data-subject-id="zone_test_epreuve"]',
    ),
  ).toHaveAttribute("aria-pressed", "true");

  await page
    .locator('.am-subject-list__button[data-subject-id="asset_test_relay_nga"]')
    .click();
  await expect(
    page.getByRole("heading", { name: /relay Ŋa dossier/u }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Select Synthetic relay Ŋa from map",
    }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("shows synthetic, unknown, missing, and glyph safeguards", async ({
  page,
}) => {
  await expect(
    page.getByText("Simulated · Synthetic test geometry"),
  ).toBeVisible();
  await expect(
    page.locator(".am-map-legend").getByText("Not known", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".am-map-legend")
      .getByText("Missing from test artifact", { exact: true }),
  ).toBeVisible();
  const probe = page.getByText(/Burkinabè · Tillabéri · Ŋ/u);
  await expect(probe).toBeVisible();
  expect(await probe.textContent()).toContain("Burkinabè · Tillabéri · Ŋ");
  expect(
    await probe.evaluate((element) =>
      document.fonts.check(
        getComputedStyle(element).font,
        "Burkinabè · Tillabéri · Ŋ",
      ),
    ),
  ).toBe(true);
});

test("presents metadata and keeps evidence separate from assessment", async ({
  page,
}) => {
  await page.getByRole("link", { name: "Monthly brief" }).click();
  await expect(
    page.getByRole("heading", { name: "Opening test brief" }),
  ).toBeVisible();
  await expect(page.getByText("TEST-BRIEF-001")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidence" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Assessment", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Declared confidence: Moderate")).toBeVisible();
  await expect(page.getByText("Simulated · Test-only document")).toBeVisible();

  await page.screenshot({
    path: "docs/build/screenshots/22/documents-1440x900.png",
    fullPage: true,
  });
});

test("passes accessibility smoke and keyboard subject selection", async ({
  page,
}) => {
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  const subject = page.locator(
    '.am-subject-list__button[data-subject-id="corridor_test_beta"]',
  );
  await subject.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: /corridor B dossier/u }),
  ).toBeVisible();
  await expect(subject).toHaveAttribute("aria-pressed", "true");

  await page.screenshot({
    path: "docs/build/screenshots/22/map-list-dossier-1440x900.png",
    fullPage: true,
  });
});
