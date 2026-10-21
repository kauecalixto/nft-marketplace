import type { Nft } from './types'

export function maxQuantity(nft: Nft): number {
  return Math.max(0, Math.min(nft.edition.available, nft.walletLimit))
}
