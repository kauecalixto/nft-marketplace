import { test, expect, type Page } from '@playwright/test'
import { api, resetAs, ADDRESS, fillCheckout } from './helpers-extra'

const post = (page: Page, url: string, body?: unknown) =>
  page.evaluate(
    async ([u, b]) => (await fetch(u as string, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b ?? {}) })).json(),
    [url, body] as const,
  )
const clients = (page: Page) =>
  page.evaluate(async () => ((await (await fetch('/api/__mock/socket/clients')).json()) as { count: number }).count)

async function seed(page: Page, nftId: string) {
  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/cart', { nftId, quantity: 1 })
}

test.beforeEach(async ({ page }) => {
  await resetAs(page)
})

test('nft.updated com checkout aberto: aviso, valor novo e confirmação exige reconfirmar', async ({ page }) => {
  await seed(page, 'nft-1')
  await fillCheckout(page)
  await expect(page.getByTestId('quote-summary').first()).toBeVisible() // carrinho carregado antes do evento
  await expect.poll(() => clients(page)).toBe(1)
  await post(page, '/api/__mock/nfts/nft-1/update') // preço -> 0.125, ainda sem diálogo
  await expect(page.getByTestId('nft-updated-notice')).toHaveText('Preço ou disponibilidade atualizado')
  await expect(page.getByTestId('subtotal').first()).toHaveText('0.125 ETH')
  await page.getByTestId('review-order').click()
  const dialog = page.getByTestId('review-dialog')
  await expect(dialog.getByTestId('subtotal')).toHaveText('0.125 ETH')
  await post(page, '/api/__mock/nfts/nft-1/update', { price: '0.2' }) // muda de novo com o diálogo aberto
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('quote-changed')).toBeVisible()
  await expect(dialog.getByTestId('subtotal')).toHaveText('0.20 ETH')
  await expect(page.getByTestId('order-confirmed')).toHaveCount(0)
  expect((await api(page, 'GET', '/orders')).json).toHaveLength(0)
  await page.getByTestId('confirm-order').click() // reconfirmação com a cotação nova
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
  expect((await api(page, 'GET', '/orders')).json).toHaveLength(1)
})

test('pedido pendente + desconexão do socket: após reconectar mostra confirmado, um único pedido', async ({ page }) => {
  await seed(page, 'nft-2')
  await api(page, 'POST', '/__mock/scenario', { scenario: 'payment-held' })
  await fillCheckout(page)
  await page.getByTestId('review-order').click()
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-pending')).toBeVisible()
  const id = new URL(page.url()).pathname.split('/').pop()!
  await expect.poll(() => clients(page)).toBe(1)
  await post(page, '/api/__mock/socket/disconnect')
  expect(await clients(page)).toBe(0)
  await post(page, `/api/__mock/orders/${id}/confirm`)
  await expect(page.getByTestId('order-confirmed')).toBeVisible({ timeout: 15000 })
  await expect.poll(() => clients(page)).toBe(1)
  expect((await api(page, 'GET', '/orders')).json).toHaveLength(1)
})

test('timeout de pagamento com relógio controlado: retry com a mesma chave, sem duplicar', async ({ page }) => {
  await seed(page, 'nft-2')
  await api(page, 'POST', '/__mock/scenario', { scenario: 'payment-timeout' })
  await fillCheckout(page)
  await page.getByTestId('review-order').click()
  await expect(page.getByTestId('review-dialog')).toBeVisible()
  await page.clock.install()
  await page.getByTestId('confirm-order').click()
  // avança o tempo (backoff de 300ms entre tentativas) sem esperar de verdade
  for (let i = 0; i < 10 && !(await page.getByTestId('order-confirmed').isVisible()); i++) {
    await page.clock.runFor(400)
    await page.waitForTimeout(50)
  }
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
  expect((await api(page, 'GET', '/orders')).json).toHaveLength(1)
})
