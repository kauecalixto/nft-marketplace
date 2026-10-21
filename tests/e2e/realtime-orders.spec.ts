import { test, expect, type Page } from '@playwright/test'
import { api, resetAs, ADDRESS, fillCheckout } from './helpers-extra'

const post = (page: Page, url: string, body?: unknown) =>
  page.evaluate(
    async ([u, b]) => (await fetch(u as string, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b ?? {}) })).json(),
    [url, body] as const,
  )
const clients = (page: Page) =>
  page.evaluate(async () => ((await (await fetch('/api/__mock/socket/clients')).json()) as { count: number }).count)
const orderList = async (page: Page) => {
  const r = await api(page, 'GET', '/orders')
  return (Array.isArray(r.json) ? r.json : (r.json.items ?? r.json.orders)) as unknown[]
}

async function submitHeld(page: Page) {
  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/cart', { nftId: 'nft-2', quantity: 1 })
  await api(page, 'POST', '/__mock/scenario', { scenario: 'payment-held' })
  await fillCheckout(page)
  await page.getByTestId('review-order').click()
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-pending')).toBeVisible()
  return new URL(page.url()).pathname.split('/').pop()!
}

test.beforeEach(async ({ page }) => {
  await resetAs(page)
})

test('desconexão durante pedido pendente: confirma ao reconectar sem duplicar pedido', async ({ page }) => {
  const id = await submitHeld(page)
  await expect.poll(() => clients(page)).toBe(1)
  await post(page, '/api/__mock/socket/disconnect')
  await post(page, `/api/__mock/orders/${id}/confirm`)
  await expect(page.getByTestId('order-confirmed')).toBeVisible({ timeout: 15000 })
  expect(await orderList(page)).toHaveLength(1)
})

test('estado terminal permanece terminal; evento tardio ou duplicado não regride o pedido', async ({ page }) => {
  const id = await submitHeld(page)
  await post(page, `/api/__mock/orders/${id}/confirm`)
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
  await post(page, `/api/__mock/orders/${id}/decline`)
  await page.waitForTimeout(700)
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
  await expect(page.getByTestId('order-declined')).toHaveCount(0)
  await post(page, `/api/__mock/orders/${id}/confirm`)
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
})

test('refresh com pedido pendente recupera o mesmo pedido', async ({ page }) => {
  const id = await submitHeld(page)
  await page.reload()
  await expect(page.getByTestId('order-pending')).toBeVisible()
  expect(new URL(page.url()).pathname).toBe(`/orders/${id}`)
  expect(await orderList(page)).toHaveLength(1)
})

test('nft.updated com NFT no carrinho: aviso no carrinho; cotação antiga bloqueia a confirmação', async ({ page }) => {
  await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  await api(page, 'POST', '/cart', { nftId: 'nft-1', quantity: 1 })
  await page.goto('/cart')
  await expect(page.getByTestId('cart-item-nft-1')).toBeVisible()
  await expect.poll(() => clients(page)).toBe(1)
  await post(page, '/api/__mock/nfts/nft-1/update')
  await expect(page.getByTestId('nft-updated-notice')).toHaveText('Preço ou disponibilidade atualizado')

  await fillCheckout(page)
  await page.getByTestId('review-order').click()
  await expect(page.getByTestId('review-dialog')).toBeVisible()
  await expect.poll(() => clients(page)).toBe(1)
  await api(page, 'POST', '/__mock/scenario', { scenario: 'stale-quote' }) // servidor mudou a cotação após a revisão
  await page.getByTestId('confirm-order').click()
  // a cotação do diálogo está velha em relação ao servidor: não pode concluir direto
  await expect(page.getByTestId('quote-changed')).toBeVisible()
  await expect(page.getByTestId('order-confirmed')).toHaveCount(0)
})
