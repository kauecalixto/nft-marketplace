import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import axios from 'axios'
import { api } from '../api'
import type { Nft } from './types'
import { maxQuantity } from './quantity'
import { NftUpdateNotice } from '../realtime/Notice'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Skeleton } from '../components/ui/skeleton'
import { AlertIcon, CartIcon, CheckCircleIcon, ChevronLeftIcon, InfoIcon, MinusIcon, PlusIcon } from '../components/icons'
import { FavoriteButton } from '../account/FavoriteButton'

export function NftDetailPage() {
  const { id } = useParams({ from: '/nfts/$id' })
  const { data: nft, isLoading, error } = useQuery({
    queryKey: ['nft', id],
    queryFn: async ({ signal }) => (await api.get<Nft>(`/nfts/${id}`, { signal })).data,
  })
  if (isLoading) return <DetailSkeleton />
  if (axios.isAxiosError(error) && error.response?.status === 404)
    return <p data-testid="nft-not-found" className="card p-8 text-center text-lg font-semibold">NFT não encontrado</p>
  if (error || !nft)
    return (
      <p role="alert" className="card flex items-center gap-2 border-destructive/40 bg-destructive-soft p-5 font-semibold text-destructive">
        <AlertIcon className="size-5" />
        Erro ao carregar NFT
      </p>
    )
  return <Detail nft={nft} />
}

const galleryGrid = 'grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,572px)_minmax(0,1fr)] lg:gap-12'
const Breadcrumb = () => <p className="mb-4 text-sm font-bold text-foreground max-md:hidden">Início / Mercado</p>

function DetailSkeleton() {
  // espelha Detail: coluna da galeria (painel quadrado + miniaturas) e coluna de informações
  return (
    <div data-testid="skeleton-detail" aria-busy="true" aria-label="Carregando NFT" role="status">
      <Breadcrumb />
      <div className={galleryGrid}>
        <div className="flex flex-col-reverse gap-4 lg:flex-row">
          <div className="flex gap-3 lg:w-[100px] lg:shrink-0 lg:flex-col lg:gap-4">
            <Skeleton className="size-[72px] rounded-xl lg:size-[100px]" />
            <Skeleton className="size-[72px] rounded-xl lg:size-[100px]" />
            <Skeleton className="size-[72px] rounded-xl lg:size-[100px]" />
          </div>
          <Skeleton className="aspect-square w-full lg:flex-1" />
        </div>
        <div className="min-h-[471px] space-y-4 lg:min-h-0">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-full max-w-md" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-12 w-64" />
        </div>
      </div>
    </div>
  )
}

function Gallery({ nft }: { nft: Nft }) {
  const images = nft.images?.length ? nft.images : [nft.image]
  const [sel, setSel] = useState(0)
  return (
    <div data-testid="gallery" className="flex flex-col-reverse gap-4 lg:flex-row">
      <ul className="flex gap-3 lg:w-[100px] lg:shrink-0 lg:flex-col lg:gap-4" aria-label="Miniaturas">
        {images.map((src, i) => (
          <li key={i}>
            <button
              type="button"
              data-testid="gallery-thumb"
              aria-label={`Ver imagem ${i + 1} de ${images.length}`}
              aria-pressed={i === sel}
              onClick={() => setSel(i)}
              className={`block rounded-xl border-2 p-0.5 transition-[border-color] duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${i === sel ? 'border-primary' : 'border-transparent opacity-80 hover:opacity-100'}`}
            >
              <img src={src} alt="" width={100} height={100} loading="lazy" decoding="async" className="size-16 rounded-[0.6rem] object-cover lg:size-[92px]" />
            </button>
          </li>
        ))}
      </ul>
      <div className="card min-w-0 p-3 max-md:bg-transparent max-md:p-0 sm:p-5 lg:flex-1">
        <img data-testid="gallery-main" src={images[sel]} alt={`${nft.name} - imagem ${sel + 1} de ${images.length}`} width={640} height={640} loading="eager" fetchPriority="high" decoding="async" className="block aspect-square w-full rounded-3xl object-cover max-md:rounded-2xl" />
      </div>
    </div>
  )
}

function Detail({ nft }: { nft: Nft }) {
  const max = maxQuantity(nft)
  const unavailable = max === 0
  const [rawQty, setQty] = useState(1)
  const [empty, setEmpty] = useState(false) // campo apagado durante a digitação; confirma no blur
  const qty = unavailable ? 1 : Math.min(rawQty, max)
  const clamp = (n: number) => Math.min(max, Math.max(1, Math.trunc(n) || 1))
  const atMax = !unavailable && qty >= max
  const add = useMutation({
    mutationFn: async () => api.post('/cart', { nftId: nft.id, quantity: qty }),
  })
  return (
    <article>
      <Breadcrumb />
      <div className={`${galleryGrid} relative`}>
        <Gallery nft={nft} />
        <div className="min-w-0 space-y-4 max-md:-mx-4 max-md:rounded-t-3xl max-md:bg-surface max-md:px-4 max-md:py-5">
          <div className="max-md:absolute max-md:left-3 max-md:top-3">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary max-md:inline-flex max-md:size-10 max-md:items-center max-md:justify-center max-md:rounded-full max-md:bg-background/80 max-md:text-primary max-md:no-underline">
              <ChevronLeftIcon className="size-5 md:hidden" />
              <span className="max-md:sr-only">← Voltar ao catálogo</span>
            </Link>
          </div>
          <h1 className="break-words text-[28px] font-bold leading-9">{nft.name}</h1>
          <div className="border-b border-primary/45 pb-3">
            <p className="num text-[22px] font-bold leading-8 text-primary">{nft.price} ETH</p>
          </div>
          <NftUpdateNotice nftIds={[nft.id]} />
          <div className="space-y-2">
            <p className="font-bold">Edição:</p>
            <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant={unavailable ? 'destructive' : 'success'}>{unavailable ? 'Indisponível' : 'Disponível'}</Badge>
              <span>
                Edição: {nft.edition.available} de {nft.edition.total} disponíveis (limite por carteira: {nft.walletLimit})
              </span>
            </p>
          </div>
          {unavailable && nft.edition.available <= 0 && (
            <p data-testid="edition-unavailable" className="flex items-center gap-2 rounded-card bg-destructive-soft p-3 text-sm font-semibold text-destructive"><AlertIcon className="size-5 shrink-0" />Edição indisponível</p>
          )}
          {unavailable && nft.edition.available > 0 && (
            <p data-testid="wallet-quota-unavailable" className="flex items-center gap-2 rounded-card bg-warning-soft p-3 text-sm font-semibold text-warning"><InfoIcon className="size-5 shrink-0" />Sem cota para esta carteira</p>
          )}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {!unavailable && (
              <div className="flex items-center gap-2" role="group" aria-label="Seletor de quantidade">
                <Button
                  type="button"
                  size="icon"
                  className="rounded-full"
                  data-testid="quantity-decrease"
                  aria-label="Diminuir quantidade"
                  disabled={qty <= 1}
                  onClick={() => setQty(clamp(qty - 1))}
                >
                  <MinusIcon className="size-4" />
                </Button>
                <Input
                  data-testid="quantity-input"
                  aria-label="Quantidade"
                  type="number"
                  step={1}
                  min={1}
                  max={max}
                  value={empty ? '' : qty}
                  onChange={(e) => {
                    if (e.target.value === '') return setEmpty(true)
                    setEmpty(false)
                    setQty(clamp(Number(e.target.value)))
                  }}
                  onBlur={() => setEmpty(false)}
                  className="num w-16 text-center text-base"
                />
                <Button
                  type="button"
                  size="icon"
                  className="rounded-full"
                  data-testid="quantity-increase"
                  aria-label="Aumentar quantidade"
                  disabled={atMax}
                  onClick={() => setQty(clamp(qty + 1))}
                >
                  <PlusIcon className="size-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap items-start gap-3">
              <Button
                data-testid="add-to-cart"
                className="h-auto min-h-10 whitespace-normal py-2 text-center max-md:min-h-12 max-md:rounded-2xl max-md:bg-linear-to-r max-md:from-primary max-md:to-primary-2"
                disabled={unavailable || add.isPending}
                onClick={() => add.mutate()}
              >
                <CartIcon className="size-5" />
                Adicionar ao carrinho
              </Button>
              <FavoriteButton nftId={nft.id} />
            </div>
          </div>
          {atMax && <p data-testid="quantity-limit-message" className="flex items-center gap-2 text-sm font-medium text-warning"><InfoIcon className="size-4 shrink-0" />Limite de quantidade atingido</p>}
          {add.isSuccess && <p role="status" className="flex items-center gap-2 rounded-card bg-success-soft p-3 text-sm font-semibold text-success"><CheckCircleIcon className="size-5 shrink-0" />Adicionado ao carrinho ({qty})</p>}
          {add.isError && <p role="alert" className="flex items-center gap-2 rounded-card bg-destructive-soft p-3 text-sm font-semibold text-destructive"><AlertIcon className="size-5 shrink-0" />Não foi possível adicionar ao carrinho</p>}
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li>ID do token: <span className="break-all">{nft.id}</span></li>
            <li>Criador: <Link to="/criadores" className="break-all text-primary hover:underline">{nft.creator}</Link></li>
          </ul>
        </div>
      </div>
    </article>
  )
}
