import { useParams, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { errorInfo, orderQuery } from './queries'
import { Button } from '../components/ui/button'
import { QuoteSummary } from './QuoteSummary'

export function OrderPage() {
  const { id } = useParams({ from: '/orders/$id' })
  const { data: o, isLoading, error } = useQuery(orderQuery(id))
  if (isLoading) return <p>Carregando pedido...</p>
  if (error || !o) {
    const s = errorInfo(error).status
    return <p role="alert" data-testid="order-not-found">{s === 404 || s === 403 ? 'Pedido não encontrado' : 'Falha ao carregar o pedido'}</p>
  }
  if (o.status === 'pending')
    return (
      <section>
        <h1 className="text-xl font-bold break-all">Pedido {o.id}</h1>
        <p role="status" data-testid="order-pending">Pagamento pendente. Aguardando confirmação...</p>
      </section>
    )
  if (o.status === 'declined')
    return (
      <section>
        <h1 className="text-xl font-bold break-all">Pedido {o.id}</h1>
        <p role="alert" data-testid="order-declined">Pedido recusado. Seus itens continuam no carrinho.</p>
        <Button asChild variant="outline" className="mt-2"><Link to="/cart">Voltar ao carrinho</Link></Button>
      </section>
    )
  return (
    <section data-testid="order-confirmed" className="min-w-0 break-words [overflow-wrap:anywhere]">
      <h1 className="text-xl font-bold">Pedido confirmado</h1>
      <p className="break-all">Pedido {o.id}</p>
      <p>
        Transação: <a className="break-all" data-testid="tx-hash" href={o.explorerUrl} target="_blank" rel="noreferrer">{o.txHash}</a>
      </p>
      <p>Rede: {o.network}</p>
      <ul>
        {o.items.map((i) => (
          <li key={i.nftId} data-testid={`receipt-item-${i.nftId}`}>{i.name} x {i.quantity} - {i.lineTotal} ETH</li>
        ))}
      </ul>
      <QuoteSummary quote={o} />
    </section>
  )
}
