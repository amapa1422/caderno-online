# Registro de solicitações

Novas solicitações no topo. Não reutilize IDs nem apague pedidos depois de
rollback. Os checkpoints são referências Git reais, confirmadas com
`git rev-parse 'CP-XXXX^{commit}'`. O histórico anterior à instalação existe no
Git, mas seus prompts não foram fornecidos e não recebem IDs inventados.

## PROMPT-0001

Data: 2026-09-22, 16:25:04 -03:00 (America/Sao_Paulo; checkpoint inicial).

Resumo do pedido: Instalar um sistema permanente de memória, histórico,
documentação e rollback antes de qualquer nova mudança de produto.

Objetivo: Analisar o projeto inteiro, preservar seu estado como `BASELINE-0001`,
criar `AGENTS.md`, preencher `.project-memory/` e estabelecer leitura/atualização
obrigatórias com checkpoints Git antes/depois de tarefas significativas.

Arquivos afetados: `AGENTS.md`; `.project-memory/README.md`, `CURRENT_STATE.md`,
`CHANGELOG.md`, `DECISIONS.md`, `PROMPTS.md`, `ARCHITECTURE.md`, `KNOWN_ISSUES.md`,
`ROLLBACK.md`, `checkpoints/CP-0001.md`, `checkpoints/CP-0002.md`.

CHANGE relacionado: `CHANGE-0001`.

Checkpoint antes: **CP-0001 / BASELINE-0001** —
`2eb960f0b473a216e82e4d242dff044ecac0e481`.

Checkpoint depois: **CP-0002** — `refs/tags/CP-0002`.

Trecho fiel da solicitação: “Agora quero que você faça SOMENTE a configuração
desse sistema.” / “Não prossiga para redesign ou outras modificações nesta tarefa.”

Restrições: Não modificar interface, funcionalidades, Firebase ou lógica de negócio.
Manter o histórico, documentar decisões e tornar os checkpoints restauráveis.

Estado: Configuração documentada; conclusão e validações descritas em `CHANGE-0001`.
O commit complementar de hashes pertence a este mesmo pedido; não é outro prompt.

Interpretação futura: “antes de PROMPT-0001” aponta a `CP-0001`; restaurar o
aplicativo para esse estado deve conservar a memória atual, criada depois dele.
