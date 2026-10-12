import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./output/playwright/prompt-24",
  reporter: [["line"]],
  timeout: 180_000,
  expect: {
    timeout: 60_000,
  },
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:4173",
    colorScheme: "light",
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "corepack pnpm --filter @african-mandate/web dev --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
