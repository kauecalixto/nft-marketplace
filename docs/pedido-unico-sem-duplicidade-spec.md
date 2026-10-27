# Spec — Pedido único sem duplicidade

## Objetivo e bounded context

Garantir que o colecionador pague uma única vez por tentativa, recupere o pedido após refresh ou reconexão, veja a confirmação só quando o pedido foi confirmado e tenha o carrinho ajustado corretamente. Bounded context: **Compra** (`src/purchase/`). Termos: Carrinho, Cotação, Pedido (ver GLOSSARIO.md). Decisão arquitetural: `docs/adr/0001-pedido-unico-sem-duplicidade.md`.

## Origem

| Requisito | R-xx do Research | Seção do enunciado |
| --- | --- | --- |
| EARS-01 | R-01, R-06 | §3 Pagamento e confirmação (1º item); §5 (chave de idempotência) |
| EARS-02 | R-02, R-07 | §3 Pagamento e confirmação (2º item); §7 (interrupção com pedido pendente) |
| EARS-03 | R-03, R-05 | §3 Pagamento e confirmação (3º e 4º itens) |
| EARS-04 | R-02, R-08 | §7 (`order.updated`, pedidos terminais) |
| EARS-05 | R-06 | §5 (chave com conteúdo diferente gera conflito) |

## Escopo

**Incluído**
- Criação idempotente do pedido, uma chave por tentativa, e conflito para conteúdo diferente.
- Estados pendente, confirmado e recusado, recuperação após refresh ou reconexão, e atualização por `order.updated`.
- Exibição da confirmação apenas para pedido confirmado e remoção do carrinho só dos itens e quantidades comprados.

**Fora de escopo**
- Estorno, recuperação de valores cobrados, suporte e e-mail (Research, Limites).
- Tempo máximo em andamento antes de recusar (Research, Limites).
- Mudança de preço ou disponibilidade durante a compra (dúvida aberta do Research).
- Sincronização entre abas ou aparelhos (dúvida aberta do Research).
- Preservação dos itens do carrinho em recusa ou falha (R-04, §3 4º item): reconhecida como requisito do Research, mas não entra nesta iteração dos cinco critérios; fica para a próxima spec do contexto Compra.
- Vendedores e demais jornadas; carteiras, pagamentos e blockchain reais.

## Pressupostos e dúvidas

- Pressuposto: o colecionador paga por parte do carrinho (os itens e quantidades da tentativa), e o restante permanece no carrinho; isto decorre de "remover do carrinho apenas os itens e quantidades comprados" (§3).
- Pressuposto: o resultado da simulação é determinístico por cenário MSW.
- Dúvida: o colecionador espera aviso, a compra antiga ou escolha ao reutilizar a tentativa com itens diferentes? Esta spec adota o aviso de conflito.
- Dúvida: quanto tempo se tolera "em andamento" antes de tentar de novo?
- Dúvida: o mesmo pedido deve aparecer em duas abas ou outro aparelho?
- Dúvida: após recusa, tentar de novo com um clique ou revisar o carrinho?
- Os números de custo e frequência do Research são hipóteses (R-09), não requisitos.

## Critérios EARS

| ID | Padrão | Critério verificável | Frase do RESEARCH.md de onde veio | Seção do enunciado | Verificação |
| --- | --- | --- | --- | --- | --- |
| EARS-01 | Ubiquitous | O sistema de compra deve devolver o mesmo pedido, sem criar outro, para qualquer reenvio da mesma tentativa de pagamento com o mesmo conteúdo. | "Tentar repetir a mesma tentativa traz de volta a mesma compra" e "nunca resulta em pagar duas vezes" | §3 Pagamento e confirmação; §5 | CB-01 (Playwright, handlers MSW) |
| EARS-02 | State-driven | Enquanto o pedido estiver pendente, o sistema de compra deve apresentar o mesmo pedido pendente após recarregar a página ou reconectar, sem criar outro pedido e sem exibir a confirmação. | "ao voltar ele encontra a mesma compra no mesmo ponto, sem precisar pagar outra vez" | §3 Pagamento e confirmação; §7 | CB-02 |
| EARS-03 | Event-driven | Quando o pedido passar a confirmado, o sistema de compra deve exibir a confirmação e remover do carrinho apenas os itens e as quantidades comprados. | "Ele só vê a mensagem de compra confirmada quando a compra foi de fato aceita" e "saem do carrinho apenas os itens, e nas quantidades, que ele comprou" | §3 Pagamento e confirmação; §6 (pagamento confirmado) | CB-02 |
| EARS-04 | Optional feature | Onde o evento `order.updated` estiver disponível, o sistema de compra deve apresentar o resultado do pedido (confirmado ou recusado) ao recebê-lo e manter definitivo o estado terminal, sem voltá-lo a pendente por evento duplicado ou antigo. | "Compra aceita ou recusada é definitiva: não muda de resultado depois, nem reaparece como pendente" | §7 (`order.updated`, pedidos terminais) | CB-02 (via cliente Socket.IO) |
| EARS-05 | Unwanted behavior | Se a mesma tentativa de pagamento for reutilizada com itens diferentes, então o sistema de compra deve rejeitá-la como conflito, avisar o colecionador e não criar nem alterar nenhum pedido. | "é tratado como conflito e avisado, em vez de criar uma compra nova em silêncio" | §5 | CB-03 |

## Cenários BDD

```gherkin
# language: pt
Funcionalidade: Pedido único sem duplicidade na compra

  # ID: CB-01 | Cobre: EARS-01
  Cenário: Cliques repetidos na mesma tentativa geram um único pedido
    Dado que o colecionador está autenticado
    E que o carrinho tem 2 unidades do NFT "Aurora 12" a 0,50 ETH cada
    E que o carrinho tem 1 unidade do NFT "Brisa 07" a 0,30 ETH, que não será comprada
    Quando ele envia o pagamento de 2 unidades de "Aurora 12" três vezes seguidas na mesma tentativa
    Então existe exatamente 1 pedido de 1,00 ETH para essa tentativa
    E as três respostas se referem ao mesmo pedido

  # ID: CB-02 | Cobre: EARS-02, EARS-03, EARS-04
  Cenário: Pedido pendente é recuperado após recarregar e só a compra confirmada altera o carrinho
    Dado que o colecionador está autenticado
    E que o carrinho tem 2 unidades do NFT "Aurora 12" a 0,50 ETH cada e 1 unidade do NFT "Brisa 07" a 0,30 ETH
    E que ele enviou o pagamento de 2 unidades de "Aurora 12" e o pedido de 1,00 ETH está pendente
    Quando a conexão é interrompida e a página é recarregada
    Então ele vê o mesmo pedido de 1,00 ETH pendente
    E continua existindo exatamente 1 pedido
    E nenhuma confirmação de compra é exibida
    Quando o pedido passa a confirmado
    Então a confirmação mostra 2 unidades de "Aurora 12" e o total de 1,00 ETH
    E o carrinho contém somente 1 unidade de "Brisa 07"
    Quando chega uma atualização antiga informando o mesmo pedido como pendente
    Então o pedido continua confirmado

  # ID: CB-03 | Cobre: EARS-05 (cenário de erro/limite)
  Cenário: Reutilizar a tentativa com itens diferentes é tratado como conflito
    Dado que o colecionador está autenticado
    E que ele enviou o pagamento de 2 unidades de "Aurora 12" a 0,50 ETH cada, gerando 1 pedido de 1,00 ETH
    Quando ele reenvia a mesma tentativa incluindo 1 unidade de "Brisa 07" a 0,30 ETH
    Então ele é avisado de que a tentativa já foi usada com outro conteúdo
    E continua existindo exatamente 1 pedido, de 1,00 ETH, sem a unidade de "Brisa 07"
```

## Mapa de testes

Os testes Playwright previstos passam pelos handlers MSW (REST) e pelo cliente Socket.IO (eventos), sem simular eventos diretamente na interface (§6, §9).

| Cenário | EARS cobertos | Teste Playwright previsto |
| --- | --- | --- |
| CB-01 | EARS-01 | `test('Cliques repetidos na mesma tentativa geram um único pedido')` |
| CB-02 | EARS-02, EARS-03, EARS-04 | `test('Pedido pendente é recuperado após recarregar e só a compra confirmada altera o carrinho')` |
| CB-03 | EARS-05 | `test('Reutilizar a tentativa com itens diferentes é tratado como conflito')` |
