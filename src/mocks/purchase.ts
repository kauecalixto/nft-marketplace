import { http, HttpResponse } from 'msw'
import { currentNft } from './fixtures'
import { emitters, resolveUser } from './shared'
import { formatEth, mulInt, parseEth, percentOf } from '../purchase/eth'
import type { CartItem, Order, OrderItem, Quote } from '../purchase/types'

const PURCHASE_SCENARIOS: string[] = ['payment-declined', 'payment-pending', 'payment-held', 'payment-timeout', 'stale-quote', 'wallet-rejected']

const STORE_KEY = 'mock:purchase'
const FEES: Record<string, string> = { ethereum: '0.005', polygon: '0.001', base: '0.0005' }
const COUPONS: Record<string, { pct: number; expired?: boolean }> = { KURIO10: { pct: 10 }, KURIO5: { pct: 5, expired: true } }
const GUEST = 'guest'

interface Stored {
  carts: Record<string, { nftId: string; quantity: number }[]>
  coupons: Record<string, string | null>
  orders: Order[]
  idem: Record<string, { hash: string; orderId: string }>
  counter: number
  feeBump: string // wei, acrescentado pelo cenário stale-quote
  scenario: string
}
const fresh = (): Stored => ({ carts: {}, coupons: {}, orders: [], idem: {}, counter: 0, feeBump: '0', scenario: 'default' })
function load(): Stored {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) return { ...fresh(), ...JSON.parse(raw) }
  } catch {
    /* sem persistência */
  }
  return fresh()
}
let S = load()
const save = () => {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(S))
  } catch {
    /* ignore */
  }
}

export function setPurchaseScenario(s: string) {
  S.scenario = s
  save()
}
export const getPurchaseScenario = () => S.scenario
export function isPurchaseScenario(s: string) {
  return PURCHASE_SCENARIOS.includes(s)
}
export function resetPurchase() {
  S = fresh()
  try {
    localStorage.removeItem(STORE_KEY)
  } catch {
    /* ignore */
  }
}

const err = (status: number, code: string, message: string, extra?: object) =>
  HttpResponse.json({ code, message, ...extra }, { status })
const maxFor = (nftId: string) => {
  const n = currentNft(nftId)
  return n ? Math.min(n.edition.available, n.walletLimit) : 0
}

// Identifica o dono do carrinho; ao autenticar, o carrinho do visitante é mesclado no do usuário.
function owner(request: Request): string {
  const user = resolveUser(request)
  if (!user) return GUEST
  const guest = S.carts[GUEST] ?? []
  if (guest.length) {
    const cart = (S.carts[user.id] ??= [])
    for (const g of guest) {
      const ex = cart.find((i) => i.nftId === g.nftId)
      const max = maxFor(g.nftId)
      if (ex) ex.quantity = Math.min(ex.quantity + g.quantity, max)
      else if (max > 0) cart.push({ nftId: g.nftId, quantity: Math.min(g.quantity, max) })
    }
    S.carts[GUEST] = []
    if (S.coupons[GUEST] && !S.coupons[user.id]) S.coupons[user.id] = S.coupons[GUEST]
    S.coupons[GUEST] = null
    save()
  }
  return user.id
}

function cartView(key: string): CartItem[] {
  return (S.carts[key] ?? []).flatMap((i) => {
    const n = currentNft(i.nftId)
    if (!n) return []
    return [{ nftId: n.id, name: n.name, image: n.image, price: n.price, quantity: i.quantity, available: n.edition.available, max: maxFor(n.id) }]
  })
}

function buildQuote(key: string, network: string): Quote {
  const items = cartView(key)
  const code = S.coupons[key] ?? null
  const coupon = code ? COUPONS[code] : undefined
  let subtotal = 0n
  const lines = items.map((i) => {
    const line = mulInt(parseEth(i.price), i.quantity)
    subtotal += line
    return { nftId: i.nftId, name: i.name, quantity: i.quantity, unitPrice: i.price, lineTotal: formatEth(line) }
  })
  const discount = coupon && !coupon.expired ? percentOf(subtotal, coupon.pct) : 0n
  const fee = items.length ? parseEth(FEES[network] ?? FEES.ethereum) + BigInt(S.feeBump) : 0n
  const total = subtotal - discount + fee
  const unavailable = items.filter((i) => i.quantity > i.max).map((i) => i.nftId)
  const version = [network, code, ...lines.map((l) => `${l.nftId}:${l.quantity}:${l.unitPrice}`), formatEth(fee)].join('|')
  return {
    quoteId: `q-${Math.abs([...version].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7))}`,
    version,
    network,
    items: lines,
    coupon: code,
    subtotal: formatEth(subtotal),
    discount: formatEth(discount),
    networkFee: formatEth(fee),
    total: formatEth(total),
    unavailable,
  }
}

function emit(o: Order) {
  emitters.orderUpdated({ eventId: `${o.id}-v${o.version}`, resource: 'order', id: o.id, userId: o.userId, version: o.version, status: o.status })
}
function settle(o: Order, status: 'confirmed' | 'declined') {
  if (o.status !== 'pending') return
  o.status = status
  o.version += 1
  if (status === 'confirmed') {
    o.txHash = `0x${o.id.replace(/\D/g, '').padStart(8, '0')}${'ab'.repeat(28)}`
    o.explorerUrl = `https://explorer.mock/tx/${o.txHash}`
    const cart = S.carts[o.userId] ?? []
    for (const it of o.items) {
      const c = cart.find((x) => x.nftId === it.nftId)
      if (c) c.quantity -= it.quantity
    }
    S.carts[o.userId] = cart.filter((c) => c.quantity > 0)
    if (!S.carts[o.userId].length) S.coupons[o.userId] = null
  }
  save()
  emit(o)
}

const view = (o: Order): Order => structuredClone(o)

export const purchaseHandlers = [
  http.get('/api/cart', ({ request }) => HttpResponse.json(cartView(owner(request)))),
  http.post('/api/cart', async ({ request }) => {
    const key = owner(request)
    const { nftId, quantity } = (await request.json()) as { nftId: string; quantity: number }
    const max = maxFor(nftId)
    const cart = (S.carts[key] ??= [])
    const ex = cart.find((i) => i.nftId === nftId)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > max)
      return err(409, 'AVAILABILITY_CONFLICT', 'quantidade inválida')
    if (ex) ex.quantity = Math.min(ex.quantity + quantity, max)
    else cart.push({ nftId, quantity })
    save()
    return HttpResponse.json(cartView(key), { status: 201 })
  }),
  http.patch('/api/cart/:nftId', async ({ request, params }) => {
    const key = owner(request)
    const { quantity } = (await request.json()) as { quantity: number }
    const ex = (S.carts[key] ?? []).find((i) => i.nftId === params.nftId)
    if (!ex) return err(404, 'NOT_FOUND', 'item não está no carrinho')
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > maxFor(ex.nftId))
      return err(409, 'AVAILABILITY_CONFLICT', 'quantidade indisponível', { max: maxFor(ex.nftId) })
    ex.quantity = quantity
    save()
    return HttpResponse.json(cartView(key))
  }),
  http.post('/api/cart/coupon', async ({ request }) => {
    const key = owner(request)
    const { code } = (await request.json()) as { code: string }
    const norm = (code ?? '').trim().toUpperCase()
    const c = COUPONS[norm]
    if (!c) return err(422, 'COUPON_INVALID', 'Cupom inválido')
    if (c.expired) return err(422, 'COUPON_EXPIRED', 'Cupom expirado')
    S.coupons[key] = norm
    save()
    return HttpResponse.json(buildQuote(key, 'ethereum'))
  }),
  http.delete('/api/cart/coupon', ({ request }) => {
    const key = owner(request)
    S.coupons[key] = null
    save()
    return HttpResponse.json(buildQuote(key, 'ethereum'))
  }),
  http.delete('/api/cart/:nftId', ({ request, params }) => {
    const key = owner(request)
    S.carts[key] = (S.carts[key] ?? []).filter((i) => i.nftId !== params.nftId)
    if (!S.carts[key].length) S.coupons[key] = null
    save()
    return HttpResponse.json(cartView(key))
  }),
  http.get('/api/quote', ({ request }) => {
    const key = owner(request)
    const network = new URL(request.url).searchParams.get('network') ?? 'ethereum'
    return HttpResponse.json(buildQuote(key, network))
  }),

  http.get('/api/orders', ({ request }) => {
    const user = resolveUser(request)
    if (!user) return err(401, 'UNAUTHENTICATED', 'sessão inválida')
    const status = new URL(request.url).searchParams.get('status')
    return HttpResponse.json(S.orders.filter((o) => o.userId === user.id && (!status || o.status === status)).map(view))
  }),
  http.get('/api/orders/:id', ({ request, params }) => {
    const user = resolveUser(request)
    if (!user) return err(401, 'UNAUTHENTICATED', 'sessão inválida')
    const o = S.orders.find((x) => x.id === params.id)
    if (!o) return err(404, 'NOT_FOUND', 'pedido não encontrado')
    if (o.userId !== user.id) return err(403, 'FORBIDDEN', 'sem permissão')
    return HttpResponse.json(view(o))
  }),
  http.post('/api/orders', async ({ request }) => {
    const user = resolveUser(request)
    if (!user) return err(401, 'UNAUTHENTICATED', 'sessão inválida')
    const idemKey = request.headers.get('Idempotency-Key')
    if (!idemKey) return err(400, 'IDEMPOTENCY_KEY_REQUIRED', 'Idempotency-Key obrigatória')
    const raw = await request.text()
    const body = JSON.parse(raw) as {
      collector: { name: string; email: string; document: string }
      walletId: string
      network: string
      quoteVersion: string
    }
    const slot = `${user.id}:${idemKey}`
    const prev = S.idem[slot]
    if (prev) {
      if (prev.hash !== raw) return err(409, 'IDEMPOTENCY_CONFLICT', 'chave já usada com conteúdo diferente')
      return HttpResponse.json(view(S.orders.find((o) => o.id === prev.orderId)!))
    }
    const c = body.collector ?? ({} as typeof body.collector)
    const fields: Record<string, string> = {}
    if (!c.name || c.name.trim().length < 3) fields.name = 'Informe o nome completo'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email ?? '')) fields.email = 'E-mail inválido'
    if (!/^\d{11}$/.test(c.document ?? '')) fields.document = 'Documento deve ter 11 dígitos'
    if (!body.walletId) fields.walletId = 'Selecione uma carteira'
    if (!body.network) fields.network = 'Selecione uma rede'
    if (Object.keys(fields).length) return err(422, 'VALIDATION_ERROR', 'dados inválidos', { fields })
    const pending = S.orders.find((o) => o.userId === user.id && o.status === 'pending')
    if (pending) return err(409, 'ORDER_PENDING', 'já existe um pedido pendente', { orderId: pending.id })
    if (S.scenario === 'wallet-rejected') return err(422, 'WALLET_REJECTED', 'A carteira recusou a conexão')

    if (S.scenario === 'stale-quote') {
      S.feeBump = (BigInt(S.feeBump) + parseEth('0.001')).toString()
      S.scenario = 'default'
      save()
    }
    const quote = buildQuote(user.id, body.network)
    if (!quote.items.length) return err(409, 'AVAILABILITY_CONFLICT', 'carrinho vazio')
    if (quote.unavailable.length) return err(409, 'AVAILABILITY_CONFLICT', 'itens indisponíveis', { quote })
    if (quote.version !== body.quoteVersion) return err(409, 'QUOTE_STALE', 'A cotação mudou', { quote })

    S.counter += 1
    const items: OrderItem[] = quote.items.map((i) => ({ ...i }))
    const order: Order = {
      id: `ord-${S.counter}`,
      userId: user.id,
      status: 'pending',
      version: 1,
      createdAt: new Date().toISOString(),
      items,
      subtotal: quote.subtotal,
      discount: quote.discount,
      networkFee: quote.networkFee,
      total: quote.total,
      coupon: quote.coupon,
      network: body.network,
      walletId: body.walletId,
      collector: { ...c },
    }
    S.orders.push(order)
    S.idem[slot] = { hash: raw, orderId: order.id }
    save()
    emit(order)
    if (S.scenario === 'payment-declined') settle(order, 'declined')
    else if (S.scenario === 'payment-pending') setTimeout(() => settle(order, 'confirmed'), 400)
    else if (S.scenario === 'payment-held') {
      /* fica pendente até /__mock/orders/:id/confirm */
    } else settle(order, 'confirmed')
    if (S.scenario === 'payment-timeout') return err(504, 'GATEWAY_TIMEOUT', 'tempo esgotado')
    return HttpResponse.json(view(order), { status: 201 })
  }),
  http.post('/api/__mock/orders/:id/confirm', ({ params }) => {
    const o = S.orders.find((x) => x.id === params.id)
    if (!o) return err(404, 'NOT_FOUND', 'pedido não encontrado')
    settle(o, 'confirmed')
    return HttpResponse.json(view(o))
  }),
  // Reemite order.updated sem alterar o pedido (duplicata / evento antigo), como /__mock/nfts/:id/event.
  http.post('/api/__mock/orders/:id/event', async ({ request, params }) => {
    const o = S.orders.find((x) => x.id === params.id)
    if (!o) return err(404, 'NOT_FOUND', 'pedido não encontrado')
    const b = ((await request.json().catch(() => ({}))) ?? {}) as { version?: number; eventId?: string; status?: Order['status'] }
    const evt = { eventId: b.eventId ?? `${o.id}-replay-${Date.now()}`, resource: 'order' as const, id: o.id, userId: o.userId, version: b.version ?? o.version, status: b.status ?? o.status }
    emitters.orderUpdated(evt)
    return HttpResponse.json(evt)
  }),
  http.post('/api/__mock/orders/:id/decline', ({ params }) => {
    const o = S.orders.find((x) => x.id === params.id)
    if (!o) return err(404, 'NOT_FOUND', 'pedido não encontrado')
    settle(o, 'declined')
    return HttpResponse.json(view(o))
  }),
]
