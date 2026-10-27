import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useRouter, useSearch } from '@tanstack/react-router'
import { api } from '../api'
import { Button } from '../components/ui/button'
import { AlertIcon, InfoIcon } from '../components/icons'
import { Field } from './Field'
import { apiErrors, safeRedirect, startSession, type FieldErrors, type User } from './session'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
type AuthResp = { token: string; user: User }

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
    <form onSubmit={submit} noValidate className="card mx-auto w-full max-w-md space-y-4 p-6 sm:p-8" aria-labelledby="login-title">
      <div>
        <h1 id="login-title" className="text-3xl font-extrabold">Entrar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Acesse sua conta para comprar e acompanhar pedidos.</p>
      </div>
      {(search.expired === true || search.expired === 'true') && (
        <p role="status" data-testid="session-expired" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-warning"><InfoIcon className="mt-0.5 size-4 shrink-0" />Sua sessão expirou. Entre novamente para continuar.</p>
      )}
      <Field id="email" label="E-mail" type="email" autoComplete="username" error={errors.email} />
      <Field id="password" label="Senha" type="password" autoComplete="current-password" error={errors.password} />
      {general && <p role="alert" data-testid="login-error" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-destructive"><AlertIcon className="mt-0.5 size-4 shrink-0" />{general}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={login.isPending}>
        Entrar
      </Button>
      <p className="text-center text-sm text-muted-foreground">Ainda não tem conta? <Link to="/register" className="font-semibold text-primary underline">Criar conta</Link></p>
    </form>
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
    <form onSubmit={submit} noValidate className="card mx-auto w-full max-w-md space-y-4 p-6 sm:p-8" aria-labelledby="register-title">
      <div>
        <h1 id="register-title" className="text-3xl font-extrabold">Cadastro</h1>
        <p className="mt-1 text-sm text-muted-foreground">Crie sua conta em poucos segundos.</p>
      </div>
      <Field id="name" label="Nome" autoComplete="name" error={errors.name} />
      <Field id="email" label="E-mail" type="email" autoComplete="username" error={errors.email} />
      <Field id="password" label="Senha" type="password" autoComplete="new-password" error={errors.password} />
      {general && <p role="alert" data-testid="register-error" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-destructive"><AlertIcon className="mt-0.5 size-4 shrink-0" />{general}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={register.isPending}>
        Cadastrar
      </Button>
    </form>
  )
}
