# Registro de solicitações

Novas solicitações no topo. Não reutilize IDs nem apague pedidos depois de
rollback. Os checkpoints são referências Git reais, confirmadas com
`git rev-parse 'CP-XXXX^{commit}'`. O histórico anterior à instalação existe no
Git, mas seus prompts não foram fornecidos e não recebem IDs inventados.

## PROMPT-0002

Data: 2026-09-22, 16:53:42 -03:00 (checkpoint inicial).

Resumo do pedido: Aplicar o design system oficial ao Caderno Online, preservando
autenticação, notas existentes, sincronização e os contratos de banco.

Objetivo: Interface de diário com sidebar recolhível/drawer mobile, editor central,
calendário, temas claro/escuro, navegação entre dias com virada de folha,
marca-textos e feedback discreto de gravação, com acessibilidade e testes.

Arquivos afetados: `index.html`, `style.css`, `app.js`, `design_system.html`,
testes e memória (lista final em CHANGE-0002).

CHANGE relacionado: `CHANGE-0002` (em andamento).

Checkpoint antes: **CP-0003**, `ac98d0649274c25d885b0e6074764ade3e800406`.

Checkpoint depois: Pendente; tarefa em implementação.

Trecho fiel: “Faça as alterações diretamente nos arquivos do projeto.” /
“Não remova funcionalidades existentes.”

Referência: `design_system.html` localizado em Downloads, ausente da raiz no início;
será incorporado ao projeto. Tokens oficiais serão preservados, com adaptações
de contraste/acessibilidade documentadas. Não copiar conteúdo demonstrativo para
as notas dos usuários. Não há PWA nem autosave de rascunho no código recebido.

Estado: Em andamento.

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

Checkpoint depois: **CP-0002** — `6d10c7b0b299e2802e9cca026ee427fe6b2d436c`
(`refs/tags/CP-0002`, 2026-09-22 às 16:38:31 -03:00).

Trecho fiel da solicitação: “Agora quero que você faça SOMENTE a configuração
desse sistema.” / “Não prossiga para redesign ou outras modificações nesta tarefa.”

Restrições: Não modificar interface, funcionalidades, Firebase ou lógica de negócio.
Manter o histórico, documentar decisões e tornar os checkpoints restauráveis.

Estado: Concluído; configuração e validações descritas em `CHANGE-0001`.
O commit complementar de hashes pertence a este mesmo pedido; não é outro prompt.

Interpretação futura: “antes de PROMPT-0001” aponta a `CP-0001`; restaurar o
aplicativo para esse estado deve conservar a memória atual, criada depois dele.
