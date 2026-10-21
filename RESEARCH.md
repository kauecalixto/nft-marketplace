# RESEARCH — Limite de quantidade por edição no detalhe do NFT

## Fonte
- Documento: `docs/ENUNCIADO.md` (enunciado do desafio), §3 "Catálogo e detalhe" e "Carrinho".
- Trecho de origem: "O detalhe deve suportar acesso direto, NFT inexistente, edição indisponível e limite de quantidade." e "Quantidades são inteiras."
- Limitação: este Research foi escrito na mesma sessão do Discovery, não em sessão nova (ver `DIFERENCAS.md`).

## Dor
- Quem sente: o colecionador que escolhe quantas unidades de um NFT comprar.
- Quando: no detalhe do NFT, ao ajustar a quantidade antes de adicionar ao carrinho.
- Objetivo: comprar a quantidade desejada sem descobrir só no pagamento que ela não existe.
- Falha/risco: escolher quantidade acima da edição disponível, ou tentar comprar edição indisponível, sem aviso.
- Consequência/custo: o pedido falha tarde (conflito de disponibilidade no checkout), com retrabalho e perda de confiança.

## Resultado esperado
- Resultado observável: a tela impede quantidades fora do limite, diz o motivo em texto e trata edição indisponível e NFT inexistente.
- Limites: quantidade inteira, mínimo 1, máximo definido pela edição. Sem carteira ou pagamento reais.
- Dúvidas abertas:
  - O enunciado não define o valor do limite nem se há limite por carteira além da disponibilidade da edição.
  - Não diz se o limite considera o que já está no carrinho.
  - Não diz como a tela reage se a disponibilidade mudar enquanto o detalhe está aberto (`nft.updated`, §7).

## Rastreabilidade
| ID | Afirmação | Seção/trecho |
|---|---|---|
| R-01 | O detalhe tem limite de quantidade | §3 Catálogo e detalhe |
| R-02 | Edição indisponível é um caso tratado | §3 Catálogo e detalhe |
| R-03 | NFT inexistente é um caso tratado | §3 Catálogo e detalhe |
| R-04 | Quantidades são inteiras | §3 Carrinho (parágrafo de ETH) |
| R-05 | Disponibilidade por NFT e edição é respeitada ao adicionar | §3 Carrinho |
