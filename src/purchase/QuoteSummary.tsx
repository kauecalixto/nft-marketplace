import type { Quote } from './types'

export function QuoteSummary({ quote }: { quote: Pick<Quote, 'subtotal' | 'discount' | 'networkFee' | 'total'> }) {
  return (
    <dl className="grid grid-cols-2 max-w-xs gap-1" data-testid="quote-summary">
      <dt>Subtotal</dt>
      <dd data-testid="subtotal">{quote.subtotal} ETH</dd>
      <dt>Desconto</dt>
      <dd data-testid="discount">{quote.discount} ETH</dd>
      <dt>Taxa de rede</dt>
      <dd data-testid="network-fee">{quote.networkFee} ETH</dd>
      <dt className="font-bold">Total</dt>
      <dd className="font-bold" data-testid="total">{quote.total} ETH</dd>
    </dl>
  )
}
