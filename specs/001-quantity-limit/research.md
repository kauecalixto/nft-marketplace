# Research (Phase 0)

Sem NEEDS CLARIFICATION no Technical Context. Decisões herdadas do ADR 0001 (não pesquisadas externamente).

- **Decision**: limite efetivo = min(edition.available, walletLimit), servido pela API mock. **Rationale**: regra única na API (ADR 0001). **Alternatives**: validar só no servidor (erro tardio); limite fixo no front (viola constituição III).
- **Decision**: quantidade em estado local, mínimo 1. **Rationale**: ADR 0001.
- **Open**: nome `walletLimit` não consta no enunciado (dúvida do RESEARCH.md).
