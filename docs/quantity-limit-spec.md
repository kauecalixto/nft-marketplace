# Feature Spec — quantity-limit

## Objetivo e bounded context
Limitar a quantidade escolhida no detalhe do NFT pela edição. Contexto: Catálogo (`src/catalog/`).

## Origem no Research e README
| Requisito | Research | Seção |
|---|---|---|
| Limite de quantidade | R-01 | §3 Catálogo e detalhe |
| Edição indisponível | R-02 | §3 Catálogo e detalhe |
| NFT inexistente | R-03 | §3 Catálogo e detalhe |
| Quantidade inteira | R-04 | §3 Carrinho |
| Respeitar disponibilidade ao adicionar | R-05 | §3 Carrinho |

## Escopo
### Incluído
Seletor de quantidade, mensagem de limite, edição indisponível, NFT inexistente, adicionar ao carrinho.
### Fora de escopo
Pagamento, cupom, eventos `nft.updated`, quantidade já presente no carrinho.
### Pressupostos / dúvidas
Campos `edition.available` e `walletLimit` definidos no ADR 0001 (não estão no enunciado). Ver dúvidas do Research.

## Critérios EARS
| ID | Padrão | Critério verificável | Origem Research | Origem README | Verificação |
|---|---|---|---|---|---|
| EARS-01 | Ubiquitous | O seletor de quantidade deve aceitar apenas inteiros maiores ou iguais a 1. | R-04 | §3 Carrinho | Playwright: valor inicial 1; diminuir em 1 não altera |
| EARS-02 | Event-driven | Quando o usuário aumentar a quantidade, o sistema deve incrementá-la em 1 até o limite `min(edition.available, walletLimit)`. | R-01 | §3 Catálogo e detalhe | Playwright: cliques até o limite |
| EARS-03 | Unwanted behavior | Se a quantidade atingir o limite, então o sistema deve desabilitar o aumento e exibir o texto "Limite de quantidade atingido". | R-01 | §3 Catálogo e detalhe | Playwright: botão desabilitado e mensagem visível |
| EARS-04 | State-driven | Enquanto a edição estiver indisponível (`edition.available` = 0), o sistema deve exibir "Edição indisponível" e desabilitar "Adicionar ao carrinho". | R-02, R-05 | §3 Catálogo e detalhe; §3 Carrinho | Playwright: NFT sem disponibilidade |
| EARS-05 | Unwanted behavior | Se o identificador do NFT não existir, então o sistema deve exibir "NFT não encontrado" em vez do seletor. | R-03 | §3 Catálogo e detalhe | Playwright: id inexistente em acesso direto |

## Cenários BDD
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
