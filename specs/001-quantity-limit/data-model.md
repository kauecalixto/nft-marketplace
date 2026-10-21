# Data Model

- **Nft**: id, name, creator, price (string decimal), image, edition{total, available}, walletLimit (fonte: docs/CONTRACTS.md, GET /nfts/:id).
- **Quantidade escolhida**: inteiro, 1 <= q <= max, max = max(0, min(edition.available, walletLimit)).
- **Estados da tela**: carregando; NFT não encontrado (404); edição indisponível (max = 0); normal; limite atingido (q = max).
