import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useRouter, useSearch } from '@tanstack/react-router'
import { api } from '../api'
import { Button } from '../components/ui/button'
import { AlertIcon, InfoIcon } from '../components/icons'
import type { ReactNode } from 'react'
import { Field } from './Field'
import type { SocialProvider } from '../api'
import { apiErrors, safeRedirect, signInWithProvider, startSession, type FieldErrors, type User } from './session'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
type AuthResp = { token: string; user: User }

const SOCIAL_LABEL: Record<SocialProvider, string> = { google: 'Google', facebook: 'Facebook' }

function GoogleIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-5 shrink-0">
      <path fill="#4285F4" d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.69h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.23c1.89-1.74 2.98-4.3 2.98-7.26Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.23-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.81-1.76-5.6-4.12H3.06v2.58A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.52H3.06a10 10 0 0 0 0 8.96L6.4 13.9Z" />
      <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.83 1.5l2.86-2.86A9.6 9.6 0 0 0 12 2 10 10 0 0 0 3.06 7.52L6.4 10.1C7.19 7.74 9.4 5.98 12 5.98Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-5 shrink-0 text-[#5b8def]" fill="currentColor">
      <path d="M13.5 21.5v-8h2.7l.4-3.2h-3.1V8.3c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1v2.4H7.7v3.2h2.7v8h3.1Z" />
    </svg>
  )
}

// Login social SIMULADO por MSW (ENUNCIADO §3 sessão/autenticação; docs/CONTRACTS.md POST /api/auth/social): sem OAuth real.
// Sucesso => mesma navegação do login por e-mail/senha (safeRedirect); falha/cancelamento => mensagem em PT da API, sem sessão.
function SocialButtons({ redirect }: { redirect?: unknown }) {
  const router = useRouter()
  const [pending, setPending] = useState<SocialProvider | null>(null)
  const [error, setError] = useState<string>()
  async function go(provider: SocialProvider) {
    if (pending) return
    setPending(provider)
    setError(undefined)
    try {
      await signInWithProvider(provider)
      router.history.push(redirect === undefined ? '/' : safeRedirect(redirect))
    } catch (e) {
      setError(apiErrors(e).message ?? 'Não foi possível entrar com o provedor. Tente novamente.')
      setPending(null)
    }
  }
  const social = 'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control border border-input px-4 max-sm:rounded-lg text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60'
  return (
    <>
      <div className="space-y-3">
        {(['google', 'facebook'] as const).map((p) => (
          <button key={p} type="button" data-testid={`social-${p}`} onClick={() => void go(p)} disabled={pending !== null} aria-busy={pending === p} className={social}>
            {p === 'google' ? <GoogleIcon /> : <FacebookIcon />}
            {pending === p ? `Conectando com ${SOCIAL_LABEL[p]}…` : `Continuar com ${SOCIAL_LABEL[p]}`}
          </button>
        ))}
      </div>
      {error && <p role="alert" data-testid="social-error" className="mt-3 flex items-start gap-2 rounded-card bg-destructive-soft p-3 text-sm font-semibold text-destructive"><AlertIcon className="mt-0.5 size-4 shrink-0" />{error}</p>}
    </>
  )
}

// Cartão de login/cadastro do Figma (modal sobre o Início no desktop, tela cheia no mobile): abas "Entrar | Criar conta"
// (o título ativo é o h1), divisor "Ou continue com" e botões sociais (simulados por MSW).
function AuthShell({ tabs, switchLine, redirect, children }: { tabs: ReactNode; switchLine: ReactNode; redirect?: unknown; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[500px]">
      <p aria-hidden="true" className="mb-12 mt-12 text-center text-3xl font-bold uppercase tracking-[0.2em] sm:hidden">Kurio</p>
      <div className="rounded-card border-primary sm:border-b-8 sm:bg-surface sm:px-10 sm:py-8">
        <div className="mb-5 flex items-center justify-center gap-4 text-xl font-bold">{tabs}</div>
        {children}
        <div className="my-5 flex items-center gap-3 text-xs">
          <span aria-hidden="true" className="h-px flex-1 bg-primary/40" />
          Ou continue com
          <span aria-hidden="true" className="h-px flex-1 bg-primary/40" />
        </div>
        <SocialButtons redirect={redirect} />
        <p className="mt-6 text-center text-sm sm:hidden">{switchLine}</p>
      </div>
    </div>
  )
}

export function LoginPage() {
  const search = useSearch({ from: '/login' })
  const router = useRouter()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [general, setGeneral] = useState<string>()
  const login = useMutation({
    mutationFn: async (b: { email: string; password: string }) => (await api.post<AuthResp>('/auth/login', b)).data,
    onSuccess: (d) => {
      startSession(d.token, d.user)
      router.history.push(safeRedirect(search.redirect))
    },
    onError: (e) => {
      const r = apiErrors(e)
      setErrors(r.fields)
      setGeneral(r.message)
    },
  })
  function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const f = new FormData(ev.currentTarget)
    const email = String(f.get('email') ?? '').trim()
    const password = String(f.get('password') ?? '')
    const errs: FieldErrors = {}
    if (!EMAIL.test(email)) errs.email = 'Informe um e-mail válido'
    if (!password) errs.password = 'Informe a senha'
    setErrors(errs)
    setGeneral(undefined)
    if (Object.keys(errs).length === 0) login.mutate({ email, password })
  }
  return (
    <AuthShell
      redirect={search.redirect}
      tabs={<><h1 id="login-title" className="text-primary max-sm:text-lg max-sm:text-foreground">Entrar</h1><span aria-hidden="true" className="h-5 w-px bg-primary max-sm:hidden" /><Link to="/register" className="text-foreground no-underline hover:text-primary max-sm:hidden">Criar conta</Link></>}
      switchLine={<>Novo na Kurio? <Link to="/register" className="font-bold text-primary">Crie uma conta</Link></>}
    >
    <form onSubmit={submit} noValidate className="space-y-4" aria-labelledby="login-title">
      <p className="text-center text-sm text-muted-foreground">Entre para comprar, acompanhar pedidos e gerenciar sua carteira.</p>
      {(search.expired === true || search.expired === 'true') && (
        <p role="status" data-testid="session-expired" className="flex items-start gap-2 rounded-xl border border-warning/40 bg-warning-soft p-3 text-sm font-semibold text-warning"><InfoIcon className="mt-0.5 size-4 shrink-0" />Sua sessão expirou. Entre novamente para continuar.</p>
      )}
      <Field id="email" label="E-mail" type="email" autoComplete="username" error={errors.email} className="max-sm:h-12 max-sm:rounded-xl" />
      <Field id="password" label="Senha" type="password" autoComplete="current-password" error={errors.password} className="max-sm:h-12 max-sm:rounded-xl" />
      {general && <p role="alert" data-testid="login-error" className="flex items-start gap-2 rounded-card bg-destructive-soft p-3 text-sm font-semibold text-destructive"><AlertIcon className="mt-0.5 size-4 shrink-0" />{general}</p>}
      <Button type="submit" size="lg" className="w-full max-sm:rounded-xl" disabled={login.isPending}>
        Entrar
      </Button>
    </form>
    </AuthShell>
  )
}

export function RegisterPage() {
  const router = useRouter()
  const [errors, setErrors] = useState<FieldErrors>({})
  const [general, setGeneral] = useState<string>()
  const register = useMutation({
    mutationFn: async (b: { name: string; email: string; password: string }) =>
      (await api.post<AuthResp>('/auth/register', b)).data,
    onSuccess: (d) => {
      startSession(d.token, d.user)
      router.history.push('/')
    },
    onError: (e) => {
      const r = apiErrors(e)
      setErrors(r.fields)
      setGeneral(r.status === 409 ? 'Este e-mail já está cadastrado. Tente entrar.' : r.message)
    },
  })
  function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const f = new FormData(ev.currentTarget)
    const name = String(f.get('name') ?? '').trim()
    const email = String(f.get('email') ?? '').trim()
    const password = String(f.get('password') ?? '')
    const errs: FieldErrors = {}
    if (!name) errs.name = 'Informe o nome'
    if (!EMAIL.test(email)) errs.email = 'Informe um e-mail válido'
    if (password.length < 8) errs.password = 'A senha deve ter ao menos 8 caracteres'
    setErrors(errs)
    setGeneral(undefined)
    if (Object.keys(errs).length === 0) register.mutate({ name, email, password })
  }
  return (
    <AuthShell
      tabs={<><Link to="/login" search={{}} className="text-foreground no-underline hover:text-primary max-sm:hidden">Entrar</Link><span aria-hidden="true" className="h-5 w-px bg-primary max-sm:hidden" /><h1 id="register-title" className="text-primary max-sm:text-lg max-sm:text-foreground">Criar conta</h1></>}
      switchLine={<>Já tem uma conta? <Link to="/login" search={{}} className="font-bold text-primary">Entre</Link></>}
    >
    <form onSubmit={submit} noValidate className="space-y-4" aria-labelledby="register-title">
      <p className="text-center text-sm text-muted-foreground">Crie seu perfil de colecionador e conecte uma carteira quando quiser.</p>
      <Field id="name" label="Nome" autoComplete="name" error={errors.name} className="max-sm:h-12 max-sm:rounded-xl" />
      <Field id="email" label="E-mail" type="email" autoComplete="username" error={errors.email} className="max-sm:h-12 max-sm:rounded-xl" />
      <Field id="password" label="Senha" type="password" autoComplete="new-password" error={errors.password} className="max-sm:h-12 max-sm:rounded-xl" />
      {general && <p role="alert" data-testid="register-error" className="flex items-start gap-2 rounded-xl bg-destructive-soft p-3 text-sm font-semibold text-destructive"><AlertIcon className="mt-0.5 size-4 shrink-0" />{general}</p>}
      <Button type="submit" size="lg" className="w-full max-sm:rounded-xl" disabled={register.isPending}>
        Cadastrar
      </Button>
    </form>
    </AuthShell>
  )
}
