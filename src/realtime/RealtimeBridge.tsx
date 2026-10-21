import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouterState } from '@tanstack/react-router'
import { api } from '../api'
import { startRealtime } from './client'
import { NftUpdateNotice } from './Notice'

// Ciclo de vida do socket (montagem/desmontagem) + aviso no carrinho.
export function RealtimeBridge() {
  const qc = useQueryClient()
  const path = useRouterState({ select: (s) => s.location.pathname })
  useEffect(() => startRealtime(qc), [qc])
  return path === '/cart' || path === '/checkout' ? <CartNotice /> : null
}

function CartNotice() {
  const { data } = useQuery({
    queryKey: ['cart'],
    queryFn: async ({ signal }) => (await api.get('/cart', { signal })).data as unknown,
  })
  const items = Array.isArray(data) ? data : ((data as { items?: unknown[] } | undefined)?.items ?? [])
  const ids = (items as { nftId?: string }[]).map((i) => i.nftId).filter((x): x is string => !!x)
  return <NftUpdateNotice nftIds={ids} />
}
