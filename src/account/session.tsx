import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { useSyncExternalStore } from 'react'
import { api, getToken, loginSocial, setToken, subscribeToken, type SocialProvider } from '../api'
import { queryClient } from '../queryClient'
import { Avatar } from '../components/Avatar'
import { buttonVariants } from '../components/ui/button'
import { LoginIcon, LogoutIcon, UserIcon, WalletIcon } from '../components/icons'
import { cn } from '../lib/utils'

// Abaixo de md a navegação vira a barra de abas inferior do Figma (ícones de 44 px); de md em diante é o menu do cabeçalho.
export const navLink = 'inline-flex h-10 items-center gap-2 rounded-control px-2 text-sm font-medium text-foreground no-underline transition-colors hover:text-primary max-md:size-11 max-md:min-w-0 max-md:shrink max-md:justify-center max-md:rounded-full max-md:px-0'
export const navActive = { className: 'text-primary underline decoration-2 underline-offset-8 max-md:bg-accent max-md:no-underline', 'aria-current': 'page' as const }

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
  void queryClient.cancelQueries()
  queryClient.clear() // troca de usuário: descarta dados privados do anterior
  queryClient.setQueryData(sessionQuery.queryKey, user)
  setToken(token)
}

/**
 * Login social SIMULADO. Reutiliza `startSession` (cancela queries, limpa cache do usuário anterior, grava a sessão,
 * `setToken` => o socket reassina com o novo token). Não navega: o chamador usa `router.history.push(safeRedirect(search.redirect))`.
 * Rejeita com AxiosError (400 INVALID_PROVIDER; 401 PROVIDER_FAILURE/PROVIDER_CANCELLED); use `apiErrors(e).message`.
 */
export async function signInWithProvider(provider: SocialProvider, credential?: string): Promise<User> {
  const { token, user } = await loginSocial(provider, credential)
  startSession(token, user)
  return user
}

export function safeRedirect(r: unknown) {
  if (typeof r !== 'string' || !r.startsWith('/') || r.startsWith('//')) return '/'
  // eslint-disable-next-line no-control-regex
  if (r.includes('\\') || /[\u0000-\u001f\u007f]/.test(r)) return '/'
  try {
    return new URL(r, window.location.origin).origin === window.location.origin ? r : '/'
  } catch {
    return '/'
  }
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
      void qc.cancelQueries()
      qc.clear()
      void navigate({ to: '/login', search: {} })
    },
  })
  if (!getToken() || !user)
    return (
      <Link to="/login" search={{}} className={cn(buttonVariants({ size: 'sm' }), 'ml-1 gap-1.5 no-underline max-md:size-11 max-md:min-w-0 max-md:shrink max-md:rounded-full max-md:px-0')}>
        <LoginIcon className="size-5" />
        <span className="max-md:sr-only">Entrar</span>
      </Link>
    )
  return (
    <>
      <Link to="/profile" className={navLink} activeProps={navActive}>
        <UserIcon className="size-5" />
        <span className="sr-only 2xl:not-sr-only">Perfil</span>
      </Link>
      <Link to="/wallets" className={cn(navLink, 'max-md:hidden')} activeProps={navActive}>
        <WalletIcon className="size-5" />
        <span className="sr-only 2xl:not-sr-only">Carteiras</span>
      </Link>
      <span className="flex items-center gap-2 max-md:contents sm:ml-1 sm:border-l sm:pl-3">
        <Avatar name={user.name} src={user.avatar} className="max-md:hidden" />
        <span data-testid="nav-user" className="sr-only truncate text-sm font-medium sm:not-sr-only sm:max-w-28 max-md:sr-only">{user.name}</span>
        <button data-testid="logout" onClick={() => logout.mutate()} className={cn(navLink, 'px-2')}>
          <LogoutIcon className="size-5" />
          <span className="sr-only xl:not-sr-only">Sair</span>
        </button>
      </span>
    </>
  )
}
