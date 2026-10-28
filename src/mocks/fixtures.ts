import type { Nft } from '../catalog/types'

// Imagens originais do Figma (4 macacos, 640x640 JPEG em public/nfts/). No Figma elas se repetem em todos
// os cards; aqui sao distribuidas de forma deterministica pelo numero do NFT (ver ARCHITECTURE.md > Design).
const ARTS = ['/nfts/macaco-jaqueta.jpg', '/nfts/gorila-chapeu.jpg', '/nfts/chimpanze-blazer.jpg', '/nfts/orangotango-fone.jpg']
const art = (n: number, v: number) => ARTS[(n - 1 + v) % ARTS.length]

// Coleções e redes (campos aditivos): 4 NFTs por coleção; rede alterna por número do NFT.
export const COLLECTIONS = [
  { slug: 'genesis', name: 'Genesis' },
  { slug: 'orbit', name: 'Orbit' },
  { slug: 'pixel', name: 'Pixel' },
]
const NETWORKS: NonNullable<Nft['network']>[] = ['ethereum', 'polygon', 'base']

const mk = (n: number, name: string, total: number, available: number, walletLimit: number, price: string): Nft => ({
  id: `nft-${n}`,
  name,
  creator: `creator-${n}`,
  price,
  image: art(n, 0),
  images: [art(n, 0), art(n, 1), art(n, 2)],
  featured: n >= 7 && n <= 9,
  edition: { total, available },
  walletLimit,
  collection: COLLECTIONS[Math.floor((n - 1) / 4) % COLLECTIONS.length].slug,
  network: NETWORKS[n % NETWORKS.length],
})

// max = min(available, walletLimit)
// nft-1: min(10,3)=3 | nft-2: min(2,5)=2 | nft-3: min(100,5)=5 | nft-4: 1/1 -> 1
// nft-5: available 0 (indisponível) | nft-6: min(50,1)=1 | nft-12: available 0
export const nftsFixture: Nft[] = [
  mk(1, 'Aurora Genesis', 100, 10, 3, '0.50'),
  mk(2, 'Blue Orbit', 10, 2, 5, '1.25'),
  mk(3, 'Cyber Koi', 500, 100, 5, '0.08'),
  mk(4, 'One of One', 1, 1, 1, '12.00'),
  mk(5, 'Sold Out Sun', 20, 0, 2, '0.90'),
  mk(6, 'Solo Limit', 50, 50, 1, '0.30'),
  mk(7, 'Neon Dunes', 30, 12, 4, '0.45'),
  mk(8, 'Pixel Pals', 1000, 640, 10, '0.02'),
  mk(9, 'Glass Garden', 15, 7, 2, '2.10'),
  mk(10, 'Void Walker', 5, 5, 5, '3.333'),
  mk(11, 'Paper Moon', 60, 31, 6, '0.15'),
  mk(12, 'Last Echo', 8, 0, 3, '5.00'),
]

// Alterações em tempo de execução (via /api/__mock/nfts/:id/update). As respostas REST leem daqui,
// então REST e eventos Socket.IO ficam consistentes.
export const nftOverrides: Record<string, { version: number; price?: string; available?: number }> = {}
export function resetNftOverrides() {
  for (const k of Object.keys(nftOverrides)) delete nftOverrides[k]
}
export function currentNft(id: string): Nft | undefined {
  const base = nftsFixture.find((n) => n.id === id)
  if (!base) return undefined
  const o = nftOverrides[id]
  if (!o) return base
  return {
    ...base,
    price: o.price ?? base.price,
    edition: { ...base.edition, available: o.available ?? base.edition.available },
  }
}
export function currentNfts(): Nft[] {
  return nftsFixture.map((n) => currentNft(n.id)!)
}
