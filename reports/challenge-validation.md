# Validação (estado final, 2026-10-21)

Fonte dos números: `reports/qa-report.md` (rodada 4) e `reports/lighthouse/summary.json`.

| Comando | Resultado real |
|---|---|
| `npm run typecheck` | sem erros |
| `npm run lint` | sem erros nem warnings |
| `npm run build:demo` | build ok (aviso de chunk > 500 kB em `app` e `browser`) |
| `npx playwright test` execução 1 | **150 passed** |
| `npx playwright test` execução 2 | **149 passed, 1 failed**: `purchase.spec.ts:144` (duplo clique no envio), intermitente |
| `purchase.spec.ts:144 --repeat-each=15` (isolado) | 15/15 passaram |
| `npm run test:unit` | 3 passed |

O teste de duplo clique falhou em 1 de 2 execuções completas e passou 15/15 isolado; a causa provável é corrida sob carga, e o trace não foi analisado.

## Lighthouse (rerodado após a migração shadcn/ui, 3 execuções por combinação, medianas)
| Página | Modo | Perf | A11y | BP | SEO | LCP |
|---|---|---|---|---|---|---|
| Início `/` | mobile | 98 | 100 | 100 | 100 | 2,12 s |
| Detalhe `/nfts/nft-1` | mobile | 96 | 100 | 100 | 100 | 2,41 s |
| Início `/` | desktop | 100 | 100 | 100 | 100 | 0,57 s |
| Detalhe `/nfts/nft-1` | desktop | 100 | 100 | 100 | 100 | 0,57 s |

Ressalva: perfil do Chromium reaproveitado, com avisos de IndexedDB nas execuções.

## Defeitos antes pendentes, agora corrigidos e testados
- Foco volta ao botão `review-order` após Esc no diálogo de revisão (`a11y-keyboard.spec.ts`).
- Overflow horizontal em 390 px (`/wallets`, `/orders/:id`) (`responsive.spec.ts`).

## Entrega
- Commits 97be5de e 005f811 enviados para https://github.com/kauecalixto/nft-marketplace (branch main).
- QA independente, rodadas 1 a 4: aprovado com ressalvas.

## Pendente
- Deploy: não realizado. `vercel.json` está pronto, mas a Vercel exige a conta do usuário. Sem URL pública (obrigatório no §12).
- Figma: fidelidade não verificada (sem acesso).
- PR: não aberto.
- OpenSpec/TLC: não executado.
- Auditoria axe e teste de zoom: não feitos.

| Estado | Situação |
|---|---|
| IMPLEMENTADO | Escopo da matriz, exceto deploy e Figma |
| TESTADO | typecheck, lint, build e unit ok; Playwright 150/150 e 149/150 (1 intermitente) |
| VALIDADO | build e tipos; speckit (`reports/speckit-validation.md`); sem validador OpenSpec/TLC |
| VERIFICADO | QA independente rodada 4 (aprovado com ressalvas); sem acesso ao Figma nem a URL publicada |
