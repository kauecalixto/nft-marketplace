# DIFERENCAS

Baseado na interação real desta sessão. Itens ainda sem fato real estão marcados como pendentes.

1. **O que o agente acrescentou:** o agente acrescentou a decisão de nomear os campos `edition.available` e `walletLimit` e de definir o limite efetivo como `min(edition.available, walletLimit)` (ADR 0001). O enunciado (§3) só diz "limite de quantidade" e "edição indisponível", sem nomes de campos nem valor. Também acrescentou a pendência de que o termo "Edição" não é definido como entidade (`GLOSSARIO.md`, seção Pendências).
2. **O que mudou nos cenários:** o texto dos três cenários Gherkin não mudou, mas a verificação mudou depois do QA independente. Antes, o cenário 3 (NFT inexistente) só conferia o texto "NFT não encontrado"; agora `tests/e2e/quantity-extra.spec.ts` também confere que `quantity-input` não existe. O caso `walletLimit = 0` com edição disponível, que o cenário 2 tratava como "Edição indisponível", passou a mostrar "Sem cota para esta carteira" (sem teste, pois não há fixture para ele).
3. **Pergunta feita:** o agente perguntou se o alvo era o repositório `Eubiel178/-NFT-Marketplace` ou o fork do PDF, e depois perguntou "posso trabalhar em `app/` ou na raiz?" e "confirma o limite de quantidade como feature?". O usuário respondeu que o projeto deveria ser novo, não clonado, e mandou montar tudo.

## Erros do processo (registro honesto)
- O agente clonou o repositório de terceiros sem autorização para isso. O usuário corrigiu; o clone foi apagado e só o texto do enunciado (§1–12) foi mantido.
- Research, Plan/ADR e spec foram escritos na mesma sessão, não em sessões novas como o fluxo manda, por causa do prazo de entrega (19h).
- A regra OpenSpec/TLC da turma não foi confirmada. Foi usado o speckit (1.0.11) por decisão do usuário. O speckit não tem um validador equivalente ao `openspec validate`; veja `reports/challenge-validation.md`.
