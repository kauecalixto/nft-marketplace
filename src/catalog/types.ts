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
}

export interface NftPage {
  items: Nft[]
  total: number
  page: number
  pageSize: number
}
