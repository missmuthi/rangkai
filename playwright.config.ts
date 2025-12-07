import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Enhanced reporting
  reporter: [
    ['html', { outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  // Global timeout settings
  timeout: 60 * 1000, // 60s per test
  expect: {
    timeout: 10 * 1000 // 10s for assertions
  },
  
  // Output directory for screenshots, traces
  outputDir: 'test-results/artifacts',

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Setup project to authenticate
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'], 
        storageState: 'playwright/.auth/user.json' 
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'], 
        storageState: 'playwright/.auth/user.json' 
      },
      dependencies: ['setup'],
    },
    // Standalone project for tests that don't need auth setup
    {
      name: 'chromium-no-auth',
      use: { 
        ...devices['Desktop Chrome']
      },
      testMatch: /(real-isbn-scan|ux-features)\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
