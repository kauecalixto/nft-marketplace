import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { api } from '../api'
import type { CartItem, Order, Quote, Wallet } from './types'

export const NETWORKS = [
  { id: 'ethereum', label: 'Ethereum' },
  { id: 'polygon', label: 'Polygon' },
  { id: 'base', label: 'Base' },
]

export function errorInfo(e: unknown): { status?: number; code?: string; message: string; data: Record<string, unknown> } {
  if (axios.isAxiosError(e)) {
    const d = (e.response?.data ?? {}) as { code?: string; message?: string }
    return { status: e.response?.status, code: d.code, message: d.message ?? 'Falha de rede', data: d as Record<string, unknown> }
  }
  return { message: 'Erro inesperado', data: {} }
}

export const cartQuery = { queryKey: ['cart'], queryFn: async ({ signal }: { signal: AbortSignal }) => (await api.get<CartItem[]>('/cart', { signal })).data }
export const quoteQuery = (network = 'ethereum') => ({
  queryKey: ['quote', network],
  queryFn: async ({ signal }: { signal: AbortSignal }) => (await api.get<Quote>('/quote', { params: { network }, signal })).data,
})

export const useCart = () => useQuery(cartQuery)
export const useQuote = (network?: string) => useQuery(quoteQuery(network))
export const useWallets = () => useQuery({ queryKey: ['wallets'], queryFn: async ({ signal }: { signal: AbortSignal }) => (await api.get<Wallet[]>('/wallets', { signal })).data })

function useRefreshCart() {
  const qc = useQueryClient()
  return () => Promise.all([qc.invalidateQueries({ queryKey: ['cart'] }), qc.invalidateQueries({ queryKey: ['quote'] })])
}

// Atualização otimista com rollback: alterar quantidade e remover.
export function useChangeQuantity() {
  const qc = useQueryClient()
  const refresh = useRefreshCart()
  return useMutation({
    mutationFn: async (v: { nftId: string; quantity: number }) => (await api.patch(`/cart/${v.nftId}`, { quantity: v.quantity })).data,
    onMutate: async (v) => {
      await qc.cancelQueries({ queryKey: ['cart'] })
      const prev = qc.getQueryData<CartItem[]>(['cart'])
      qc.setQueryData<CartItem[]>(['cart'], (c) => c?.map((i) => (i.nftId === v.nftId ? { ...i, quantity: v.quantity } : i)))
      return { prev }
    },
    onError: (_e, _v, ctx) => qc.setQueryData(['cart'], ctx?.prev),
    onSettled: refresh,
  })
}
export function useRemoveItem() {
  const qc = useQueryClient()
  const refresh = useRefreshCart()
  return useMutation({
    mutationFn: async (nftId: string) => (await api.delete(`/cart/${nftId}`)).data,
    onMutate: async (nftId) => {
      await qc.cancelQueries({ queryKey: ['cart'] })
      const prev = qc.getQueryData<CartItem[]>(['cart'])
      qc.setQueryData<CartItem[]>(['cart'], (c) => c?.filter((i) => i.nftId !== nftId))
      return { prev }
    },
    onError: (_e, _v, ctx) => qc.setQueryData(['cart'], ctx?.prev),
    onSettled: refresh,
  })
}
export function useApplyCoupon() {
  const refresh = useRefreshCart()
  return useMutation({ mutationFn: async (code: string) => (await api.post('/cart/coupon', { code })).data, onSuccess: refresh })
}
export function useRemoveCoupon() {
  const refresh = useRefreshCart()
  return useMutation({ mutationFn: async () => (await api.delete('/cart/coupon')).data, onSuccess: refresh })
}

export const orderQuery = (id: string) => ({
  queryKey: ['orders', id],
  queryFn: async ({ signal }: { signal: AbortSignal }) => (await api.get<Order>(`/orders/${id}`, { signal })).data,
  refetchInterval: (q: { state: { data?: Order } }) => (q.state.data?.status === 'pending' ? 1000 : (false as const)),
})
