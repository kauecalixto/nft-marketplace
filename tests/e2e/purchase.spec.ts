import { test, expect, type Page } from '@playwright/test'

const ADDRESS = '0x1111111111111111111111111111111111111111'

// O estado do mock vive no navegador (MSW); tudo roda no contexto da página.
async function api(page: Page, method: string, path: string, body?: unknown, headers: Record<string, string> = {}) {
  return page.evaluate(
    async ([m, p, b, h]) => {
      const token = localStorage.getItem('nft:token')
      const r = await fetch(`/api${p}`, {
        method: m as string,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(h as Record<string, string>) },
        body: b ? JSON.stringify(b) : undefined,
      })
      const text = await r.text()
      return { status: r.status, json: text ? JSON.parse(text) : null }
    },
    [method, path, body, headers] as const,
  )
}
const scenario = (page: Page, s: string) => api(page, 'POST', '/__mock/scenario', { scenario: s })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.locator('nav').first().waitFor() // app montado => worker MSW ativo
  await page.evaluate(() => fetch('/api/__mock/reset', { method: 'POST' }))
  await page.evaluate(() => localStorage.setItem('nft:token', 'u-ana'))
})

async function setupCart(page: Page, items: [string, number][] = [['nft-2', 2], ['nft-3', 2]], withWallet = true) {
  if (withWallet) await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  for (const [nftId, quantity] of items) expect((await api(page, 'POST', '/cart', { nftId, quantity })).status).toBe(201)
}

async function fillCheckout(page: Page) {
  await page.goto('/checkout')
  await page.getByTestId('field-name').fill('Ana Colecionadora')
  await page.getByTestId('field-email').fill('ana@example.test')
  await page.getByTestId('field-document').fill('12345678901')
  await page.getByTestId('field-wallet').selectOption({ index: 1 })
  await page.getByTestId('review-order').click()
  await expect(page.getByTestId('review-dialog')).toBeVisible()
}

test('cupom válido, inválido e expirado', async ({ page }) => {
  await setupCart(page, [['nft-2', 2]], false)
  await page.goto('/cart')
  await expect(page.getByTestId('subtotal')).toHaveText('2.50 ETH')
  await expect(page.getByTestId('discount')).toHaveText('0.00 ETH')
  await expect(page.getByTestId('network-fee')).toHaveText('0.005 ETH')
  await expect(page.getByTestId('total')).toHaveText('2.505 ETH')

  await page.getByTestId('coupon-input').fill('NOPE')
  await page.getByTestId('coupon-apply').click()
  await expect(page.getByTestId('coupon-error')).toHaveText('Cupom inválido')

  await page.getByTestId('coupon-input').fill('KURIO5')
  await page.getByTestId('coupon-apply').click()
  await expect(page.getByTestId('coupon-error')).toHaveText('Cupom expirado')

  await page.getByTestId('coupon-input').fill('KURIO10')
  await page.getByTestId('coupon-apply').click()
  await expect(page.getByTestId('discount')).toHaveText('0.25 ETH')
  await expect(page.getByTestId('total')).toHaveText('2.255 ETH')
  await page.getByTestId('coupon-remove').click()
  await expect(page.getByTestId('total')).toHaveText('2.505 ETH')
})

test('alterar quantidades, limite e remover item', async ({ page }) => {
  await setupCart(page, [['nft-2', 1], ['nft-3', 1]], false)
  await page.goto('/cart')
  await page.getByTestId('qty-inc-nft-2').click()
  await expect(page.getByTestId('qty-nft-2')).toHaveText('2')
  await expect(page.getByTestId('qty-inc-nft-2')).toBeDisabled() // min(2, 5) = 2
  await expect(page.getByTestId('subtotal')).toHaveText('2.58 ETH') // 2*1.25 + 0.08
  await page.getByTestId('qty-dec-nft-2').click()
  await expect(page.getByTestId('subtotal')).toHaveText('1.33 ETH')
  await page.getByTestId('remove-nft-3').click()
  await expect(page.getByTestId('cart-item-nft-3')).toHaveCount(0)
  await expect(page.getByTestId('subtotal')).toHaveText('1.25 ETH')
})

test('rollback otimista: quantidade acima do limite volta ao valor do servidor', async ({ page }) => {
  await setupCart(page, [['nft-2', 1]], false)
  await page.goto('/cart')
  await expect(page.getByTestId('qty-nft-2')).toHaveText('1')
  // Quantidade fora do limite: 409 e o estado exibido permanece o do servidor.
  const r = await api(page, 'PATCH', '/cart/nft-2', { quantity: 99 })
  expect(r.status).toBe(409)
  expect(r.json.code).toBe('AVAILABILITY_CONFLICT')
  await expect(page.getByTestId('qty-nft-2')).toHaveText('1')
})

test('carrinho e cupom persistem após refresh', async ({ page }) => {
  await setupCart(page, [['nft-2', 2]], false)
  await page.goto('/cart')
  await page.getByTestId('coupon-input').fill('KURIO10')
  await page.getByTestId('coupon-apply').click()
  await expect(page.getByTestId('coupon-applied')).toBeVisible()
  await page.reload()
  await expect(page.getByTestId('qty-nft-2')).toHaveText('2')
  await expect(page.getByTestId('coupon-applied')).toContainText('KURIO10')
  await expect(page.getByTestId('total')).toHaveText('2.255 ETH')
})

test('compra completa até o recibo confirmado; carrinho esvazia', async ({ page }) => {
  await setupCart(page)
  await fillCheckout(page)
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('review-dialog')).toHaveCount(0)
  await page.getByTestId('review-order').click()
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
  await expect(page.getByTestId('tx-hash')).toContainText('0x')
  await expect(page.getByTestId('receipt-item-nft-2')).toContainText('Blue Orbit')
  await expect(page.getByTestId('subtotal')).toHaveText('2.66 ETH')
  await expect(page.getByTestId('total')).toHaveText('2.665 ETH')
  const cart = await api(page, 'GET', '/cart')
  expect(cart.json).toEqual([])
})

test('validação do formulário de pagamento bloqueia a revisão', async ({ page }) => {
  await setupCart(page)
  await page.goto('/checkout')
  await page.getByTestId('review-order').click()
  await expect(page.getByTestId('error-name')).toHaveText('Informe o nome completo')
  await expect(page.getByTestId('error-email')).toHaveText('E-mail inválido')
  await expect(page.getByTestId('error-walletId')).toHaveText('Selecione uma carteira')
  await expect(page.getByTestId('review-dialog')).toHaveCount(0)
})

test('pagamento recusado preserva o carrinho', async ({ page }) => {
  await setupCart(page)
  await scenario(page, 'payment-declined')
  await fillCheckout(page)
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-error')).toContainText('Pagamento recusado')
  const cart = await api(page, 'GET', '/cart')
  expect(cart.json).toHaveLength(2)
  const orders = await api(page, 'GET', '/orders')
  expect(orders.json.map((o: { status: string }) => o.status)).toEqual(['declined'])
})

test('duplo clique no envio cria um único pedido', async ({ page }) => {
  await setupCart(page)
  await fillCheckout(page)
  await page.getByTestId('confirm-order').dblclick()
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
  const orders = await api(page, 'GET', '/orders')
  expect(orders.json).toHaveLength(1)
})

test('timeout no envio recupera o mesmo pedido com a mesma chave', async ({ page }) => {
  await setupCart(page)
  await scenario(page, 'payment-timeout')
  await fillCheckout(page)
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
  const orders = await api(page, 'GET', '/orders')
  expect(orders.json).toHaveLength(1)
  expect(page.url()).toContain(`/orders/${orders.json[0].id}`)
})

test('cotação alterada exige nova confirmação', async ({ page }) => {
  await setupCart(page)
  await scenario(page, 'stale-quote')
  await fillCheckout(page)
  await expect(page.getByTestId('network-fee').last()).toHaveText('0.005 ETH')
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('quote-changed')).toBeVisible()
  await expect(page.getByTestId('review-dialog').getByTestId('network-fee')).toHaveText('0.006 ETH')
  expect((await api(page, 'GET', '/orders')).json).toHaveLength(0)
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
  await expect(page.getByTestId('network-fee')).toHaveText('0.006 ETH')
})

test('pedido pendente: confirmação só aparece após confirmar; novo pedido é barrado', async ({ page }) => {
  await setupCart(page)
  await scenario(page, 'payment-held')
  await fillCheckout(page)
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-pending')).toBeVisible()
  await expect(page.getByTestId('order-confirmed')).toHaveCount(0)
  const [order] = (await api(page, 'GET', '/orders?status=pending')).json
  const again = await api(page, 'POST', '/orders', { collector: { name: 'Ana Colecionadora', email: 'a@b.co', document: '12345678901' }, walletId: 'x', network: 'ethereum', quoteVersion: 'v' }, { 'Idempotency-Key': 'k-other' })
  expect(again.status).toBe(409)
  expect(again.json.code).toBe('ORDER_PENDING')
  await api(page, 'POST', `/__mock/orders/${order.id}/confirm`)
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
})

test('pendente com auto-confirmação em 400ms', async ({ page }) => {
  await setupCart(page)
  await scenario(page, 'payment-pending')
  await fillCheckout(page)
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-confirmed')).toBeVisible({ timeout: 8000 })
})

test('mesma Idempotency-Key com conteúdo diferente gera conflito', async ({ page }) => {
  await setupCart(page)
  const wallet = (await api(page, 'GET', '/wallets')).json[0]
  const quote = (await api(page, 'GET', '/quote?network=ethereum')).json
  const body = { collector: { name: 'Ana Colecionadora', email: 'ana@example.test', document: '12345678901' }, walletId: wallet.id, network: 'ethereum', quoteVersion: quote.version }
  const h = { 'Idempotency-Key': 'key-1' }
  const first = await api(page, 'POST', '/orders', body, h)
  expect(first.status).toBe(201)
  const same = await api(page, 'POST', '/orders', body, h)
  expect(same.json.id).toBe(first.json.id)
  const other = await api(page, 'POST', '/orders', { ...body, collector: { ...body.collector, name: 'Outro Nome' } }, h)
  expect(other.status).toBe(409)
  expect(other.json.code).toBe('IDEMPOTENCY_CONFLICT')
})

test('wallet-rejected mostra erro e não cria pedido', async ({ page }) => {
  await setupCart(page)
  await scenario(page, 'wallet-rejected')
  await fillCheckout(page)
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-error')).toContainText('carteira recusou')
  expect((await api(page, 'GET', '/orders')).json).toHaveLength(0)
})
