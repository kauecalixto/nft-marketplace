import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { api } from '../api'
import { parseEth } from '../purchase/eth'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { Skeleton } from '../components/ui/skeleton'
import { AlertIcon, SearchIcon } from '../components/icons'
import { Banners, CollectionsPanel, FeaturedOfferCard, Journal, MONKEYS, NetworkPanel } from './StaticSections'
import { COLLECTIONS, NETWORKS, TABS, applyCatalog, collectionOf, fetchAllNfts, networkOf, type Tab } from './taxonomy'
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
  collection?: string
  network?: string
  tab?: Tab
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
    collection: COLLECTIONS.find((x) => x === s.collection),
    network: NETWORKS.find((x) => x === s.network),
    tab: TABS.find((x) => x === s.tab),
  }
}

const PAGE_SIZE = 6 // mesmo pageSize da API (src/mocks/handlers.ts)

// Painel do card do Figma: fundo --surface, imagem quadrada arredondada com 4px de respiro lateral.
// `eager` = acima da dobra (sem lazy); width/height + aspect-square evitam deslocamento de layout.
const panelCls = 'block rounded-card bg-surface px-1 py-1 md:py-6'
function NftArt({ nft, eager = false }: { nft: Nft; eager?: boolean }) {
  return (
    <span className={panelCls}>
      <img src={nft.image} alt={nft.name} width={640} height={640} loading={eager ? 'eager' : 'lazy'} decoding="async" className="nft-img block aspect-square w-full rounded-[1rem] object-cover" />
    </span>
  )
}

const gridCls = 'grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:gap-x-8 lg:gap-y-8'

function CardsSkeleton() {
  return (
    <ul data-testid="skeleton-catalog" aria-busy="true" aria-label="Carregando catálogo" className={gridCls}>
      {Array.from({ length: PAGE_SIZE }, (_, i) => (
        <li key={i} data-testid="skeleton-card" className="min-w-0">
          <span className={panelCls}>
            <Skeleton className="aspect-square w-full rounded-[1rem]" />
          </span>
          <div className="pt-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
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
    <section aria-labelledby="featured-title" className="mt-14">
      <h2 id="featured-title" className="section-title mb-6 text-base">Destaques</h2>
      {isLoading ? (
        <ul data-testid="skeleton-featured" aria-busy="true" aria-label="Carregando destaques" className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="min-w-0">
              <span className={panelCls}>
                <Skeleton className="aspect-square w-full rounded-[1rem]" />
              </span>
              <div className="pt-3">
                <Skeleton className="h-[22px] w-24" />
                <Skeleton className="mt-1 h-5 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:gap-8">
          {data?.map((n) => (
            <li key={n.id} data-testid="featured-card" className="nft-card min-w-0">
              <Link to="/nfts/$id" params={{ id: n.id }} className="block text-foreground no-underline">
                <NftArt nft={n} />
                <span className="block pt-3">
                  <Badge variant="secondary" className="mb-1">Em destaque</Badge>
                  <h3 className="truncate text-sm font-normal leading-5">{n.name}</h3>
                  <p className="num text-base font-bold leading-6 text-primary">{n.price} ETH</p>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

const SLIDES = [MONKEYS.jaqueta, MONKEYS.gorila, MONKEYS.chimpanze, MONKEYS.orangotango]

function Hero() {
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hover, setHover] = useState(false)
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  // Rotação automática a cada 7 s; pausada por hover/foco, pelo botão de pausa e com prefers-reduced-motion.
  useEffect(() => {
    if (paused || hover || reduced) return
    const t = window.setInterval(() => setSlide((i) => (i + 1) % SLIDES.length), 7000)
    return () => window.clearInterval(t)
  }, [paused, hover, reduced])
  const dot = 'inline-flex size-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring'
  return (
    <section
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="relative grid grid-cols-[minmax(0,1fr)_9rem] items-center gap-3 rounded-3xl bg-linear-to-br from-[#5b3a22] to-surface p-4 sm:grid-cols-[minmax(0,1fr)_14rem] md:min-h-[450px] md:grid-cols-[minmax(0,1fr)_minmax(0,450px)] md:gap-12 md:rounded-none md:bg-none md:p-0"
    >
      <div className="min-w-0 md:pl-10">
        <p className="text-xs tracking-wider text-foreground md:text-sm">Bem-vindo à Kurio</p>
        <h1 className="mt-2 text-lg font-bold uppercase leading-snug text-foreground sm:text-2xl md:mt-4 md:text-[40px] md:leading-[70px]">Seja dono do futuro da arte digital</h1>
        <p className="mt-3 max-w-[560px] text-xs leading-5 text-muted-foreground md:mt-4 md:text-sm md:leading-6">Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.</p>
        <a href="#catalogo" className="mt-4 inline-flex h-9 items-center rounded-control bg-primary px-4 text-sm font-bold uppercase text-primary-foreground no-underline hover:brightness-110 md:mt-6 md:h-10 md:px-5">Explorar</a>
      </div>
      <img src={SLIDES[slide]} alt="" width={640} height={640} loading="eager" fetchPriority="high" decoding="async" className="aspect-square w-full rounded-2xl object-cover md:rounded-3xl" />
      <div role="group" aria-label="Imagens em destaque" className="col-span-2 flex items-center justify-center gap-1 md:absolute md:bottom-3 md:left-1/2 md:col-span-1 md:justify-start lg:left-[40%]">
        {SLIDES.map((_, i) => (
          <button key={i} type="button" aria-label={`Mostrar imagem ${i + 1} de ${SLIDES.length}`} aria-current={i === slide ? 'true' : undefined} onClick={() => setSlide(i)} className={dot}>
            <span className={`size-2 rounded-full ${i === slide ? 'bg-primary' : 'bg-primary/40'}`} />
          </button>
        ))}
        {!reduced && (
          <button type="button" aria-pressed={paused} onClick={() => setPaused((p) => !p)} className="ml-2 h-6 rounded-control px-2 text-xs font-bold text-muted-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
            {paused ? 'Retomar rotação' : 'Pausar rotação'}
          </button>
        )}
      </div>
    </section>
  )
}

function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  const first = Math.max(1, Math.min(page - 2, pages - 4))
  const nums = Array.from({ length: Math.min(5, pages) }, (_, i) => first + i)
  const box = 'inline-flex size-9 items-center justify-center rounded-control border border-input text-sm font-bold text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-50'
  return (
    <nav aria-label="Paginação" className="mt-8 flex flex-wrap items-center justify-between gap-3">
      <span data-testid="page-indicator" aria-live="polite" className="num text-sm text-muted-foreground">
        Página {page} de {pages}
      </span>
      <div className="flex flex-wrap gap-2">
        <button type="button" aria-label="Anterior" className={box} disabled={page <= 1} onClick={() => onPage(page - 1)}><span aria-hidden="true">‹</span></button>
        {nums.map((n) => (
          <button key={n} type="button" aria-label={`Ir para a página ${n}`} aria-current={n === page ? 'page' : undefined} className={n === page ? `${box} border-primary bg-primary text-primary-foreground hover:bg-primary` : box} onClick={() => onPage(n)}>{n}</button>
        ))}
        <button type="button" aria-label="Próxima" className={box} disabled={page >= pages} onClick={() => onPage(page + 1)}><span aria-hidden="true">›</span></button>
      </div>
    </nav>
  )
}

export function HomePage() {
  const search = useSearch({ from: '/' })
  const { q, min, max, available, sort, page = 1, collection, network, tab } = search
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
  // Botão "Aplicar" do Figma: confirma mín. e máx. de uma vez (mesma regra de validação de `commit`).
  // Campos vazios aplicam "sem filtro" (limpam min/max da URL). Sem nada a aplicar (valores iguais aos da URL, ou inválidos), o botão fica desabilitado.
  const nmin = minText.trim() || undefined
  const nmax = maxText.trim() || undefined
  const canApply = !bad(minText) && !bad(maxText) && (nmin !== min || nmax !== max)
  const applyPrice = () => {
    if (canApply) setFilters({ min: nmin, max: nmax })
  }

  // Coleção, rede e abas (Novos lançamentos / Em alta) não existem na API: carregam todas as páginas e filtram no cliente.
  const clientMode = !!(collection || network || tab)
  const { data, isLoading, isError, isPlaceholderData, refetch } = useQuery({
    placeholderData: keepPreviousData,
    queryKey: clientMode ? ['nfts', 'client', { q, min, max, available, sort, page, collection, network, tab }] : ['nfts', { q, min, max, available, sort, page }],
    queryFn: async ({ signal }): Promise<NftPage> =>
      clientMode
        ? applyCatalog(await fetchAllNfts(signal), { q, min, max, available, sort, page, collection, network, tab })
        : (await api.get<NftPage>('/nfts', { params: { q, min, max, available: available || undefined, sort, page }, signal })).data,
  })
  // Contagens dos painéis Coleções/Rede (a partir de todos os NFTs; sem contagem enquanto carrega ou em erro).
  const all = useQuery({ queryKey: ['nfts', 'all'], queryFn: ({ signal }) => fetchAllNfts(signal) })
  const countBy = (of: (n: Nft) => string) => all.data?.reduce<Record<string, number>>((acc, n) => ({ ...acc, [of(n)]: (acc[of(n)] ?? 0) + 1 }), {})
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1

  return (
    <section>
      <Hero />
      <Featured />
      <div id="catalogo" className="mt-14 grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[310px_minmax(0,1fr)] lg:gap-12">
        <aside aria-label="Filtros" className="space-y-6">
          <div className="card space-y-6 p-5">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="busca"
                aria-label="Buscar NFT"
                placeholder="Explorar coleções"
                className="pl-9"
                value={q ?? ''}
                onChange={(e) => setFilters({ q: e.target.value || undefined }, true)}
              />
            </div>
            <CollectionsPanel counts={countBy(collectionOf)} selected={collection} onSelect={(v) => setFilters({ collection: v })} />
            <div className="space-y-3">
              <h2 className="text-base font-bold">Faixa de preço</h2>
              <Label className="flex min-w-0 flex-col gap-1.5">
                Preço mín. (ETH)
                <Input
                  inputMode="decimal"
                  value={minText}
                  aria-invalid={bad(minText)}
                  aria-describedby={priceError ? 'price-error' : undefined}
                  onChange={(e) => setMinText(e.target.value)}
                  onBlur={(e) => commit('min', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && commit('min', minText)}
                />
              </Label>
              <Label className="flex min-w-0 flex-col gap-1.5">
                Preço máx. (ETH)
                <Input
                  inputMode="decimal"
                  value={maxText}
                  aria-invalid={bad(maxText)}
                  aria-describedby={priceError ? 'price-error' : undefined}
                  onChange={(e) => setMaxText(e.target.value)}
                  onBlur={(e) => commit('max', e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && commit('max', maxText)}
                />
              </Label>
              <Button type="button" size="sm" onClick={applyPrice} disabled={!canApply} title={canApply ? undefined : "Altere o preço mínimo ou máximo para aplicar"}>Aplicar</Button>
            </div>
            <Label className="flex h-10 cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="size-5 accent-primary" checked={!!available} onChange={(e) => setFilters({ available: e.target.checked ? true : undefined })} />
              Somente disponíveis
            </Label>
            <NetworkPanel counts={countBy(networkOf)} selected={network} onSelect={(v) => setFilters({ network: v })} />
          </div>
          <FeaturedOfferCard />
        </aside>
        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-end gap-x-5 gap-y-2 text-sm font-bold">
              <h2 className="sr-only">Lista de NFTs</h2>
              {([[undefined, 'Todos os NFTs'], ['novos', 'Novos lançamentos'], ['alta', 'Em alta']] as const).map(([k, label]) => (
                <button key={label} type="button" aria-pressed={tab === k} onClick={() => setFilters({ tab: k })} className={`border-b-2 pb-1 ${tab === k ? 'border-primary text-primary' : 'border-transparent text-foreground hover:text-primary'}`}>{label}</button>
              ))}
              {(collection || network) && (
                <button type="button" onClick={() => setFilters({ collection: undefined, network: undefined })} className="pb-1 text-muted-foreground underline underline-offset-4 hover:text-primary">Limpar filtros{[collection, network].filter(Boolean).length ? ` (${[collection, network].filter(Boolean).join(', ')})` : ''}</button>
              )}
            </div>
            <Label className="flex items-center gap-2 font-normal">
              Ordenar por:
              <select className="h-9 rounded-control border border-input bg-background px-2 text-sm text-foreground outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/40" value={sort ?? ''} onChange={(e) => setFilters({ sort: SORTS.find((x) => x === e.target.value) })}>
                <option value="">Listados recentemente</option>
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
            <div role="alert" data-testid="catalog-error" className="card flex flex-col items-start gap-2 border border-destructive/40 bg-destructive-soft p-5 text-destructive">
              <p className="flex items-center gap-2 font-semibold"><AlertIcon className="size-5" />Erro ao carregar NFTs</p>
              <Button type="button" variant="outline" className="mt-2" onClick={() => void refetch()}>
                Tentar novamente
              </Button>
            </div>
          )}
          {data && data.items.length === 0 && <p data-testid="catalog-empty" className="card p-8 text-center text-muted-foreground">Nenhum NFT encontrado</p>}
          {data && (
            <ul aria-busy={isPlaceholderData} className={`${gridCls} ${isPlaceholderData ? 'opacity-60' : ''}`}>
              {data.items.map((n, i) => (
                <li key={n.id} data-testid="nft-card" className="nft-card relative min-w-0">
                  <Link to="/nfts/$id" params={{ id: n.id }} className="block text-foreground no-underline">
                    <NftArt nft={n} eager={i < 3} />
                    <span className="block pt-3">
                      <h2 className="truncate text-sm font-normal leading-5">{n.name}</h2>
                      <p className="num text-base font-bold leading-6 text-primary">{n.price} ETH</p>
                    </span>
                  </Link>
                  {n.edition.available <= 0 && <Badge variant="destructive" className="absolute left-2 top-2 bg-destructive-soft md:left-3 md:top-8">Indisponível</Badge>}
                </li>
              ))}
            </ul>
          )}
          {data && data.total > 0 && <Pager page={page} pages={pages} onPage={setPage} />}
        </div>
      </div>
      <Banners />
      <Journal />
    </section>
  )
}
