import { api } from '../api'
import { parseEth } from '../purchase/eth'
import type { Nft, NftPage } from './types'

/**
 * Coleção e rede dos NFTs. A API/mocks NÃO têm esses campos (contrato inalterado), então a classificação é
 * derivada no cliente e de forma determinística pelo número do NFT. Os filtros por coleção/rede e as abas
 * "Novos lançamentos"/"Em alta" buscam todas as páginas de GET /api/nfts e filtram/ordenam/paginam no cliente.
 */
export const COLLECTIONS = ['Arte digital', 'Fotografia', 'Música', 'Arte 3D', 'Colecionáveis', 'Generativa', 'Jogos', 'Assinaturas', 'Utilidade'] as const
export const NETWORKS = ['Ethereum', 'Polygon', 'Solana'] as const
export const TABS = ['novos', 'alta'] as const
export type Tab = (typeof TABS)[number]

const num = (n: Nft) => Number(n.id.replace(/\D/g, '')) || 0
export const collectionOf = (n: Nft) => COLLECTIONS[(num(n) - 1 + COLLECTIONS.length) % COLLECTIONS.length]
export const networkOf = (n: Nft) => NETWORKS[(num(n) - 1 + NETWORKS.length) % NETWORKS.length]

export async function fetchAllNfts(signal?: AbortSignal): Promise<Nft[]> {
  const first = (await api.get<NftPage>('/nfts', { params: { page: 1 }, signal })).data
  const pages = Math.ceil(first.total / first.pageSize)
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pages - 1) }, async (_, i) => (await api.get<NftPage>('/nfts', { params: { page: i + 2 }, signal })).data.items),
  )
  return [...first.items, ...rest.flat()]
}

export interface ClientFilter {
  q?: string
  min?: string
  max?: string
  available?: true
  sort?: 'price-asc' | 'price-desc' | 'name'
  page?: number
  collection?: string
  network?: string
  tab?: Tab
}

const cmp = (a: bigint, b: bigint) => (a < b ? -1 : a > b ? 1 : 0)

export function applyCatalog(all: Nft[], f: ClientFilter, pageSize = 6): NftPage {
  const q = f.q?.toLowerCase()
  const min = f.min ? parseEth(f.min) : null
  const max = f.max ? parseEth(f.max) : null
  let list = all.filter(
    (n) =>
      (!q || n.name.toLowerCase().includes(q)) &&
      (min === null || parseEth(n.price) >= min) &&
      (max === null || parseEth(n.price) <= max) &&
      (!f.available || n.edition.available > 0) &&
      (!f.collection || collectionOf(n) === f.collection) &&
      (!f.network || networkOf(n) === f.network),
  )
  if (f.sort === 'price-asc') list = [...list].sort((a, b) => cmp(parseEth(a.price), parseEth(b.price)))
  else if (f.sort === 'price-desc') list = [...list].sort((a, b) => cmp(parseEth(b.price), parseEth(a.price)))
  else if (f.sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
  else if (f.tab === 'novos') list = [...list].sort((a, b) => num(b) - num(a))
  // Em alta: maior fração da edição já vendida (total - disponível) / total.
  else if (f.tab === 'alta')
    list = [...list].sort((a, b) => {
      const sa = BigInt(a.edition.total - a.edition.available) * BigInt(b.edition.total || 1)
      const sb = BigInt(b.edition.total - b.edition.available) * BigInt(a.edition.total || 1)
      return cmp(sb, sa) || num(a) - num(b)
    })
  const page = Math.max(1, f.page ?? 1)
  return { items: list.slice((page - 1) * pageSize, page * pageSize), total: list.length, page, pageSize }
}
