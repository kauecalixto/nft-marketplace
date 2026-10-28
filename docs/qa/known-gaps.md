# Lacunas conhecidas

Estado atual, baseado em leitura de código/testes e na última execução completa. Itens ligados à matriz em `docs/requirements/requirements-matrix.md`. Resultados de execução: `reports/implementation-status.md` e `reports/qa-report.md` (o QA r4 é anterior às últimas mudanças de UI e não foi refeito).

## Última execução completa (Playwright)
`npx playwright test`: 169 passed, 0 failed (desktop 1440, tablet 768 e mobile 390; inclui os 3 testes `@visual`). Typecheck, lint, `test:unit` (3 testes) e `build:demo` passam.
Os baselines `@visual` foram regenerados após o redesign da interface (ver seção "Design" em `ARCHITECTURE.md`); são `*-win32.png` e só valem no Windows.

## Ainda faltam (alto impacto)
- Deploy público (§12): `vercel.json` (build:demo, dist, rewrite SPA) existe e o fallback foi testado com `vite preview`, mas NENHUM deploy foi realizado; sem URL pública.
- PR no fork: não aberto. Nada foi commitado nem enviado.
- Fidelidade ao Figma: sem acesso ao Figma; sem tokens/frames. NÃO IMPLEMENTADO.
- Auditoria axe (@axe-core): não existe. Há correções de acessibilidade com teste (`a11y-fixes.spec.ts`, `a11y-keyboard.spec.ts`, `order-live-region.spec.ts`), mas nenhuma varredura automática por regras axe.
- CI: `.github/workflows/ci.yml` existe, mas NUNCA rodou no GitHub (sem push). Ele executa `--grep-invert @visual` porque os baselines só valem em win32.
- Baselines `@visual` só em win32: não validam em Linux/CI (o CI roda `--grep-invert @visual`).
- Lighthouse: as medições em `reports/lighthouse/` são anteriores ao redesign e precisam ser repetidas.
- Pagamento parcial: não existe. O app e os mocks montam a cotação e o pedido do carrinho INTEIRO. Isso diverge da spec de `docs/pedido-unico-sem-duplicidade-spec.md` (pressuposto de pagar por parte do carrinho); detalhes em `REVIEW.md`.
- Spec `docs/pedido-unico-sem-duplicidade-spec.md`: R-04 (preservar itens em falha) ficou fora dos cinco EARS; o app já mantém o carrinho em recusa (`OrderPage`, `CheckoutPage`), mas sem critério/teste próprio dessa spec.
- shadcn/ui: usado em AuthPages, PrivatePages, HomePage, NftDetailPage, CartPage, CheckoutPage e OrderPage; cobertura total não auditada.
- Lighthouse: última rodada em `reports/lighthouse/README.md`; a UI mudou depois, então precisa de nova rodada.

## Já existe (antes listado como lacuna)
- Especificação da semana 5 também na ferramenta alternativa: OpenSpec (`openspec/changes/limite-quantidade-edicao/`, `openspec validate limite-quantidade-edicao --strict` válido, CLI 1.15.0) e TLC (`.specs/features/quantity-limit/spec.md`, `validate_spec.py` com 0 erros e 0 avisos). Comparação em `DIFERENCAS.md`. Ver ressalva sobre `docs/comparacao-ferramentas.md` em `docs/README.md`.
- Semana 6: `RESEARCH.md`, `docs/adr/0001-pedido-unico-sem-duplicidade.md`, `docs/pedido-unico-sem-duplicidade-spec.md` e `tests/e2e/pedido-unico.spec.ts` (3 testes passam; mutações de teste M1 a M3 provaram que podem falhar).
- Zoom/reflow do diálogo de revisão do checkout (WCAG 1.4.10, 390 px a 200%): corrigido; teste em `tests/e2e/review-dialog-zoom.spec.ts` passa.
- `npm ci` puro funciona: o conflito de peer dependencies foi resolvido com aliases em `package.json` (`typescript` -> `@typescript/typescript6`, `@typescript/native` -> `typescript@7`).
- Timeout do Axios: existe em `src/api.ts` (`timeout` = `VITE_API_TIMEOUT_MS`, padrão 15000 ms). Não há teste dedicado.
- Cenários HTTP 4xx genéricos nos mocks: `/api/__mock/status/:code` (`docs/CONTRACTS.md`).
- Redirect seguro após login (`safe-redirect.spec.ts`) e troca de usuário na mesma aba com socket ativo (`socket-user-switch.spec.ts`).
- Rota 404 (`not-found.spec.ts`), script `lint` (eslint), destaques e galeria (`featured-gallery.spec.ts`), edição de carteira (`wallet-edit.spec.ts`).
- Regressão visual com baselines (`visual-regression.spec.ts`).
- Testes de teclado/foco (`a11y-keyboard.spec.ts`), incluindo retorno de foco ao `review-order` após Esc.
- Responsividade 390/768/1440 em carrinho, checkout, pedido, perfil e carteiras (`responsive.spec.ts`).
- Testes de `order.updated` (`realtime-orders.spec.ts`) e do merge do carrinho de visitante (`cart-merge.spec.ts`).
- Script `npm run verify` (typecheck, lint, test:unit, build:demo).

## Outras lacunas confirmadas
- Baselines visuais só win32: `tests/e2e/visual-regression.spec.ts-snapshots/` tem 12 arquivos `*-win32.png`, incompatíveis com CI Linux.
- Matriz responsiva nos testes E2E: `purchase.spec.ts`, `account.spec.ts` e `realtime.spec.ts` só rodam em 1440 px (regex `RESPONSIVE` em `playwright.config.ts`); os projetos tablet e mobile rodam só os specs listados nele.
- Mocks: Socket.IO só websocket, namespace `/`; estado em memória/`localStorage`.
- Skeleton incompleto: loading com skeleton e shimmer apenas no catálogo, detalhe, resumo do carrinho, checkout e pedido; demais telas usam texto ou feedback simples.
- Política de cache/retry e timeout sem teste dedicado (só efeitos observáveis nos E2E); contratos tipados parcialmente.
- Perfil/carteiras/confirmação sem layout mobile dedicado.
- `walletLimit = 0` não tem teste (sem fixture).

## Conta (login, perfil, carteiras): controles do Figma sem backend
- Painel lateral "Meu perfil": só "Dados do perfil" e "Carteiras" existem. Atividade, Lista de interesse, Ofertas, Arquivos baixados e Suporte estão fora do escopo (ENUNCIADO §3) e foram REMOVIDOS em vez de ficarem clicáveis sem efeito; "Sair" fica no header.
- Login/Cadastro: "Esqueceu a senha?", mostrar/ocultar senha e "confirmar senha" não existem no app (não há recuperação de senha no escopo nem no mock); não foram adicionados controles sem função.
- Login social (Google/Facebook): simulado por MSW, sem OAuth real (ver `ARCHITECTURE.md`).
- Carteiras: conectar/desconectar passou a existir também na página de Carteiras (mesmos endpoints do checkout), com testes em `tests/e2e/wallets-connect.spec.ts`.

## Controles do Figma removidos ou simulados (regra "todo botão funciona")
- Removidos do rodapé por não haver destino nem backend: "Minha coleção", "Atividade", "Lista de interesse" (não há lista de favoritos no perfil), "Política do mercado" e "Denunciar item". "Estúdio do criador" virou "Criadores" (/criadores).
- Coleção e rede dos NFTs são derivadas no cliente (`src/catalog/taxonomy.ts`), não vêm da API; as contagens são calculadas, não as do Figma. Se a API ganhar os campos `collection`/`network`, trocar a derivação.
- Newsletter: confirmação local, sem endpoint e sem armazenar o e-mail. Redes sociais apontam para a página inicial de cada rede (não há perfis oficiais).
- Rodapé (contatos e "Carteiras compatíveis") e a faixa de benefícios são texto não interativo.
- Não verificados nesta rodada: Carrinho, Pagamento e Confirmação (cobertos só pela suíte existente) e o Detalhe sem "Mais desta coleção"/relacionados (não existem). Auditoria completa fica com o qa-independent.
