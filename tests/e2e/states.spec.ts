import { test, expect, type Page } from '@playwright/test'

const scenario = (page: Page, s: string) =>
  page.evaluate((sc) => fetch('/api/__mock/scenario', { method: 'POST', body: JSON.stringify({ scenario: sc }) }), s)

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => fetch('/api/__mock/reset', { method: 'POST' }))
})

test('skeleton do catálogo aparece sob cenário slow e some ao carregar', async ({ page }) => {
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Carrinho' })).toBeVisible() // app e worker MSW prontos
  await scenario(page, 'slow')
  await page.getByRole('link', { name: 'Início' }).click()
  await expect(page.getByTestId('skeleton-catalog')).toBeVisible()
  await expect(page.getByTestId('skeleton-card')).toHaveCount(6)
  await expect(page.getByTestId('nft-card')).toHaveCount(6, { timeout: 8000 })
  await expect(page.getByTestId('skeleton-catalog')).toHaveCount(0)
})

test('skeleton do detalhe aparece sob cenário slow', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('nft-card')).toHaveCount(6)
  await scenario(page, 'slow')
  await page.getByRole('link', { name: /Blue Orbit/ }).click()
  await expect(page.getByTestId('skeleton-detail')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Blue Orbit' })).toBeVisible({ timeout: 8000 })
})

test('erro HTTP 500 mostra alerta e Tentar novamente recupera', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('nft-card')).toHaveCount(6)
  await scenario(page, 'http-500')
  await page.getByLabel('Somente disponíveis').check()
  await expect(page.getByTestId('catalog-error')).toBeVisible()
  await scenario(page, 'default')
  await page.getByRole('button', { name: 'Tentar novamente' }).click()
  await expect(page.getByTestId('nft-card')).toHaveCount(6)
  await expect(page.getByTestId('catalog-error')).toHaveCount(0)
})
