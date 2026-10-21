import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import axios from 'axios'
import { api } from '../api'
import type { Nft } from './types'
import { maxQuantity } from './quantity'
import { NftUpdateNotice } from '../realtime/Notice'
import { FavoriteButton } from '../account/FavoriteButton'

export function NftDetailPage() {
  const { id } = useParams({ from: '/nfts/$id' })
  const { data: nft, isLoading, error } = useQuery({
    queryKey: ['nft', id],
    queryFn: async ({ signal }) => (await api.get<Nft>(`/nfts/${id}`, { signal })).data,
  })
  if (isLoading) return <DetailSkeleton />
  if (axios.isAxiosError(error) && error.response?.status === 404)
    return <p data-testid="nft-not-found">NFT não encontrado</p>
  if (error || !nft) return <p role="alert">Erro ao carregar NFT</p>
  return <Detail nft={nft} />
}

function DetailSkeleton() {
  return (
    <div data-testid="skeleton-detail" aria-busy="true" aria-label="Carregando NFT" role="status" className="space-y-3">
      <div className="skeleton w-64 h-64" />
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-5 w-24" />
      <div className="skeleton h-5 w-72 max-w-full" />
      <div className="skeleton h-10 w-40" />
    </div>
  )
}

function Gallery({ nft }: { nft: Nft }) {
  const images = nft.images?.length ? nft.images : [nft.image]
  const [sel, setSel] = useState(0)
  return (
    <div data-testid="gallery" className="space-y-2">
      <img data-testid="gallery-main" src={images[sel]} alt={`${nft.name} - imagem ${sel + 1} de ${images.length}`} className="w-64" />
      <ul className="flex gap-2" aria-label="Miniaturas">
        {images.map((src, i) => (
          <li key={i}>
            <button
              type="button"
              data-testid="gallery-thumb"
              aria-label={`Ver imagem ${i + 1} de ${images.length}`}
              aria-pressed={i === sel}
              onClick={() => setSel(i)}
              className={`border-2 rounded ${i === sel ? 'border-black' : 'border-transparent'}`}
            >
              <img src={src} alt="" className="w-16 h-16" />
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
    <article className="space-y-3">
      <Gallery nft={nft} />
      <h1 className="text-2xl font-bold">{nft.name}</h1>
      <p>{nft.price} ETH</p>
      <NftUpdateNotice nftIds={[nft.id]} />
      <FavoriteButton nftId={nft.id} />
      <p>
        Edição: {nft.edition.available} de {nft.edition.total} disponíveis (limite por carteira: {nft.walletLimit})
      </p>
      {unavailable && nft.edition.available <= 0 && <p data-testid="edition-unavailable">Edição indisponível</p>}
      {unavailable && nft.edition.available > 0 && <p data-testid="wallet-quota-unavailable">Sem cota para esta carteira</p>}
      {!unavailable && (
      <div className="flex items-center gap-2">
        <button
          data-testid="quantity-decrease"
          aria-label="Diminuir quantidade"
          disabled={qty <= 1}
          onClick={() => setQty(clamp(qty - 1))}
          className="border px-3 disabled:opacity-40"
        >
          -
        </button>
        <input
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
          className="border w-16 text-center"
        />
        <button
          data-testid="quantity-increase"
          aria-label="Aumentar quantidade"
          disabled={atMax}
          onClick={() => setQty(clamp(qty + 1))}
          className="border px-3 disabled:opacity-40"
        >
          +
        </button>
      </div>
      )}
      {atMax && <p data-testid="quantity-limit-message">Limite de quantidade atingido</p>}
      <button
        data-testid="add-to-cart"
        disabled={unavailable || add.isPending}
        onClick={() => add.mutate()}
        className="bg-black text-white px-4 py-2 disabled:opacity-40"
      >
        Adicionar ao carrinho
      </button>
      {add.isSuccess && <p role="status">Adicionado ao carrinho ({qty})</p>}
      {add.isError && <p role="alert">Não foi possível adicionar ao carrinho</p>}
    </article>
  )
}
