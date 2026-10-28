import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/ui/button'
import { Skeleton } from '../components/ui/skeleton'
import { AlertIcon } from '../components/icons'
import { formatEth, parseEth } from '../purchase/eth'
import { fetchAllNfts } from '../catalog/taxonomy'
import type { Nft } from '../catalog/types'

interface Creator {
  name: string
  nfts: Nft[]
  min: string
  max: string
}

// Sem endpoint de criadores: lista derivada de GET /api/nfts (todas as páginas), agrupada por `creator`.
function groupByCreator(nfts: Nft[]): Creator[] {
  const map = new Map<string, Nft[]>()
  for (const n of nfts) map.set(n.creator, [...(map.get(n.creator) ?? []), n])
  return [...map].map(([name, list]) => {
    const prices = list.map((n) => parseEth(n.price))
    return {
      name,
      nfts: list,
      min: formatEth(prices.reduce((a, b) => (a < b ? a : b))),
      max: formatEth(prices.reduce((a, b) => (a > b ? a : b))),
    }
  })
}

function CreatorsSkeleton() {
  return (
    <ul data-testid="skeleton-creators" role="status" aria-busy="true" aria-label="Carregando criadores" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <li key={i} className="card space-y-4 p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="size-14" />
            <Skeleton className="size-14" />
          </div>
          <Skeleton className="h-10 w-full" />
        </li>
      ))}
    </ul>
  )
}

export function CreatorsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['nfts', 'all'],
    queryFn: ({ signal }) => fetchAllNfts(signal),
  })
  const creators = data ? groupByCreator(data) : []
  return (
    <section aria-labelledby="creators-title" className="space-y-8">
      <header className="space-y-2">
        <h1 id="creators-title" className="text-2xl font-bold uppercase md:text-[32px]">Criadores</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Conheça quem publicou obras no marketplace, quantas edições existem e a faixa de preço de cada criador.</p>
      </header>
      {isLoading && <CreatorsSkeleton />}
      {isError && (
        <div role="alert" data-testid="creators-error" className="card flex flex-col items-start gap-2 border border-destructive/40 bg-destructive-soft p-5 text-destructive">
          <p className="flex items-center gap-2 font-semibold"><AlertIcon className="size-5" />Erro ao carregar criadores</p>
          <Button type="button" variant="outline" className="mt-2" onClick={() => void refetch()}>Tentar novamente</Button>
        </div>
      )}
      {data && creators.length === 0 && <p data-testid="creators-empty" className="card p-8 text-center text-muted-foreground">Nenhum criador encontrado</p>}
      {creators.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((c) => (
            <li key={c.name} data-testid="creator-card" className="card min-w-0 space-y-4 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={c.name} className="size-12 text-base" />
                <h2 className="min-w-0 truncate text-base font-bold">{c.name}</h2>
              </div>
              <p className="num text-sm text-muted-foreground">
                {c.nfts.length} {c.nfts.length === 1 ? 'NFT' : 'NFTs'} · {c.min === c.max ? `${c.min} ETH` : `${c.min} – ${c.max} ETH`}
              </p>
              <ul className="flex flex-wrap gap-2">
                {c.nfts.slice(0, 4).map((n) => (
                  <li key={n.id}>
                    <img src={n.image} alt="" width={56} height={56} loading="lazy" decoding="async" className="size-14 rounded-lg object-cover" />
                  </li>
                ))}
              </ul>
              <Link to="/nfts/$id" params={{ id: c.nfts[0].id }} aria-label={`Ver obras de ${c.name}`} className="inline-flex h-10 w-full items-center justify-center rounded-control bg-primary px-4 text-sm font-bold text-primary-foreground no-underline hover:brightness-110">Ver obras</Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
