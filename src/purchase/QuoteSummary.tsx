import type { Quote } from './types'

export function QuoteSummary({ quote }: { quote: Pick<Quote, 'subtotal' | 'discount' | 'networkFee' | 'total'> }) {
  return (
    <dl className="num grid w-full grid-cols-2 gap-x-2 gap-y-1 text-sm [&_dt]:[overflow-wrap:anywhere] [&_dd]:[overflow-wrap:anywhere]" data-testid="quote-summary">
      <dt className="text-muted-foreground">Subtotal</dt>
      <dd data-testid="subtotal" className="text-right font-medium">{quote.subtotal} ETH</dd>
      <dt className="text-muted-foreground">Desconto</dt>
      <dd data-testid="discount" className="text-right font-medium">{quote.discount} ETH</dd>
      <dt className="text-muted-foreground">Taxa de rede</dt>
      <dd data-testid="network-fee" className="text-right font-medium">{quote.networkFee} ETH</dd>
      <div role="presentation" className="col-span-2 mt-1 border-t" />
      <dt className="pt-1 text-base font-bold">Total</dt>
      <dd className="pt-1 text-right text-base font-extrabold text-primary" data-testid="total">{quote.total} ETH</dd>
    </dl>
  )
}
