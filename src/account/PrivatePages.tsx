import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import { Field } from './Field'
import { AvatarUpload } from './AvatarUpload'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { Avatar } from '../components/Avatar'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { CheckCircleIcon, UserIcon, WalletIcon } from '../components/icons'
import { apiErrors, useSession, type FieldErrors, type User } from './session'

const ADDRESS = /^0x[0-9a-fA-F]{40}$/
interface Wallet { id: string; label: string; address: string; role: 'primary' | 'secondary'; connected?: boolean }

// Layout do Figma para Perfil e Carteiras: painel lateral "Meu perfil" + conteúdo. O Figma lista também Atividade, Lista de
// interesse, Ofertas, Arquivos baixados, Suporte e Sair; as cinco primeiras estão fora do escopo (ENUNCIADO §3) e "Sair" já
// está no header, então o painel traz só as duas telas reais.
function AccountLayout({ children }: { children: ReactNode }) {
  const item = 'flex h-11 items-center gap-3 border-l-4 border-transparent px-3 text-sm text-foreground no-underline hover:bg-accent'
  const active = { className: 'border-primary bg-accent text-primary', 'aria-current': 'page' as const }
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-7">
      <nav aria-label="Conta" className="card py-2">
        <p className="px-4 pb-2 pt-3 text-lg font-bold">Meu perfil</p>
        <ul>
          <li><Link to="/profile" className={item} activeProps={active}><UserIcon className="size-5" />Dados do perfil</Link></li>
          <li><Link to="/wallets" className={item} activeProps={active}><WalletIcon className="size-5" />Carteiras</Link></li>
        </ul>
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function ProfilePage() {
  const { data: user } = useSession()
  if (!user)
    return (
      <AccountLayout>
        <div data-testid="skeleton-profile" role="status" aria-busy="true" aria-label="Carregando perfil" className="max-w-sm space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </AccountLayout>
    )
  return (
    <AccountLayout>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-x-6 gap-y-8 xl:grid-cols-2">
        <ProfileForm key={user.id + user.name + user.avatar} user={user} />
        <AvatarUpload />
        <PasswordForm />
      </div>
    </AccountLayout>
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
    <form onSubmit={submit} noValidate className="space-y-4 xl:row-span-2" aria-labelledby="profile-title">
      <div className="flex items-center gap-4">
        {user.avatar ? <img src={user.avatar} alt="Avatar" className="size-16 rounded-full object-cover" /> : <Avatar name={user.name} className="size-16 text-xl" />}
        <div className="min-w-0">
          <h1 id="profile-title" className="text-base font-bold">Perfil do colecionador</h1>
          <p className="break-all text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <Field id="name" label="Nome" defaultValue={user.name} error={errors.name} />
      <Field id="avatar" label="URL do avatar" defaultValue={user.avatar} error={errors.avatar} />
      <Button type="submit" disabled={m.isPending}>
        Salvar perfil
      </Button>
      {m.isSuccess && <p role="status" className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircleIcon className="size-5" />Perfil atualizado</p>}
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
    <form onSubmit={submit} noValidate className="space-y-4" aria-labelledby="password-title">
      <h2 id="password-title" className="text-base font-bold">Alterar senha</h2>
      <Field id="currentPassword" label="Senha atual" type="password" autoComplete="current-password" error={errors.currentPassword} />
      <Field id="newPassword" label="Nova senha" type="password" autoComplete="new-password" error={errors.newPassword} />
      <Button type="submit" disabled={m.isPending}>
        Alterar senha
      </Button>
      {m.isSuccess && <p role="status" className="flex items-center gap-2 text-sm font-semibold text-success"><CheckCircleIcon className="size-5" />Senha alterada</p>}
    </form>
  )
}

function WalletRow({ wallet: w, queryKey, onPrimary }: { wallet: Wallet; queryKey: unknown[]; onPrimary: () => void }) {
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [connectError, setConnectError] = useState<string>()
  const connected = w.connected !== false
  const connection = useMutation({
    mutationFn: async () => api.post(`/wallets/${w.id}/${connected ? 'disconnect' : 'connect'}`),
    onMutate: () => setConnectError(undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallets'] }),
    onError: (e) => setConnectError(apiErrors(e).message ?? 'Não foi possível alterar a conexão.'),
  })
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
    <li data-testid="wallet-item" className="card min-w-0 break-words [overflow-wrap:anywhere] flex flex-wrap items-center gap-x-3 gap-y-1 p-4">
      {editing ? (
        <form onSubmit={submit} noValidate className="w-full max-w-md space-y-4" aria-label={`Editar carteira ${w.label}`}>
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
          <WalletIcon className="size-5 shrink-0 text-primary" /><strong className="break-words">{w.label}</strong> ({w.role === 'primary' ? 'principal' : 'secundária'}) <code className="break-all rounded-control bg-background px-1.5 py-0.5 text-xs">{w.address}</code>
          <span data-testid="wallet-connection" role="status" className="text-sm">{connection.isPending ? 'Processando...' : connected ? 'Conectada' : 'Desconectada'}</span>
          <Button type="button" variant="link" size="sm" data-testid="wallet-toggle-connection" disabled={connection.isPending} onClick={() => connection.mutate()} className="ml-2" aria-label={`${connected ? 'Desconectar' : 'Conectar'} ${w.label}`}>
            {connected ? 'Desconectar' : 'Conectar'}
          </Button>
          {w.role !== 'primary' && (
            <Button type="button" variant="link" size="sm" onClick={onPrimary} className="ml-2">
              Tornar principal
            </Button>
          )}
          <Button type="button" variant="link" size="sm" onClick={() => setEditing(true)} className="ml-2" aria-label={`Editar ${w.label}`}>
            Editar
          </Button>
          {connectError && <p role="alert" data-testid="wallet-connect-error" className="w-full text-sm font-semibold text-destructive">{connectError}</p>}
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
    <AccountLayout>
    <div className="space-y-6">
      <div>
        <h1 className="text-base font-bold">Carteiras</h1>
        <p className="mt-1 text-sm text-muted-foreground">Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.</p>
      </div>
      {isLoading && (
        <ul data-testid="skeleton-wallets" role="status" aria-busy="true" aria-label="Carregando carteiras" className="space-y-2">
          <li><Skeleton className="h-6 w-full max-w-lg" /></li>
          <li><Skeleton className="h-6 w-full max-w-lg" /></li>
        </ul>
      )}
      {error && <p role="alert" className="card border border-destructive/40 bg-destructive-soft p-4 font-semibold text-destructive">Erro ao carregar carteiras</p>}
      {wallets && wallets.length === 0 && <p data-testid="wallets-empty" className="card p-6 text-center text-muted-foreground">Nenhuma carteira cadastrada</p>}
      <ul className="space-y-2 min-w-0">
        {wallets?.map((w) => (
          <WalletRow key={w.id} wallet={w} queryKey={key} onPrimary={() => makePrimary.mutate(w.id)} />
        ))}
      </ul>
      <form onSubmit={submit} noValidate className="max-w-md space-y-4" aria-labelledby="wallet-form-title">
        <h2 id="wallet-form-title" className="text-base font-bold">Adicionar carteira</h2>
        <Field id="label" label="Apelido" error={errors.label} />
        <Field id="address" label="Endereço" error={errors.address} />
        <Button type="submit" disabled={add.isPending}>
          Adicionar carteira
        </Button>
      </form>
    </div>
    </AccountLayout>
  )
}
