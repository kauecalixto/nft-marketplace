import { useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Link, useRouter, useSearch } from '@tanstack/react-router'
import { api } from '../api'
import { Button } from '../components/ui/button'
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
    <form onSubmit={submit} noValidate className="space-y-3 max-w-sm" aria-labelledby="login-title">
      <h1 id="login-title" className="text-2xl font-bold">Entrar</h1>
      {(search.expired === true || search.expired === 'true') && (
        <p role="status" data-testid="session-expired">Sua sessão expirou. Entre novamente para continuar.</p>
      )}
      <Field id="email" label="E-mail" type="email" autoComplete="username" error={errors.email} />
      <Field id="password" label="Senha" type="password" autoComplete="current-password" error={errors.password} />
      {general && <p role="alert" data-testid="login-error">{general}</p>}
      <Button type="submit" disabled={login.isPending}>
        Entrar
      </Button>
      <p><Link to="/register">Criar conta</Link></p>
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
    <form onSubmit={submit} noValidate className="space-y-3 max-w-sm" aria-labelledby="register-title">
      <h1 id="register-title" className="text-2xl font-bold">Cadastro</h1>
      <Field id="name" label="Nome" autoComplete="name" error={errors.name} />
      <Field id="email" label="E-mail" type="email" autoComplete="username" error={errors.email} />
      <Field id="password" label="Senha" type="password" autoComplete="new-password" error={errors.password} />
      {general && <p role="alert" data-testid="register-error">{general}</p>}
      <Button type="submit" disabled={register.isPending}>
        Cadastrar
      </Button>
    </form>
  )
}
