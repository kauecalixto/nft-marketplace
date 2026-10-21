import { useRef, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'
import { NETWORKS, errorInfo, quoteQuery, useCart, useQuote, useWallets } from './queries'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '../components/ui/dialog'
import { QuoteSummary } from './QuoteSummary'
import type { Order, Quote } from './types'

interface Form { name: string; email: string; document: string; walletId: string; network: string }
type Errors = Partial<Record<keyof Form, string>>

export function validate(f: Form): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 3) e.name = 'Informe o nome completo'
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email)) e.email = 'E-mail inválido'
  if (!/^\d{11}$/.test(f.document)) e.document = 'Documento deve ter 11 dígitos'
  if (!f.walletId) e.walletId = 'Selecione uma carteira'
  if (!f.network) e.network = 'Selecione uma rede'
  return e
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function CheckoutPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const cart = useCart()
  const wallets = useWallets()
  const pending = useQuery({ queryKey: ['orders', 'pending'], queryFn: async ({ signal }) => (await api.get<Order[]>('/orders', { params: { status: 'pending' }, signal })).data })
  const [form, setForm] = useState<Form>({ name: '', email: '', document: '', walletId: '', network: 'ethereum' })
  const [errors, setErrors] = useState<Errors>({})
  const quote = useQuote(form.network)
  const [open, setOpen] = useState(false)
  const [reviewQuote, setReviewQuote] = useState<Quote | null>(null)
  const [stale, setStale] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const busy = useRef(false)
  const idemKey = useRef(crypto.randomUUID())
  const opener = useRef<HTMLButtonElement>(null)

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const openReview = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
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
          idemKey.current = transient ? idemKey.current : crypto.randomUUID()
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
  if (cart.isLoading || wallets.isLoading) return <p>Carregando...</p>
  const empty = !cart.data?.length
  const pend = pending.data?.[0]

  return (
    <section>
      <h1 className="text-xl font-bold">Pagamento</h1>
      {pend && (
        <p role="status" data-testid="pending-order-banner">
          Você tem um pedido pendente: <Link to="/orders/$id" params={{ id: pend.id }}>{pend.id}</Link>
        </p>
      )}
      {empty ? (
        <p data-testid="checkout-empty">Carrinho vazio. <Link to="/">Ver catálogo</Link></p>
      ) : (
        <form onSubmit={openReview} noValidate className="space-y-3 max-w-md">
          {(['name', 'email', 'document'] as const).map((k) => (
            <div key={k}>
              <Label className="block">
                {{ name: 'Nome completo', email: 'E-mail', document: 'Documento (11 dígitos)' }[k]}
                <Input data-testid={`field-${k}`} value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={`err-${k}`} className="mt-1" />
              </Label>
              <p id={`err-${k}`} role={errors[k] ? 'alert' : undefined} data-testid={`error-${k}`} className="text-red-700">{errors[k]}</p>
            </div>
          ))}
          <div>
            <label className="block">
              Carteira
              <select data-testid="field-wallet" value={form.walletId} onChange={set('walletId')} aria-invalid={!!errors.walletId} className="block border w-full">
                <option value="">Selecione</option>
                {wallets.data?.map((w) => (
                  <option key={w.id} value={w.id}>{w.label ?? w.name ?? w.address} ({w.address.slice(0, 8)}...)</option>
                ))}
              </select>
            </label>
            <p role={errors.walletId ? 'alert' : undefined} data-testid="error-walletId" className="text-red-700">{errors.walletId}</p>
            {!wallets.data?.length && <p>Nenhuma carteira cadastrada. <Link to="/wallets">Cadastrar carteira</Link></p>}
          </div>
          <label className="block">
            Rede
            <select data-testid="field-network" value={form.network} onChange={set('network')} className="block border w-full">
              {NETWORKS.map((n) => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </label>
          {quote.data && <QuoteSummary quote={quote.data} />}
          <Button ref={opener} type="submit" data-testid="review-order">Revisar pedido</Button>
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

function ReviewDialog(p: {
  quote: Quote; form: Form; stale: boolean; error: string | null; submitting: boolean; pendingId?: string
  onConfirm: () => void; onClose: () => void; onCloseAutoFocus: (e: Event) => void
}) {
  return (
    <DialogContent data-testid="review-dialog" aria-describedby="review-desc" onCloseAutoFocus={p.onCloseAutoFocus}>
      <DialogTitle>Revisar pedido</DialogTitle>
      <DialogDescription id="review-desc" className="sr-only">Confira os dados e itens antes de confirmar o pedido.</DialogDescription>
      <p>{p.form.name} - {p.form.email}</p>
      <ul>
        {p.quote.items.map((i) => (
          <li key={i.nftId}>{i.name} x {i.quantity} = {i.lineTotal} ETH</li>
        ))}
      </ul>
      <QuoteSummary quote={p.quote} />
      {p.stale && <p role="alert" data-testid="quote-changed">A cotação mudou. Confira os novos valores e confirme novamente.</p>}
      {p.error && (
        <p role="alert" data-testid="order-error">
          {p.error}
          {p.pendingId && <> <Link to="/orders/$id" params={{ id: p.pendingId }}>Ver pedido</Link></>}
        </p>
      )}
      <DialogFooter>
        <Button type="button" data-testid="confirm-order" disabled={p.submitting} onClick={p.onConfirm}>{p.submitting ? 'Enviando...' : 'Confirmar pedido'}</Button>
        <Button type="button" variant="outline" data-testid="cancel-review" onClick={p.onClose}>Cancelar</Button>
      </DialogFooter>
    </DialogContent>
  )
}
