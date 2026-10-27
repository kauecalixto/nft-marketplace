import { test, expect, type Page } from '@playwright/test'
import { api, resetAs, ADDRESS, fillCheckout } from './helpers-extra'

// A11y: a mudança pendente -> confirmado tem de ser anunciada por uma região viva (role=status/alert ou aria-live),
// não só trocada visualmente na tela.

const LIVE = '[role="status"], [role="alert"], [aria-live="polite"], [aria-live="assertive"]'
const post = (page: Page, url: string) => page.evaluate(async (u) => (await fetch(u, { method: 'POST' })).status, url)

test.beforeEach(async ({ page }) => {
  await resetAs(page)
})

test('confirmação do pedido (pendente -> confirmado) é anunciada em região viva', async ({ page }) => {
  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  await api(page, 'POST', '/__mock/scenario', { scenario: 'payment-held' })
  await fillCheckout(page)
  await page.getByTestId('review-order').click()
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-pending')).toBeVisible()
  // O estado pendente já é uma região viva (aviso de "aguardando").
  await expect(page.locator(LIVE).filter({ hasText: /pendente/i })).not.toHaveCount(0)

  const id = new URL(page.url()).pathname.split('/').pop()!
  // Observa de dentro da página: qualquer texto com "confirmad" que entre numa região viva depois deste ponto.
  await page.evaluate((sel) => {
    const w = window as unknown as { __announced: string[] }
    w.__announced = []
    const scan = () => {
      for (const el of document.querySelectorAll(sel)) {
        const t = (el.textContent ?? '').trim()
        if (/confirmad/i.test(t) && !w.__announced.includes(t)) w.__announced.push(t)
      }
    }
    new MutationObserver(scan).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true })
    scan()
  }, LIVE)

  expect(await post(page, `/api/__mock/orders/${id}/confirm`)).toBeLessThan(300)
  await expect(page.getByTestId('order-confirmed')).toBeVisible()

  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __announced: string[] }).__announced.length), {
      message: 'nenhuma região viva (role=status/alert/aria-live) anunciou a confirmação do pedido',
    })
    .toBeGreaterThan(0)
  await expect(page.locator(LIVE).filter({ hasText: /confirmad/i })).not.toHaveCount(0)
})
