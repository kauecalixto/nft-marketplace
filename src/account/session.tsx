import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { useSyncExternalStore } from 'react'
import { api, getToken, setToken, subscribeToken } from '../api'
import { queryClient } from '../queryClient'

export interface User { id: string; email: string; name: string; avatar: string }
export type FieldErrors = Record<string, string>

export const sessionQuery = {
  queryKey: ['session'] as const,
  retry: false,
  queryFn: async ({ signal }: { signal: AbortSignal }) => (await api.get<User>('/session', { signal })).data,
}

export function useSession() {
  const token = useSyncExternalStore(subscribeToken, getToken)
  return useQuery({ ...sessionQuery, enabled: !!token })
}

/** Erros de campo devolvidos pela API (422) ou mensagem geral. */
export function apiErrors(e: unknown): { fields: FieldErrors; message?: string; status?: number } {
  if (axios.isAxiosError(e) && e.response) {
    const d = e.response.data as { errors?: FieldErrors; message?: string }
    return { fields: d?.errors ?? {}, message: d?.message, status: e.response.status }
  }
  return { fields: {}, message: 'Falha de rede. Tente novamente.' }
}

export function startSession(token: string, user: User) {
  queryClient.clear() // troca de usuário: descarta dados privados do anterior
  queryClient.setQueryData(sessionQuery.queryKey, user)
  setToken(token)
}

export function safeRedirect(r: unknown) {
  return typeof r === 'string' && r.startsWith('/') && !r.startsWith('//') ? r : '/'
}

export function AccountNav() {
  const { data: user } = useSession()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const logout = useMutation({
    mutationFn: async () => {
      try {
        await api.post('/auth/logout')
      } catch {
        /* sessão já inválida */
      }
    },
    onSettled: () => {
      setToken(null)
      qc.clear()
      void navigate({ to: '/login', search: {} })
    },
  })
  if (!getToken() || !user)
    return (
      <>
        <Link to="/login" search={{}}>Entrar</Link>
        <Link to="/register">Cadastrar</Link>
      </>
    )
  return (
    <>
      <Link to="/profile">Perfil</Link>
      <Link to="/wallets">Carteiras</Link>
      <span data-testid="nav-user">{user.name}</span>
      <button data-testid="logout" onClick={() => logout.mutate()} className="underline">
        Sair
      </button>
    </>
  )
}
