# Spec Delta

## Purpose

Define o limite de quantidade que o colecionador pode escolher no detalhe do NFT, conforme a Edição, e o comportamento para Edição indisponível e NFT inexistente (contexto Catálogo).

## ADDED Requirements

### Requirement: Quantidade inteira mínima 1
O seletor de quantidade SHALL aceitar apenas inteiros maiores ou iguais a 1 (§3 Carrinho).

#### Scenario: Valor inicial e mínimo
- **WHEN** o colecionador abre o detalhe de um NFT com Edição disponível e tenta diminuir a quantidade
- **THEN** a quantidade inicial é 1 e diminuir não a altera

### Requirement: Aumento até o limite da Edição
Quando o colecionador aumentar a quantidade, o sistema SHALL incrementá-la em 1 até o limite da Edição, definido como `min(edition.available, walletLimit)` (§3 Catálogo e detalhe; campos conforme ADR 0001).

#### Scenario: Aumentar a quantidade até o limite da edição
- **WHEN** o colecionador abre o detalhe de um NFT com edição disponível e aumenta a quantidade até o limite da edição
- **THEN** o botão de aumentar fica desabilitado
- **AND** a mensagem "Limite de quantidade atingido" é exibida

### Requirement: Mensagem de limite atingido
Se a quantidade atingir o limite, o sistema SHALL desabilitar o aumento e exibir o texto "Limite de quantidade atingido" (§3 Catálogo e detalhe).

#### Scenario: Limite atingido
- **WHEN** a quantidade escolhida é igual ao limite da Edição
- **THEN** o botão de aumentar está desabilitado e o texto "Limite de quantidade atingido" está visível

### Requirement: Edição indisponível
Enquanto a Edição estiver indisponível (`edition.available` igual a 0), o sistema SHALL exibir "Edição indisponível" e desabilitar "Adicionar ao carrinho" (§3 Catálogo e detalhe; §3 Carrinho).

#### Scenario: Edição indisponível (limite)
- **WHEN** o colecionador abre o detalhe de um NFT sem disponibilidade e a página termina de carregar
- **THEN** "Edição indisponível" é exibido
- **AND** o botão "Adicionar ao carrinho" fica desabilitado

### Requirement: NFT inexistente
Se o identificador do NFT não existir, o sistema SHALL exibir "NFT não encontrado" em vez do seletor de quantidade (§3 Catálogo e detalhe).

#### Scenario: NFT inexistente (erro)
- **WHEN** o colecionador acessa diretamente o detalhe de um identificador inexistente e a página termina de carregar
- **THEN** "NFT não encontrado" é exibido
- **AND** o seletor de quantidade não é exibido
