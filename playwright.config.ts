import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    // Always capture screenshots — we read them to verify UI visually
    screenshot: 'on',
    // Capture trace on first retry for debugging
    trace: 'on-first-retry',
    // Viewport that matches a typical desktop session
    viewport: { width: 1440, height: 900 },
  },

  outputDir: 'test-results',

  // Reuse an already-running dev server; if none is up, start one
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
