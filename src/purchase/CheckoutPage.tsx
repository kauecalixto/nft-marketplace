import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, sessionExpiryHooks } from '../api'
import { useSession } from '../account/session'
import { NETWORKS, errorInfo, quoteQuery, useCart, useQuote, useWallets } from './queries'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Skeleton } from '../components/ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '../components/ui/dialog'
import { QuoteSummary } from './QuoteSummary'
import { BackButton, mobileTitle } from '../components/BackButton'
import { AlertIcon, CheckIcon, ClockIcon, InfoIcon, ShieldIcon } from '../components/icons'
import { formatEth, mulInt, parseEth } from './eth'
import type { Order, Quote } from './types'

interface Form { name: string; email: string; document: string; walletId: string; network: string }
type Errors = Partial<Record<keyof Form, string>>

export function validate(f: Form, connected = true): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 3) e.name = 'Informe o nome completo'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'E-mail inválido'
  if (!/^\d{11}$/.test(f.document)) e.document = 'Documento deve ter 11 dígitos'
  if (!f.walletId) e.walletId = 'Selecione uma carteira'
  else if (!connected) e.walletId = 'Conecte a carteira para continuar'
  if (!f.network) e.network = 'Selecione uma rede'
  return e
}

const draftKey = (userId: string) => `checkout-draft:${userId}`
interface Draft { form: Form; open: boolean; idemKey: string }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function CheckoutPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const cart = useCart()
  const wallets = useWallets()
  const pending = useQuery({ queryKey: ['orders', 'pending'], queryFn: async ({ signal }) => (await api.get<Order[]>('/orders', { params: { status: 'pending' }, signal })).data })
  const session = useSession()
  const userId = session.data?.id
  const [form, setForm] = useState<Form>({ name: '', email: '', document: '', walletId: '', network: 'ethereum' })
  const [errors, setErrors] = useState<Errors>({})
  const quote = useQuote(form.network)
  const [open, setOpen] = useState(false)
  const [reviewQuote, setReviewQuote] = useState<Quote | null>(null)
  const [stale, setStale] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const busy = useRef(false)
  const idemKey = useRef<string>(crypto.randomUUID())
  const opener = useRef<HTMLButtonElement>(null)
  const [walletError, setWalletError] = useState<string | null>(null)
  const connection = useMutation({
    mutationFn: async (v: { id: string; action: 'connect' | 'disconnect' }) => (await api.post(`/wallets/${v.id}/${v.action}`)).data,
    onMutate: () => setWalletError(null),
    onSuccess: () => { setErrors((e) => ({ ...e, walletId: undefined })); return qc.invalidateQueries({ queryKey: ['wallets'] }) },
    onError: (e) => setWalletError(errorInfo(e).code === 'WALLET_REJECTED' ? 'A carteira recusou a conexão. Tente novamente.' : errorInfo(e).message),
  })

  // Sessão expirada: salva formulário, estado da revisão e Idempotency-Key por usuário (sessionStorage).
  const snapshot = useRef<Draft | null>(null)
  useEffect(() => { snapshot.current = { form, open, idemKey: idemKey.current } })
  useEffect(() => {
    if (!userId) return
    const save = () => {
      try { sessionStorage.setItem(draftKey(userId), JSON.stringify(snapshot.current)) } catch { /* ignore */ }
    }
    sessionExpiryHooks.add(save)
    return () => void sessionExpiryHooks.delete(save)
  }, [userId])
  const restored = useRef(false)
  const [restoredNotice, setRestoredNotice] = useState(false)
  useEffect(() => {
    if (!userId || restored.current) return
    restored.current = true
    let draft: Draft | null = null
    try {
      draft = JSON.parse(sessionStorage.getItem(draftKey(userId)) ?? 'null') as Draft | null
      sessionStorage.removeItem(draftKey(userId))
    } catch { /* ignore */ }
    if (!draft) return
    setForm(draft.form)
    idemKey.current = draft.idemKey
    setRestoredNotice(true)
    if (draft.open) {
      void qc.fetchQuery({ ...quoteQuery(draft.form.network), staleTime: 0 }).then((q) => { setReviewQuote(q); setOpen(true) })
    }
  }, [userId, qc])

  const selectedWallet = wallets.data?.find((w) => w.id === form.walletId)
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openReview = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form, selectedWallet?.connected !== false)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setOrderError(null)
    setStale(false)
    // Revalida cotação (preço, disponibilidade, cupom, taxas) antes de confirmar.
    const fresh = await qc.fetchQuery({ ...quoteQuery(form.network), staleTime: 0 })
    setReviewQuote(fresh)
    setOpen(true)
  }
  const close = () => {
    setOpen(false)
    opener.current?.focus()
  }

  const confirm = async () => {
    if (busy.current || !reviewQuote) return
    busy.current = true
    setSubmitting(true)
    setOrderError(null)
    const body = {
      collector: { name: form.name.trim(), email: form.email.trim(), document: form.document },
      walletId: form.walletId,
      network: form.network,
      quoteVersion: reviewQuote.version,
    }
    try {
      let attempt = 0
      for (;;) {
        try {
          const { data } = await api.post<Order>('/orders', body, { headers: { 'Idempotency-Key': idemKey.current } })
          idemKey.current = crypto.randomUUID()
          void qc.invalidateQueries({ queryKey: ['cart'] })
          void qc.invalidateQueries({ queryKey: ['quote'] })
          void qc.invalidateQueries({ queryKey: ['orders'] })
          if (data.status === 'declined') {
            setOrderError('Pagamento recusado. Seus itens continuam no carrinho.')
            return
          }
          setOpen(false)
          await navigate({ to: '/orders/$id', params: { id: data.id } })
          return
        } catch (e) {
          const info = errorInfo(e)
          const transient = info.status === 504 || info.status === undefined
          if (transient && ++attempt < 3) {
            await sleep(300)
            continue // mesma Idempotency-Key: recupera o mesmo pedido
          }
          idemKey.current = transient || info.status === 401 ? idemKey.current : crypto.randomUUID()
          if (info.code === 'QUOTE_STALE') {
            setReviewQuote(info.data.quote as Quote)
            setStale(true)
            void qc.invalidateQueries({ queryKey: ['quote'] })
          } else if (info.code === 'ORDER_PENDING') {
            setOrderError('Você já tem um pedido pendente.')
            void qc.invalidateQueries({ queryKey: ['orders', 'pending'] })
          } else if (info.code === 'WALLET_REJECTED') {
            setOrderError('A carteira recusou a conexão. Tente novamente.')
          } else if (info.code === 'AVAILABILITY_CONFLICT') {
            setOrderError('Itens indisponíveis; revise o carrinho.')
            void qc.invalidateQueries({ queryKey: ['cart'] })
          } else if (transient) {
            setOrderError('Tempo esgotado. Tente novamente: o pedido não será duplicado.')
          } else {
            setOrderError(info.message)
          }
          return
        }
      }
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }

  if (wallets.isError || pending.isError) {
    const status = errorInfo(wallets.error ?? pending.error).status
    if (status === 401) return <p role="alert">Sessão necessária. <Link to="/login" search={{ redirect: '/checkout' }}>Entrar</Link></p>
  }
  if (cart.isLoading || wallets.isLoading)
    return (
      <section>
        <Breadcrumb />
        <div className="relative mb-6"><BackButton to="/cart" /><h1 className={`section-title text-base ${mobileTitle}`}>Pagamento</h1></div>
        <div data-testid="skeleton-checkout" role="status" aria-busy="true" aria-label="Carregando pagamento" className={layoutCls}>
          <div className="grid content-start gap-x-6 gap-y-5 md:grid-cols-2">
            <Skeleton className="h-6 w-48 md:col-span-2" />
            {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-[66px] w-full" />)}
            <Skeleton className="mt-2 h-6 w-40 md:col-span-2" />
            <Skeleton className="h-[72px] w-full" />
            <Skeleton className="h-[72px] w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-[180px] w-full" />
            <Skeleton className="h-[121px] w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </section>
    )
  const empty = !cart.data?.length
  const pend = pending.data?.[0]

  return (
    <section>
      <Breadcrumb />
      <div className="relative mb-6"><BackButton to="/cart" /><h1 className={`section-title text-base ${mobileTitle}`}>Pagamento</h1></div>
      {pend && (
        <p role="status" data-testid="pending-order-banner" className="mb-4 flex flex-wrap items-center gap-2 rounded-card border border-warning/40 bg-warning-soft p-3 text-sm font-medium text-warning">
          <ClockIcon className="size-5 shrink-0" />
          <span>Você tem um pedido pendente: <Link to="/orders/$id" params={{ id: pend.id }} className="break-all font-semibold underline">{pend.id}</Link></span>
        </p>
      )}
      {restoredNotice && <p role="status" data-testid="draft-restored" className="mb-4 flex items-center gap-2 rounded-card border border-border bg-secondary p-3 text-sm font-medium text-secondary-foreground"><InfoIcon className="size-5 shrink-0" />Recuperamos os dados do seu checkout.</p>}
      {empty ? (
        <p data-testid="checkout-empty" className="card p-8 text-center text-muted-foreground">Carrinho vazio. <Link to="/" className="font-semibold text-primary underline">Ver catálogo</Link></p>
      ) : (
        <form onSubmit={openReview} noValidate className={layoutCls}>
          <div className="grid min-w-0 content-start gap-x-6 gap-y-5 md:grid-cols-2">
            <h2 className="text-base font-bold md:col-span-2">Perfil do colecionador</h2>
            {(['name', 'email', 'document'] as const).map((k) => (
              <div key={k} className="min-w-0">
                <Label className="block">
                  {{ name: 'Nome completo', email: 'E-mail', document: 'Documento (11 dígitos)' }[k]}
                  <Input data-testid={`field-${k}`} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={`err-${k}`} className="mt-2 max-md:h-12 max-md:rounded-xl max-md:bg-surface" />
                </Label>
                <p id={`err-${k}`} role={errors[k] ? 'alert' : undefined} data-testid={`error-${k}`} className="mt-1 flex items-center gap-1.5 text-sm font-medium text-destructive">{errors[k] && <AlertIcon className="size-4 shrink-0" />}{errors[k]}</p>
              </div>
            ))}
            <h2 className="mt-2 text-base font-bold md:col-span-2">Carteira e rede</h2>
            <div className="min-w-0">
              <label className="block text-sm">
                Carteira
                <select data-testid="field-wallet" value={form.walletId} onChange={set('walletId')} aria-invalid={!!errors.walletId} aria-describedby="err-walletId" className={selectCls}>
                  <option value="">Selecione</option>
                  {wallets.data?.map((w) => (
                    <option key={w.id} value={w.id}>{w.label ?? w.name ?? w.address} ({w.address.slice(0, 8)}...)</option>
                  ))}
                </select>
              </label>
              <p id="err-walletId" role={errors.walletId ? 'alert' : undefined} data-testid="error-walletId" className="mt-1 flex items-center gap-1.5 text-sm font-medium text-destructive">{errors.walletId && <AlertIcon className="size-4 shrink-0" />}{errors.walletId}</p>
              {selectedWallet && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span data-testid="wallet-status" role="status" className={`inline-flex items-center gap-1.5 rounded-control border px-2.5 py-0.5 text-xs font-bold ${connection.isPending ? 'border-border bg-secondary text-secondary-foreground' : selectedWallet.connected === false ? 'border-warning/40 bg-warning-soft text-warning' : 'border-success/40 bg-success-soft text-success'}`}>
                    {connection.isPending ? <ClockIcon className="size-3.5" /> : selectedWallet.connected === false ? <AlertIcon className="size-3.5" /> : <CheckIcon className="size-3.5" />}
                    {connection.isPending ? 'Processando...' : selectedWallet.connected === false ? 'Desconectada' : 'Conectada'}
                  </span>
                  <Button type="button" size="sm" data-testid="connect-wallet" disabled={connection.isPending || selectedWallet.connected !== false} onClick={() => connection.mutate({ id: selectedWallet.id, action: 'connect' })}>Conectar</Button>
                  <Button type="button" size="sm" variant="outline" data-testid="disconnect-wallet" disabled={connection.isPending || selectedWallet.connected === false} onClick={() => connection.mutate({ id: selectedWallet.id, action: 'disconnect' })}>Desconectar</Button>
                </div>
              )}
              {walletError && <p role="alert" data-testid="wallet-error" className="mt-1 flex items-center gap-1.5 text-sm font-medium text-destructive"><AlertIcon className="size-4 shrink-0" />{walletError}</p>}
              {!wallets.data?.length && <p className="mt-2 text-sm text-muted-foreground">Nenhuma carteira cadastrada. <Link to="/wallets" className="font-bold text-primary underline">Cadastrar carteira</Link></p>}
            </div>
            <label className="block min-w-0 text-sm">
              Rede
              <select data-testid="field-network" value={form.network} onChange={set('network')} className={selectCls}>
                {NETWORKS.map((n) => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="min-w-0 space-y-4 max-md:-mx-4 max-md:rounded-t-3xl max-md:bg-surface max-md:px-4 max-md:py-5 lg:sticky lg:top-24">
            <h2 className="text-base font-bold">Seus NFTs</h2>
            <ul className="space-y-2">
              {cart.data?.map((i) => (
                <li key={i.nftId} className="card flex items-center gap-3 p-2 max-md:rounded-2xl max-md:bg-background">
                  <img src={i.image} alt="" width={70} height={70} loading="lazy" decoding="async" className="size-[70px] shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 break-words">
                    <span className="block font-bold">{i.name}</span>
                    <span className="block text-xs text-muted-foreground">ID do token: {i.nftId}</span>
                  </span>
                  <span className="num shrink-0 text-right text-sm">
                    <span className="block text-muted-foreground">x {i.quantity}</span>
                    <span className="block font-bold text-primary">{formatEth(mulInt(parseEth(i.price), i.quantity))} ETH</span>
                  </span>
                </li>
              ))}
            </ul>
            {quote.data && <QuoteSummary quote={quote.data} />}
            <Button ref={opener} type="submit" size="lg" className="w-full max-md:h-14 max-md:rounded-2xl max-md:bg-linear-to-r max-md:from-primary max-md:to-primary-2" data-testid="review-order">Revisar pedido</Button>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldIcon className="size-4 shrink-0" />Você confirma tudo antes de enviar o pedido.</p>
          </div>
        </form>
      )}
      {reviewQuote && (
        <Dialog open={open} onOpenChange={(o) => { if (!o) close() }}>
          <ReviewDialog quote={reviewQuote} form={form} stale={stale} error={orderError} submitting={submitting} onConfirm={confirm} onClose={close} pendingId={pend?.id} onCloseAutoFocus={(e) => { e.preventDefault(); opener.current?.focus() }} />
        </Dialog>
      )}
    </section>
  )
}

const selectCls = 'mt-2 flex h-10 w-full max-md:h-12 max-md:rounded-xl max-md:bg-surface rounded-control border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:border-destructive'
const layoutCls = 'grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_405px] lg:gap-12'
const Breadcrumb = () => <p className="mb-4 text-sm font-bold text-foreground max-md:hidden">Início / Mercado / Pagamento</p>

function ReviewDialog(p: {
  quote: Quote; form: Form; stale: boolean; error: string | null; submitting: boolean; pendingId?: string
  onConfirm: () => void; onClose: () => void; onCloseAutoFocus: (e: Event) => void
}) {
  return (
    <DialogContent data-testid="review-dialog" aria-describedby="review-desc" onCloseAutoFocus={p.onCloseAutoFocus}>
      <DialogTitle>Revisar pedido</DialogTitle>
      <DialogDescription id="review-desc" className="sr-only">Confira os dados e itens antes de confirmar o pedido.</DialogDescription>
      <p className="break-words rounded-card bg-secondary p-3 text-sm font-medium">{p.form.name} - {p.form.email}</p>
      <ul className="divide-y rounded-card border text-sm">
        {p.quote.items.map((i) => (
          <li key={i.nftId} className="num break-words px-3 py-2">{i.name} x {i.quantity} = {i.lineTotal} ETH</li>
        ))}
      </ul>
      <QuoteSummary quote={p.quote} />
      {p.stale && <p role="alert" data-testid="quote-changed" className="flex items-start gap-2 rounded-card bg-warning-soft p-3 text-sm font-semibold text-warning"><AlertIcon className="mt-0.5 size-4 shrink-0" />A cotação mudou. Confira os novos valores e confirme novamente.</p>}
      {p.error && (
        <p role="alert" data-testid="order-error" className="flex items-start gap-2 rounded-card bg-destructive-soft p-3 text-sm font-semibold text-destructive">
          <AlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>
            {p.error}
            {p.pendingId && <> <Link to="/orders/$id" params={{ id: p.pendingId }} className="underline">Ver pedido</Link></>}
          </span>
        </p>
      )}
      <DialogFooter>
        <Button type="button" className="h-auto min-h-10 whitespace-normal py-2 text-center" data-testid="confirm-order" disabled={p.submitting} onClick={p.onConfirm}>{p.submitting ? 'Enviando...' : 'Confirmar pedido'}</Button>
        <Button type="button" variant="outline" className="h-auto min-h-10 whitespace-normal py-2 text-center" data-testid="cancel-review" onClick={p.onClose}>Cancelar</Button>
      </DialogFooter>
    </DialogContent>
  )
}
