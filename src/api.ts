import axios from 'axios'
import { TOKEN_KEY } from './mocks/shared'
import { queryClient } from './queryClient'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api' })

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
export const setToken = (t: string | null) => {
  writeToken(t)
  listeners.forEach((fn) => fn())
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
      queryClient.clear()
      window.location.assign(`/login?redirect=${encodeURIComponent(here)}&expired=true`)
    }
  }
  return Promise.reject(error)
})
