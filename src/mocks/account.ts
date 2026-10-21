import { http, HttpResponse } from 'msw'
import { getPurchaseScenario } from './purchase'
import { setUserResolver, type MockUser } from './shared'

// Contas, sessão, favoritos, perfil e carteiras simulados na camada de rede.
// Senhas: apenas SHA-256 (hex) com salt; token de sessão = id do usuário (contrato em shared.ts).
const DB_KEY = 'nft-marketplace:account-db'

interface StoredUser { id: string; email: string; name: string; avatar: string; salt: string; hash: string }
interface Wallet { id: string; label: string; address: string; role: 'primary' | 'secondary'; connected?: boolean }
interface Db {
  users: StoredUser[]
  expired: string[] // ids de usuários com sessão expirada
  loggedOut: string[]
  favorites: Record<string, string[]>
  wallets: Record<string, Wallet[]>
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
const newSalt = () => [...crypto.getRandomValues(new Uint8Array(8))].map((b) => b.toString(16).padStart(2, '0')).join('')
async function makeUser(id: string, email: string, name: string, password: string): Promise<StoredUser> {
  const salt = newSalt()
  return { id, email, name, avatar: '', salt, hash: await sha256(salt + password) }
}

let cache: Db | null = null
let favoritesError = false

function readSync(): Db | null {
  if (cache) return cache
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) return (cache = JSON.parse(raw) as Db)
  } catch {
    /* ignora */
  }
  return null
}
function write(db: Db) {
  cache = db
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    /* ignora */
  }
}
async function seed(): Promise<Db> {
  const db: Db = {
    users: [
      await makeUser('u-ana', 'ana@example.test', 'Ana Demo', 'kurio-demo'),
      await makeUser('u-bruno', 'bruno@example.test', 'Bruno Demo', 'bruno-demo'),
    ],
    expired: [],
    loggedOut: [],
    favorites: {},
    wallets: {},
  }
  write(db)
  return db
}
async function getDb() {
  return readSync() ?? (await seed())
}

const pub = (u: StoredUser) => ({ id: u.id, email: u.email, name: u.name, avatar: u.avatar })
const token = (r: Request) => /^Bearer (.+)$/.exec(r.headers.get('Authorization') ?? '')?.[1] ?? null
const active = (db: Db, t: string | null) =>
  t && !db.expired.includes(t) && !db.loggedOut.includes(t) ? db.users.find((x) => x.id === t) : undefined

setUserResolver((request): MockUser | null => {
  const db = readSync()
  const u = db ? active(db, token(request)) : undefined
  return u ? { id: u.id, email: u.email, name: u.name } : null
})

const unauth = () => HttpResponse.json({ code: 'SESSION_EXPIRED', message: 'Sessão expirada ou inválida' }, { status: 401 })
async function auth(request: Request) {
  const db = await getDb()
  return { db, user: active(db, token(request)) }
}
const invalid = (errors: Record<string, string>) =>
  HttpResponse.json({ code: 'VALIDATION_ERROR', message: 'Dados inválidos', errors }, { status: 422 })
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ADDRESS = /^0x[0-9a-fA-F]{40}$/
const transient = () => HttpResponse.json({ code: 'TRANSIENT', message: 'Falha transitória' }, { status: 503 })

export function resetAccount() {
  cache = null
  favoritesError = false
  try {
    localStorage.removeItem(DB_KEY)
  } catch {
    /* ignora */
  }
}

export const accountHandlers = [
  http.post('/api/__mock/session/expire', async ({ request }) => {
    const { db, user } = await auth(request)
    if (!user) return unauth()
    db.expired.push(user.id)
    write(db)
    return HttpResponse.json({ ok: true })
  }),
  http.post('/api/__mock/favorites-error', async ({ request }) => {
    const { enabled } = (await request.json()) as { enabled: boolean }
    favoritesError = enabled
    return HttpResponse.json({ enabled })
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const b = (await request.json()) as { name?: string; email?: string; password?: string }
    const errors: Record<string, string> = {}
    if (!b.name?.trim()) errors.name = 'Informe o nome'
    if (!b.email || !EMAIL.test(b.email)) errors.email = 'E-mail inválido'
    if (!b.password || b.password.length < 8) errors.password = 'A senha deve ter ao menos 8 caracteres'
    if (Object.keys(errors).length) return invalid(errors)
    const db = await getDb()
    const email = b.email!.trim().toLowerCase()
    if (db.users.some((u) => u.email === email))
      return HttpResponse.json({ code: 'EMAIL_CONFLICT', message: 'E-mail já cadastrado' }, { status: 409 })
    const u = await makeUser(`u-${crypto.randomUUID().slice(0, 8)}`, email, b.name!.trim(), b.password!)
    db.users.push(u)
    write(db)
    return HttpResponse.json({ token: u.id, user: pub(u) }, { status: 201 })
  }),
  http.post('/api/auth/login', async ({ request }) => {
    const b = (await request.json()) as { email?: string; password?: string }
    const db = await getDb()
    const u = db.users.find((x) => x.email === (b.email ?? '').trim().toLowerCase())
    if (!u || u.hash !== (await sha256(u.salt + (b.password ?? ''))))
      return HttpResponse.json({ code: 'INVALID_CREDENTIALS', message: 'E-mail ou senha inválidos' }, { status: 401 })
    db.expired = db.expired.filter((x) => x !== u.id)
    db.loggedOut = db.loggedOut.filter((x) => x !== u.id)
    write(db)
    return HttpResponse.json({ token: u.id, user: pub(u) })
  }),
  http.get('/api/session', async ({ request }) => {
    const { user } = await auth(request)
    return user ? HttpResponse.json(pub(user)) : unauth()
  }),
  http.post('/api/auth/logout', async ({ request }) => {
    const { db, user } = await auth(request)
    if (user) {
      db.loggedOut.push(user.id)
      write(db)
    }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/favorites', async ({ request }) => {
    const { db, user } = await auth(request)
    if (!user) return unauth()
    return HttpResponse.json(db.favorites[user.id] ?? [])
  }),
  http.post('/api/favorites', async ({ request }) => {
    const { db, user } = await auth(request)
    if (!user) return unauth()
    if (favoritesError) return transient()
    const { nftId } = (await request.json()) as { nftId: string }
    const list = db.favorites[user.id] ?? []
    if (!list.includes(nftId)) list.push(nftId)
    db.favorites[user.id] = list
    write(db)
    return HttpResponse.json(list, { status: 201 })
  }),
  http.delete('/api/favorites/:nftId', async ({ request, params }) => {
    const { db, user } = await auth(request)
    if (!user) return unauth()
    if (favoritesError) return transient()
    db.favorites[user.id] = (db.favorites[user.id] ?? []).filter((x) => x !== params.nftId)
    write(db)
    return HttpResponse.json(db.favorites[user.id])
  }),

  http.get('/api/profile', async ({ request }) => {
    const { user } = await auth(request)
    return user ? HttpResponse.json(pub(user)) : unauth()
  }),
  http.patch('/api/profile', async ({ request }) => {
    const { db, user } = await auth(request)
    if (!user) return unauth()
    const b = (await request.json()) as { name?: string; avatar?: string }
    const errors: Record<string, string> = {}
    if (b.name !== undefined && !b.name.trim()) errors.name = 'Informe o nome'
    if (b.avatar && b.avatar.startsWith('data:')) {
      if (!/^data:image\/[a-z0-9.+-]+;base64,/i.test(b.avatar)) errors.avatar = 'Envie um arquivo de imagem'
      else if (b.avatar.length > 1_400_000) errors.avatar = 'A imagem deve ter no máximo 1 MB'
    } else if (b.avatar && !/^https?:\/\/\S+$/.test(b.avatar)) errors.avatar = 'URL do avatar inválida'
    if (Object.keys(errors).length) return invalid(errors)
    if (b.name !== undefined) user.name = b.name.trim()
    if (b.avatar !== undefined) user.avatar = b.avatar
    write(db)
    return HttpResponse.json(pub(user))
  }),
  http.put('/api/profile/password', async ({ request }) => {
    const { db, user } = await auth(request)
    if (!user) return unauth()
    const b = (await request.json()) as { currentPassword?: string; newPassword?: string }
    if (user.hash !== (await sha256(user.salt + (b.currentPassword ?? ''))))
      return invalid({ currentPassword: 'Senha atual incorreta' })
    if (!b.newPassword || b.newPassword.length < 8)
      return invalid({ newPassword: 'A nova senha deve ter ao menos 8 caracteres' })
    user.salt = newSalt()
    user.hash = await sha256(user.salt + b.newPassword)
    write(db)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/wallets', async ({ request }) => {
    const { db, user } = await auth(request)
    if (!user) return unauth()
    return HttpResponse.json(db.wallets[user.id] ?? [])
  }),
  http.post('/api/wallets', async ({ request }) => {
    const { db, user } = await auth(request)
    if (!user) return unauth()
    const b = (await request.json()) as { label?: string; address?: string }
    const list = db.wallets[user.id] ?? []
    const errors: Record<string, string> = {}
    if (!b.label?.trim()) errors.label = 'Informe um apelido'
    if (!b.address || !ADDRESS.test(b.address)) errors.address = 'Endereço inválido (0x + 40 hexadecimais)'
    else if (list.some((w) => w.address.toLowerCase() === b.address!.toLowerCase())) errors.address = 'Carteira já cadastrada'
    if (list.length >= 2) errors.address = 'Limite de duas carteiras (principal e secundária)'
    if (Object.keys(errors).length) return invalid(errors)
    const w: Wallet = {
      id: `w-${crypto.randomUUID().slice(0, 8)}`,
      label: b.label!.trim(),
      address: b.address!,
      role: list.length ? 'secondary' : 'primary',
      connected: true,
    }
    db.wallets[user.id] = [...list, w]
    write(db)
    return HttpResponse.json(w, { status: 201 })
  }),
  http.post('/api/wallets/:id/connect', async ({ request, params }) => {
    const { db, user } = await auth(request)
    if (!user) return unauth()
    const w = (db.wallets[user.id] ?? []).find((x) => x.id === params.id)
    if (!w) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Carteira inexistente' }, { status: 404 })
    if (getPurchaseScenario() === 'wallet-rejected')
      return HttpResponse.json({ code: 'WALLET_REJECTED', message: 'A carteira recusou a conexão' }, { status: 409 })
    w.connected = true
    write(db)
    return HttpResponse.json(w)
  }),
  http.post('/api/wallets/:id/disconnect', async ({ request, params }) => {
    const { db, user } = await auth(request)
    if (!user) return unauth()
    const w = (db.wallets[user.id] ?? []).find((x) => x.id === params.id)
    if (!w) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Carteira inexistente' }, { status: 404 })
    w.connected = false
    write(db)
    return HttpResponse.json(w)
  }),
  http.patch('/api/wallets/:id', async ({ request, params }) => {
    const { db, user } = await auth(request)
    if (!user) return unauth()
    const list = db.wallets[user.id] ?? []
    const w = list.find((x) => x.id === params.id)
    if (!w) return HttpResponse.json({ code: 'NOT_FOUND', message: 'Carteira inexistente' }, { status: 404 })
    const b = (await request.json()) as { label?: string; address?: string; primary?: boolean }
    const errors: Record<string, string> = {}
    if (b.label !== undefined && !b.label.trim()) errors.label = 'Informe um apelido'
    if (b.address !== undefined && !ADDRESS.test(b.address)) errors.address = 'Endereço inválido (0x + 40 hexadecimais)'
    if (Object.keys(errors).length) return invalid(errors)
    if (b.label !== undefined) w.label = b.label.trim()
    if (b.address !== undefined) w.address = b.address
    if (b.primary) list.forEach((x) => (x.role = x.id === w.id ? 'primary' : 'secondary'))
    write(db)
    return HttpResponse.json(list)
  }),
]
