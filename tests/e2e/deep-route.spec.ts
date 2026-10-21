import { test, expect } from '@playwright/test'
import { resetAs } from './helpers-extra'

// Acesso direto/refresh em rota profunda: exige fallback de histórico (vercel.json / vite preview).
test('acesso direto e refresh em /nfts/nft-1', async ({ page }) => {
  const res = await page.goto('/nfts/nft-1')
  expect(res?.status()).toBe(200)
  await expect(page.getByRole('heading', { name: 'Aurora Genesis' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Aurora Genesis' })).toBeVisible()
  expect(new URL(page.url()).pathname).toBe('/nfts/nft-1')
})

test('refresh em /checkout autenticado mantém a rota', async ({ page }) => {
  await resetAs(page)
  const res = await page.goto('/checkout')
  expect(res?.status()).toBe(200)
  await page.reload()
  await expect(page.locator('nav').first()).toBeVisible()
  expect(new URL(page.url()).pathname).toBe('/checkout')
})
