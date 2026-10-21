// Contador de eventos nft.updated aceitos, por NFT; alimenta o aviso (live region).
type L = () => void
const listeners = new Set<L>()
let counts: Record<string, number> = {}
export const noticeStore = {
  subscribe(l: L) { listeners.add(l); return () => { listeners.delete(l) } },
  get: () => counts,
  bump(id: string) { counts = { ...counts, [id]: (counts[id] ?? 0) + 1 }; listeners.forEach((l) => l()) },
  reset() { counts = {}; listeners.forEach((l) => l()) },
}
