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
import { AlertIcon, CheckIcon, ClockIcon, InfoIcon, ShieldIcon } from '../components/icons'
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
        <h1 className="mb-6 text-3xl font-extrabold">Pagamento</h1>
        <div data-testid="skeleton-checkout" role="status" aria-busy="true" aria-label="Carregando pagamento" className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <div className="card space-y-4 p-5 sm:p-6">
              <Skeleton className="h-7 w-44" />
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-10 w-full" />
                </div>
              ))}
            </div>
            <div className="card space-y-4 p-5 sm:p-6">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="card space-y-4 p-5 sm:p-6">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-[105px] w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </section>
    )
  const empty = !cart.data?.length
  const pend = pending.data?.[0]

  return (
    <section>
      <h1 className="mb-6 text-3xl font-extrabold">Pagamento</h1>
      {pend && (
        <p role="status" data-testid="pending-order-banner" className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-warning">
          <ClockIcon className="size-5 shrink-0" />
          <span>Você tem um pedido pendente: <Link to="/orders/$id" params={{ id: pend.id }} className="break-all font-semibold underline">{pend.id}</Link></span>
        </p>
      )}
      {restoredNotice && <p role="status" data-testid="draft-restored" className="mb-4 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm font-medium text-secondary-foreground"><InfoIcon className="size-5 shrink-0" />Recuperamos os dados do seu checkout.</p>}
      {empty ? (
        <p data-testid="checkout-empty" className="card p-8 text-center text-muted-foreground">Carrinho vazio. <Link to="/" className="font-semibold text-primary underline">Ver catálogo</Link></p>
      ) : (
        <form onSubmit={openReview} noValidate className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <div className="card space-y-4 p-5 sm:p-6">
              <h2 className="text-lg font-bold">Dados do comprador</h2>
              {(['name', 'email', 'document'] as const).map((k) => (
                <div key={k}>
                  <Label className="block">
                    {{ name: 'Nome completo', email: 'E-mail', document: 'Documento (11 dígitos)' }[k]}
                    <Input data-testid={`field-${k}`} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={`err-${k}`} className="mt-1.5" />
                  </Label>
                  <p id={`err-${k}`} role={errors[k] ? 'alert' : undefined} data-testid={`error-${k}`} className="mt-1 flex items-center gap-1.5 text-sm font-medium text-destructive">{errors[k] && <AlertIcon className="size-4 shrink-0" />}{errors[k]}</p>
                </div>
              ))}
            </div>
            <div className="card space-y-4 p-5 sm:p-6">
              <h2 className="text-lg font-bold">Carteira e rede</h2>
              <div>
                <label className="block text-sm font-medium">
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
                    <span data-testid="wallet-status" role="status" className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${connection.isPending ? 'border-border bg-secondary text-secondary-foreground' : selectedWallet.connected === false ? 'border-amber-200 bg-amber-50 text-warning' : 'border-green-200 bg-green-50 text-success'}`}>
                      {connection.isPending ? <ClockIcon className="size-3.5" /> : selectedWallet.connected === false ? <AlertIcon className="size-3.5" /> : <CheckIcon className="size-3.5" />}
                      {connection.isPending ? 'Processando...' : selectedWallet.connected === false ? 'Desconectada' : 'Conectada'}
                    </span>
                    <Button type="button" size="sm" data-testid="connect-wallet" disabled={connection.isPending || selectedWallet.connected !== false} onClick={() => connection.mutate({ id: selectedWallet.id, action: 'connect' })}>Conectar</Button>
                    <Button type="button" size="sm" variant="outline" data-testid="disconnect-wallet" disabled={connection.isPending || selectedWallet.connected === false} onClick={() => connection.mutate({ id: selectedWallet.id, action: 'disconnect' })}>Desconectar</Button>
                  </div>
                )}
                {walletError && <p role="alert" data-testid="wallet-error" className="mt-1 flex items-center gap-1.5 text-sm font-medium text-destructive"><AlertIcon className="size-4 shrink-0" />{walletError}</p>}
                {!wallets.data?.length && <p className="mt-2 text-sm text-muted-foreground">Nenhuma carteira cadastrada. <Link to="/wallets" className="font-semibold text-primary underline">Cadastrar carteira</Link></p>}
              </div>
              <label className="block text-sm font-medium">
                Rede
                <select data-testid="field-network" value={form.network} onChange={set('network')} className={selectCls}>
                  {NETWORKS.map((n) => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="card space-y-4 p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold">Resumo</h2>
            {quote.data && <QuoteSummary quote={quote.data} />}
            <Button ref={opener} type="submit" size="lg" className="w-full" data-testid="review-order">Revisar pedido</Button>
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

const selectCls = 'mt-1.5 flex h-10 w-full rounded-control border border-input bg-surface px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 aria-invalid:border-destructive'

function ReviewDialog(p: {
  quote: Quote; form: Form; stale: boolean; error: string | null; submitting: boolean; pendingId?: string
  onConfirm: () => void; onClose: () => void; onCloseAutoFocus: (e: Event) => void
}) {
  return (
    <DialogContent data-testid="review-dialog" aria-describedby="review-desc" onCloseAutoFocus={p.onCloseAutoFocus}>
      <DialogTitle>Revisar pedido</DialogTitle>
      <DialogDescription id="review-desc" className="sr-only">Confira os dados e itens antes de confirmar o pedido.</DialogDescription>
      <p className="break-words rounded-xl bg-secondary p-3 text-sm font-medium">{p.form.name} - {p.form.email}</p>
      <ul className="divide-y rounded-xl border text-sm">
        {p.quote.items.map((i) => (
          <li key={i.nftId} className="num break-words px-3 py-2">{i.name} x {i.quantity} = {i.lineTotal} ETH</li>
        ))}
      </ul>
      <QuoteSummary quote={p.quote} />
      {p.stale && <p role="alert" data-testid="quote-changed" className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-warning"><AlertIcon className="mt-0.5 size-4 shrink-0" />A cotação mudou. Confira os novos valores e confirme novamente.</p>}
      {p.error && (
        <p role="alert" data-testid="order-error" className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-destructive">
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
