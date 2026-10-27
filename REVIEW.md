# REVIEW — Semana 6: pedido único sem duplicidade (contexto Compra)

Este review cobre a feature da semana 6. O review da semana 5 (limite de quantidade por edição) foi movido para `docs/semana-5-quantity-limit/REVIEW-semana5.md`.

Fonte dos requisitos: `docs/ENUNCIADO.md` (§3 Pagamento e confirmação, §5 Pedidos, §6, §7). Regra do projeto: toda afirmação abaixo aponta para um arquivo que pode ser conferido; o que não foi executado está marcado como tal.

## Fluxo seguido (sessões separadas)
| Sessão | Entrada | Saída |
|---|---|---|
| Research | Trecho do enunciado (§3, §5, §7) | `RESEARCH.md` |
| Plan | `RESEARCH.md` + `GLOSSARIO.md` | `docs/adr/0001-pedido-unico-sem-duplicidade.md` e `docs/pedido-unico-sem-duplicidade-spec.md` |
| Implement | A spec e o ADR | `tests/e2e/pedido-unico.spec.ts` e o endpoint de mock `POST /api/__mock/orders/:id/event` |

Research, Plan e Implement foram sessões separadas de subagente. Esta documentação foi redigida por outro agente (integração), que não participou dessas sessões: o que segue sobre elas vem dos artefatos e do relatório do orquestrador, não de transcrição.

## O que foi pedido na sessão Plan
A partir do `RESEARCH.md`: um ADR e uma spec com exatamente cinco critérios EARS e três cenários BDD em Gherkin (ao menos um de erro ou limite), cada critério rastreado ao R-xx do Research e à seção do enunciado, sem inventar requisitos.

## O que o agente devolveu
- ADR 0001 (status "Proposto"): chave de idempotência por tentativa gerada no cliente, deduplicação no mock MSW (mesma chave e mesmo corpo devolve o mesmo pedido; corpo diferente, 409), `order.updated` por Socket.IO com deduplicação por id e versão, recuperação após refresh por consulta REST, remoção do carrinho só após confirmação.
- Spec com EARS-01 a EARS-05 e CB-01 a CB-03, tabela de origem e mapa de testes.
- Teste Playwright com três casos que usam os mesmos títulos dos cenários.

## O que foi rejeitado ou reescrito nos EARS e no BDD
| Item | O que mudou | Por quê |
|---|---|---|
| EARS-04 (Optional feature) | Acrescentado o padrão "Onde o evento `order.updated` estiver disponível...": o resultado (confirmado ou recusado) é apresentado ao receber o evento e o estado terminal não volta a pendente por evento duplicado ou antigo. | Faz o critério depender de a funcionalidade tempo real estar presente (§7) e cobre pedidos terminais (R-02, R-08). Cobertura: CB-02, último passo, que usa o cliente Socket.IO real. |
| CB-03 (erro/limite) | Cenário de erro: reutilizar a tentativa com itens diferentes é tratado como conflito, sem criar nem alterar pedido (EARS-05). | Exigência do desafio de ter ao menos um cenário de erro; origem em §5 (R-06). |
| R-04 (preservar itens em falha) | Reconhecido no Research, mas deixado fora dos cinco EARS e listado como fora de escopo na spec. | A spec tem um limite de cinco critérios; fica para a próxima spec do contexto Compra. O app já mantém o carrinho em recusa, mas esta spec não o cobre. |
| Citação do §5 no `RESEARCH.md` | A palavra "chave" foi trocada por "[identificação da tentativa]". | O motivo da troca não está registrado nos artefatos. Consequência: a citação não é mais literal ao enunciado e deve ser lida como paráfrase. |
| Números de custo e frequência do Research | Mantidos como hipóteses (R-09), fora dos EARS. | Não vêm do enunciado e não foram medidos. |

O que não consigo afirmar: se o usuário rejeitou ou reescreveu algum critério durante a sessão Plan, além do que está nos artefatos. Os três cenários da semana 5 também NÃO foram escritos à mão pelo usuário (vieram de uma spec manual prévia); a regra de par/ímpar do curso não está confirmada.

## Divergências reais entre a implementação (Implement) e a spec
| # | Divergência | Efeito |
|---|---|---|
| 1 | O app e os mocks montam cotação e pedido do carrinho INTEIRO; não existe pagamento parcial. A spec pressupõe pagar "2 unidades de Aurora 12" e deixar "Brisa 07" no carrinho. | Os testes contornam: "Solo Limit" é adicionada ao carrinho DEPOIS de o pedido ser criado (via `POST /api/cart`), logo não pertence ao pedido. EARS-03 ("só itens e quantidades comprados saem") é exercitado, mas não por um pagamento parcial de verdade. |
| 2 | A UI só reaproveita a chave de idempotência em timeout (504 ou erro de rede, até 3 tentativas) ou em rascunho de checkout restaurado (`CheckoutPage.tsx`). Após qualquer outro resultado a chave é regenerada. | CB-03 usa o rascunho restaurado (`sessionStorage['checkout-draft:u-ana']` montado pelo teste) para reproduzir a reutilização pela interface; pela API, o 409 `IDEMPOTENCY_CONFLICT` é afirmado diretamente. |
| 3 | O aviso de conflito exibido é o texto do mock: "chave já usada com conteúdo diferente". | O teste verifica esse texto. A spec diz "avisado de que a tentativa já foi usada com outro conteúdo" (outra redação; a palavra "chave" aparece na UI). |
| 4 | "Pedido de 1,00 ETH" é o subtotal. O total é 1.005 ETH por causa da taxa de rede de 0.005 (rede Ethereum). | O teste afirma `subtotal` 1.00 e `total` 1.005; a spec não menciona taxa. |
| 5 | Nomes mapeados para as fixtures: "Aurora 12" é `nft-1` "Aurora Genesis" (0.50 ETH); "Brisa 07" é `nft-6` "Solo Limit" (0.30 ETH). | A spec fala em nomes que não existem nas fixtures. |
| 6 | O Implement acrescentou o endpoint de mock `POST /api/__mock/orders/:id/event` (`{version?, eventId?, status?}`) em `src/mocks/purchase.ts`. | Necessário para emitir o evento antigo pelo servidor Socket.IO simulado em vez de mexer no cache. Não está no enunciado nem na spec; documentado em `docs/CONTRACTS.md`. |
| 7 | R-04 ficou fora dos cinco EARS. | Ver tabela anterior. |
| 8 | A citação do enunciado no Research não é mais literal. | Ver tabela anterior. |
| 9 | Pedido pendente nos testes vem do cenário `payment-held` do mock; a confirmação vem de `POST /api/__mock/orders/:id/confirm`. | O ciclo de vida é controlado pelo teste, não por um provedor de pagamento. Nada real é usado. |

## Mapa de testes (spec -> teste)
Arquivo: `tests/e2e/pedido-unico.spec.ts` (projeto `chromium-desktop`).
| Cenário | EARS | Teste |
|---|---|---|
| CB-01 | EARS-01 | `Cliques repetidos na mesma tentativa geram um único pedido` |
| CB-02 | EARS-02, 03, 04 | `Pedido pendente é recuperado após recarregar e só a compra confirmada altera o carrinho` |
| CB-03 | EARS-05 | `Reutilizar a tentativa com itens diferentes é tratado como conflito` |

## Evidência de testes
Resultados informados pelo orquestrador a partir de execuções reais deste estado do código (o integrador de documentação NÃO reexecutou a suíte Playwright; reexecutou apenas o validador TLC, com o resultado abaixo).
| Comando | Resultado |
|---|---|
| `npm run typecheck` | passa |
| `npm run lint` | passa |
| `npm run test:unit` | 3 testes passam |
| `npm run build:demo` | passa |
| `npx playwright test` (completo) | 169 passed, 0 failed |
| `npx playwright test pedido-unico` | 3 testes passam |
| `openspec validate limite-quantidade-edicao --strict` (semana 5, CLI 1.15.0) | válido |
| `python .claude/skills/tlc-spec-driven/scripts/validate_spec.py .specs/features/quantity-limit/spec.md` (semana 5) | `0 error(s), 0 warning(s)` (executado por mim ao escrever este review) |

Antes do redesign havia 2 `@visual` falhando (`inicio` 390 px e `pagamento` 768 px) por mudanças intencionais de acessibilidade; o redesign da interface mudou todas as telas e os baselines `@visual` foram regenerados, e a suíte completa passou (169 de 169).

Poder de falha: as mutações M1, M2 e M3 aplicadas ao mock provaram que os três testes podem falhar (resultado informado pelo orquestrador; não verifiquei se as mutações estão registradas em algum arquivo).

Estados: IMPLEMENTADO (com a divergência 1), TESTADO (resultados acima), VALIDADO apenas para a semana 5 (OpenSpec e TLC). A spec da semana 6 não tem validador automático. VERIFICADO: não houve QA independente sobre o estado atual.

## Limitações
- Sem pagamento parcial: a spec e a UI divergem (divergência 1).
- O cenário CB-03 pela interface depende de um rascunho de checkout semeado pelo teste; sem expiração de sessão real nesse caminho.
- Política de "tempo máximo em andamento", estorno, suporte e e-mail estão fora de escopo (Research, Limites). Dúvidas abertas do Research (duas abas, aviso x escolha em conflito, nova tentativa após recusa) continuam abertas.
- Os custos e frequências do Research são hipóteses.
- Os testes de regressão visual só têm baselines win32; o CI (`.github/workflows/ci.yml`) roda `--grep-invert @visual` e ainda NÃO rodou no GitHub.
- Sem deploy, sem PR, sem commit nem push; fidelidade ao Figma e auditoria axe pendentes (`docs/qa/known-gaps.md`).
