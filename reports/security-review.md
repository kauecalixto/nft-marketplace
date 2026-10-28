# Revisão de segurança independente (final)

- **Data:** 2026-10-28. **Base:** `main` em `51893e8`. **Alvo público:** https://nft-marketplace-sable.vercel.app
- **Papel:** security-reviewer, somente leitura. Nenhum arquivo de código, `package*.json` ou configuração foi alterado; só este relatório foi criado.
- **Método:** leitura de código (`src/`), `vercel.json`, histórico git, `curl -I` na URL pública e `npm audit`. Não foi feito teste dinâmico no navegador nem execução de Playwright. Nada abaixo é "TESTADO" por esta revisão; o que é VERIFICADO diz o comando.

## Contexto e limite da demo

Esta entrega é uma **demonstração sem backend**: REST e Socket.IO são respondidos por MSW dentro do navegador (`VITE_ENABLE_MOCKS=true`, `src/main.tsx:4-6`). Todo o "servidor" (contas, pedidos, carrinhos) vive no `localStorage` do próprio visitante. Por isso:

- Não existe servidor compartilhado. Um visitante não consegue ler dados de outro visitante pela rede; só enxerga o próprio navegador.
- As garantias de autenticação e isolamento abaixo valem para o **fluxo da aplicação**, não contra quem controla o próprio navegador. Isso é **limite da demo**, não defeito a corrigir, e está marcado como `[LIMITE DA DEMO]`.

## Resumo

| Severidade | Qtde |
|---|---|
| Crítico | 0 |
| Alto | 0 |
| Médio | 1 |
| Baixo | 4 |
| Informativo / limite da demo | 6 |

Nenhum achado elimina a entrega (§11 "exposição de dados entre usuários" não foi encontrada no fluxo da aplicação).

## Achados

### Médio

**M1. CSP `img-src 'self' data:` bloqueia avatar por URL, que o formulário aceita**
- Evidência: `vercel.json` (`img-src 'self' data:`); `src/account/PrivatePages.tsx:79` aceita `^https?://\S+$` e `:86` renderiza `<img src={user.avatar}>`. Header confirmado na URL pública (`curl -I`).
- Efeito: em produção, um avatar `https://...` é salvo com sucesso mas não é exibido (CSP bloqueia). Do lado da segurança é o comportamento desejado (sem pixel de rastreio de terceiros). Do lado funcional é inconsistência: a UI aceita um valor que nunca renderiza no deploy. Os testes E2E rodam em `localhost:4173` com os mesmos headers? Não verificado: `vite preview` não aplica os headers do `vercel.json`, então esse caminho só se reproduz no deploy.
- Recomendação: restringir a validação a `data:image/` (upload) ou documentar que URL externa é bloqueada pela CSP. Não relaxar `img-src`.
- Classificado Médio por ser um conflito entre dois controles; não é vulnerabilidade explorável.

### Baixo

**B1. Rascunho de checkout com dados pessoais em `sessionStorage` sem limpeza explícita**
- Evidência: `src/purchase/CheckoutPage.tsx:31,63-73,81-82`. Na expiração de sessão o formulário (nome, e-mail, documento de 11 dígitos, carteira) é gravado em `checkout-draft:<userId>`; só é removido ao restaurar (`:82`). O logout (`src/account/session.tsx:79-84`) não limpa essa chave.
- Efeito: se o usuário não voltar a logar na mesma aba, o rascunho fica até a aba fechar. A chave é por usuário, então não vaza entre contas na restauração.
- Recomendação: remover `checkout-draft:*` no logout explícito.

**B2. `Authorization: Bearer <id do usuário>` e token em `localStorage`**
- Evidência: `src/api.ts:13,32,41`; `src/mocks/shared.ts:3-4`; `src/mocks/account.ts:6,69-71` (token = id do usuário, `active()` só confere se o id existe e não está expirado).
- Efeito `[LIMITE DA DEMO]`: o token é previsível (`u-ana`, `u-bruno`, `u-carla`); quem define `localStorage['nft:token']` assume a conta. Em backend real isso seria crítico; aqui o "backend" roda no navegador do próprio visitante e o token está documentado como mock. Qualquer script na origem também lê o `localStorage`, e o XSS é mitigado por CSP (ver I1).
- Recomendação: manter documentado; não copiar este esquema para produção real.

**B3. Hash de senha no mock é SHA-256 com salt, sem custo adaptativo; seed com senhas fictícias no código**
- Evidência: `src/mocks/account.ts:19-27,53-54` (credenciais `kurio-demo`, `bruno-demo`). 
- Efeito `[LIMITE DA DEMO]`: senhas não são armazenadas em claro (atende §3), mas SHA-256 rápido não serve como hash de senha real. As credenciais são fictícias e públicas por exigência do enunciado ("credenciais fictícias").
- Recomendação: apenas registrar no ARCHITECTURE que é simulação.

**B4. Endpoints `/api/__mock/*` ativos também no deploy público**
- Evidência: `src/mocks/handlers.ts:47,60,66`, `purchase.ts:288-303`, `socket.ts:61-89`, `account.ts:118,125`. O deploy usa `build:demo` (`vercel.json`), então os mocks e o service worker (`/mockServiceWorker.js` responde 200, verificado por `curl`) estão no ar.
- Efeito `[LIMITE DA DEMO]`: os endpoints só atuam sobre o estado do próprio navegador (interceptados por MSW, não chegam a servidor). `reset`, `expire`, `confirm` etc. não afetam outros visitantes. Não há segredo exposto por eles.
- Recomendação: nenhuma para a demo; em produção real removeriam-se.

### Informativo (controles que funcionam / observações)

**I1. CSP e headers do deploy (verificados)**
`curl -I` na URL pública devolve: `Content-Security-Policy` (igual ao `vercel.json`), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` e `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` (este último é da Vercel).
- `script-src 'self'` sem `unsafe-inline`/`unsafe-eval`: `index.html` só tem `<script type="module" src>` externo (sem script inline).
- `worker-src 'self'`: permite o service worker do MSW na mesma origem. `connect-src 'self' ws: wss:`: o Socket.IO simulado e o REST ficam na mesma origem. `ws: wss:` é amplo (qualquer host WebSocket); em demo nada o usa fora da origem. Recomendação opcional: trocar por `'self'` se o socket for sempre da mesma origem (MSW socket não abre conexão real).
- `style-src 'unsafe-inline'`: necessário para estilos inline do Tailwind/React; risco menor que no script.
- `form-action 'self'`, `base-uri 'self'`, `object-src 'none'`, `frame-ancestors 'none'`: corretos.
- Não verificado: que a aplicação funciona sem violações de CSP no console do navegador. A suíte E2E roda contra `vite preview`, que não aplica `vercel.json`. O resultado do `qa-independent` na URL pública é a evidência adequada.

**I2. Redirecionamento seguro**
`src/account/session.tsx:56-65` (`safeRedirect`): rejeita não-string, não iniciado por `/`, `//`, `\`, caracteres de controle e destino de origem diferente. Usado em `src/account/AuthPages.tsx:45,97`. Sem achado.

**I3. Isolamento entre usuários (cache, socket)**
- Cache: `startSession` cancela e limpa o cache (`session.tsx:38-43`), o logout também (`:79-84`), o 401 também (`src/api.ts:59-65`) e a troca de token em outra aba também (`src/realtime/client.ts:67-70`).
- Socket: `setToken` dispara `TOKEN_CHANGED`; `client.ts:59-72` zera `seenIds`/`versions`/avisos e reassina. No mock, `subscribe` resolve o usuário pelo token e `unsubscribe` zera (`src/mocks/socket.ts:34-38`). `order.updated` só é entregue ao cliente cujo `userId` coincide (`socket.ts:50`) e o cliente ainda filtra por `e.userId !== currentToken` (`client.ts:55`).
- Não verificado por esta revisão: execução dos testes de troca de usuário (`tests/e2e/socket-user-switch.spec.ts`). Esta revisão leu o código, não rodou o spec.
- Observação: `nft.updated` é global (não privado), correto.

**I4. Login social simulado**
`src/mocks/social-auth.ts`: sem client ID, sem chamada externa, `credential` opaca e nunca validada nem armazenada; usuários de fixture por provedor (Google = `ana@example.test`, Facebook = `carla@example.test`). Entra como o usuário demo de qualquer forma, o que é o comportamento esperado de simulação `[LIMITE DA DEMO]`. Reabre sessão expirada/encerrada do mesmo usuário (`account.ts:101-102`), coerente. Sem achado.

**I5. XSS e renderização de dados**
Busca por `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, `postMessage` e `window.open` em `src/`: nenhuma ocorrência. Links externos `target="_blank"` existem só no rodapé (`src/components/SiteFooter.tsx:109`) com `rel="noopener noreferrer"` (destinos: Facebook, Instagram, X, LinkedIn, YouTube, URLs institucionais fixas). O link do explorador é texto não navegável (`src/purchase/OrderPage.tsx:138-140`), não abre domínio inexistente. Avatar: `data:image/` ou `http(s)`; React escapa o texto e a CSP restringe a origem da imagem (ver M1).

**I6. Dependências**
`npm audit --omit=dev` retornou `found 0 vulnerabilities` (executado nesta revisão, em `main` em `51893e8`). O `npm audit` cobre só dependências de produção declaradas; não analisa o código do bundle.

## Segredos

- **Árvore de trabalho:** arquivos rastreados com cara de segredo: apenas `.env.demo` e `.env.example`. Valores: `VITE_API_URL=/api` e `VITE_ENABLE_MOCKS=true`, públicos e sem segredo. `.env` existe em disco, não está rastreado, está no `.gitignore` e contém as mesmas duas chaves.
- **Histórico:** `git log --all -p -G` com padrões de chaves/tokens (AWS `AKIA…`, `ghp_…`, `sk-…`, chaves privadas PEM, `xox[bp]-`, `AIza…`, `api_key=`, `secret=`, `password=` com valor literal), excluindo `package-lock.json`, `reports/` e snapshots: **sem resultados**. O arquivo `.env` foi versionado em `97be5de` e removido em `f98c2f5`; o conteúdo só tinha as duas chaves públicas acima (`VITE_API_URL`, `VITE_ENABLE_MOCKS`). Nenhum nome de arquivo `.pem`, `.key` ou `id_rsa` aparece no histórico.
- **`dist/`:** uma varredura inicial acusou `AKIA` em `dist/assets/browser-*.js`; era falso positivo (busca sem distinção de maiúsculas casou `akianraspacpaaxawtfb` dentro de código minificado). Nenhuma chave PEM ou token `ghp_` encontrado. Sem sourcemaps em `dist/` (0 arquivos `.map`; `https://nft-marketplace-sable.vercel.app/assets/index.js.map` devolveu 404).
- **`playwright-report/`:** nenhuma ocorrência dos padrões acima. Não foi revisado o conteúdo dos traces.
- **Limite da varredura:** padrões conhecidos apenas. Não substitui um scanner dedicado (por exemplo gitleaks) nem cobre segredos sem formato reconhecível.

## O que o deploy público expõe

- Aplicação estática, sem backend, sem variáveis privadas (só `VITE_API_URL` e `VITE_ENABLE_MOCKS`, públicas por definição do Vite).
- `mockServiceWorker.js` (200): é o service worker oficial do MSW `2.15.0`, mesma versão de `node_modules/msw`. O `git status` mostra o arquivo "modificado", mas a diferença é só fim de linha (`git diff --ignore-all-space --ignore-space-at-eol --stat` não mostra mudança).
- Dados de demonstração: contas `ana@example.test`, `bruno@example.test`, `carla@example.test` e as senhas fictícias do enunciado. Não são pessoais.
- Sem sourcemaps publicados. HSTS ativo (Vercel).
- Origens externas contatadas pela aplicação: nenhuma em tempo de execução (a CSP também não permite); só os links do rodapé, abertos por ação do usuário.

## Limitações desta revisão

- Leitura estática e `curl`; nenhum teste dinâmico no navegador, nenhuma execução de Playwright, nenhum fuzzing.
- Conferi os headers servidos pela URL pública, não a ausência de violações de CSP no console.
- Não revisei conteúdo de `reports/` além de buscas por padrões, nem o histórico de `package-lock.json`.
- `npm audit` depende do banco de avisos no momento da execução.

## Resumo de recomendações (por prioridade)

1. M1: alinhar a validação de avatar com a CSP (ou documentar a limitação).
2. B1: limpar `checkout-draft:*` no logout.
3. B2/B3/B4: manter documentados como limites da demo; não reaproveitar em backend real.
4. I1: reduzir `connect-src` para `'self'` se nenhum WebSocket externo for necessário, e confirmar ausência de violações de CSP no deploy (responsabilidade do QA).
