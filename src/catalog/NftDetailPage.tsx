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
import { AlertIcon, CartIcon, CheckCircleIcon, InfoIcon, MinusIcon, PlusIcon } from '../components/icons'
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
      <p role="alert" className="card flex items-center gap-2 border-red-200 bg-red-50 p-5 font-semibold text-destructive">
        <AlertIcon className="size-5" />
        Erro ao carregar NFT
      </p>
    )
  return <Detail nft={nft} />
}

function DetailSkeleton() {
  // espelha Detail: coluna da galeria (imagem quadrada + miniaturas de 64px) e coluna de informações
  return (
    <div data-testid="skeleton-detail" aria-busy="true" aria-label="Carregando NFT" role="status" className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <Skeleton className="aspect-square w-full max-w-xl rounded-card" />
        <div className="flex gap-2">
          <Skeleton className="size-16 rounded-xl" />
          <Skeleton className="size-16 rounded-xl" />
          <Skeleton className="size-16 rounded-xl" />
        </div>
      </div>
      <div className="card space-y-4 p-6">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-6 w-full max-w-md" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-48" />
      </div>
    </div>
  )
}

function Gallery({ nft }: { nft: Nft }) {
  const images = nft.images?.length ? nft.images : [nft.image]
  const [sel, setSel] = useState(0)
  return (
    <div data-testid="gallery" className="space-y-3">
      <div className="card max-w-xl overflow-hidden p-2">
        <img data-testid="gallery-main" src={images[sel]} alt={`${nft.name} - imagem ${sel + 1} de ${images.length}`} width={400} height={400} className="block aspect-square w-full rounded-[0.9rem] object-cover" />
      </div>
      <ul className="flex flex-wrap gap-2" aria-label="Miniaturas">
        {images.map((src, i) => (
          <li key={i}>
            <button
              type="button"
              data-testid="gallery-thumb"
              aria-label={`Ver imagem ${i + 1} de ${images.length}`}
              aria-pressed={i === sel}
              onClick={() => setSel(i)}
              className={`block rounded-xl border-2 p-0.5 transition-[border-color,box-shadow] duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 ${i === sel ? 'border-primary shadow-pop' : 'border-transparent opacity-80 hover:opacity-100'}`}
            >
              <img src={src} alt="" width={64} height={64} className="size-16 rounded-[0.6rem] object-cover" />
            </button>
          </li>
        ))}
      </ul>
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
    <article className="grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-2">
      <Gallery nft={nft} />
      <div className="card space-y-4 p-6 sm:p-8">
        <div>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-primary">← Voltar ao catálogo</Link>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="break-words text-3xl font-extrabold">{nft.name}</h1>
          <FavoriteButton nftId={nft.id} />
        </div>
        <div className="rounded-2xl bg-secondary p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preço</p>
          <p className="num text-3xl font-extrabold text-primary">{nft.price} ETH</p>
        </div>
        <NftUpdateNotice nftIds={[nft.id]} />
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant={unavailable ? 'destructive' : 'success'}>{unavailable ? 'Indisponível' : 'Disponível'}</Badge>
          <span>
            Edição: {nft.edition.available} de {nft.edition.total} disponíveis (limite por carteira: {nft.walletLimit})
          </span>
        </p>
        {unavailable && nft.edition.available <= 0 && (
          <p data-testid="edition-unavailable" className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-destructive"><AlertIcon className="size-5 shrink-0" />Edição indisponível</p>
        )}
        {unavailable && nft.edition.available > 0 && (
          <p data-testid="wallet-quota-unavailable" className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-warning"><InfoIcon className="size-5 shrink-0" />Sem cota para esta carteira</p>
        )}
        {!unavailable && (
          <div className="flex items-center gap-2" role="group" aria-label="Seletor de quantidade">
            <Button
              type="button"
              variant="outline"
              size="icon"
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
              className="num w-20 text-center text-base font-semibold"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              data-testid="quantity-increase"
              aria-label="Aumentar quantidade"
              disabled={atMax}
              onClick={() => setQty(clamp(qty + 1))}
            >
              <PlusIcon className="size-4" />
            </Button>
          </div>
        )}
        {atMax && <p data-testid="quantity-limit-message" className="flex items-center gap-2 text-sm font-medium text-warning"><InfoIcon className="size-4 shrink-0" />Limite de quantidade atingido</p>}
        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            data-testid="add-to-cart"
            size="lg"
            className="h-auto min-h-11 whitespace-normal py-2 text-center"
            disabled={unavailable || add.isPending}
            onClick={() => add.mutate()}
          >
            <CartIcon className="size-5" />
            Adicionar ao carrinho
          </Button>
        </div>
        {add.isSuccess && <p role="status" className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-semibold text-success"><CheckCircleIcon className="size-5 shrink-0" />Adicionado ao carrinho ({qty})</p>}
        {add.isError && <p role="alert" className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-destructive"><AlertIcon className="size-5 shrink-0" />Não foi possível adicionar ao carrinho</p>}
      </div>
    </article>
  )
}
