import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const viewports = [
  { width: 1920, height: 1080, name: "desktop-target" },
  { width: 1440, height: 900, name: "desktop-common" },
  { width: 1280, height: 720, name: "desktop-minimum" },
  { width: 1024, height: 768, name: "tablet-landscape" },
] as const;

test("passes the accessibility smoke and exposes no unnamed buttons", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?testRoute=1");

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);

  for (const button of await page.getByRole("button").all()) {
    await expect(button).toHaveAccessibleName(/\S/u);
  }
  await expect(page.getByText("A larger screen is required")).toBeHidden();
});

test("supports keyboard skip navigation and campaign navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?testRoute=1");

  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to campaign workspace" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#campaign-workspace$/u);
  await expect(page.getByRole("main")).toBeFocused();

  const briefLink = page.getByRole("link", { name: "Monthly brief" });
  await briefLink.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("heading", { name: "Monthly brief", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "Opening test brief" }),
  ).toBeVisible();
  await expect(briefLink).toHaveAttribute("aria-current", "page");
});

test("renders loading, error, and partial states", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  for (const [state, heading] of [
    ["loading", "Loading campaign view"],
    ["error", "Campaign view could not load"],
    ["partial", "Partial campaign view"],
  ] as const) {
    await page.goto(`/?testRoute=1&state=${state}`);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});

test("keeps content and controls available at 200 percent text size", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?testRoute=1");
  await page.locator("html").evaluate((element) => {
    element.setAttribute("style", "font-size: 200%");
  });

  const measurements = await page.evaluate(() => ({
    viewportWidth: window.innerWidth,
    documentWidth: document.documentElement.scrollWidth,
    workspaceHeight:
      document.querySelector("main")?.getBoundingClientRect().height ?? 0,
    overflowingElements: [...document.querySelectorAll("body *")]
      .map((element) => ({
        className: element.getAttribute("class") ?? "",
        right: Math.ceil(element.getBoundingClientRect().right),
        text: element.textContent?.trim().slice(0, 80) ?? "",
      }))
      .filter((element) => element.right > window.innerWidth),
  }));
  expect(measurements.overflowingElements).toEqual([]);
  expect(measurements.documentWidth).toBeLessThanOrEqual(
    measurements.viewportWidth,
  );
  expect(measurements.workspaceHeight).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "End month" })).toBeVisible();
  await page.screenshot({
    path: "docs/build/screenshots/21/text-zoom-200.png",
    fullPage: true,
  });
});

test("honors reduced motion and omits unapproved headline indicators", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/?testRoute=1");
  const text = (await page.locator("body").innerText()).toLowerCase();
  for (const prohibited of [
    "stability",
    "insurgency",
    "civilian support",
    "global legitimacy",
    "regional synergy",
  ]) {
    expect(text).not.toContain(prohibited);
  }
  const motion = await page.locator(".am-shell").evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      animation: style.animationName,
      transition: style.transitionDuration,
    };
  });
  expect(motion.animation).toBe("none");
  expect(motion.transition).toBe("0s");
});

for (const viewport of viewports) {
  test(`captures and measures ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/?testRoute=1");
    const measurement = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
    }));
    expect(measurement.width).toBe(viewport.width);
    expect(measurement.height).toBe(viewport.height);
    expect(measurement.documentWidth).toBeLessThanOrEqual(viewport.width);
    await page.screenshot({
      path: `docs/build/screenshots/21/${viewport.name}-${viewport.width}x${viewport.height}.png`,
      fullPage: true,
    });
  });
}
