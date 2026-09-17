import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  globalSetup: './tests/e2e/admin-global-setup.ts',
  webServer: [
    {
      command: 'npm run build && node --import tsx scripts/start-public-e2e.ts',
      url: 'http://127.0.0.1:4321',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: 'node --import tsx scripts/start-admin-e2e.ts',
      url: 'http://127.0.0.1:4322',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    {
      name: 'reduced-motion',
      use: { ...devices['Desktop Chrome'], reducedMotion: 'reduce' },
    },
  ],
});
