# Tasks

## 1. Seletor de quantidade e limite

- [ ] 1.1 Garantir quantidade inicial 1, mínimo 1 e incremento de 1 no detalhe do NFT; verificar com teste Playwright do cenário de aumento
- [ ] 1.2 Desabilitar o aumento no limite `min(edition.available, walletLimit)` e exibir "Limite de quantidade atingido"; verificar com o cenário "Aumentar a quantidade até o limite da edição"

## 2. Estados de borda

- [ ] 2.1 Exibir "Edição indisponível" e desabilitar "Adicionar ao carrinho" quando `edition.available` for 0; verificar com o cenário "Edição indisponível (limite)"
- [ ] 2.2 Exibir "NFT não encontrado" sem seletor para identificador inexistente; verificar com o cenário "NFT inexistente (erro)"

## Workflow follow-up

- Cada tarefa já existe implementada ou não conforme a auditoria do código; esta change é de especificação e não altera `src/` nem `tests/`.
