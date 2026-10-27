# ADR 0001 — Pedido único sem duplicidade (chave de idempotência por tentativa)

## Status

Proposto (sessão PLAN). Passa a Aceito quando a spec `docs/pedido-unico-sem-duplicidade-spec.md` for validada.

## Contexto

- Bounded context: **Compra** (pasta prevista `src/purchase/`).
- Termos do glossário usados:
  - **Carrinho**: conjunto de itens e quantidades que o colecionador pretende comprar, mantido após refresh.
  - **Cotação**: resposta da API com disponibilidade, desconto, taxa de rede e total, referência para finalizar o pedido.
  - **Pedido**: compra enviada com chave de idempotência, nos estados pendente, confirmado ou recusado, sendo confirmado e recusado terminais.
- Origem: enunciado §3 (Pagamento e confirmação), §5 (Pedidos: criação idempotente), §6 (timeout após criação do pedido, com recuperação por idempotência) e §7 (`order.updated`, interrupção com pedido pendente).

## Problema

Segundo o RESEARCH.md, o colecionador, no momento de pagar, pode clicar de novo porque "nada parece acontecer", reenviar após uma demora, recarregar a página ou perder a conexão no meio do pagamento. O resultado é pagar duas vezes pelo mesmo item, não saber se comprou, ou ver uma confirmação que não corresponde a uma compra aceita. Os custos citados no Research são hipóteses a validar (R-09), não fatos medidos.

## Decisão

Cada tentativa de pagamento recebe uma **chave de idempotência** própria, gerada no cliente e reutilizada em qualquer reenvio daquela mesma tentativa. Usando somente a stack do enunciado §2:

1. **TanStack Query (mutations):** a criação do pedido é uma mutation que envia a chave no envio. Cliques repetidos e novas tentativas após timeout reutilizam a chave da tentativa em curso, e o botão de pagar fica desabilitado enquanto a mutation estiver em andamento. Uma nova tentativa (nova chave) só nasce quando o colecionador inicia deliberadamente outro pagamento. O estado do pedido fica no cache de queries, que é a fonte da interface.
2. **Axios (REST):** todas as chamadas de pedido passam pelo Axios; a chave de idempotência segue como cabeçalho da requisição de criação. A consulta do pedido (`GET`) serve à recuperação após refresh ou reconexão.
3. **MSW (mocks):** o simulado de Pedidos, na camada de rede, aceita uma chave de idempotência por tentativa e:
   - para a mesma chave e o mesmo conteúdo, devolve o mesmo pedido (sem criar outro);
   - para a mesma chave com conteúdo diferente, responde **conflito** (HTTP 409);
   - mantém o pedido em memória/persistência local para sobreviver a refresh, com reset restaurando o cenário conhecido;
   - cobre os cenários do §6: timeout após criação com recuperação por idempotência, pagamento confirmado e pagamento recusado.
4. **Socket.IO (`order.updated`):** o cliente `socket.io-client` recebe o evento, que carrega identidade estável, recurso afetado e versão (§7). O cliente ignora duplicatas e versões antigas, e nunca regride um pedido terminal (confirmado ou recusado) para pendente. Após reconexão, o pedido ativo é reconciliado com a API REST.
5. **Recuperação:** a chave e o identificador do pedido pendente ficam persistidos no cliente (por usuário) para que, após refresh ou reconexão, o sistema consulte o pedido existente em vez de criar outro.
6. **Carrinho:** só após o pedido ser **confirmado** saem do carrinho os itens e quantidades comprados; em recusa ou falha o carrinho permanece intacto. A confirmação só é exibida para pedido confirmado pela simulação.

## Alternativas consideradas

| Alternativa | Motivo da rejeição |
| --- | --- |
| Apenas desabilitar o botão de pagar durante o envio | Não cobre refresh, queda de conexão nem reenvio após timeout, e a decisão ficaria só na interface. O enunciado §5 exige idempotência no contrato e §4 pede recuperação "sem duplicar operações". |
| Deduplicar no cliente por tempo (ignorar novo envio nos primeiros N segundos) | Janela arbitrária: bloqueia compras legítimas ou deixa passar reenvios tardios. Não gera o conflito exigido pelo §5 para conteúdo diferente. |
| Gerar uma chave nova a cada envio e deixar o servidor deduplicar por conteúdo do carrinho | Duas compras legítimas iguais ficariam indistinguíveis de um reenvio, e a regra "mesma tentativa recupera o mesmo pedido" do §5 não seria cumprida. |
| Atualizar o estado do pedido apenas por polling REST, sem Socket.IO | Descumpre o §7 (`order.updated`) e o critério de testar o cliente Socket.IO; polling pode permanecer só como reconciliação após reconexão. |
| Simular eventos chamando diretamente callbacks ou o cache | Proibido pelo §6 e eliminatório no §11. |

## Consequências

- A chave de idempotência passa a fazer parte do contrato de criação de pedido e dos mocks MSW, e deve ser documentada nos contratos REST.
- O cache de TanStack Query e o cliente Socket.IO precisam respeitar a regra de versão e de estados terminais.
- Haverá persistência local mínima (chave e pedido pendente por usuário), que deve ser limpa em logout ou troca de usuário (§3, Conta e sessão).
- Os testes Playwright dos cenários da spec passam pelos handlers MSW e pelo cliente Socket.IO.

## Trade-offs e riscos

- Complexidade: gerenciar o ciclo de vida da chave (quando reutilizar e quando gerar nova) é fonte de erro; reutilizar uma chave após o usuário editar o carrinho causa conflito, o que é o comportamento desejado, mas precisa de mensagem clara.
- Dúvida aberta do Research: o que o colecionador espera ver ao reaproveitar uma tentativa com itens diferentes (aviso, compra antiga ou escolha). Esta decisão adota o aviso de conflito, a validar.
- Dúvida aberta: abertura em duas abas ou outro aparelho; a decisão cobre refresh e reconexão na mesma sessão, não sincronização entre abas.
- Fora desta decisão: tempo máximo em andamento antes de recusar, estorno, suporte, e-mail, e mudança de preço ou disponibilidade durante a compra.
- Simulação apenas: nenhuma carteira, pagamento ou blockchain reais.

## Requisitos relacionados

Ver `docs/pedido-unico-sem-duplicidade-spec.md`.

- EARS-01: mesma tentativa, mesmo pedido.
- EARS-02: recuperação do pedido pendente após refresh ou reconexão.
- EARS-03: confirmação e remoção apenas dos itens e quantidades comprados.
- EARS-04: resultado por `order.updated` e estados terminais definitivos.
- EARS-05: conflito para a mesma tentativa com conteúdo diferente.
