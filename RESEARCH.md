# RESEARCH — Compra sem pagar duas vezes e sem ficar no escuro

## Fonte

**Seção 3, "Pagamento e confirmação" (escala M):**

> - Impedir pedidos duplicados em cliques repetidos ou reenvios após timeout.
> - Representar pedido pendente, confirmado e recusado, com recuperação após refresh ou reconexão.
> - Exibir a confirmação somente para pedido efetivamente confirmado na simulação.
> - Preservar os itens em falhas; após confirmação, remover do carrinho apenas os itens e quantidades comprados.

**Seção 5 (complemento):**

> Na simulação, a mesma tentativa deve recuperar o mesmo pedido; reutilizar a [identificação da tentativa] com conteúdo diferente deve gerar conflito.

**Seção 7 (complemento):**

> Também deve funcionar uma interrupção de conexão enquanto o pedido está pendente. Após reconectar ou recarregar a página, o usuário deve recuperar seu estado sem criar outra compra. Pedidos confirmados ou recusados são terminais.

## Dor

**Quem sente:** o colecionador que está comprando um ou mais itens no marketplace e precisa pagar para ficar com eles.

**Quando:** no momento de pagar. É o ponto em que ele já decidiu, já tem o carrinho montado e está sob alguma pressão (item raro, preço que muda, poucas unidades). É também quando a conexão oscila, a página demora a responder ou ele fecha e reabre a aba sem saber o que aconteceu.

**Objetivo:** pagar uma única vez, saber com certeza se a compra deu certo e, se não deu, continuar com o carrinho intacto para tentar de novo.

**Falha/risco:**
- Ele clica em "pagar" de novo porque nada parece acontecer, ou envia outra vez depois de uma demora, e acaba pagando duas vezes pelo mesmo item.
- A tela fica esperando e ele não sabe se comprou: a compra ficou travada, sem resposta, sem como conferir.
- Ele recarrega a página ou perde a conexão no meio do pagamento e volta para uma tela vazia ou um carrinho como se nada tivesse acontecido, sem saber se pagou.
- Aparece uma mensagem de "compra confirmada" sem que a compra tenha de fato sido aceita, e ele acredita que o item é dele.
- Dá algo errado no pagamento e o carrinho some, obrigando-o a montar tudo de novo; ou a compra dá certo e itens que ele não comprou somem junto.

**Consequência/custo** (todos os números abaixo são hipóteses a validar com colecionadores reais, não fatos medidos):
- Pagar duas vezes: hipótese de que, em cerca de 1 a 3 a cada 100 compras com internet instável, o colecionador pague em duplicidade. Cada ocorrência custaria o valor de um item inteiro, de dezenas a milhares de reais, preso até um estorno que pode levar dias.
- Não saber se comprou: hipótese de 5 a 15 minutos de angústia e conferência por ocorrência, além de contato com o suporte, e de que uma parcela relevante dessas pessoas desista da compra ou do marketplace.
- Perder a vez: em itens raros ou de unidade única, ficar sem saber se comprou pode significar perder o item para outro colecionador, uma perda que não se recupera com dinheiro de volta.
- Refazer o carrinho: hipótese de 2 a 5 minutos por ocorrência para remontar uma compra com vários itens, com risco de errar quantidades.
- Perda de confiança: hipótese de que quem sofre uma cobrança em duplicidade ou uma confirmação falsa raramente volte a comprar na plataforma.

## Resultado esperado

Do ponto de vista do colecionador, ao pagar:

- Clicar várias vezes em "pagar", ou tentar de novo depois de uma demora, nunca resulta em pagar duas vezes: ele continua com uma única compra.
- Logo após pagar, ele vê com clareza que a compra está em andamento, e depois vê um de três resultados: em andamento, aceita ou recusada.
- Se a conexão cair ou ele recarregar a página enquanto a compra está em andamento, ao voltar ele encontra a mesma compra no mesmo ponto, sem precisar pagar outra vez.
- Ele só vê a mensagem de compra confirmada quando a compra foi de fato aceita.
- Se a compra for recusada ou falhar, os itens continuam no carrinho do jeito que estavam.
- Se a compra for aceita, saem do carrinho apenas os itens, e nas quantidades, que ele comprou; o que sobrou continua lá.
- Compra aceita ou recusada é definitiva: não muda de resultado depois, nem reaparece como pendente.
- Tentar repetir a mesma tentativa traz de volta a mesma compra; tentar reaproveitar uma tentativa anterior com itens diferentes é tratado como conflito e avisado, em vez de criar uma compra nova em silêncio.

**Limites:**
- Trata-se apenas de uma simulação de pagamento; não há dinheiro, carteira ou compra real envolvidos.
- Fica de fora a recuperação de valores já cobrados, o estorno, o suporte e qualquer comunicação por e-mail.
- Fica de fora a decisão sobre quanto tempo uma compra pode permanecer em andamento antes de ser considerada recusada.
- Só vale para o colecionador que está comprando; vendedores e outras jornadas não fazem parte desta pesquisa.

**Dúvidas abertas:**
- Quantas pessoas realmente pagam duas vezes ou ficam sem saber se compraram? Os números acima são hipóteses.
- Quanto tempo o colecionador tolera ver "em andamento" antes de achar que algo deu errado e tentar de novo?
- Se ele abrir a loja em duas abas ou em outro aparelho, deve ver a mesma compra em andamento?
- O que o colecionador espera ver quando tenta repetir uma tentativa com itens diferentes: um aviso, a compra antiga, ou a escolha entre as duas?
- Depois de uma compra recusada, ele quer tentar de novo com um clique ou prefere revisar o carrinho primeiro?
- Se o preço ou a disponibilidade de um item mudar durante a compra, isso deve levar à recusa total ou parcial? O enunciado não diz.

## Rastreabilidade

| ID | Afirmação | Seção do enunciado |
|----|-----------|--------------------|
| R-01 | Cliques repetidos ou reenvios após demora não podem gerar compras duplicadas | Seção 3, Pagamento e confirmação, 1º item |
| R-02 | A compra pode estar em andamento, aceita ou recusada, e o estado é recuperado após recarregar ou reconectar | Seção 3, Pagamento e confirmação, 2º item |
| R-03 | A confirmação só aparece para compra efetivamente aceita na simulação | Seção 3, Pagamento e confirmação, 3º item |
| R-04 | Em falha, os itens são preservados no carrinho | Seção 3, Pagamento e confirmação, 4º item |
| R-05 | Após aceita, saem do carrinho só os itens e quantidades comprados | Seção 3, Pagamento e confirmação, 4º item |
| R-06 | Repetir a mesma tentativa traz a mesma compra; reaproveitar a tentativa com conteúdo diferente é conflito | Seção 5 |
| R-07 | Queda de conexão com compra em andamento deve ser suportada, sem criar outra compra ao voltar | Seção 7 |
| R-08 | Compra aceita ou recusada é definitiva | Seção 7 |
| R-09 | Os valores de custo e frequência desta pesquisa são hipóteses, não vêm do enunciado | Nenhuma (hipótese a validar) |
