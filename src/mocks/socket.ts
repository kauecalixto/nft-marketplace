// Servidor Socket.IO simulado no navegador: MSW `ws.link` + @mswjs/socket.io-binding.
// Limitações: só transporte websocket, namespace "/", sem rooms/broadcast nativos (a lista de
// clientes e a filtragem por usuário são feitas aqui), sem ack e sem recuperação de sessão.
// O handshake é feito pelo binding (sid fixo); a identidade vem do evento `subscribe` {token}.
import { http, HttpResponse, ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import { currentNft, nftOverrides } from './fixtures'
import { emitters, resolveUser, type NftUpdated, type OrderUpdated } from './shared'

type Io = ReturnType<typeof toSocketIo>
interface Client { id: number; io: Io; userId: string | null; close: () => void }
const clients = new Map<number, Client>()
let nextId = 1
let seq = 0
const eventId = () => `evt-${Date.now().toString(36)}-${++seq}`

// O MSW remove o prefixo /socket.io/ do caminho antes de comparar, então o padrão é '*'.
const link = ws.link('*')

const socketHandler = link.addEventListener('connection', (connection) => {
  const io = toSocketIo(connection)
  const client: Client = {
    id: nextId++,
    io,
    userId: null,
    close: () => connection.client.close(1000, 'mock disconnect'),
  }
  clients.set(client.id, client)
  const ping = setInterval(() => {
    try { connection.client.send('2') } catch { /* fechado */ }
  }, 20000)
  io.client.on('subscribe', (_e, payload: { token?: string } | undefined) => {
    const token = payload?.token
    if (!token) { client.userId = null; return }
    const user = resolveUser(new Request('http://mock.local/', { headers: { Authorization: `Bearer ${token}` } }))
    client.userId = user ? user.id : null
  })
  io.client.on('unsubscribe', () => { client.userId = null })
  connection.client.addEventListener('close', () => {
    clearInterval(ping)
    clients.delete(client.id)
  })
})

emitters.nftUpdated = (e: NftUpdated) => {
  for (const c of clients.values()) c.io.client.emit('nft.updated', e)
}
emitters.orderUpdated = (e: OrderUpdated) => {
  // Só a subscription do dono recebe o evento.
  for (const c of clients.values()) if (c.userId && c.userId === e.userId) c.io.client.emit('order.updated', e)
}

function snapshot(id: string, version: number, evtId?: string): NftUpdated | null {
  const nft = currentNft(id)
  if (!nft) return null
  return { eventId: evtId ?? eventId(), resource: 'nft', id, version, price: nft.price, available: nft.edition.available }
}

export const realtimeHandlers = [
  socketHandler,
  http.post('/api/__mock/nfts/:id/update', async ({ params, request }) => {
    const id = String(params.id)
    if (!currentNft(id)) return HttpResponse.json({ message: 'not found' }, { status: 404 })
    const body = ((await request.json().catch(() => ({}))) ?? {}) as { price?: string; available?: number }
    const prev = nftOverrides[id]
    nftOverrides[id] = {
      version: (prev?.version ?? 0) + 1,
      price: body.price ?? '0.125',
      available: body.available ?? prev?.available,
    }
    const evt = snapshot(id, nftOverrides[id].version)!
    emitters.nftUpdated(evt)
    return HttpResponse.json(evt)
  }),
  // Reemite sem alterar os dados (para testar duplicata / evento antigo).
  http.post('/api/__mock/nfts/:id/event', async ({ params, request }) => {
    const id = String(params.id)
    const body = ((await request.json().catch(() => ({}))) ?? {}) as { version?: number; eventId?: string }
    const evt = snapshot(id, body.version ?? nftOverrides[id]?.version ?? 0, body.eventId)
    if (!evt) return HttpResponse.json({ message: 'not found' }, { status: 404 })
    emitters.nftUpdated(evt)
    return HttpResponse.json(evt)
  }),
  http.post('/api/__mock/socket/disconnect', () => {
    const n = clients.size
    for (const c of [...clients.values()]) c.close()
    return HttpResponse.json({ disconnected: n })
  }),
  http.get('/api/__mock/socket/clients', () =>
    HttpResponse.json({ count: clients.size, clients: [...clients.values()].map((c) => ({ id: c.id, userId: c.userId })) }),
  ),
]
