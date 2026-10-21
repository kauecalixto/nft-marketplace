import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { errorInfo, useApplyCoupon, useCart, useChangeQuantity, useQuote, useRemoveCoupon, useRemoveItem } from './queries'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import { QuoteSummary } from './QuoteSummary'

export function CartPage() {
  const { data: items, isLoading, isError } = useCart()
  const quote = useQuote()
  const change = useChangeQuantity()
  const remove = useRemoveItem()
  const apply = useApplyCoupon()
  const removeCoupon = useRemoveCoupon()
  const qc = useQueryClient()
  const [code, setCode] = useState('')
  const [couponError, setCouponError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const onChange = (nftId: string, quantity: number) => {
    setNotice(null)
    change.mutate(
      { nftId, quantity },
      {
        onError: (e) => {
          setNotice(errorInfo(e).code === 'AVAILABILITY_CONFLICT' ? 'Quantidade indisponível; carrinho atualizado.' : 'Não foi possível alterar a quantidade.')
          void qc.invalidateQueries({ queryKey: ['cart'] })
        },
      },
    )
  }
  const onApply = (e: React.FormEvent) => {
    e.preventDefault()
    setCouponError(null)
    apply.mutate(code, {
      onSuccess: () => setCode(''),
      onError: (err) => setCouponError(errorInfo(err).message),
    })
  }

  if (isLoading)
    return (
      <section>
        <h1 className="text-xl font-bold">Carrinho</h1>
        <div data-testid="skeleton-cart-summary" role="status" aria-busy="true" aria-label="Carregando carrinho" className="my-4 space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full max-w-xs" />
        </div>
      </section>
    )
  if (isError) return <p role="alert">Falha ao carregar o carrinho.</p>
  return (
    <section>
      <h1 className="text-xl font-bold">Carrinho</h1>
      {items?.length === 0 && <p data-testid="cart-empty">Carrinho vazio</p>}
      {notice && (
        <p role="alert" data-testid="cart-notice">
          {notice}
        </p>
      )}
      <ul className="my-4 space-y-2">
        {items?.map((i) => (
          <li key={i.nftId} data-testid={`cart-item-${i.nftId}`} className="flex items-center gap-3">
            <img src={i.image} alt="" width={48} height={48} />
            <span className="flex-1">
              {i.name} - {i.price} ETH
            </span>
            <Button type="button" variant="outline" size="sm" aria-label={`Diminuir ${i.name}`} data-testid={`qty-dec-${i.nftId}`} disabled={i.quantity <= 1} onClick={() => onChange(i.nftId, i.quantity - 1)}>
              -
            </Button>
            <span data-testid={`qty-${i.nftId}`} aria-live="polite">
              {i.quantity}
            </span>
            <Button type="button" variant="outline" size="sm" aria-label={`Aumentar ${i.name}`} data-testid={`qty-inc-${i.nftId}`} disabled={i.quantity >= i.max} onClick={() => onChange(i.nftId, i.quantity + 1)}>
              +
            </Button>
            <Button type="button" variant="outline" size="sm" data-testid={`remove-${i.nftId}`} onClick={() => remove.mutate(i.nftId)}>
              Remover
            </Button>
          </li>
        ))}
      </ul>
      {!!items?.length && (
        <>
          <form onSubmit={onApply} className="flex gap-2 items-start my-4">
            <label>
              Cupom <Input data-testid="coupon-input" value={code} onChange={(e) => setCode(e.target.value)} className="inline-block w-auto" />
            </label>
            <Button type="submit" size="sm" data-testid="coupon-apply" disabled={apply.isPending || !code.trim()}>
              Aplicar
            </Button>
            {couponError && (
              <p role="alert" data-testid="coupon-error">
                {couponError}
              </p>
            )}
          </form>
          {quote.data?.coupon && (
            <p data-testid="coupon-applied">
              Cupom {quote.data.coupon} aplicado{' '}
              <Button type="button" variant="outline" size="sm" data-testid="coupon-remove" onClick={() => removeCoupon.mutate()}>
                Remover cupom
              </Button>
            </p>
          )}
          {quote.data && <QuoteSummary quote={quote.data} />}
          <Link to="/checkout" data-testid="go-checkout" className="inline-block mt-4 underline">
            Ir para o pagamento
          </Link>
        </>
      )}
    </section>
  )
}
