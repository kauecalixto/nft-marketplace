import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { api } from '../api'
import { parseEth } from '../purchase/eth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import type { Nft, NftPage } from './types'

export const SORTS = ['price-asc', 'price-desc', 'name'] as const
export type Sort = (typeof SORTS)[number]
export interface CatalogSearch {
  q?: string
  min?: string
  max?: string
  available?: true
  sort?: Sort
  page?: number
}

const DECIMAL = /^\d+(\.\d{1,18})?$/
const decimal = (v: unknown) => (typeof v === 'string' && DECIMAL.test(v.trim()) ? v.trim() : undefined)

export function validateCatalogSearch(s: Record<string, unknown>): CatalogSearch {
  const page = Math.trunc(Number(s.page))
  return {
    q: typeof s.q === 'string' && s.q ? s.q : undefined,
    min: decimal(s.min),
    max: decimal(s.max),
    available: s.available === true || s.available === 'true' ? true : undefined,
    sort: SORTS.find((x) => x === s.sort),
    page: page > 1 ? page : undefined,
  }
}

function CardsSkeleton() {
  return (
    <ul data-testid="skeleton-catalog" aria-busy="true" aria-label="Carregando catálogo" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} data-testid="skeleton-card" className="border rounded p-3">
          <Skeleton className="w-full aspect-square" />
          <Skeleton className="h-6 w-3/4 mt-2" />
          <Skeleton className="h-5 w-1/2 mt-2" />
        </li>
      ))}
    </ul>
  )
}

function Featured() {
  const { data, isLoading } = useQuery({
    queryKey: ['nfts-featured'],
    queryFn: async ({ signal }) => (await api.get<Nft[]>('/nfts/featured', { signal })).data,
  })
  if (!isLoading && (!data || data.length === 0)) return null
  return (
    <section aria-labelledby="featured-title" className="mb-6">
      <h2 id="featured-title" className="text-xl font-bold mb-2">Destaques</h2>
      {isLoading ? (
        <ul data-testid="skeleton-featured" aria-busy="true" aria-label="Carregando destaques" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="border rounded p-3">
              <Skeleton className="w-full aspect-square" />
              <Skeleton className="h-6 w-3/4 mt-2" />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data?.map((n) => (
            <li key={n.id} data-testid="featured-card" className="border rounded p-3 min-w-0">
              <Link to="/nfts/$id" params={{ id: n.id }}>
                <img src={n.image} alt={n.name} className="w-full aspect-square" />
                <Badge variant="secondary" className="mt-2">Em destaque</Badge>
                <h3 className="font-semibold break-words">{n.name}</h3>
                <p>{n.price} ETH</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function HomePage() {
  const search = useSearch({ from: '/' })
  const { q, min, max, available, sort, page = 1 } = search
  const navigate = useNavigate({ from: '/' })
  // Qualquer mudança de filtro/ordenação/busca reinicia a paginação.
  const setFilters = (patch: Partial<CatalogSearch>, replace = false) =>
    void navigate({ search: { ...search, ...patch, page: undefined }, replace })
  const setPage = (p: number) => void navigate({ search: { ...search, page: p > 1 ? p : undefined } })

  const [minText, setMinText] = useState(min ?? '')
  const [maxText, setMaxText] = useState(max ?? '')
  // Sincroniza o texto digitado quando a URL muda (ajuste de estado durante a renderização).
  const [seen, setSeen] = useState({ min, max })
  if (seen.min !== min || seen.max !== max) {
    setSeen({ min, max })
    if (seen.min !== min) setMinText(min ?? '')
    if (seen.max !== max) setMaxText(max ?? '')
  }
  const bad = (v: string) => v !== '' && !DECIMAL.test(v.trim())
  const rangeInverted = !bad(minText) && !bad(maxText) && minText !== '' && maxText !== '' && parseEth(minText) > parseEth(maxText)
  const commit = (key: 'min' | 'max', v: string) => {
    if (bad(v)) return
    const val = v.trim() || undefined
    if (val !== (key === 'min' ? min : max)) setFilters({ [key]: val })
  }

  const { data, isLoading, isError, isPlaceholderData, refetch } = useQuery({
    placeholderData: keepPreviousData,
    queryKey: ['nfts', { q, min, max, available, sort, page }],
    queryFn: async ({ signal }) =>
      (await api.get<NftPage>('/nfts', { params: { q, min, max, available: available || undefined, sort, page }, signal })).data,
  })
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <section>
      <Featured />
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <Input
          aria-label="Buscar NFT"
          placeholder="Buscar"
          className="w-48 max-w-full"
          value={q ?? ''}
          onChange={(e) => setFilters({ q: e.target.value || undefined }, true)}
        />
        <Label className="flex flex-col gap-1">
          Preço mín. (ETH)
          <Input
            inputMode="decimal"
            className="w-28"
            value={minText}
            aria-invalid={bad(minText)}
            onChange={(e) => setMinText(e.target.value)}
            onBlur={(e) => commit('min', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commit('min', minText)}
          />
        </Label>
        <Label className="flex flex-col gap-1">
          Preço máx. (ETH)
          <Input
            inputMode="decimal"
            className="w-28"
            value={maxText}
            aria-invalid={bad(maxText)}
            onChange={(e) => setMaxText(e.target.value)}
            onBlur={(e) => commit('max', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commit('max', maxText)}
          />
        </Label>
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={!!available} onChange={(e) => setFilters({ available: e.target.checked ? true : undefined })} />
          Somente disponíveis
        </label>
        <Label className="flex flex-col gap-1">
          Ordenar por
          <select className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={sort ?? ''} onChange={(e) => setFilters({ sort: SORTS.find((x) => x === e.target.value) })}>
            <option value="">Padrão</option>
            <option value="price-asc">Preço: menor primeiro</option>
            <option value="price-desc">Preço: maior primeiro</option>
            <option value="name">Nome</option>
          </select>
        </Label>
      </div>
      {(bad(minText) || bad(maxText)) && <p role="alert">Informe preços decimais válidos (ex.: 0.50)</p>}
      {rangeInverted && <p role="alert">O preço mínimo é maior que o máximo</p>}
      {isLoading && <CardsSkeleton />}
      {isError && (
        <div role="alert" data-testid="catalog-error">
          <p>Erro ao carregar NFTs</p>
          <Button type="button" variant="outline" className="mt-2" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}
      {data && data.items.length === 0 && <p data-testid="catalog-empty">Nenhum NFT encontrado</p>}
      {data && (
        <ul aria-busy={isPlaceholderData} className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${isPlaceholderData ? 'opacity-60' : ''}`}>
          {data.items.map((n) => (
            <li key={n.id} data-testid="nft-card" className="border rounded p-3 min-w-0">
              <Link to="/nfts/$id" params={{ id: n.id }}>
                <img src={n.image} alt={n.name} className="w-full aspect-square" />
                <h2 className="font-semibold break-words">{n.name}</h2>
                <p>{n.price} ETH</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {data && data.total > 0 && (
        <nav aria-label="Paginação" className="flex items-center gap-3 mt-4">
          <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span data-testid="page-indicator" aria-live="polite">
            Página {page} de {pages}
          </span>
          <Button type="button" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>
            Próxima
          </Button>
        </nav>
      )}
    </section>
  )
}
