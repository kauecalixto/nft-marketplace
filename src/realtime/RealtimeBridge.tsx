import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouterState } from '@tanstack/react-router'
import { useCart } from '../purchase/queries'
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
  const { data } = useCart()
  const ids = (data ?? []).map((i) => i.nftId).filter((x): x is string => !!x)
  return <NftUpdateNotice nftIds={ids} />
}
