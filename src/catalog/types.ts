export interface Nft {
  id: string
  name: string
  creator: string
  price: string // ETH decimal string
  image: string
  images: string[]
  featured?: boolean
  edition: { total: number; available: number }
  walletLimit: number
  collection?: string // slug de GET /collections (campo aditivo)
  network?: 'ethereum' | 'polygon' | 'base' // rede de origem (campo aditivo)
}

export interface NftPage {
  items: Nft[]
  total: number
  page: number
  pageSize: number
}
