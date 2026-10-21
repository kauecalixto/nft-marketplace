# Validação (estado final; comandos rodados por mim às 18:55)

| Comando | Resultado real |
|---|---|
| `npm run typecheck` | sem erros |
| `npm run lint` | sem erros nem warnings |
| `npm run build:demo` | build ok |
| `npx playwright test` | **95 passed**, 0 failed (chromium 1440, 768 e 390; regressão visual com 12 baselines versionadas) |
| `node --test tests/unit/eth.test.mjs` | 3 passed (rodado antes da última rodada de UI) |
| `npm run audit:lighthouse` | medianas Perf 95–100, A11y/BP/SEO 100 — medido ANTES da migração para shadcn/ui, destaques e galeria; **não repetido** |

Ressalvas dos 95:
- Dois testes usam `test.fail` (defeitos conhecidos documentados nos specs): foco não volta ao botão após Esc no diálogo de revisão (`a11y-keyboard.spec.ts`) e overflow de `/wallets` em 390 px (`responsive.spec.ts`). Eles "passam" porque o defeito era esperado; se o defeito já foi corrigido, o teste deve ser reavaliado (um `test.fail` que passa por dentro falha a suíte, e a suíte passou, portanto os defeitos ainda estavam presentes quando rodei). Não confirmei o estado do overflow de `/wallets` depois do ajuste `break-all` e do estado de `/orders/:id` em 390 px.
- Specs novos (a11y, realtime-orders, cart-merge, responsive, visual) rodam só no projeto desktop; o loop de viewports está dentro do arquivo.
- Baselines visuais geradas agora, como referência inicial, não comparadas com o Figma.

| Estado | Situação |
|---|---|
| IMPLEMENTADO | Catálogo (busca, filtros, ordenação, paginação, destaques), detalhe (galeria, limite de quantidade, favoritos), conta, carrinho/cupom/cotação em BigInt, checkout idempotente, pedidos, Socket.IO via MSW, shadcn/ui nas telas de compra e autenticação, 404, lint |
| TESTADO | 95 testes Playwright + 3 unitários, rodados por mim |
| VALIDADO | Parcial: speckit rodou specify/plan/tasks/analyze (0 críticos, 3 médios, 4 baixos — `reports/speckit-validation.md`). Sem validador OpenSpec/TLC; regra da turma não confirmada; o speckit foi gerado a partir de spec e código existentes |
| VERIFICADO | QA independente rodada 2 (aprovado com ressalvas) cobriu o estado anterior; **a versão final não passou por nova rodada de QA** |

## Não entregue
Deploy (obrigatório), PR no fork, fidelidade ao Figma (sem acesso), spec em OpenSpec/TLC, Lighthouse atualizado, shadcn/ui nas telas de perfil, carteiras e catálogo (usam Tailwind direto), foco após Esc no diálogo, overflow em 390 px a confirmar. Matriz e gaps em `docs/requirements/requirements-matrix.md` e `docs/qa/known-gaps.md` foram escritos antes da última rodada e podem estar desatualizados quanto a 404, lint, destaques, galeria, edição de carteira e shadcn.
