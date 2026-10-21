# REVIEW

## O que foi pedido na sessão Plan
Research, ADR e spec da feature "limite de quantidade por edição" (Catálogo). Não houve sessão separada: tudo na mesma sessão, por prazo.

## O que foi devolvido
`RESEARCH.md`, `docs/adr/0001-limite-quantidade-edicao.md`, `docs/quantity-limit-spec.md`. Implementação por um subagente; QA por outro subagente independente (`reports/qa-report.md`, veredito: aprovado com ressalvas).

## EARS reescritos/rejeitados
| Critério | Alteração | Motivo | Origem |
|---|---|---|---|
| ADR/EARS (campos) | `maxPerOrder` renomeado para `walletLimit` | O código implementado usa `walletLimit`; ADR alinhado ao código | Implementação |
| ADR (conflito) | Mock passou de 422 para 409 `AVAILABILITY_CONFLICT` | QA: ADR e enunciado (§5) falam em conflito de disponibilidade | `reports/qa-report.md` |

## BDD reescritos/rejeitados
Nenhum cenário Gherkin foi reescrito. A cobertura do cenário 3 e de EARS-01 foi completada em `tests/e2e/quantity-extra.spec.ts`: ausência do seletor, diminuir mantém 1 e digitação fora da faixa é limitada.

## Evidência de testes
- Comandos: `npm run typecheck`, `npx playwright test`, `npm run build:demo`.
- Resultado real (estado final, rodado por mim): typecheck sem erros; `npx playwright test` com 72 passed (desktop 1440, tablet 768, mobile 390); build ok. QA da rodada 2 em `reports/qa-report.md`.
- Limitações: os defeitos da rodada 1 foram corrigidos e o QA da rodada 2 confirmou; `walletLimit = 0` não tem teste; o desafio completo não está entregue (ver `docs/qa/known-gaps.md`).
