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
import { AlertIcon, SearchIcon, SparkleIcon } from '../components/icons'
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

const PAGE_SIZE = 6 // mesmo pageSize da API (src/mocks/handlers.ts)

function NftArt({ nft, className = '' }: { nft: Nft; className?: string }) {
  return (
    <span className={`block overflow-hidden rounded-xl bg-secondary ${className}`}>
      <img src={nft.image} alt={nft.name} width={400} height={400} loading="lazy" className="nft-img block aspect-square w-full" />
    </span>
  )
}

function CardsSkeleton() {
  return (
    <ul data-testid="skeleton-catalog" aria-busy="true" aria-label="Carregando catálogo" className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: PAGE_SIZE }, (_, i) => (
        <li key={i} data-testid="skeleton-card" className="card min-w-0 p-3">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="px-1 pb-1 pt-3">
            <Skeleton className="my-1 h-4 w-3/4" />
            <Skeleton className="my-1 h-4 w-1/2" />
          </div>
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
    <section aria-labelledby="featured-title" className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <SparkleIcon className="size-6 text-primary" />
        <h2 id="featured-title" className="text-2xl font-bold">Destaques</h2>
      </div>
      {isLoading ? (
        <ul data-testid="skeleton-featured" aria-busy="true" aria-label="Carregando destaques" className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="card min-w-0 p-3">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <div className="px-1 pb-1 pt-3">
                <Skeleton className="h-[22px] w-24" />
                <Skeleton className="my-1 h-4 w-3/4" />
                <Skeleton className="my-1 h-4 w-1/2" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {data?.map((n) => (
            <li key={n.id} data-testid="featured-card" className="card nft-card min-w-0 p-3">
              <Link to="/nfts/$id" params={{ id: n.id }} className="block no-underline text-foreground">
                <NftArt nft={n} />
                <span className="block px-1 pb-1 pt-3">
                  <Badge variant="secondary">Em destaque</Badge>
                  <h3 className="break-words text-lg font-semibold">{n.name}</h3>
                  <p className="num text-base font-bold text-primary">{n.price} ETH</p>
                </span>
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
  const priceError = bad(minText) || bad(maxText) || rangeInverted
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
      <div className="relative mb-8 overflow-hidden rounded-[1.75rem] bg-linear-to-br from-indigo-700 via-primary to-violet-700 px-6 py-10 text-white shadow-lift sm:px-10 sm:py-14">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          <SparkleIcon className="size-4" /> Coleções digitais
        </p>
        <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl">Catálogo de NFTs</h1>
        <p className="mt-3 max-w-xl text-base text-indigo-50 sm:text-lg">Descubra, compare e colecione obras digitais únicas com preço e disponibilidade em tempo real.</p>
      </div>
      <Featured />
      <h2 className="mb-4 text-2xl font-bold">Todos os NFTs</h2>
      <div className="card mb-6 flex flex-wrap items-end gap-4 p-4 sm:p-5">
        <div className="relative w-full sm:w-56">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Buscar NFT"
            placeholder="Buscar"
            className="pl-9"
            value={q ?? ''}
            onChange={(e) => setFilters({ q: e.target.value || undefined }, true)}
          />
        </div>
        <Label className="flex min-w-0 max-w-full flex-col gap-1.5">
          Preço mín. (ETH)
          <Input
            inputMode="decimal"
            className="w-28"
            value={minText}
            aria-invalid={bad(minText)}
            aria-describedby={priceError ? 'price-error' : undefined}
            onChange={(e) => setMinText(e.target.value)}
            onBlur={(e) => commit('min', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commit('min', minText)}
          />
        </Label>
        <Label className="flex min-w-0 max-w-full flex-col gap-1.5">
          Preço máx. (ETH)
          <Input
            inputMode="decimal"
            className="w-28"
            value={maxText}
            aria-invalid={bad(maxText)}
            aria-describedby={priceError ? 'price-error' : undefined}
            onChange={(e) => setMaxText(e.target.value)}
            onBlur={(e) => commit('max', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commit('max', maxText)}
          />
        </Label>
        <Label className="flex h-10 cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" className="size-5 accent-primary" checked={!!available} onChange={(e) => setFilters({ available: e.target.checked ? true : undefined })} />
          Somente disponíveis
        </Label>
        <Label className="flex min-w-0 max-w-full flex-col gap-1.5">
          Ordenar por
          <select className="flex h-10 w-full rounded-control border border-input bg-surface px-3 py-1 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30" value={sort ?? ''} onChange={(e) => setFilters({ sort: SORTS.find((x) => x === e.target.value) })}>
            <option value="">Padrão</option>
            <option value="price-asc">Preço: menor primeiro</option>
            <option value="price-desc">Preço: maior primeiro</option>
            <option value="name">Nome</option>
          </select>
        </Label>
      </div>
      {(bad(minText) || bad(maxText)) && <p id="price-error" role="alert" className="mb-4 flex items-center gap-2 text-sm font-medium text-destructive"><AlertIcon className="size-4 shrink-0" />Informe preços decimais válidos (ex.: 0.50)</p>}
      {rangeInverted && !(bad(minText) || bad(maxText)) && <p id="price-error" role="alert" className="mb-4 flex items-center gap-2 text-sm font-medium text-destructive"><AlertIcon className="size-4 shrink-0" />O preço mínimo é maior que o máximo</p>}
      {isLoading && <CardsSkeleton />}
      {isError && (
        <div role="alert" data-testid="catalog-error" className="card flex flex-col items-start gap-2 border-red-200 bg-red-50 p-5 text-destructive">
          <p className="flex items-center gap-2 font-semibold"><AlertIcon className="size-5" />Erro ao carregar NFTs</p>
          <Button type="button" variant="outline" className="mt-2" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      )}
      {data && data.items.length === 0 && <p data-testid="catalog-empty" className="card p-8 text-center text-muted-foreground">Nenhum NFT encontrado</p>}
      {data && (
        <ul aria-busy={isPlaceholderData} className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 ${isPlaceholderData ? 'opacity-60' : ''}`}>
          {data.items.map((n) => (
            <li key={n.id} data-testid="nft-card" className="card nft-card relative min-w-0 p-3">
              <Link to="/nfts/$id" params={{ id: n.id }} className="block no-underline text-foreground">
                <NftArt nft={n} />
                <span className="block px-1 pb-1 pt-3">
                  <h2 className="break-words text-base font-semibold">{n.name}</h2>
                  <p className="num font-bold text-primary">{n.price} ETH</p>
                </span>
              </Link>
              {n.edition.available <= 0 && <Badge variant="destructive" className="absolute left-5 top-5 bg-white shadow-sm">Indisponível</Badge>}
            </li>
          ))}
        </ul>
      )}
      {data && data.total > 0 && (
        <nav aria-label="Paginação" className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Anterior
          </Button>
          <span data-testid="page-indicator" aria-live="polite" className="num text-sm font-medium text-muted-foreground">
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
