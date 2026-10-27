# Limite de quantidade por edição Specification

**Approved**: pendente (aprovação humana não dada; não escrita por este agente)

## Problem Statement

No detalhe do NFT (contexto Catálogo, `src/catalog/`), o colecionador pode escolher mais unidades do que a Edição permite e só descobriria o erro depois, no carrinho. O enunciado exige que o detalhe suporte "NFT inexistente, edição indisponível e limite de quantidade" (docs/ENUNCIADO.md §3 "Catálogo e detalhe"; §3 "Carrinho": respeitar a disponibilidade por NFT e edição).

## Goals

- [ ] O colecionador nunca consegue selecionar, no detalhe, quantidade acima do limite da Edição.
- [ ] Edição indisponível e NFT inexistente têm mensagem em texto e nenhuma ação de compra possível.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Pagamento e cupom | Contexto Compra (§3 Pagamento e confirmação) |
| Eventos `nft.updated` | Reconciliação em tempo real é outra feature (§7) |
| Quantidade já presente no carrinho | Contexto Compra (§3 Carrinho) |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Nomes dos campos da API | `edition.available` e `walletLimit` | O enunciado não os define; vêm do ADR 0001 da spec manual (docs/semana-5-quantity-limit/) | n |
| Limite efetivo | `min(edition.available, walletLimit)` | Decisão do ADR 0001, não do enunciado | n |
| Origem dos cenários | Os 3 cenários Gherkin vieram da spec manual já existente | Entrada fornecida; não foram escritos por este agente | y |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: Limitar a quantidade pela Edição ⭐ MVP

**User Story**: Como colecionador, quero que o seletor de quantidade respeite o limite da Edição para não pedir mais do que existe.

**Why P1**: É o núcleo do requisito de limite de quantidade (§3 Catálogo e detalhe).

**Acceptance Criteria** (each line is one EARS pattern):

1. The system SHALL aceitar no seletor de quantidade apenas inteiros maiores ou iguais a 1 (§3 Carrinho).  <!-- ubiquitous -->
2. WHEN o colecionador aumentar a quantidade THEN system SHALL incrementá-la em 1 até o limite `min(edition.available, walletLimit)` (§3 Catálogo e detalhe).  <!-- event-driven -->
3. IF a quantidade atingir o limite THEN system SHALL desabilitar o aumento e exibir o texto "Limite de quantidade atingido" (§3 Catálogo e detalhe).  <!-- unwanted-behavior -->

**Independent Test**: Abrir o detalhe de um NFT com edição disponível, aumentar até o limite e ver o botão de aumentar desabilitado e a mensagem.

---

### P1: Edição indisponível e NFT inexistente ⭐ MVP

**User Story**: Como colecionador, quero uma mensagem clara quando a edição está indisponível ou o NFT não existe.

**Why P1**: Ambos os estados são exigidos pelo detalhe (§3 Catálogo e detalhe).

**Acceptance Criteria**:

1. WHILE a edição estiver indisponível (`edition.available` igual a 0) the system SHALL exibir "Edição indisponível" e desabilitar "Adicionar ao carrinho" (§3 Catálogo e detalhe; §3 Carrinho).  <!-- state-driven -->
2. IF o identificador do NFT não existir THEN system SHALL exibir "NFT não encontrado" em vez do seletor de quantidade (§3 Catálogo e detalhe).  <!-- unwanted-behavior -->

**Independent Test**: Abrir o detalhe de um NFT sem disponibilidade e de um identificador inexistente por acesso direto.

---

## Edge Cases

- WHEN a quantidade for 1 e o colecionador tentar diminuir THEN system SHALL manter a quantidade em 1.
- WHEN o limite efetivo for 1 THEN system SHALL exibir "Limite de quantidade atingido" já na quantidade inicial.

---

## Cenários de aceitação (Gherkin, vindos da spec manual)

```gherkin
Funcionalidade: Limite de quantidade por edição

  Cenário: Aumentar a quantidade até o limite da edição
    Dado que o colecionador abre o detalhe de um NFT com edição disponível
    Quando ele aumenta a quantidade até o limite da edição
    Então o botão de aumentar fica desabilitado
    E a mensagem "Limite de quantidade atingido" é exibida

  Cenário: Edição indisponível (limite)
    Dado que o colecionador abre o detalhe de um NFT sem disponibilidade
    Quando a página termina de carregar
    Então "Edição indisponível" é exibido
    E o botão "Adicionar ao carrinho" fica desabilitado

  Cenário: NFT inexistente (erro)
    Dado que o colecionador acessa diretamente o detalhe de um identificador inexistente
    Quando a página termina de carregar
    Então "NFT não encontrado" é exibido
    E o seletor de quantidade não é exibido
```

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| QTY-01 | P1: Limitar a quantidade pela Edição | - | Pending |
| QTY-02 | P1: Limitar a quantidade pela Edição | - | Pending |
| QTY-03 | P1: Limitar a quantidade pela Edição | - | Pending |
| QTY-04 | P1: Edição indisponível e NFT inexistente | - | Pending |
| QTY-05 | P1: Edição indisponível e NFT inexistente | - | Pending |

**Coverage:** 5 total, 0 mapped to tasks, 5 unmapped

---

## Sources

- docs/ENUNCIADO.md §3 "Catálogo e detalhe" e "Carrinho" - define os estados do detalhe e a disponibilidade por NFT e edição.
- docs/semana-5-quantity-limit/quantity-limit-spec.md - spec manual com EARS e os 3 cenários Gherkin (entrada).
- docs/semana-5-quantity-limit/ADR-0001-limite-quantidade-edicao.md - nomes de campos e limite efetivo.

---

## Success Criteria

- [ ] Os 3 cenários Gherkin passam como testes Playwright.
- [ ] Nenhuma quantidade acima do limite da Edição pode ser selecionada no detalhe.
