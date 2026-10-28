import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { errorInfo, useApplyCoupon, useCart, useChangeQuantity, useQuote, useRemoveCoupon, useRemoveItem } from './queries'
import { Button, buttonVariants } from '../components/ui/button'
import { AlertIcon, CartIcon, CheckCircleIcon, MinusIcon, PlusIcon, TrashIcon } from '../components/icons'
import { Input } from '../components/ui/input'
import { formatEth, mulInt, parseEth } from './eth'
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
        <Breadcrumb />
        <div className={layoutCls}>
          <div>
            <h1 className="section-title mb-4 text-base">Carrinho</h1>
            <div data-testid="skeleton-cart-summary" role="status" aria-busy="true" aria-label="Carregando carrinho" className="space-y-3">
              <Skeleton className="h-[138px] w-full lg:h-[86px]" />
              <Skeleton className="h-[138px] w-full lg:h-[86px]" />
            </div>
          </div>
          <div className="space-y-5">
            <Skeleton className="h-[37px] w-full" />
            <Skeleton className="h-[68px] w-full" />
            <Skeleton className="h-[121px] w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="mx-auto h-[21px] w-40" />
          </div>
        </div>
      </section>
    )
  if (isError)
    return (
      <p role="alert" className="card flex items-center gap-2 border border-destructive/40 bg-destructive-soft p-5 font-semibold text-destructive">
        <AlertIcon className="size-5" />
        Falha ao carregar o carrinho.
      </p>
    )
  return (
    <section>
      <Breadcrumb />
      {items?.length === 0 && (
        <>
          <h1 className="section-title mb-6 text-base">Carrinho</h1>
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-secondary text-primary"><CartIcon className="size-7" /></span>
            <p data-testid="cart-empty" className="text-lg font-semibold">Carrinho vazio</p>
            <Link to="/" className={buttonVariants({})}>Explorar NFTs</Link>
          </div>
        </>
      )}
      {notice && (
        <p role="alert" data-testid="cart-notice" className="mb-4 flex items-center gap-2 rounded-card border border-warning/40 bg-warning-soft p-3 text-sm font-semibold text-warning">
          <AlertIcon className="size-5 shrink-0" />
          {notice}
        </p>
      )}
      {!!items?.length && (
        <div className={layoutCls}>
          <div className="min-w-0">
            <h1 className="section-title mb-4 text-base lg:sr-only">Carrinho</h1>
            <div aria-hidden="true" className={`${rowGrid} mb-2 hidden border-b border-primary/45 pb-3 font-bold lg:grid`}>
              <span className="col-span-2">NFTs</span>
              <span>Preço</span>
              <span>Edições</span>
              <span>Total</span>
              <span />
            </div>
            <ul className="space-y-3">
              {items.map((i) => (
                <li key={i.nftId} data-testid={`cart-item-${i.nftId}`} className={`card flex flex-wrap items-center gap-x-4 gap-y-3 p-2 ${rowGrid}`}>
                  <img src={i.image} alt={i.name} width={70} height={70} loading="lazy" decoding="async" className="size-[70px] shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1 basis-40 break-words lg:basis-auto">
                    <span className="block font-bold">{i.name}</span>
                    <span className="block text-xs text-muted-foreground">ID do token: {i.nftId}</span>
                  </span>
                  <span className="num font-bold text-primary"><span className="sr-only">Preço: </span>{i.price} ETH</span>
                  <div className="flex items-center gap-2">
                    <Button type="button" size="icon" className="size-8 rounded-full" aria-label={`Diminuir ${i.name}`} data-testid={`qty-dec-${i.nftId}`} disabled={i.quantity <= 1} onClick={() => onChange(i.nftId, i.quantity - 1)}>
                      <MinusIcon className="size-4" />
                    </Button>
                    <span data-testid={`qty-${i.nftId}`} aria-live="polite" className="num w-6 text-center text-base">
                      {i.quantity}
                    </span>
                    <Button type="button" size="icon" className="size-8 rounded-full" aria-label={`Aumentar ${i.name}`} data-testid={`qty-inc-${i.nftId}`} disabled={i.quantity >= i.max} onClick={() => onChange(i.nftId, i.quantity + 1)}>
                      <PlusIcon className="size-4" />
                    </Button>
                  </div>
                  <span className="num font-bold text-primary"><span className="sr-only">Total do item: </span>{formatEth(mulInt(parseEth(i.price), i.quantity))} ETH</span>
                  <Button type="button" variant="ghost" size="icon" className="text-primary" aria-label={`Remover ${i.name}`} title="Remover" data-testid={`remove-${i.nftId}`} onClick={() => onRemove(i.nftId)}>
                    <TrashIcon className="size-5" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
          <div className="min-w-0 space-y-5 lg:sticky lg:top-24">
            <h2 className="section-title text-base text-foreground">Resumo da carteira</h2>
            <form onSubmit={onApply} className="flex flex-wrap items-end gap-y-2">
              <label className="w-full text-sm font-bold" htmlFor="coupon-input">Código promocional</label>
              <Input id="coupon-input" data-testid="coupon-input" placeholder="Digite o código promocional..." value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={!!couponError} aria-describedby={couponError ? 'coupon-error' : undefined} className="min-w-0 flex-1 basis-40 rounded-r-none" />
              <Button type="submit" data-testid="coupon-apply" className="rounded-l-none" disabled={apply.isPending || !code.trim()}>
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
              <p data-testid="coupon-applied" className="flex flex-wrap items-center gap-2 rounded-card bg-success-soft p-3 text-sm font-semibold text-success">
                <CheckCircleIcon className="size-5 shrink-0" />
                <span>Cupom {quote.data.coupon} aplicado</span>
                <Button type="button" variant="outline" size="sm" data-testid="coupon-remove" onClick={() => removeCoupon.mutate()}>
                  Remover cupom
                </Button>
              </p>
            )}
            {quote.isLoading && (
              // mesmas 4 linhas do QuoteSummary (3 x 20px + divisor 9px + total 36px + gaps = 121px)
              <div data-testid="skeleton-quote" role="status" aria-busy="true" aria-label="Calculando total" className="grid gap-1">
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
                <Skeleton className="h-5" />
                <Skeleton className="mt-1 h-[45px]" />
              </div>
            )}
            {quote.data && <QuoteSummary quote={quote.data} />}
            <Link to="/checkout" data-testid="go-checkout" className={`${buttonVariants({ size: 'lg' })} w-full text-primary-foreground no-underline`}>
              Ir para o pagamento
            </Link>
            <p className="text-center"><Link to="/" className="text-sm text-primary">Continuar explorando</Link></p>
          </div>
        </div>
      )}
    </section>
  )
}

const layoutCls = 'grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,1fr)_332px] lg:gap-[86px]'
// Colunas do Figma (NFT, preço, edições, total, remover) a partir de lg; abaixo disso as linhas quebram em flex-wrap.
const rowGrid = 'lg:grid lg:grid-cols-[70px_minmax(0,1fr)_100px_130px_120px_40px] lg:items-center lg:gap-x-3'
const Breadcrumb = () => <p className="mb-4 text-sm font-bold text-foreground">Início / Mercado / Carrinho</p>
