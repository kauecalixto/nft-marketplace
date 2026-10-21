import type { QueryClient } from '@tanstack/react-query'
import { io, type Socket } from 'socket.io-client'
import { TOKEN_KEY } from '../mocks/shared'
import { noticeStore } from './store'

interface NftEvt { eventId: string; resource: 'nft'; id: string; version: number }
interface OrderEvt { eventId: string; resource: 'order'; id: string; userId: string; version: number }

const RECONCILE_KEYS = [['nfts'], ['nft'], ['cart'], ['quote'], ['order'], ['orders']]
export const TOKEN_CHANGED = 'nft:token-changed'

function token(): string | null {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

// Eventos só invalidam queries; a API REST continua sendo a fonte da verdade.
export function startRealtime(qc: QueryClient): () => void {
  const socket: Socket = io(import.meta.env.VITE_SOCKET_URL ?? undefined, {
    path: '/socket.io',
    transports: ['websocket'],
    reconnectionDelay: 300,
    reconnectionDelayMax: 1000,
  })
  const seenIds = new Set<string>()
  const versions = new Map<string, number>() // `${resource}:${id}` -> maior versão aplicada
  let currentToken = token()
  let connectedOnce = false

  const fresh = (e: { eventId: string; resource: string; id: string; version: number }) => {
    if (seenIds.has(e.eventId)) return false
    seenIds.add(e.eventId)
    const key = `${e.resource}:${e.id}`
    if (e.version <= (versions.get(key) ?? -1)) return false
    versions.set(key, e.version)
    return true
  }
  const subscribe = () => {
    if (currentToken) socket.emit('subscribe', { token: currentToken })
    else socket.emit('unsubscribe')
  }
  const invalidate = (keys: string[][]) => keys.forEach((queryKey) => void qc.invalidateQueries({ queryKey }))

  socket.on('connect', () => {
    subscribe()
    if (connectedOnce) invalidate(RECONCILE_KEYS) // reconexão: reconcilia com o REST
    connectedOnce = true
  })
  socket.on('nft.updated', (e: NftEvt) => {
    if (!fresh(e)) return
    invalidate([['nfts'], ['nft', e.id], ['cart'], ['quote']])
    noticeStore.bump(e.id)
  })
  socket.on('order.updated', (e: OrderEvt) => {
    if (!currentToken || e.userId !== currentToken || !fresh(e)) return
    invalidate([['orders'], ['order'], ['order', e.id]])
  })

  const onTokenChange = () => {
    const t = token()
    if (t === currentToken) return
    currentToken = t
    seenIds.clear()
    versions.clear()
    noticeStore.reset()
    if (socket.connected) subscribe()
    invalidate(RECONCILE_KEYS)
  }
  window.addEventListener('storage', onTokenChange)
  window.addEventListener(TOKEN_CHANGED, onTokenChange)

  return () => {
    window.removeEventListener('storage', onTokenChange)
    window.removeEventListener(TOKEN_CHANGED, onTokenChange)
    socket.off()
    if (socket.connected) socket.emit('unsubscribe')
    socket.disconnect()
  }
}
