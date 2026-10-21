import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import { Field } from './Field'
import { AvatarUpload } from './AvatarUpload'
import { Button } from '../components/ui/button'
import { apiErrors, useSession, type FieldErrors, type User } from './session'

const ADDRESS = /^0x[0-9a-fA-F]{40}$/
interface Wallet { id: string; label: string; address: string; role: 'primary' | 'secondary' }

export function ProfilePage() {
  const { data: user } = useSession()
  if (!user) return <p>Carregando...</p>
  return (
    <div className="space-y-8">
      <ProfileForm key={user.id + user.name + user.avatar} user={user} />
      <AvatarUpload />
      <PasswordForm />
    </div>
  )
}

function ProfileForm({ user }: { user: User }) {
  const qc = useQueryClient()
  const [errors, setErrors] = useState<FieldErrors>({})
  const m = useMutation({
    mutationFn: async (b: { name: string; avatar: string }) => (await api.patch<User>('/profile', b)).data,
    onSuccess: (u) => {
      setErrors({})
      qc.setQueryData(['session'], u)
    },
    onError: (e) => setErrors(apiErrors(e).fields),
  })
  function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const f = new FormData(ev.currentTarget)
    const name = String(f.get('name') ?? '').trim()
    const avatar = String(f.get('avatar') ?? '').trim()
    const errs: FieldErrors = {}
    if (!name) errs.name = 'Informe o nome'
    if (avatar && !avatar.startsWith('data:image/') && !/^https?:\/\/\S+$/.test(avatar)) errs.avatar = 'URL do avatar inválida'
    setErrors(errs)
    if (!Object.keys(errs).length) m.mutate({ name, avatar })
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-3 max-w-sm" aria-labelledby="profile-title">
      <h1 id="profile-title" className="text-2xl font-bold">Perfil</h1>
      <p>{user.email}</p>
      {user.avatar && <img src={user.avatar} alt="Avatar" className="w-16 h-16" />}
      <Field id="name" label="Nome" defaultValue={user.name} error={errors.name} />
      <Field id="avatar" label="URL do avatar" defaultValue={user.avatar} error={errors.avatar} />
      <Button type="submit" disabled={m.isPending}>
        Salvar perfil
      </Button>
      {m.isSuccess && <p role="status">Perfil atualizado</p>}
    </form>
  )
}

function PasswordForm() {
  const [errors, setErrors] = useState<FieldErrors>({})
  const m = useMutation({
    mutationFn: async (b: { currentPassword: string; newPassword: string }) => api.put('/profile/password', b),
    onSuccess: () => setErrors({}),
    onError: (e) => setErrors(apiErrors(e).fields),
  })
  function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const form = ev.currentTarget
    const f = new FormData(form)
    const currentPassword = String(f.get('currentPassword') ?? '')
    const newPassword = String(f.get('newPassword') ?? '')
    const errs: FieldErrors = {}
    if (!currentPassword) errs.currentPassword = 'Informe a senha atual'
    if (newPassword.length < 8) errs.newPassword = 'A nova senha deve ter ao menos 8 caracteres'
    setErrors(errs)
    if (!Object.keys(errs).length) m.mutate({ currentPassword, newPassword }, { onSuccess: () => form.reset() })
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-3 max-w-sm" aria-labelledby="password-title">
      <h2 id="password-title" className="text-xl font-bold">Alterar senha</h2>
      <Field id="currentPassword" label="Senha atual" type="password" autoComplete="current-password" error={errors.currentPassword} />
      <Field id="newPassword" label="Nova senha" type="password" autoComplete="new-password" error={errors.newPassword} />
      <Button type="submit" disabled={m.isPending}>
        Alterar senha
      </Button>
      {m.isSuccess && <p role="status">Senha alterada</p>}
    </form>
  )
}

function WalletRow({ wallet: w, queryKey, onPrimary }: { wallet: Wallet; queryKey: unknown[]; onPrimary: () => void }) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const save = useMutation({
    mutationFn: async (b: { label: string; address: string }) => api.patch(`/wallets/${w.id}`, b),
    onSuccess: () => {
      setErrors({})
      setEditing(false)
      void qc.invalidateQueries({ queryKey })
    },
    onError: (e) => setErrors(apiErrors(e).fields),
  })
  function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const f = new FormData(ev.currentTarget)
    const label = String(f.get(`label-${w.id}`) ?? '').trim()
    const address = String(f.get(`address-${w.id}`) ?? '').trim()
    const errs: FieldErrors = {}
    if (!label) errs.label = 'Informe um apelido'
    if (!ADDRESS.test(address)) errs.address = 'Endereço inválido (0x + 40 hexadecimais)'
    setErrors(errs)
    if (!Object.keys(errs).length) save.mutate({ label, address })
  }
  return (
    <li data-testid="wallet-item" className="border p-2 min-w-0 break-words [overflow-wrap:anywhere] flex flex-wrap items-center gap-2">
      {editing ? (
        <form onSubmit={submit} noValidate className="space-y-3 max-w-sm" aria-label={`Editar carteira ${w.label}`}>
          <Field id={`label-${w.id}`} label="Apelido" defaultValue={w.label} error={errors.label} />
          <Field id={`address-${w.id}`} label="Endereço" defaultValue={w.address} error={errors.address} />
          <Button type="submit" disabled={save.isPending}>
            Salvar carteira
          </Button>
          <Button
            type="button"
            variant="link"
            className="ml-2"
            onClick={() => {
              setEditing(false)
              setErrors({})
            }}
          >
            Cancelar
          </Button>
        </form>
      ) : (
        <>
          <strong className="break-words">{w.label}</strong> ({w.role === 'primary' ? 'principal' : 'secundária'}) <code className="break-all">{w.address}</code>
          {w.role !== 'primary' && (
            <Button type="button" variant="link" size="sm" onClick={onPrimary} className="ml-2">
              Tornar principal
            </Button>
          )}
          <Button type="button" variant="link" size="sm" onClick={() => setEditing(true)} className="ml-2" aria-label={`Editar ${w.label}`}>
            Editar
          </Button>
        </>
      )}
    </li>
  )
}

export function WalletsPage() {
  const { data: user } = useSession()
  const qc = useQueryClient()
  const key = ['wallets', user?.id]
  const { data: wallets, isLoading, error } = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async ({ signal }) => (await api.get<Wallet[]>('/wallets', { signal })).data,
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const add = useMutation({
    mutationFn: async (b: { label: string; address: string }) => (await api.post<Wallet>('/wallets', b)).data,
    onSuccess: () => {
      setErrors({})
      void qc.invalidateQueries({ queryKey: key })
    },
    onError: (e) => setErrors(apiErrors(e).fields),
  })
  const makePrimary = useMutation({
    mutationFn: async (id: string) => api.patch(`/wallets/${id}`, { primary: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  })
  function submit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const form = ev.currentTarget
    const f = new FormData(form)
    const label = String(f.get('label') ?? '').trim()
    const address = String(f.get('address') ?? '').trim()
    const errs: FieldErrors = {}
    if (!label) errs.label = 'Informe um apelido'
    if (!ADDRESS.test(address)) errs.address = 'Endereço inválido (0x + 40 hexadecimais)'
    setErrors(errs)
    if (!Object.keys(errs).length) add.mutate({ label, address }, { onSuccess: () => form.reset() })
  }
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Carteiras</h1>
      {isLoading && <p>Carregando...</p>}
      {error && <p role="alert">Erro ao carregar carteiras</p>}
      {wallets && wallets.length === 0 && <p data-testid="wallets-empty">Nenhuma carteira cadastrada</p>}
      <ul className="space-y-2 min-w-0">
        {wallets?.map((w) => (
          <WalletRow key={w.id} wallet={w} queryKey={key} onPrimary={() => makePrimary.mutate(w.id)} />
        ))}
      </ul>
      <form onSubmit={submit} noValidate className="space-y-3 max-w-sm" aria-labelledby="wallet-form-title">
        <h2 id="wallet-form-title" className="text-xl font-bold">Adicionar carteira</h2>
        <Field id="label" label="Apelido" error={errors.label} />
        <Field id="address" label="Endereço" error={errors.address} />
        <Button type="submit" disabled={add.isPending}>
          Adicionar carteira
        </Button>
      </form>
    </div>
  )
}
