# Lighthouse - build demo otimizado (`npm run build:demo` + `vite preview`)

Reproduzir: `npm run build:demo && npx vite preview --port 4180 --strictPort` e, em outro terminal, `npm run audit:lighthouse`.
Config versionada em `scripts/lighthouse.mjs`. Dados brutos: `*.json`/`*.html` por execucao e `summary.json`.

Ambiente: lighthouse 13.5.0, chrome-launcher 1.2.2, Chromium do Playwright (chromium-1248, headless), Windows 11 (10.0.26300), mocks MSW padrao do demo.
Emulacao: mobile = padrao do Lighthouse (Moto G Power, slow 4G simulado, CPU 4x); desktop = `desktopConfig` (40 ms RTT, 10 Mbps, CPU 1x). Throttling `simulate`. 3 execucoes por combinacao (12), mediana.

## Medianas (alvos: Perf >= 90, A11y >= 95, BP >= 95, SEO >= 90)

| Pagina | Modo | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|---|
| Inicio `/` | mobile | 91 | 100 | 100 | 100 | 2.84 s | 0 | 238 ms |
| Detalhe `/nfts/nft-1` | mobile | 94 | 100 | 100 | 100 | 2.65 s | 0 | 177 ms |
| Inicio `/` | desktop | 100 | 100 | 100 | 100 | 0.78 s | 0 | 4 ms |
| Detalhe `/nfts/nft-1` | desktop | 100 | 100 | 100 | 100 | 0.68 s | 0 | 1 ms |

Todas as medianas atingem as metas. Nova execução em 2026-10-28 (3 por combinação, 12 no total) sobre o build final, com o design baseado nos frames do Figma (imagens JPEG dos macacos, painel de filtros, rodapé completo, Criadores e Aprenda). Dados em `summary.json`. O Início mobile caiu de 98 para 91 e o LCP subiu de 2,12 s para 2,84 s: o hero e os cards agora carregam imagens JPEG de ~60 KB cada (antes eram SVG de poucos KB). Continua acima da meta (Perf >= 90), mas com pouca folga.

## Histórico
A primeira rodada (antes das correções) deu SEO 83 e A11y 98: faltavam `<meta name="description">`, `public/robots.txt` (o preview devolvia o `index.html` para `/robots.txt`), landmark `<main>` e favicon. Foram corrigidos em `index.html`, `public/robots.txt` e `src/app.tsx`, sem simplificar a aplicação; a segunda rodada é a que vale e está nesta pasta (`summary.json`).

## Ressalvas
- Medição local com `vite preview`, sem URL publicada (não há deploy).
- Avisos de IndexedDB nas execuções 2 e 3 de cada combinação (perfil do Chromium reaproveitado); não alteram as medianas de forma relevante, mas não é perfil limpo.
- LCP mobile ~2,1–2,4 s e TBT 116–127 ms (simulados): dentro da meta, mas no limite do "bom".
