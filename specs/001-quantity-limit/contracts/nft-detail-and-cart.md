# Contratos usados (de docs/CONTRACTS.md)

- GET /api/nfts/:id -> 200 Nft{..., edition{total,available}, walletLimit}; 404 {message:'not found'}.
- POST /api/cart {nftId, quantity} -> 201 lista; 409 AVAILABILITY_CONFLICT quando quantidade acima do limite.

Contrato de UI: textos "Limite de quantidade atingido", "Edição indisponível", "NFT não encontrado".
