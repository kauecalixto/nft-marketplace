import type { Nft } from '../catalog/types'

// Arte SVG deterministica por NFT (substituivel por assets reais: ver ARCHITECTURE.md > Design).
// n define a paleta e a composicao (4 estilos); `v` (0..2) varia a mesma obra para a galeria.
const PALETTES: [number, number][] = [
  [262, 320], [205, 258], [168, 214], [24, 340], [350, 28], [190, 140],
  [280, 210], [45, 350], [150, 200], [310, 245], [12, 300], [230, 175],
]
const art = (n: number, v: number) => {
  const [h1, h2] = PALETTES[(n - 1) % PALETTES.length]
  const a = (h1 + v * 22) % 360
  const b = (h2 - v * 18 + 360) % 360
  const r = (k: number) => ((n * 37 + v * 53 + k * 91) % 100) / 100 // pseudo-aleatorio estavel em [0,1)
  const c1 = `hsl(${a} 85% 62%)`
  const c2 = `hsl(${b} 80% 48%)`
  const c3 = `hsl(${(a + b) / 2 + 20} 90% 78%)`
  let shapes = ''
  const style = (n + v) % 4
  if (style === 0) {
    for (let i = 0; i < 5; i++) shapes += `<circle cx="${60 + r(i) * 280}" cy="${60 + r(i + 7) * 280}" r="${30 + r(i + 3) * 70}" fill="${i % 2 ? c3 : '#fff'}" fill-opacity="${0.18 + (i % 3) * 0.1}"/>`
  } else if (style === 1) {
    for (let i = 0; i < 5; i++) shapes += `<path d="M-20 ${210 + i * 36} C 80 ${150 + i * 30 + r(i) * 60} 200 ${290 + i * 24 - r(i + 2) * 60} 420 ${190 + i * 34}" stroke="${i % 2 ? c3 : '#fff'}" stroke-opacity="${0.55 - i * 0.07}" stroke-width="${10 + i * 3}" fill="none" stroke-linecap="round"/>`
  } else if (style === 2) {
    for (let i = 0; i < 6; i++) shapes += `<circle cx="200" cy="200" r="${28 + i * 30}" fill="none" stroke="${i % 2 ? c3 : '#fff'}" stroke-opacity="${0.7 - i * 0.09}" stroke-width="${6 + (i % 3) * 3}"/>`
    shapes += `<circle cx="200" cy="200" r="22" fill="#fff" fill-opacity=".9"/>`
  } else {
    for (let i = 0; i < 5; i++) shapes += `<rect x="${110 - i * 14}" y="${110 - i * 14}" width="${180 + i * 28}" height="${180 + i * 28}" rx="${10 + i * 6}" transform="rotate(${45 + i * 9} 200 200)" fill="none" stroke="${i % 2 ? c3 : '#fff'}" stroke-opacity="${0.75 - i * 0.12}" stroke-width="${5 + i}"/>`
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><radialGradient id="s" cx=".3" cy=".25" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="400" height="400" fill="url(#g)"/>${shapes}<rect width="400" height="400" fill="url(#s)"/></svg>`,
  )}`
}

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
