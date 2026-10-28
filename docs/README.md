# Índice da documentação

Caminhos relativos à raiz do projeto, salvo indicação. Visão geral e comandos: [`../README.md`](../README.md).

## Enunciado
| Documento | Conteúdo |
| --- | --- |
| [`ENUNCIADO.md`](ENUNCIADO.md) | Texto do desafio (seções 1 a 12), fonte de todos os requisitos |
| [`../GLOSSARIO.md`](../GLOSSARIO.md) | Dois bounded contexts (Catálogo, Compra), termos e o termo "Edição" com dois sentidos |

## Arquitetura e contratos
| Documento | Conteúdo |
| --- | --- |
| [`../ARCHITECTURE.md`](../ARCHITECTURE.md) | Estrutura de `src/`, sessão, carrinho, cache, retry, idempotência, reconciliação REST e Socket.IO, limitações, desvio do Figma |
| [`CONTRACTS.md`](CONTRACTS.md) | Contratos REST e Socket.IO como implementados nos mocks, incluindo endpoints `/api/__mock/*` |
| [`architecture/bounded-contexts.md`](architecture/bounded-contexts.md) | Contextos e pastas |

## QA e testes
| Documento | Conteúdo |
| --- | --- |
| [`requirements/requirements-matrix.md`](requirements/requirements-matrix.md) | Matriz de requisitos (REQ-01 a REQ-84) |
| [`qa/known-gaps.md`](qa/known-gaps.md) | Lacunas conhecidas e última execução completa |
| [`testing/test-strategy.md`](testing/test-strategy.md) | Estratégia e arquivos de teste. Ressalva: texto anterior às últimas mudanças (por exemplo, diz que não há script para o teste unitário, mas `npm run test:unit` existe) |

## Semana 5: limite de quantidade por edição (Catálogo)
| Documento | Conteúdo |
| --- | --- |
| [`semana-5-quantity-limit/RESEARCH.md`](semana-5-quantity-limit/RESEARCH.md) | Research da semana 5 |
| [`semana-5-quantity-limit/ADR-0001-limite-quantidade-edicao.md`](semana-5-quantity-limit/ADR-0001-limite-quantidade-edicao.md) | ADR |
| [`semana-5-quantity-limit/quantity-limit-spec.md`](semana-5-quantity-limit/quantity-limit-spec.md) | Spec manual (5 EARS, 3 BDD) |
| [`semana-5-quantity-limit/REVIEW-semana5.md`](semana-5-quantity-limit/REVIEW-semana5.md) | Review da semana 5 (antigo `REVIEW.md`) |
| [`semana-5-quantity-limit/DIFERENCAS-speckit.md`](semana-5-quantity-limit/DIFERENCAS-speckit.md) | Diferenças registradas na rodada com speckit |
| [`../openspec/changes/limite-quantidade-edicao/`](../openspec/changes/limite-quantidade-edicao/) | Change OpenSpec (`openspec validate limite-quantidade-edicao --strict`) |
| [`../.specs/features/quantity-limit/spec.md`](../.specs/features/quantity-limit/spec.md) | Spec TLC (`validate_spec.py`) |
| [`../DIFERENCAS.md`](../DIFERENCAS.md) | Diferenças e comparação OpenSpec x TLC |
| [`../specs/001-quantity-limit/`](../specs/001-quantity-limit/) | Artefatos speckit da mesma feature |

## Semana 6: pedido único sem duplicidade (Compra)
| Documento | Conteúdo |
| --- | --- |
| [`../RESEARCH.md`](../RESEARCH.md) | Research (dor, resultado esperado, rastreabilidade R-01 a R-09) |
| [`adr/0001-pedido-unico-sem-duplicidade.md`](adr/0001-pedido-unico-sem-duplicidade.md) | ADR |
| [`pedido-unico-sem-duplicidade-spec.md`](pedido-unico-sem-duplicidade-spec.md) | Spec (EARS-01 a 05, BDD CB-01 a CB-03) |
| [`../tests/e2e/pedido-unico.spec.ts`](../tests/e2e/pedido-unico.spec.ts) | Testes Playwright dos três cenários |
| [`../REVIEW.md`](../REVIEW.md) | Review: divergências entre spec e implementação, evidência, limitações |

## Specs de trabalho
| Documento | Conteúdo |
| --- | --- |

## Reports
| Documento | Conteúdo |
| --- | --- |
| [`../reports/qa-report.md`](../reports/qa-report.md) | QA independente (rodada 4, anterior às últimas mudanças de UI) |
| [`../reports/challenge-validation.md`](../reports/challenge-validation.md) | Validação do desafio |
| [`../reports/speckit-validation.md`](../reports/speckit-validation.md) | Análise de consistência do speckit |
| [`../reports/lighthouse/README.md`](../reports/lighthouse/README.md) | Medianas do Lighthouse e causas |
