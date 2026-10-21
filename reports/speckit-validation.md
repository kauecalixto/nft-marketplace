# Validação speckit — feature 001-quantity-limit

Data: 2026-10-21. Sem branch, commit ou push. `SPECIFY_FEATURE=001-quantity-limit` e `.specify/feature.json` apontando para `specs/001-quantity-limit`. Nenhum hook (`.specify/extensions.yml` não existe).

## Skills executadas, em ordem
1. `speckit-specify` -> spec.md, checklists/requirements.md (checklist preenchido por leitura do autor, sem validador automático). Diretório criado manualmente seguindo o passo 3 da skill; o script create-new-feature.ps1 não foi usado.
2. `speckit-plan` -> `setup-plan.ps1 -Json` rodou (copiou o template); plan.md, research.md, data-model.md, contracts/, quickstart.md preenchidos.
3. `speckit-tasks` -> `setup-tasks.ps1 -Json` rodou; tasks.md com 13 tarefas.
4. `speckit-analyze` -> `check-prerequisites.ps1 -RequireSpec -RequireTasks -IncludeTasks` rodou com sucesso; análise somente leitura.

Observação: o fluxo da constituição inclui `speckit-clarify`, que não foi executado (fora do escopo pedido).
Testes Playwright NÃO foram executados nesta tarefa.

## Resultado do speckit-analyze (inconsistências encontradas)
| ID | Sev. | Local | Achado |
|---|---|---|---|
| F1 | MEDIUM | spec.md vs src/catalog/NftDetailPage.tsx | O código exibe "Sem cota para esta carteira" (limite por carteira com available > 0 e limite 0). A spec não cobre esse estado; só "Edição indisponível". Requisito faltando ou código além da spec. |
| F2 | MEDIUM | spec.md US2 / EARS-04 | A spec diz "edição indisponível" quando limite efetivo é 0; o código distingue available <= 0 de cota de carteira zerada. Ambiguidade. |
| C1 | MEDIUM | constituição I vs CLAUDE.md | A constituição aponta `docs/ENUNCIADO.md` como fonte; CLAUDE.md exige rastrear para o README. FR-006 e o doc manual citam seções do enunciado; a spec do speckit não confere com o README. Não resolvido. |
| C2 | LOW | constituição IV / tasks.md | Tarefas de teste T005-T010 existem como arquivos, mas sem execução registrada; T012 aberta. Corretamente não marcadas como passadas. |
| U1 | LOW | tasks.md T011 | Confirmação de "NFT não encontrado" ficou aberta na tarefa, mas o texto existe em NftDetailPage.tsx:19 (verificado depois). T011 pode ser marcada. |
| U2 | LOW | spec.md Assumptions | `walletLimit` não está no enunciado (dúvida do Research); spec o chama de "limite por carteira". Terminologia consistente com o ADR, mas dúvida segue aberta. |
| D1 | LOW | spec.md SC-001..004 | Critérios de sucesso pouco quantitativos (contagens de cenários), sem métrica de usuário real. |

Cobertura: FR-001..FR-005 têm >= 1 tarefa (US1: T005-T007; US2: T008-T009; US3: T010-T011); FR-006 sem tarefa dedicada. Tarefas sem requisito: T001-T004 (infra) e T013. Total: 6 requisitos, 13 tarefas, 0 CRITICAL, 0 HIGH, 3 MEDIUM, 4 LOW.
Nenhum arquivo foi editado pela análise; as correções acima NÃO foram aplicadas.
