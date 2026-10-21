import { defineConfig, devices } from '@playwright/test'

// responsive.spec e visual-regression definem seus próprios viewports (390/768/1440); rodá-los em outros projetos só duplicaria.
const RESPONSIVE = /(catalog|states|quantity-limit|a11y-keyboard|realtime-orders|realtime-checkout|cart-merge|wallet-edit|featured-gallery|not-found|deep-route).spec.ts/

export default defineConfig({
  testDir: './tests/e2e',
  reporter: 'html',
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  // Um único comando (`npx playwright test`): desktop roda tudo; tablet e mobile rodam os specs responsivos.
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'chromium-tablet', testMatch: RESPONSIVE, use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } } },
    { name: 'chromium-mobile', testMatch: RESPONSIVE, use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, hasTouch: true } },
  ],
  webServer: {
    command: 'npm run build:demo && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120000,
  },
})
