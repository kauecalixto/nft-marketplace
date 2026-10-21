import { useState, useSyncExternalStore } from 'react'
import { noticeStore } from './store'

// Live region sempre presente; o texto aparece quando um nft.updated atinge um dos NFTs observados
// depois da montagem do componente.
export function NftUpdateNotice({ nftIds }: { nftIds: string[] }) {
  const counts = useSyncExternalStore(noticeStore.subscribe, noticeStore.get)
  const [base] = useState<Record<string, number>>(() => ({ ...noticeStore.get() }))
  const hit = nftIds.some((id) => (counts[id] ?? 0) > (base[id] ?? 0))
  return (
    <p role="status" data-testid="nft-updated-notice" className={hit ? 'text-sm text-amber-700' : 'sr-only'}>
      {hit ? 'Preço ou disponibilidade atualizado' : ''}
    </p>
  )
}
