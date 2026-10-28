import { useParams, Link } from '@tanstack/react-router'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { errorInfo, orderQuery } from './queries'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { ClockIcon, XCircleIcon } from '../components/icons'
import { QuoteSummary } from './QuoteSummary'
import type { Order } from './types'

export function OrderPage() {
  const { id } = useParams({ from: '/orders/$id' })
  const query = useQuery(orderQuery(id))
  // Região viva persistente: existe em todos os estados, para anunciar a passagem de pendente a confirmado.
  return (
    <>
      <div role="status" aria-live="polite" data-testid="order-live" className="sr-only">
        {query.data?.status === 'confirmed' ? 'Pedido confirmado.' : ''}
      </div>
      <OrderView data={query.data} isLoading={query.isLoading} error={query.error} />
    </>
  )
}

// Cartão central do Figma (confirmação de pedido): painel --surface com barra cobre na base.
const shell = 'card mx-auto w-full max-w-[578px] overflow-hidden border-b-8 border-primary'

function ThankYouIcon() {
  return (
    <svg viewBox="0 0 64 80" aria-hidden="true" focusable="false" className="mx-auto h-20 w-16 text-primary" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round">
      <path d="M6 30 32 8l26 22v40a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V30Z" />
      <path d="M6 30 32 52l26-22" />
      <rect x="14" y="18" width="36" height="26" rx="2" fill="var(--surface)" />
      <text x="32" y="30" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">THANK</text>
      <text x="32" y="39" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none">YOU</text>
    </svg>
  )
}

function OrderView({ data: o, isLoading, error }: Pick<UseQueryResult<Order>, 'data' | 'isLoading' | 'error'>) {
  if (isLoading)
    return (
      <section className="mx-auto max-w-[578px]">
        <h1 className="sr-only">Pedido</h1>
        <div data-testid="skeleton-order" role="status" aria-busy="true" aria-label="Carregando pedido" className={shell}>
          <Skeleton className="h-[256px] rounded-none sm:h-[232px]" />
          <Skeleton className="h-[166px] rounded-none sm:h-[102px]" />
          <div className="space-y-5 p-5 sm:px-12 sm:py-6">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-[89px] w-full" />
            <Skeleton className="h-[121px] w-full" />
            <Skeleton className="h-[60px] w-full sm:h-10" />
            <Skeleton className="h-[124px] w-full sm:h-[92px]" />
            <Skeleton className="mx-auto h-10 w-48" />
          </div>
        </div>
      </section>
    )
  if (error || !o) {
    const s = errorInfo(error).status
    return (
      <p role="alert" data-testid="order-not-found" className="card mx-auto flex max-w-2xl items-center gap-2 border border-destructive/40 bg-destructive-soft p-5 font-semibold text-destructive">
        <XCircleIcon className="size-5 shrink-0" />
        {s === 404 || s === 403 ? 'Pedido não encontrado' : 'Falha ao carregar o pedido'}
      </p>
    )
  }
  if (o.status === 'pending')
    return (
      <section className="mx-auto max-w-[578px]">
        <div className={shell}>
          <div className="flex items-center gap-3 bg-warning-soft p-5 text-warning">
            <ClockIcon className="size-8 shrink-0" />
            <div className="min-w-0">
              <h1 className="break-all text-xl font-bold">Pedido {o.id}</h1>
              <p role="status" data-testid="order-pending" className="font-semibold">Pagamento pendente. Aguardando confirmação...</p>
            </div>
          </div>
        </div>
      </section>
    )
  if (o.status === 'declined')
    return (
      <section className="mx-auto max-w-[578px]">
        <div className={shell}>
          <div className="flex items-center gap-3 bg-destructive-soft p-5 text-destructive">
            <XCircleIcon className="size-8 shrink-0" />
            <div className="min-w-0">
              <h1 className="break-all text-xl font-bold">Pedido {o.id}</h1>
              <p role="alert" data-testid="order-declined" className="font-semibold">Pedido recusado. Seus itens continuam no carrinho.</p>
            </div>
          </div>
          <div className="p-5">
            <Button asChild variant="outline"><Link to="/cart">Voltar ao carrinho</Link></Button>
          </div>
        </div>
      </section>
    )
  const date = new Date(o.createdAt)
  const when = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  return (
    <section data-testid="order-confirmed" className="mx-auto min-w-0 max-w-[578px] break-words [overflow-wrap:anywhere]">
      <div className={shell}>
        <div className="space-y-3 px-5 pb-5 pt-6 text-center">
          <ThankYouIcon />
          <h1 className="text-2xl font-bold">Pedido confirmado</h1>
          <p className="text-base font-bold text-muted-foreground">Seus NFTs agora estão na sua carteira</p>
          <p className="break-all text-xs text-muted-foreground">Pedido {o.id}</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-primary/70 px-5 py-4 text-xs sm:grid-cols-[1.7fr_1fr_.8fr_.8fr] sm:gap-x-0 sm:gap-y-0 [&>div]:min-w-0 sm:[&>div+div]:border-l sm:[&>div+div]:border-primary/70 sm:[&>div+div]:pl-3 sm:[&>div]:pr-3">
          <div>
            <dt className="font-bold text-foreground">ID da transação</dt>
            <dd className="mt-1 text-muted-foreground"><code className="break-all select-all" data-testid="tx-hash">{o.txHash}</code></dd>
          </div>
          <div>
            <dt className="font-bold text-foreground">Data</dt>
            <dd className="mt-1 text-muted-foreground">{when}</dd>
          </div>
          <div>
            <dt className="font-bold text-foreground">Total</dt>
            <dd className="num mt-1 text-muted-foreground">{o.total} ETH</dd>
          </div>
          <div>
            <dt className="font-bold text-foreground">Rede</dt>
            <dd className="mt-1 text-muted-foreground">{o.network}</dd>
          </div>
        </dl>
        <div className="space-y-5 p-5 sm:px-12 sm:py-6">
          <h2 className="text-sm font-bold">Detalhes da transação</h2>
          <ul className="divide-y divide-border text-sm">
            {o.items.map((i) => (
              <li key={i.nftId} data-testid={`receipt-item-${i.nftId}`} className="num py-3 font-bold text-primary">{i.name} x {i.quantity} - {i.lineTotal} ETH</li>
            ))}
          </ul>
          <QuoteSummary quote={o} />
          <p className="text-center text-xs leading-5 text-muted-foreground">Transação confirmada na simulação. A propriedade foi transferida para a sua carteira e registrada na rede (simulada).</p>
          <div className="space-y-1 rounded-card bg-band p-3 text-xs">
            <p>Transação (simulada). Sem blockchain real.</p>
            {o.explorerUrl && (
              <p className="text-muted-foreground" data-testid="tx-explorer">
                Link de exploração (simulado, não navegável): <span className="break-all select-all">{o.explorerUrl}</span>
              </p>
            )}
          </div>
          <div className="text-center">
            <Button asChild variant="outline"><Link to="/">Continuar explorando</Link></Button>
          </div>
        </div>
      </div>
    </section>
  )
}
