/*
 * Spec Playwright da feature "Pedido único sem duplicidade" (docs/pedido-unico-sem-duplicidade-spec.md, ADR 0001).
 * REST passa pelos handlers MSW reais; o tempo real chega pelo cliente socket.io-client da aplicação
 * (emitido pelo servidor Socket.IO simulado via /api/__mock/...). Nada de setters/cache/callbacks da UI.
 *
 * Mapeamento dos nomes e valores da spec para as fixtures reais (src/mocks/fixtures.ts):
 *   "Aurora 12" (0,50 ETH) -> nft-1 "Aurora Genesis" (0.50 ETH, limite por carteira 3, compra 2 unidades)
 *   "Brisa 07"  (0,30 ETH) -> nft-6 "Solo Limit"     (0.30 ETH, limite por carteira 1, 1 unidade)
 *   "pedido de 1,00 ETH"   -> subtotal 1.00 ETH (2 x 0.50). O total do pedido é 1.005 ETH porque a taxa de rede
 *                             da rede Ethereum (0.005 ETH) é somada; a spec não menciona a taxa.
 *
 * Divergência cenário x app (ver relatório): o app não permite pagar só parte do carrinho; o pedido sempre
 * contém o carrinho inteiro no momento do envio. Para exercitar "só os itens e quantidades comprados saem do
 * carrinho" (EARS-03), "Brisa 07"/"Solo Limit" é adicionada ao carrinho DEPOIS de o pedido ser criado, via
 * REST (POST /api/cart), e portanto não pertence ao pedido.
 * O pedido pendente é obtido com o cenário de mock `payment-held`; o evento antigo com /__mock/orders/:id/event.
 */
import { test, expect, type Page } from '@playwright/test'
import { api, resetAs, ADDRESS } from './helpers-extra'

const AURORA = 'nft-1'
const BRISA = 'nft-6'

interface OrderBody {
  collector: { name: string; email: string; document: string }
  walletId: string
  network: string
  quoteVersion: string
}
interface OrderDto {
  id: string
  status: 'pending' | 'confirmed' | 'declined'
  subtotal: string
  items: { nftId: string; quantity: number }[]
}

const post = (page: Page, url: string, body?: unknown) =>
  page.evaluate(
    async ([u, b]) => (await fetch(u as string, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b ?? {}) })).json(),
    [url, body] as const,
  )
const clients = (page: Page) =>
  page.evaluate(async () => ((await (await fetch('/api/__mock/socket/clients')).json()) as { count: number }).count)
const orders = async (page: Page) => (await api(page, 'GET', '/orders')).json as OrderDto[]
const cart = async (page: Page) => (await api(page, 'GET', '/cart')).json as { nftId: string; quantity: number }[]

// POST /orders com Idempotency-Key explícita, pelos handlers MSW (o helper `api` não aceita cabeçalhos).
function postOrder(page: Page, key: string, body: OrderBody) {
  return page.evaluate(
    async ([k, b]) => {
      const token = localStorage.getItem('nft:token')
      const r = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'Idempotency-Key': k as string },
        body: JSON.stringify(b),
      })
      return { status: r.status, json: await r.json() }
    },
    [key, body] as const,
  )
}

async function walletId(page: Page): Promise<string> {
  const r = await api(page, 'POST', '/wallets', { label: 'Principal', address: ADDRESS })
  expect(r.status).toBe(201)
  return r.json.id as string
}
async function addToCart(page: Page, nftId: string, quantity: number) {
  expect((await api(page, 'POST', '/cart', { nftId, quantity })).status).toBe(201)
}
async function orderBody(page: Page, wallet: string): Promise<OrderBody> {
  const quote = (await api(page, 'GET', '/quote?network=ethereum')).json as { version: string }
  return {
    collector: { name: 'Ana Colecionadora', email: 'ana@example.test', document: '12345678901' },
    walletId: wallet,
    network: 'ethereum',
    quoteVersion: quote.version,
  }
}

test.beforeEach(async ({ page }) => {
  await resetAs(page) // estado isolado: reset do mock + localStorage limpo + sessão u-ana
})

test('Cliques repetidos na mesma tentativa geram um único pedido', async ({ page }) => {
  // EARS-01
  const wallet = await walletId(page)
  await addToCart(page, AURORA, 2)
  const body = await orderBody(page, wallet)
  const key = 'tentativa-cb01'

  // três envios simultâneos da mesma tentativa (mesma chave, mesmo conteúdo)
  const responses = await Promise.all([postOrder(page, key, body), postOrder(page, key, body), postOrder(page, key, body)])
  for (const r of responses) expect([200, 201]).toContain(r.status)
  const ids = new Set(responses.map((r) => r.json.id as string))
  expect(ids.size).toBe(1) // as três respostas se referem ao mesmo pedido
  for (const r of responses) expect(r.json.subtotal).toBe('1.00')

  // "Brisa 07" está no carrinho mas não foi comprada
  await addToCart(page, BRISA, 1)
  const list = await orders(page)
  expect(list).toHaveLength(1) // exatamente 1 pedido para a tentativa
  expect(list[0].id).toBe([...ids][0])
  expect(list[0].subtotal).toBe('1.00')
  expect(list[0].items).toEqual([expect.objectContaining({ nftId: AURORA, quantity: 2 })])

  // reenvio posterior (a UI usa a mesma chave após timeout) continua devolvendo o mesmo pedido
  const again = await postOrder(page, key, body)
  expect(again.json.id).toBe([...ids][0])
  expect(await orders(page)).toHaveLength(1)
})

test('Pedido pendente é recuperado após recarregar e só a compra confirmada altera o carrinho', async ({ page }) => {
  // EARS-02, EARS-03, EARS-04
  await walletId(page)
  await addToCart(page, AURORA, 2)
  await api(page, 'POST', '/__mock/scenario', { scenario: 'payment-held' }) // pedido fica pendente até o mock confirmar

  await page.goto('/checkout')
  await page.getByTestId('field-name').fill('Ana Colecionadora')
  await page.getByTestId('field-email').fill('ana@example.test')
  await page.getByTestId('field-document').fill('12345678901')
  await page.getByTestId('field-wallet').selectOption({ index: 1 })
  await page.getByTestId('review-order').click()
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-pending')).toBeVisible()
  const id = new URL(page.url()).pathname.split('/').pop()!
  expect((await orders(page))[0].subtotal).toBe('1.00')

  // "Brisa 07" entra no carrinho enquanto o pedido está pendente (não faz parte do pedido)
  await addToCart(page, BRISA, 1)
  await expect.poll(() => clients(page)).toBe(1)

  // conexão interrompida + recarga
  await post(page, '/api/__mock/socket/disconnect')
  await page.reload()
  await expect(page.getByTestId('order-pending')).toBeVisible()
  expect(new URL(page.url()).pathname).toBe(`/orders/${id}`)
  await expect(page.getByTestId('order-confirmed')).toHaveCount(0)
  const pendingList = await orders(page)
  expect(pendingList).toHaveLength(1)
  expect(pendingList[0]).toEqual(expect.objectContaining({ id, status: 'pending', subtotal: '1.00' }))
  expect(await cart(page)).toEqual(expect.arrayContaining([expect.objectContaining({ nftId: AURORA, quantity: 2 })])) // pendente não mexe no carrinho

  // o pedido passa a confirmado; o app o recebe pelo cliente Socket.IO real reconectado
  await expect.poll(() => clients(page)).toBe(1)
  await post(page, `/api/__mock/orders/${id}/confirm`)
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
  await expect(page.getByTestId(`receipt-item-${AURORA}`)).toHaveText('Aurora Genesis x 2 - 1.00 ETH')
  await expect(page.getByTestId('subtotal')).toHaveText('1.00 ETH')
  await expect(page.getByTestId('total')).toHaveText('1.005 ETH') // 1.00 + taxa de rede 0.005
  expect(await cart(page)).toEqual([expect.objectContaining({ nftId: BRISA, quantity: 1 })]) // só os itens comprados saíram
  expect(await orders(page)).toHaveLength(1)

  // atualização antiga (versão 1, pendente) chega pelo socket: o pedido continua confirmado
  await post(page, `/api/__mock/orders/${id}/event`, { version: 1, status: 'pending' })
  await page.waitForTimeout(1500) // > refetch de 1s do pedido, caso o estado voltasse a pendente
  await expect(page.getByTestId('order-confirmed')).toBeVisible()
  await expect(page.getByTestId('order-pending')).toHaveCount(0)
  expect((await orders(page))[0].status).toBe('confirmed')
})

test('Reutilizar a tentativa com itens diferentes é tratado como conflito', async ({ page }) => {
  // EARS-05
  const wallet = await walletId(page)
  await addToCart(page, AURORA, 2)
  const body = await orderBody(page, wallet)
  const key = 'tentativa-cb03'
  const first = await postOrder(page, key, body)
  expect(first.status).toBe(201)
  expect(first.json.subtotal).toBe('1.00')

  // a mesma tentativa é reenviada incluindo "Brisa 07" (cotação com outro conteúdo)
  await addToCart(page, BRISA, 1)
  const changed = await orderBody(page, wallet)
  expect(changed.quoteVersion).not.toBe(body.quoteVersion)

  // pela API: conflito 409 explícito
  const conflict = await postOrder(page, key, changed)
  expect(conflict.status).toBe(409)
  expect(conflict.json.code).toBe('IDEMPOTENCY_CONFLICT')

  // pela interface: a tentativa (chave) é recuperada do rascunho de checkout salvo na expiração da sessão
  await page.evaluate(
    ([k, w]) =>
      sessionStorage.setItem(
        'checkout-draft:u-ana',
        JSON.stringify({
          form: { name: 'Ana Colecionadora', email: 'ana@example.test', document: '12345678901', walletId: w, network: 'ethereum' },
          open: true,
          idemKey: k,
        }),
      ),
    [key, wallet] as const,
  )
  await page.goto('/checkout')
  await expect(page.getByTestId('review-dialog')).toBeVisible()
  await page.getByTestId('confirm-order').click()
  await expect(page.getByTestId('order-error')).toContainText('chave já usada com conteúdo diferente') // aviso ao colecionador
  await expect(page.getByTestId('order-confirmed')).toHaveCount(0)

  // continua existindo exatamente 1 pedido, de 1.00 ETH, sem "Brisa 07"
  const list = await orders(page)
  expect(list).toHaveLength(1)
  expect(list[0].id).toBe(first.json.id)
  expect(list[0].subtotal).toBe('1.00')
  expect(list[0].items.map((i) => i.nftId)).toEqual([AURORA])
})
