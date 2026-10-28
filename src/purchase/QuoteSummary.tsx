import type { Quote } from './types'

export function QuoteSummary({ quote }: { quote: Pick<Quote, 'subtotal' | 'discount' | 'networkFee' | 'total'> }) {
  return (
    <dl className="num grid w-full grid-cols-2 gap-x-2 gap-y-1 text-sm [&_dt]:[overflow-wrap:anywhere] [&_dd]:[overflow-wrap:anywhere]" data-testid="quote-summary">
      <dt>Subtotal</dt>
      <dd data-testid="subtotal" className="text-right">{quote.subtotal} ETH</dd>
      <dt>Desconto</dt>
      <dd data-testid="discount" className="text-right">{quote.discount} ETH</dd>
      <dt>Taxa de rede</dt>
      <dd data-testid="network-fee" className="text-right">{quote.networkFee} ETH</dd>
      <div role="presentation" className="col-span-2 mt-2 border-t border-primary/45" />
      <dt className="pt-2 text-base font-bold">Total</dt>
      <dd className="pt-2 text-right text-lg font-bold text-primary" data-testid="total">{quote.total} ETH</dd>
    </dl>
  )
}
