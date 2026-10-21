# Lacunas conhecidas

Estado atual, baseado em leitura de código/testes. Itens ligados à matriz em `docs/requirements/requirements-matrix.md`. Resultados de execução: `reports/implementation-status.md` e `reports/qa-report.md`.

## Ainda faltam (alto impacto)
- Deploy público (§12): sem configuração de deploy nem fallback SPA. NÃO IMPLEMENTADO.
- PR no fork: não aberto.
- Fidelidade ao Figma: sem acesso ao Figma; sem tokens/frames. NÃO IMPLEMENTADO.
- shadcn/ui: parcial (Button, Input, Label, Dialog no carrinho/checkout). Perfil, carteiras e catálogo ainda sem shadcn.
- Especificação na ferramenta alternativa (OpenSpec/TLC): execução e comparação pendentes.
- Lighthouse: rerodado em 2026-10-21 (ver `reports/lighthouse/README.md`); precisará de nova rodada se a UI mudar (shadcn no catálogo, deploy).

## Já existe (antes listado como lacuna)
- Rota 404 (`tests/e2e/not-found.spec.ts`), script `lint` (eslint), destaques e galeria (`featured-gallery.spec.ts`), edição de carteira (`wallet-edit.spec.ts`).
- Regressão visual com baselines (`visual-regression.spec.ts`).
- Testes de teclado/foco (`a11y-keyboard.spec.ts`), incluindo retorno de foco ao `review-order` após Esc (defeito corrigido com `onCloseAutoFocus`).
- Responsividade 390/768/1440 em carrinho, checkout, pedido, perfil e carteiras (`responsive.spec.ts`); overflow em `/wallets` e `/orders/:id` corrigido.
- Testes de `order.updated` (`realtime-orders.spec.ts`) e do merge do carrinho de visitante (`cart-merge.spec.ts`).

## Outras lacunas
- Sem teste do aviso de preço/disponibilidade no carrinho via Socket.IO nem do checkout bloqueado após `nft.updated`.
- Sem simulação de conexão/desconexão de carteira (só recusa).
- Troca de usuário na mesma aba: sem teste de troca de subscriptions.
- Expiração durante o checkout não preserva o formulário.
- Mocks: sem cenários 4xx genéricos; Socket.IO só websocket, namespace `/`.
- Skeleton+shimmer só em catálogo, detalhe e resumo do carrinho.
- Sem auditoria axe, sem teste de zoom; imagens do carrinho com `alt=""`.
- Perfil: avatar só por URL. Sem script npm para `tests/unit/eth.test.mjs`.
- Política de cache/retry sem teste dedicado; contratos tipados parcialmente.
- Este diretório não é repositório git no ambiente atual.
