# Feature Specification: Limite de quantidade por edição no detalhe do NFT

**Feature Branch**: `001-quantity-limit` (nome lógico; nenhum branch git criado)
**Created**: 2026-10-21
**Status**: Draft (feature já implementada; spec derivada dos artefatos existentes)
**Input**: "limite de quantidade por edição no detalhe do NFT" (fontes: docs/semana-5-quantity-limit/quantity-limit-spec.md, docs/semana-5-quantity-limit/ADR-0001-limite-quantidade-edicao.md, RESEARCH.md R-01..R-05, GLOSSARIO.md, constituição)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher quantidade até o limite da edição (Priority: P1)

O colecionador abre o detalhe de um NFT com edição disponível e aumenta a quantidade; ao atingir o limite, o aumento é bloqueado e um texto explica o motivo.

**Why this priority**: Evita o erro tardio de pedir mais unidades do que a edição permite (dor do Research, R-01).

**Independent Test**: Abrir o detalhe, clicar em aumentar até o limite e verificar controle desabilitado e mensagem.

**Acceptance Scenarios**:

1. **Given** um NFT com edição disponível, **When** o usuário abre o detalhe, **Then** a quantidade inicial é 1 e diminuir não a altera (R-04).
2. **Given** um NFT com edição disponível, **When** aumenta a quantidade até o limite, **Then** o botão de aumentar fica desabilitado e "Limite de quantidade atingido" é exibido (R-01).

---

### User Story 2 - Edição indisponível (Priority: P2)

**Why this priority**: Caso de limite tratado explicitamente (R-02, R-05).

**Independent Test**: Abrir um NFT sem disponibilidade.

**Acceptance Scenarios**:

1. **Given** um NFT sem disponibilidade, **When** a página carrega, **Then** "Edição indisponível" é exibido e "Adicionar ao carrinho" fica desabilitado.

---

### User Story 3 - NFT inexistente (Priority: P3)

**Why this priority**: Caso de erro tratado (R-03).

**Independent Test**: Acesso direto a identificador inexistente.

**Acceptance Scenarios**:

1. **Given** um identificador inexistente, **When** a página carrega, **Then** "NFT não encontrado" é exibido e o seletor de quantidade não aparece.

---

### Edge Cases

- Quantidade inicial 1 e tentativa de diminuir: permanece 1.
- Limite efetivo é o menor entre disponibilidade da edição e limite por carteira.
- Disponibilidade que muda durante a navegação: fora do escopo (eventos de atualização).
- Quantidade já presente no carrinho: fora do escopo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001** (EARS-01): O seletor MUST aceitar apenas inteiros >= 1.
- **FR-002** (EARS-02): Ao aumentar, o sistema MUST incrementar em 1 até o limite efetivo = min(disponibilidade da edição, limite por carteira).
- **FR-003** (EARS-03): Ao atingir o limite, o sistema MUST desabilitar o aumento e exibir "Limite de quantidade atingido".
- **FR-004** (EARS-04): Com edição indisponível, o sistema MUST exibir "Edição indisponível" e desabilitar "Adicionar ao carrinho".
- **FR-005** (EARS-05): Com identificador inexistente, o sistema MUST exibir "NFT não encontrado" no lugar do seletor.
- **FR-006**: Cada requisito MUST apontar para a seção do enunciado (§3 Catálogo e detalhe; §3 Carrinho).

### Key Entities

- **Edição**: conjunto de unidades de um NFT; atributo de disponibilidade.
- **Limite por carteira**: máximo por colecionador (nome definido pelo ADR 0001; não consta no enunciado).
- **Quantidade escolhida**: inteiro >= 1.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos 3 cenários (limite, indisponível, inexistente) têm resultado observável e verificável.
- **SC-002**: O usuário nunca consegue escolher quantidade acima do limite efetivo na tela de detalhe.
- **SC-003**: Todo estado de bloqueio é explicado por texto visível (não apenas cor).
- **SC-004**: 5 de 5 requisitos rastreiam para uma seção do enunciado.

## Assumptions

- Limite por carteira e disponibilidade vêm da API (ADR 0001); o nome do campo é decisão do ADR, não do enunciado.
- Pagamento, cupom, eventos de atualização e quantidade já no carrinho estão fora do escopo.
- Contexto de domínio: Catálogo.
- Feature já implementada; esta spec é retroativa e não valida a implementação.
