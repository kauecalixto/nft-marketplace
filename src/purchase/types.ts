export interface CartItem {
  nftId: string; name: string; image: string; price: string; quantity: number; available: number; max: number
}
export interface QuoteLine { nftId: string; name: string; quantity: number; unitPrice: string; lineTotal: string }
export interface Quote {
  quoteId: string; version: string; network: string; items: QuoteLine[]; coupon: string | null
  subtotal: string; discount: string; networkFee: string; total: string; unavailable: string[]
}
export type OrderItem = QuoteLine
export type OrderStatus = 'pending' | 'confirmed' | 'declined'
export interface Order {
  id: string; userId: string; status: OrderStatus; version: number; createdAt: string
  items: OrderItem[]; subtotal: string; discount: string; networkFee: string; total: string
  coupon: string | null; network: string; walletId: string
  collector: { name: string; email: string; document: string }
  txHash?: string; explorerUrl?: string
}
export interface Wallet { id: string; label?: string; name?: string; address: string; connected?: boolean }
