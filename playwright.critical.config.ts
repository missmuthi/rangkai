import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"]],
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  outputDir: "test-results/artifacts",
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "critical",
      use: {
        ...devices["Desktop Chrome"],
      },
      testMatch: /critical\.spec\.ts/,
    },
  ],
  webServer: {
    command: "bun scripts/nuxt-dev-safe.mjs --port 3001",
    url: "http://127.0.0.1:3001",
    env: {
      NUXT_PUBLIC_SITE_URL: "http://127.0.0.1:3001",
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
