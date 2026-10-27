import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { errorInfo, useApplyCoupon, useCart, useChangeQuantity, useQuote, useRemoveCoupon, useRemoveItem } from './queries'
import { Button, buttonVariants } from '../components/ui/button'
import { AlertIcon, CartIcon, CheckCircleIcon, MinusIcon, PlusIcon, TrashIcon } from '../components/icons'
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
  const onRemove = (nftId: string) => {
    setNotice(null)
    remove.mutate(nftId, { onError: () => setNotice('Não foi possível remover o item.') })
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
        <h1 className="mb-6 text-3xl font-extrabold">Carrinho</h1>
        <div data-testid="skeleton-cart-summary" role="status" aria-busy="true" aria-label="Carregando carrinho" className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-card" />
            <Skeleton className="h-24 w-full rounded-card" />
          </div>
          <div className="card space-y-4 p-5">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-[105px] w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
      </section>
    )
  if (isError)
    return (
      <p role="alert" className="card flex items-center gap-2 border-red-200 bg-red-50 p-5 font-semibold text-destructive">
        <AlertIcon className="size-5" />
        Falha ao carregar o carrinho.
      </p>
    )
  return (
    <section>
      <h1 className="mb-6 text-3xl font-extrabold">Carrinho</h1>
      {items?.length === 0 && (
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary"><CartIcon className="size-7" /></span>
          <p data-testid="cart-empty" className="text-lg font-semibold">Carrinho vazio</p>
          <Link to="/" className={buttonVariants({})}>Explorar NFTs</Link>
        </div>
      )}
      {notice && (
        <p role="alert" data-testid="cart-notice" className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-warning">
          <AlertIcon className="size-5 shrink-0" />
          {notice}
        </p>
      )}
      {!!items?.length && (
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <ul className="space-y-3">
            {items.map((i) => (
              <li key={i.nftId} data-testid={`cart-item-${i.nftId}`} className="card flex flex-wrap items-center gap-x-4 gap-y-3 p-3 sm:p-4">
                <img src={i.image} alt={i.name} width={72} height={72} className="size-[72px] shrink-0 rounded-xl object-cover" />
                <span className="min-w-0 flex-1 basis-40 break-words font-semibold">
                  {i.name} - {i.price} ETH
                </span>
                <div className="flex items-center gap-1.5">
                  <Button type="button" variant="outline" size="icon" aria-label={`Diminuir ${i.name}`} data-testid={`qty-dec-${i.nftId}`} disabled={i.quantity <= 1} onClick={() => onChange(i.nftId, i.quantity - 1)}>
                    <MinusIcon className="size-4" />
                  </Button>
                  <span data-testid={`qty-${i.nftId}`} aria-live="polite" className="num w-8 text-center text-base font-bold">
                    {i.quantity}
                  </span>
                  <Button type="button" variant="outline" size="icon" aria-label={`Aumentar ${i.name}`} data-testid={`qty-inc-${i.nftId}`} disabled={i.quantity >= i.max} onClick={() => onChange(i.nftId, i.quantity + 1)}>
                    <PlusIcon className="size-4" />
                  </Button>
                </div>
                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-red-50 hover:text-destructive" aria-label={`Remover ${i.name}`} data-testid={`remove-${i.nftId}`} onClick={() => onRemove(i.nftId)}>
                  <TrashIcon className="size-4" />
                  Remover
                </Button>
              </li>
            ))}
          </ul>
          <div className="card space-y-5 p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold">Resumo</h2>
            <form onSubmit={onApply} className="flex flex-wrap items-end gap-2">
              <label className="min-w-0 flex-1 basis-32 text-sm font-medium">
                Cupom <Input data-testid="coupon-input" value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={!!couponError} aria-describedby={couponError ? 'coupon-error' : undefined} className="mt-1.5" />
              </label>
              <Button type="submit" variant="outline" data-testid="coupon-apply" disabled={apply.isPending || !code.trim()}>
                Aplicar
              </Button>
              {couponError && (
                <p id="coupon-error" role="alert" data-testid="coupon-error" className="flex w-full items-center gap-1.5 text-sm font-medium text-destructive">
                  <AlertIcon className="size-4 shrink-0" />
                  {couponError}
                </p>
              )}
            </form>
            {quote.data?.coupon && (
              <p data-testid="coupon-applied" className="flex flex-wrap items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-semibold text-success">
                <CheckCircleIcon className="size-5 shrink-0" />
                <span>Cupom {quote.data.coupon} aplicado</span>
                <Button type="button" variant="outline" size="sm" data-testid="coupon-remove" onClick={() => removeCoupon.mutate()}>
                  Remover cupom
                </Button>
              </p>
            )}
            {quote.isLoading && (
              // mesmas 4 linhas do QuoteSummary (3 x 20px + total 24px + gaps/borda = 105px)
              <div data-testid="skeleton-quote" role="status" aria-busy="true" aria-label="Calculando total" className="grid gap-1">
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
                <Skeleton className="mt-1 h-[33px]" />
              </div>
            )}
            {quote.data && <QuoteSummary quote={quote.data} />}
            <Link to="/checkout" data-testid="go-checkout" className={`${buttonVariants({ size: 'lg' })} w-full text-primary-foreground no-underline`}>
              Ir para o pagamento
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
