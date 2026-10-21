# NFT Marketplace Constitution

## Core Principles

### I. Enunciado é a fonte de verdade
Todo requisito aponta para uma seção de `docs/ENUNCIADO.md`. Não se inventam requisitos; lacunas viram pergunta ou pendência registrada.

### II. Stack obrigatória usada de verdade
React, TypeScript, TanStack Router, TanStack Query, Axios, Socket.IO, Tailwind, shadcn/ui, MSW (REST e Socket.IO) e Playwright participam efetivamente da solução. Lighthouse audita o build otimizado.

### III. Mocks só na camada de rede
Respostas fictícias vivem em handlers MSW. Componentes, hooks e o cliente Axios não têm caminhos alternativos de negócio. Eventos em tempo real passam pelo `socket.io-client`, nunca por setters ou cache.

### IV. Teste primeiro, evidência real
Cenários BDD viram testes Playwright determinísticos e isolados. Nenhum status "passou" sem executar o comando e conferir a saída. Os estados IMPLEMENTADO, TESTADO, VALIDADO e VERIFICADO são reportados separados.

### V. Integridade de dados
ETH trafega como string decimal e é calculado em BigInt (wei); quantidades são inteiras. Pedidos aceitam chave de idempotência; confirmado e recusado são terminais. Dados privados são isolados por usuário e limpos no logout.

## Restrições

- Sem blockchain, carteira ou pagamento reais; sem backend de produção; sem segredos em variáveis públicas.
- Interface fiel ao Figma, em 390, 768 e 1440 px, com acessibilidade (teclado, foco, labels, movimento reduzido).
- Itens eliminatórios (§11 do enunciado) bloqueiam a conclusão.

## Fluxo de trabalho

Discovery → Glossário → Spec (speckit: specify → clarify → plan → tasks → implement) → QA independente (quem implementa não avalia) → Relatório final. Sem commit, push, PR ou deploy sem autorização explícita. Sem comandos destrutivos.

## Governance

Esta constituição prevalece sobre outras práticas do projeto. Emendas exigem registro da mudança e da justificativa.

**Version**: 1.0.0 | **Ratified**: 2026-10-21 | **Last Amended**: 2026-10-21
