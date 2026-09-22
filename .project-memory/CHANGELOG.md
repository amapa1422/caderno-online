# Histórico de alterações

Adicione novas entradas no topo, após esta introdução. Preserve as anteriores;
não substitua uma mudança antiga por outra. Datas usam America/Sao_Paulo.

## CHANGE-0001

Data: 2026-09-22.

Hora: 16:25:04 -03:00 (checkpoint inicial); 16:38:31 -03:00 (checkpoint final).

Prompt/Task: `PROMPT-0001` — instalar memória permanente e rollback.

Checkpoint inicial: `CP-0001` / `BASELINE-0001`,
commit `2eb960f0b473a216e82e4d242dff044ecac0e481`.

Checkpoint final: `CP-0002`, commit `6d10c7b0b299e2802e9cca026ee427fe6b2d436c`
(`refs/tags/CP-0002`). Hashes literais finalizados em commit complementar de
metadados da mesma tarefa, conforme `DEC-0005`.

### Objetivo

Preservar o projeto atual, documentar seu funcionamento real e preparar agentes
futuros para consultar/atualizar a memória e restaurar versões por Git. Somente
infraestrutura: nenhuma mudança de produto, Firebase, interface ou regra de negócio.

### Arquivos alterados

Todos são novos:

- `AGENTS.md`.
- `.project-memory/README.md`.
- `.project-memory/CURRENT_STATE.md`.
- `.project-memory/CHANGELOG.md`.
- `.project-memory/DECISIONS.md`.
- `.project-memory/PROMPTS.md`.
- `.project-memory/ARCHITECTURE.md`.
- `.project-memory/KNOWN_ISSUES.md`.
- `.project-memory/ROLLBACK.md`.
- `.project-memory/checkpoints/CP-0001.md`.
- `.project-memory/checkpoints/CP-0002.md`.

### Alterações realizadas

- Auditados todos os arquivos do aplicativo e o histórico Git disponível.
- Criado checkpoint inicial vazio com tags `BASELINE-0001` e `CP-0001`, mantendo
  a árvore original do aplicativo e todos os commits anteriores.
- Instaladas instruções de leitura prévia, registros obrigatórios e checkpoints
  antes/depois, com manutenção pelo agente sem lembretes do usuário.
- Documentados módulos, modelo de dados, login, sincronização, migração, inclusão,
  seleção de dia e marca-texto. Registradas ausências reais de PWA, dark mode,
  editor rico, autosave de rascunho e `design_system.html`.
- Registradas cinco decisões iniciais, distinguindo requisitos do pedido de
  observações de arquitetura sem motivação histórica conhecida.
- Registrados quatro problemas preexistentes, sem modificar o aplicativo.
- Documentada restauração total, por arquivo e seletiva, preservando a memória
  mesmo quando o alvo antecede sua criação.
- Estabelecidas tags imutáveis e finalização de hashes por commit complementar
  de metadados vinculado à mesma tarefa, sem criar um prompt fictício.

### Funcionalidades afetadas

Somente o fluxo de desenvolvimento, documentação, rastreabilidade e recuperação
de versões. Login, dados, marca-texto, interface e demais comportamentos do aplicativo
permanecem iguais ao baseline.

### Possíveis impactos

- Agentes devem manter os registros para evitar documentação desatualizada;
  não há hook automático monitorando edições de ferramentas externas.
- Rollback de arquivos não restaura dados/configurações do Firebase.
- Checkpoints permanecem locais; nenhum push, deploy ou backup remoto foi feito.
- Problemas já presentes permanecem abertos em `KNOWN_ISSUES.md`.

### Testes realizados

- Inventário completo dos cinco arquivos originais, leitura integral de HTML/CSS/JS
  e auditoria de commits, branch e árvore inicialmente limpa.
- Recuperação de `BASELINE-0001` por `git archive` em diretório temporário, extração
  e comparação SHA-256 dos cinco arquivos: idênticos byte a byte. A exportação
  usa `-c core.autocrlf=false` para preservar LF; primeiro ensaio detectou somente
  conversão CRLF da configuração local, sem mudança no aplicativo.
- Comparação Git do aplicativo com o checkpoint inicial: nenhuma diferença.
- Execução local do `app.js` real em V8 com importações substituídas por DOM/Auth/
  Firestore simulados, reproduzindo duplicação por Enter, perda de novo rascunho
  durante gravação e retenção do rascunho no logout. São defeitos anteriores,
  registrados como `ISSUE-0002` a `ISSUE-0004`, sem acesso ao serviço remoto.
- Conferência do asset Apple ausente (`ISSUE-0001`) pelo HTML e inventário.
- Revisão independente da fidelidade de `CURRENT_STATE.md`/`ARCHITECTURE.md` e
  dos comandos/pathspecs de rollback que excluem a memória.
- Execução do comando de rollback em repositório temporário descartável: restaurou
  arquivo alterado, recuperou arquivo excluído e removeu arquivo adicionado depois
  do alvo; preservou SHA-256 de `AGENTS.md` e da memória, inclusive checkpoint
  aninhado. Índice e árvore resultantes coincidiram com o código do alvo.
- Validação de estrutura/campos/IDs, resolução das tags, integridade Git e
  `git diff --check` na finalização.
- Não realizados: login real, operações em Firestore real, console do aplicativo
  no navegador, homologação visual/responsiva e teste entre dispositivos.

### Resultado

**OK** para a infraestrutura de memória, preservação e recuperação do baseline.
Integração do aplicativo e validação visual: **Necessita teste manual**.
Nenhuma funcionalidade do aplicativo foi alterada.

## Histórico anterior à memória

Este quadro é um inventário factual do Git, não reconstrução de prompts ausentes:

| Data | Commit | Mensagem existente |
| --- | --- | --- |
| 2026-09-17 12:59:13 -03:00 | `b7a7c1704fe5a8314f4467abea0cc4afc8aa837a` | Adiciona ícone ao Caderno Online |
| 2026-09-17 11:20:23 -03:00 | `7f0dbb537ed0a5c21da77c606a0d7d467cff6983` | Integra Caderno Online com Firebase |
| 2026-09-17 11:02:54 -03:00 | `f4b7e9ff8807e0ee64b294402a43468c102cecd5` | Corrige estrutura do Caderno Online |

Os prompts, testes e razões dessas tarefas não foram fornecidos. Consulte os
diffs originais antes de atribuir detalhes adicionais. Todos os commits foram preservados.
