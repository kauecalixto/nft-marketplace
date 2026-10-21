// Contrato compartilhado entre as frentes de mock (conta, compra, tempo real).
// Token de sessão = id do usuário, enviado como `Authorization: Bearer <userId>`.
// O cliente guarda o token em localStorage['nft:token'] (interceptor em src/api.ts).
export const TOKEN_KEY = 'nft:token'

export interface MockUser { id: string; email: string; name: string }

// Preenchido pela frente "conta": devolve o usuário da requisição ou null (=> 401).
export let resolveUser: (request: Request) => MockUser | null = () => null
export function setUserResolver(fn: typeof resolveUser) { resolveUser = fn }

// Preenchido pela frente "tempo real": emite eventos Socket.IO pelo servidor mock.
export type NftUpdated = { eventId: string; resource: 'nft'; id: string; version: number; price: string; available: number }
export type OrderUpdated = { eventId: string; resource: 'order'; id: string; userId: string; version: number; status: 'pending' | 'confirmed' | 'declined' }
export const emitters: {
  nftUpdated: (e: NftUpdated) => void
  orderUpdated: (e: OrderUpdated) => void
} = { nftUpdated: () => {}, orderUpdated: () => {} }
