# CONTRATOS (REST + Socket.IO), como implementados nos mocks

Base: `/api` (Axios `baseURL`, `VITE_API_URL`). Auth: `Authorization: Bearer <token>` (token = id do usuário). Fonte: `src/mocks/*.ts`. Erro padrão: `{ code, message, ... }`; validação: `{code:'VALIDATION_ERROR', message, errors:{campo:msg}}` (422), exceto pedidos, que usam `fields`.

## Sessão e conta
| Método e caminho | Request | Resposta / erros |
|---|---|---|
| POST /auth/register | `{name,email,password>=8}` | 201 `{token,user}`; 422 validação; 409 `EMAIL_CONFLICT` |
| POST /auth/login | `{email,password}` | 200 `{token,user}`; 401 `INVALID_CREDENTIALS` |
| GET /session | - | 200 `User{id,email,name,avatar}`; 401 `SESSION_EXPIRED` |
| POST /auth/logout | - | 204 (sempre) |

## NFTs (públicos)
| Método e caminho | Request | Resposta / erros |
|---|---|---|
| GET /nfts | query: `q` (substring do nome), `min`/`max` (ETH decimal; comparados em BigInt wei), `available=true`, `sort` (`price-asc`,`price-desc`,`name`), `page` (>=1; tamanho fixo 6) | 200 `{items: Nft[], total, page, pageSize}`; cenários: `http-500` -> 500 `{message}`, `network-error` -> falha de rede, `slow` -> +3 s, `variable-latency` -> 900 ms em página ímpar e 100 ms em par, `empty` -> `{items:[],total:0,page:1,pageSize:6}` |
| GET /nfts/:id | - | 200 `Nft{id,name,creator,price,image,edition{total,available},walletLimit}`; 404 `{message:'not found'}`; 500/network-error/slow idem |

## Favoritos (auth)
GET /favorites -> `string[]`. POST /favorites `{nftId}` -> 201 lista. DELETE /favorites/:nftId -> 200 lista. 401 `SESSION_EXPIRED`; 503 `TRANSIENT` quando `/__mock/favorites-error` está ativo.

## Perfil (auth)
GET /profile -> User. PATCH /profile `{name?,avatar?}` -> User; 422. `avatar` aceita URL http/https ou data URI `data:image/*;base64,...` (upload feito no cliente; limite de ~1 MB, 1.400.000 caracteres; fora disso 422 em `errors.avatar`). PUT /profile/password `{currentPassword,newPassword>=8}` -> 204; 422 (`currentPassword`/`newPassword`).

## Carteiras (auth)
GET /wallets -> `Wallet[]{id,label,address,role:'primary'|'secondary'}`. POST /wallets `{label,address 0x+40hex}` -> 201 Wallet (a 1a é primary); 422 (duplicada, limite de 2). PATCH /wallets/:id `{label?,address?,primary?}` -> 200 lista; 404 `NOT_FOUND`; 422.

## Carrinho (visitante ou usuário; visitante mesclado ao autenticar)
- GET /cart -> `CartItem[]{nftId,name,image,price,quantity,available,max}`
- POST /cart `{nftId,quantity}` -> 201 lista; 409 `AVAILABILITY_CONFLICT`
- PATCH /cart/:nftId `{quantity}` -> lista; 404 `NOT_FOUND`; 409 `AVAILABILITY_CONFLICT` (+`max`)
- DELETE /cart/:nftId -> lista
- POST /cart/coupon `{code}` -> 200 Quote(ethereum); 422 `COUPON_INVALID` ou `COUPON_EXPIRED`
- DELETE /cart/coupon -> Quote

## Cotação
GET /quote?network=ethereum|polygon|base -> `Quote{quoteId,version,network,items[{nftId,name,quantity,unitPrice,lineTotal}],coupon,subtotal,discount,networkFee,total,unavailable[]}`. Valores ETH são strings decimais (BigInt, `purchase/eth.ts`). `version` é string derivada de rede/cupom/itens/taxa.

## Pedidos (auth)
- GET /orders?status= -> `Order[]` do usuário. GET /orders/:id -> Order; 401 `UNAUTHENTICATED`; 404 `NOT_FOUND`; 403 `FORBIDDEN`.
- POST /orders (header obrigatório `Idempotency-Key`; ausente -> 400 `IDEMPOTENCY_KEY_REQUIRED`). Body `{collector{name,email,document(11 dígitos)},walletId,network,quoteVersion}`.
  - Mesma chave + mesmo corpo -> devolve o mesmo pedido; corpo diferente -> 409 `IDEMPOTENCY_CONFLICT`.
  - 422 `VALIDATION_ERROR` (+`fields`); 409 `ORDER_PENDING` (+orderId); 422 `WALLET_REJECTED` (cenário); 409 `AVAILABILITY_CONFLICT` (+quote); 409 `QUOTE_STALE` (+quote); 504 `GATEWAY_TIMEOUT` (cenário `payment-timeout`, pedido já criado); 201 Order.
  - `Order{id,userId,status:'pending'|'confirmed'|'declined',version,createdAt,items,subtotal,discount,networkFee,total,coupon,network,walletId,collector,txHash?,explorerUrl?}` (snapshot copiado da cotação). txHash/explorer simulados.
- Controle de mock: POST /__mock/orders/:id/confirm, /decline e /event (seção abaixo).

## Endpoints de controle do mock (não são contrato de produção)
POST /__mock/scenario `{scenario}` (default, empty, http-500, slow, variable-latency, network-error e cenários de pagamento); /__mock/reset; /__mock/session/expire; /__mock/favorites-error `{enabled}`; /__mock/nfts/:id/update `{price?,available?}` (incrementa versão e emite `nft.updated`); /__mock/nfts/:id/event `{version?,eventId?}` (reemite, para duplicata/antigo); /__mock/orders/:id/confirm e /decline; /__mock/orders/:id/event (abaixo); /__mock/socket/disconnect; GET /__mock/socket/clients.

### POST /api/__mock/orders/:id/event
Reemite `order.updated` do pedido pelo servidor Socket.IO simulado, sem alterar o pedido nem o carrinho. Serve para testar duplicata e evento antigo/fora de ordem (EARS-04 de `docs/pedido-unico-sem-duplicidade-spec.md`; usado em `tests/e2e/pedido-unico.spec.ts`). Foi acrescentado na implementação da semana 6; não está no enunciado nem na spec.

| Item | Valor |
|---|---|
| Body (todos opcionais) | `{version?: number, eventId?: string, status?: 'pending'\|'confirmed'\|'declined'}` |
| Padrões | `version` = versão atual do pedido; `eventId` = `<orderId>-replay-<Date.now()>`; `status` = status atual |
| Resposta 200 | o evento emitido `{eventId, resource:'order', id, userId, version, status}` |
| Erro | 404 `NOT_FOUND` (`pedido não encontrado`) se o id não existe |
| Entrega | `order.updated` só às subscriptions do dono (`userId` do pedido); o cliente descarta `eventId` repetido e `version` menor ou igual à já aplicada |

Observações: o evento é fabricado com os valores do body, então um `status` diferente do real é emitido assim mesmo (o app só invalida queries e relê o pedido por REST, que continua a fonte da verdade). `/confirm` e `/decline` só têm efeito em pedido `pending` (`settle` ignora pedidos terminais) e devolvem o pedido atual.

### Cenários de erro HTTP genéricos (mock)
`GET|POST|PUT|PATCH|DELETE /api/__mock/status/:code` responde sempre com o status pedido e corpo fixo (determinístico, sem estado):
| code | corpo |
|---|---|
| 400 | `{code:'BAD_REQUEST', message}` |
| 401 | `{code:'UNAUTHENTICATED', message}` (com token ativo o interceptor encerra a sessão e redireciona ao login) |
| 403 | `{code:'FORBIDDEN', message}` |
| 404 | `{code:'NOT_FOUND', message}` |
| 409 | `{code:'CONFLICT', message}` |
| 422 | `{code:'VALIDATION_ERROR', message, errors:{campo:msg}}` |
Outro código => 400 `UNSUPPORTED_STATUS`. Timeout do cliente: `VITE_API_TIMEOUT_MS` (ms, padrão 15000); ao estourar, o Axios rejeita com `ECONNABORTED` (não há resposta fictícia no cliente).

## Socket.IO (path /socket.io, namespace /, websocket)
Cliente -> servidor: `subscribe {token}` (resolve usuário; token inválido = anônimo), `unsubscribe`.
Servidor -> cliente:
- `nft.updated {eventId, resource:'nft', id, version, price, available}`: broadcast a todos os clientes.
- `order.updated {eventId, resource:'order', id, userId, version, status}`: só ao cliente cujo `userId` assinou; `eventId` = `${orderId}-v${version}`. Emitido na criação (pending) e ao liquidar (confirmed/declined).
Não existem eventos de carrinho/cotação separados.
