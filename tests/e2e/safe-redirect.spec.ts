import { test, expect, type Page } from '@playwright/test'
import { resetAs } from './helpers-extra'

// safeRedirect (login ?redirect=): só caminhos do mesmo site; barra invertida e controles viram '/'.

const BACKSLASH = String.fromCharCode(92)
const TAB = String.fromCharCode(9)

async function loginFollowingRedirect(page: Page, redirect: string, origin: string) {
  const offSite: string[] = []
  await page.route(/^https?:\/\//, (route) => {
    if (route.request().url().startsWith(origin)) return route.fallback()
    offSite.push(route.request().url())
    return route.abort()
  })
  await page.goto(`/login?redirect=${encodeURIComponent(redirect)}`)
  await page.getByLabel('E-mail').fill('ana@example.test')
  await page.getByLabel('Senha').fill('kurio-demo')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByTestId('nav-user')).toHaveText('Ana Demo')
  return offSite
}

test.beforeEach(async ({ page }) => {
  await resetAs(page, null)
})

const MALICIOUS = [
  ['barra + barra invertida', `/${BACKSLASH}evil.com`],
  ['barra, barra invertida e t literal', `/${BACKSLASH}t/evil.com`],
  ['barra, TAB real, barra', `/${TAB}/evil.com`],
  ['barra, barra invertida, TAB real', `/${BACKSLASH}${TAB}/evil.com`],
  ['duas barras', '//evil.com'],
] as const

for (const [name, redirect] of MALICIOUS) {
  test(`redirect malicioso (${name}) cai em / no mesmo site`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL!).origin
    const offSite = await loginFollowingRedirect(page, redirect, origin)
    expect(new URL(page.url()).origin).toBe(origin)
    expect(new URL(page.url()).pathname).toBe('/')
    expect(offSite).toEqual([])
  })
}

test('redirect legítimo do mesmo site continua funcionando', async ({ page, baseURL }) => {
  await loginFollowingRedirect(page, '/cart', new URL(baseURL!).origin)
  await expect(page).toHaveURL(/\/cart$/)
})
