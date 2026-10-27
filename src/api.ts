import axios from 'axios'
import { TOKEN_KEY } from './mocks/shared'
import { queryClient } from './queryClient'

// Timeout por requisição (ms), configurável por VITE_API_TIMEOUT_MS; inválido/ausente => 15 s. Ao estourar, o Axios rejeita (ECONNABORTED).
const parsedTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS)
export const API_TIMEOUT_MS = Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 15_000

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api', timeout: API_TIMEOUT_MS })

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}
const listeners = new Set<() => void>()
export const subscribeToken = (fn: () => void) => {
  listeners.add(fn)
  return () => void listeners.delete(fn)
}
// Evento de troca de token na MESMA aba (o `storage` nativo só dispara em outras abas).
export const TOKEN_CHANGED = 'nft:token-changed'
export const setToken = (t: string | null) => {
  writeToken(t)
  listeners.forEach((fn) => fn())
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(TOKEN_CHANGED))
}
const writeToken = (t: string | null) => {
  try {
    if (t) localStorage.setItem(TOKEN_KEY, t)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* sem storage */
  }
}

api.interceptors.request.use((config) => {
  const t = getToken()
  if (t) config.headers.set('Authorization', `Bearer ${t}`)
  return config
})

// Permite que telas salvem rascunho (ex.: checkout) antes do redirecionamento por sessão expirada.
export const sessionExpiryHooks = new Set<() => void>()

const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/logout']
api.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && !AUTH_PATHS.some((p) => error.config?.url?.includes(p))) {
    const here = window.location.pathname + window.location.search
    if (getToken() && !window.location.pathname.startsWith('/login')) {
      sessionExpiryHooks.forEach((fn) => { try { fn() } catch { /* ignore */ } })
      setToken(null)
      void queryClient.cancelQueries()
      queryClient.clear()
      window.location.assign(`/login?redirect=${encodeURIComponent(here)}&expired=true`)
    }
  }
  return Promise.reject(error)
})
