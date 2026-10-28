import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { api } from '../api'
import { cn } from '../lib/utils'
import { POSTS } from '../learn/posts'
import { COLLECTIONS, NETWORKS } from './taxonomy'
import type { Nft } from './types'

/**
 * SEÇÕES DO FIGMA NA TELA INÍCIO. Todo controle funciona: Coleções e Rede filtram o catálogo (classificação
 * derivada no cliente, ver taxonomy.ts), o card "NFT em destaque" abre o NFT, os banners "Explorar →" levam a um
 * filtro real e "Ler mais" abre o artigo em /aprenda/$slug. Continuam ilustrativos apenas os textos editoriais
 * (banners, datas e tempos de leitura do Diário). As imagens são decorativas (`alt=""`).
 */
export const MONKEYS = {
  jaqueta: '/nfts/macaco-jaqueta.jpg',
  gorila: '/nfts/gorila-chapeu.jpg',
  chimpanze: '/nfts/chimpanze-blazer.jpg',
  orangotango: '/nfts/orangotango-fone.jpg',
}

function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-foreground">{title}</h2>
      {children}
    </div>
  )
}

const chip = 'inline-flex items-center justify-between gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors hover:text-primary lg:flex lg:w-full lg:rounded-control lg:border-transparent lg:py-2'

function FilterList({ names, counts, selected, onSelect }: { names: readonly string[]; counts?: Record<string, number>; selected?: string; onSelect: (v: string | undefined) => void }) {
  return (
    <ul className="flex flex-wrap gap-2 lg:block lg:space-y-0.5">
      {names.map((name) => {
        const on = selected === name
        return (
          <li key={name}>
            <button type="button" aria-pressed={on} onClick={() => onSelect(on ? undefined : name)} className={cn(chip, on ? 'border-primary text-primary' : 'border-input text-muted-foreground')}>
              <span>{name}</span>
              {counts && <span className="num text-foreground">({counts[name] ?? 0})</span>}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

interface PanelProps { counts?: Record<string, number>; selected?: string; onSelect: (v: string | undefined) => void }

/** Seção "Coleções" do painel de filtros: filtra o catálogo (classificação derivada no cliente; ver taxonomy.ts). */
export function CollectionsPanel(p: PanelProps) {
  return (
    <PanelSection title="Coleções">
      <FilterList names={COLLECTIONS} {...p} />
    </PanelSection>
  )
}

/** Seção "Rede" do painel de filtros: filtra o catálogo por rede. */
export function NetworkPanel(p: PanelProps) {
  return (
    <PanelSection title="Rede">
      <FilterList names={NETWORKS} {...p} />
    </PanelSection>
  )
}

/** Card "NFT em destaque / Oferta limitada": leva ao NFT em destaque real (primeiro de /api/nfts/featured). */
export function FeaturedOfferCard() {
  const { data } = useQuery({
    queryKey: ['nfts-featured'],
    queryFn: async ({ signal }) => (await api.get<Nft[]>('/nfts/featured', { signal })).data,
  })
  const nft = data?.[0]
  if (!nft) return null
  return (
    <Link to="/nfts/$id" params={{ id: nft.id }} aria-label={`NFT em destaque: ${nft.name}`} className="card hidden overflow-hidden text-foreground no-underline lg:block">
      <div className="px-5 pb-4 pt-5">
        <p className="text-xl font-bold uppercase text-primary">NFT em destaque</p>
        <p className="mt-3 text-center text-lg font-bold uppercase text-foreground">Oferta limitada</p>
      </div>
      <img src={nft.image} alt="" width={640} height={640} loading="lazy" decoding="async" className="aspect-square w-full rounded-3xl object-cover" />
    </Link>
  )
}

const BANNERS = [
  { img: MONKEYS.jaqueta, tab: 'novos' as const, title: 'Lançamentos gênesis de edição limitada', text: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.' },
  { img: MONKEYS.chimpanze, collection: 'Arte digital', title: 'Arte digital selecionada e muito mais', text: 'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.' },
]

export function Banners() {
  return (
    <div className="mt-16 grid gap-8 md:grid-cols-2">
      {BANNERS.map((b) => (
        <div key={b.title} className="card flex min-w-0 overflow-hidden">
          <img src={b.img} alt="" width={640} height={640} loading="lazy" decoding="async" className="w-28 shrink-0 self-stretch rounded-l-2xl object-cover sm:w-40 lg:min-h-[250px] lg:w-[287px]" />
          <div className="flex min-w-0 flex-1 flex-col items-end justify-center gap-2 p-4 text-right sm:p-5">
            <p className="text-base font-bold leading-6 text-foreground">{b.title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{b.text}</p>
            <Link to="/" search={b.tab ? { tab: b.tab } : { collection: b.collection }} hash="catalogo" aria-label={`Explorar: ${b.title}`} className="mt-1 inline-flex h-10 items-center rounded-control bg-primary px-4 text-sm font-bold text-primary-foreground no-underline hover:brightness-110">Explorar →</Link>
          </div>
        </div>
      ))}
    </div>
  )
}

export function Journal() {
  return (
    <section aria-labelledby="journal-title" className="mt-16">
      <h2 id="journal-title" className="text-center text-3xl font-bold">Diário da Cunhagem</h2>
      <p className="mb-8 mt-3 text-center text-sm text-muted-foreground">Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.</p>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {POSTS.map((p) => (
          <li key={p.slug} className="card min-w-0 overflow-hidden">
            <img src={p.img} alt="" width={640} height={640} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover object-top" />
            <div className="space-y-2 p-4">
              <p className="text-xs text-muted-foreground">{p.date} &nbsp;|&nbsp; Leitura de {p.read} min</p>
              <p className="text-base font-bold leading-6 text-foreground">{p.title}</p>
              <p className="text-xs leading-5 text-muted-foreground">{p.summary}</p>
              <Link to="/aprenda/$slug" params={{ slug: p.slug }} aria-label={`Ler artigo: ${p.title}`} className="inline-block text-xs font-bold text-primary underline-offset-4 hover:underline">Ler mais →</Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
