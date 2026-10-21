# Tasks: Limite de quantidade por edição

**Input**: specs/001-quantity-limit/ (plan.md, spec.md, research.md, data-model.md, contracts/)
**Nota**: feature já implementada. Marcação `[x]` = código/arquivo observado no repositório. Nenhuma tarefa de teste está marcada como passada: os testes não foram executados por este fluxo.

## Phase 1: Setup
- [x] T001 Confirmar contexto Catálogo e estrutura em src/catalog/ (NftDetailPage.tsx, quantity.ts, types.ts)

## Phase 2: Foundational
- [x] T002 Campo `walletLimit` e `edition{total,available}` no tipo Nft em src/catalog/types.ts
- [x] T003 [P] Função maxQuantity = max(0, min(available, walletLimit)) em src/catalog/quantity.ts
- [x] T004 [P] Fixtures com available e walletLimit em src/mocks/fixtures.ts e rejeição 409 em src/mocks/purchase.ts

## Phase 3: User Story 1 - Quantidade até o limite (P1)
- [x] T005 [P] [US1] Teste e2e do limite em tests/e2e/quantity-limit.spec.ts (existe; execução NÃO verificada)
- [x] T006 [P] [US1] Teste do mínimo 1 em tests/e2e/quantity-extra.spec.ts (existe; execução NÃO verificada)
- [x] T007 [US1] Seletor com mínimo 1, aumento desabilitado no limite e mensagem "Limite de quantidade atingido" em src/catalog/NftDetailPage.tsx

## Phase 4: User Story 2 - Edição indisponível (P2)
- [x] T008 [P] [US2] Teste e2e em tests/e2e/quantity-limit.spec.ts (existe; execução NÃO verificada)
- [x] T009 [US2] "Edição indisponível" e botão "Adicionar ao carrinho" desabilitado em src/catalog/NftDetailPage.tsx

## Phase 5: User Story 3 - NFT inexistente (P3)
- [x] T010 [P] [US3] Testes e2e em tests/e2e/quantity-limit.spec.ts e quantity-extra.spec.ts (existem; execução NÃO verificada)
- [ ] T011 [US3] Confirmar em src/catalog/NftDetailPage.tsx o texto "NFT não encontrado" (trecho não lido por este fluxo)

## Phase 6: Polish
- [ ] T012 Executar `npx playwright test tests/e2e/quantity-limit.spec.ts tests/e2e/quantity-extra.spec.ts` e registrar saída real (QA independente)
- [ ] T013 Decidir se o estado "Sem cota para esta carteira" (presente no código) entra na spec

## Dependências
Phase 2 antes das stories; US1, US2, US3 independentes. Paralelo: T003/T004; T005/T006; testes de cada story.
MVP: US1. Total: 13 tarefas (US1: 3, US2: 2, US3: 2).
