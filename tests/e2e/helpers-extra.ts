import { expect, type Page } from '@playwright/test'

export const ADDRESS = '0x1111111111111111111111111111111111111111'

export async function api(page: Page, method: string, path: string, body?: unknown) {
  return page.evaluate(
    async ([m, p, b]) => {
      const token = localStorage.getItem('nft:token')
      const r = await fetch(`/api${p}`, {
        method: m as string,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: b ? JSON.stringify(b) : undefined,
      })
      const t = await r.text()
      return { status: r.status, json: t ? JSON.parse(t) : null }
    },
    [method, path, body] as const,
  )
}

export async function resetAs(page: Page, token: string | null = 'u-ana') {
  await page.goto('/')
  await page.locator('nav').first().waitFor()
  await page.evaluate(() => {
    localStorage.clear()
    return fetch('/api/__mock/reset', { method: 'POST' })
  })
  if (token) await page.evaluate((t) => localStorage.setItem('nft:token', t), token)
}

export async function fillCheckout(page: Page) {
  await page.goto('/checkout')
  await page.getByTestId('field-name').fill('Ana Colecionadora')
  await page.getByTestId('field-email').fill('ana@example.test')
  await page.getByTestId('field-document').fill('12345678901')
  await page.getByTestId('field-wallet').selectOption({ index: 1 })
}

export async function noOverflow(page: Page) {
  const r = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth }))
  expect(r.sw, `${page.url()} scrollWidth ${r.sw} > innerWidth ${r.iw}`).toBeLessThanOrEqual(r.iw)
}
