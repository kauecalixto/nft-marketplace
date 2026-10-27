import { http, HttpResponse, delay } from 'msw'
import { accountHandlers, resetAccount } from './account'
import { currentNft, currentNfts, resetNftOverrides } from './fixtures'
import { parseEth } from '../purchase/eth'
import { purchaseHandlers, resetPurchase, setPurchaseScenario, isPurchaseScenario } from './purchase'

export type Scenario =
  | 'default' | 'empty' | 'http-500' | 'slow' | 'variable-latency' | 'network-error'
  | 'payment-declined' | 'payment-pending' | 'payment-held' | 'payment-timeout' | 'stale-quote' | 'wallet-rejected'
const PAGE_SIZE = 6
const HTTP_ERROR_SCENARIOS: Record<number, Record<string, unknown>> = {
  400: { code: 'BAD_REQUEST', message: 'Requisição inválida.' },
  401: { code: 'UNAUTHENTICATED', message: 'Sessão ausente ou expirada.' },
  403: { code: 'FORBIDDEN', message: 'Sem permissão para este recurso.' },
  404: { code: 'NOT_FOUND', message: 'Recurso não encontrado.' },
  409: { code: 'CONFLICT', message: 'Conflito com o estado atual do recurso.' },
  422: { code: 'VALIDATION_ERROR', message: 'Dados inválidos.', errors: { campo: 'Valor inválido.' } },
}
// O cenário de catálogo persiste em localStorage para sobreviver a refresh; o reset o limpa.
const SCENARIO_KEY = 'nft-marketplace:scenario'
function loadScenario(): Scenario {
  try {
    return (localStorage.getItem(SCENARIO_KEY) as Scenario | null) ?? 'default'
  } catch {
    return 'default'
  }
}
function saveScenario(s: Scenario) {
  try {
    if (s === 'default') localStorage.removeItem(SCENARIO_KEY)
    else localStorage.setItem(SCENARIO_KEY, s)
  } catch {
    /* sem storage */
  }
}
const state: { scenario: Scenario } = {
  scenario: loadScenario(),
}

export const handlers = [
  ...accountHandlers,
  http.post('/api/__mock/scenario', async ({ request }) => {
    const { scenario } = (await request.json()) as { scenario: Scenario }
    if (isPurchaseScenario(scenario)) setPurchaseScenario(scenario)
    else {
      state.scenario = scenario
      saveScenario(scenario)
      setPurchaseScenario('default')
    }
    return HttpResponse.json({ scenario })
  }),
  // Erros HTTP genéricos e determinísticos para testar tratamento de 4xx (corpo no formato padrão { code, message }).
  http.all('/api/__mock/status/:code', ({ params }) => {
    const code = Number(params.code)
    const body = HTTP_ERROR_SCENARIOS[code]
    if (!body) return HttpResponse.json({ code: 'UNSUPPORTED_STATUS', message: 'Use 400, 401, 403, 404, 409 ou 422.' }, { status: 400 })
    return HttpResponse.json(body, { status: code })
  }),
  http.post('/api/__mock/reset', () => {
    state.scenario = 'default'
    saveScenario('default')
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
