import { http, HttpResponse, delay } from 'msw'
import { accountHandlers, resetAccount } from './account'
import { currentNft, currentNfts, resetNftOverrides } from './fixtures'
import { parseEth } from '../purchase/eth'
import { purchaseHandlers, resetPurchase, setPurchaseScenario, isPurchaseScenario } from './purchase'

export type Scenario =
  | 'default' | 'empty' | 'http-500' | 'slow' | 'variable-latency' | 'network-error'
  | 'payment-declined' | 'payment-pending' | 'payment-held' | 'payment-timeout' | 'stale-quote' | 'wallet-rejected'
const PAGE_SIZE = 6
const state: { scenario: Scenario } = {
  scenario: 'default',
}

export const handlers = [
  ...accountHandlers,
  http.post('/api/__mock/scenario', async ({ request }) => {
    const { scenario } = (await request.json()) as { scenario: Scenario }
    if (isPurchaseScenario(scenario)) setPurchaseScenario(scenario)
    else {
      state.scenario = scenario
      setPurchaseScenario('default')
    }
    return HttpResponse.json({ scenario })
  }),
  http.post('/api/__mock/reset', () => {
    state.scenario = 'default'
    resetNftOverrides()
    resetAccount()
    resetPurchase()
    return HttpResponse.json({ ok: true })
  }),
  http.get('/api/nfts', async ({ request }) => {
    const sp = new URL(request.url).searchParams
    const page = Math.max(1, Math.trunc(Number(sp.get('page'))) || 1)
    if (state.scenario === 'network-error') return HttpResponse.error()
    if (state.scenario === 'http-500') return HttpResponse.json({ message: 'erro' }, { status: 500 })
    if (state.scenario === 'slow') await delay(3000)
    if (state.scenario === 'variable-latency') await delay(page % 2 === 1 ? 900 : 100)
    if (state.scenario === 'empty') return HttpResponse.json({ items: [], total: 0, page: 1, pageSize: PAGE_SIZE })
    const safe = (v: string | null) => {
      try {
        return v ? parseEth(v) : null
      } catch {
        return null
      }
    }
    const q = sp.get('q')?.toLowerCase()
    const min = safe(sp.get('min'))
    const max = safe(sp.get('max'))
    const sort = sp.get('sort')
    let list = currentNfts().filter(
      (n) =>
        (!q || n.name.toLowerCase().includes(q)) &&
        (min === null || parseEth(n.price) >= min) &&
        (max === null || parseEth(n.price) <= max) &&
        (sp.get('available') !== 'true' || n.edition.available > 0),
    )
    const cmpPrice = (a: bigint, b: bigint) => (a < b ? -1 : a > b ? 1 : 0)
    if (sort === 'price-asc') list = [...list].sort((a, b) => cmpPrice(parseEth(a.price), parseEth(b.price)))
    else if (sort === 'price-desc') list = [...list].sort((a, b) => cmpPrice(parseEth(b.price), parseEth(a.price)))
    else if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    const items = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    return HttpResponse.json({ items, total: list.length, page, pageSize: PAGE_SIZE })
  }),
  http.get('/api/nfts/featured', async () => {
    if (state.scenario === 'http-500') return HttpResponse.json({ message: 'erro' }, { status: 500 })
    if (state.scenario === 'network-error') return HttpResponse.error()
    if (state.scenario === 'slow') await delay(3000)
    if (state.scenario === 'empty') return HttpResponse.json([])
    return HttpResponse.json(currentNfts().filter((n) => n.featured).slice(0, 3))
  }),
  http.get('/api/nfts/:id', async ({ params }) => {
    if (state.scenario === 'http-500') return HttpResponse.json({ message: 'erro' }, { status: 500 })
    if (state.scenario === 'network-error') return HttpResponse.error()
    if (state.scenario === 'slow') await delay(3000)
    const nft = currentNft(String(params.id))
    return nft ? HttpResponse.json(nft) : HttpResponse.json({ message: 'not found' }, { status: 404 })
  }),
  ...purchaseHandlers,
]
