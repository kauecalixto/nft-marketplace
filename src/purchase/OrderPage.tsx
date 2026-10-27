import { useParams, Link } from '@tanstack/react-router'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { errorInfo, orderQuery } from './queries'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '../components/icons'
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

function OrderView({ data: o, isLoading, error }: Pick<UseQueryResult<Order>, 'data' | 'isLoading' | 'error'>) {
  if (isLoading)
    return (
      <section className="mx-auto max-w-2xl">
        <h1 className="sr-only">Pedido</h1>
        <div data-testid="skeleton-order" role="status" aria-busy="true" aria-label="Carregando pedido" className="card overflow-hidden">
          <Skeleton className="h-[84px] rounded-none" />
          <div className="space-y-4 p-6">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-[105px] w-full" />
          </div>
        </div>
      </section>
    )
  if (error || !o) {
    const s = errorInfo(error).status
    return (
      <p role="alert" data-testid="order-not-found" className="card mx-auto flex max-w-2xl items-center gap-2 border-red-200 bg-red-50 p-5 font-semibold text-destructive">
        <XCircleIcon className="size-5 shrink-0" />
        {s === 404 || s === 403 ? 'Pedido não encontrado' : 'Falha ao carregar o pedido'}
      </p>
    )
  }
  if (o.status === 'pending')
    return (
      <section className="mx-auto max-w-2xl">
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 bg-amber-50 p-5 text-warning">
            <ClockIcon className="size-8 shrink-0" />
            <div className="min-w-0">
              <h1 className="break-all text-xl font-extrabold">Pedido {o.id}</h1>
              <p role="status" data-testid="order-pending" className="font-semibold">Pagamento pendente. Aguardando confirmação...</p>
            </div>
          </div>
        </div>
      </section>
    )
  if (o.status === 'declined')
    return (
      <section className="mx-auto max-w-2xl">
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 bg-red-50 p-5 text-destructive">
            <XCircleIcon className="size-8 shrink-0" />
            <div className="min-w-0">
              <h1 className="break-all text-xl font-extrabold">Pedido {o.id}</h1>
              <p role="alert" data-testid="order-declined" className="font-semibold">Pedido recusado. Seus itens continuam no carrinho.</p>
            </div>
          </div>
          <div className="p-5">
            <Button asChild variant="outline"><Link to="/cart">Voltar ao carrinho</Link></Button>
          </div>
        </div>
      </section>
    )
  return (
    <section data-testid="order-confirmed" className="mx-auto min-w-0 max-w-2xl break-words [overflow-wrap:anywhere]">
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 bg-green-50 p-5 text-success">
          <CheckCircleIcon className="size-9 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold">Pedido confirmado</h1>
            <p className="break-all text-sm font-medium">Pedido {o.id}</p>
          </div>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="space-y-2 rounded-xl bg-secondary p-4 text-sm">
            <p>
              Transação (simulada): <code className="break-all select-all rounded bg-surface px-1.5 py-0.5 text-xs" data-testid="tx-hash">{o.txHash}</code>
            </p>
            {o.explorerUrl && (
              <p className="text-xs text-muted-foreground" data-testid="tx-explorer">
                Link de exploração (simulado, não navegável): <span className="break-all select-all">{o.explorerUrl}</span>
              </p>
            )}
            <p>Rede: <span className="font-semibold">{o.network}</span></p>
          </div>
          <ul className="divide-y rounded-xl border text-sm">
            {o.items.map((i) => (
              <li key={i.nftId} data-testid={`receipt-item-${i.nftId}`} className="num px-3 py-2.5 font-medium">{i.name} x {i.quantity} - {i.lineTotal} ETH</li>
            ))}
          </ul>
          <div className="border-t border-dashed pt-4">
            <QuoteSummary quote={o} />
          </div>
        </div>
      </div>
    </section>
  )
}
