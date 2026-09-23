# Histórico de alterações

Adicione novas entradas no topo, após esta introdução. Preserve as anteriores;
não substitua uma mudança antiga por outra. Datas usam America/Sao_Paulo.

## CHANGE-0003

Data: 2026-09-23.
Hora: 10:24:28 -03:00 (checkpoint inicial); horário final no registro CP-0005.
Prompt/Task: PROMPT-0003 — finalizar o pedido de ontem, identificado em PROMPT-0002.
Checkpoint inicial: CP-0004, `3927d2b19e9d10a93bb66efd273e10880d286bc3`.
Checkpoint final: CP-0005, commit em `refs/tags/CP-0005`.

### Objetivo

Concluir a implementação parcial do design system, preservando o trabalho recebido,
validando funcionalidades e responsividade e finalizando memória/checkpoints.

### Arquivos alterados

- app.js e style.css.
- tests/browser-checks.js, tests/browser.ps1; novos responsive-checks.js e README.md.
- .project-memory/CURRENT_STATE.md, ARCHITECTURE.md, CHANGELOG.md, PROMPTS.md,
  DECISIONS.md, KNOWN_ISSUES.md e novos checkpoints/CP-0004.md e CP-0005.md.
- CP-0004 preservou também os arquivos de CHANGE-0002 já existentes antes da retomada.

### Alterações realizadas

- Revisado o código parcial e confirmada referência estável anterior CP-0002,
  distinguindo validação documental de homologação real.
- Corrigido overflow de tooltip no tablet e fixada a coluna do workspace quando
  sidebar/calendário saem do fluxo. Layout validado até 320 px.
- Corrigido foco imediato de drawers, evitando transição de visibility ao abrir.
- Ajustado contraste de botões primários e eyebrow para accent-700 da referência.
- Protegidos awaits de edição/navegação contra troca de sessão; renderização
  atualizada quando uma gravação impede navegação.
- Ampliados testes de autosave pendente, erros, troca de conta e teclado mobile;
  runner guarda diagnóstico/captura quando detecta overflow.
- Atualizados estado, arquitetura, decisões, problemas corrigidos e instruções
  para reproduzir testes. PROMPT-0002 concluído por esta retomada.

### Funcionalidades afetadas

Conclusão do redesign de CHANGE-0002: interface, navegação, editor/rascunhos,
temas, calendário, marca-textos e acessibilidade. Nenhuma funcionalidade removida.
firebase.js e icone.png permanecem idênticos ao checkpoint pré-redesign.

### Possíveis impactos

Grifos de trechos usam campo opcional grifos; regras remotas não versionadas
precisam aceitá-lo. Rascunhos são locais à aba, não persistidos após recarregar.
Autosave atende edição de notas existentes; novas notas exigem Adicionar/Enter.
Nenhum dado remoto foi alterado nos testes. Sem push/deploy.

### Testes realizados

- `powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1`:
  **37 verificações funcionais** (login/erros, migração, snapshot, inclusão,
  duplicação por Enter, rascunhos, falhas/retry, edição/autosave, grifos, navegação,
  busca, temas, exclusão, logout e troca de conta).
- **10 verificações de teclado/painéis**: foco inicial, fundo inert, Tab/Shift+Tab,
  Escape, backdrop, calendário e paleta no viewport de 320 px.
- **18 combinações**: larguras 1920, 1440, 1280, 1024, 768, 430, 390, 375, 320 px,
  nos dois temas; nenhum overflow de documento/workspace. Movimento reduzido
  aprovado; zero erros no console do navegador com backend simulado.
- Capturas 375/light e 1440/dark inspecionadas visualmente. Captura 768/light
  durante diagnóstico confirmou problema de overflow antes da correção.
- `powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1 -Live`:
  título Caderno Online, login visível, 13 cores carregadas, zero erros de console.
  SDK real inicializado em perfil temporário; nenhuma autenticação/escrita remota.
- Tentativa inicial restrita não suportou HttpListener; execução fora da restrição
  permitiu a suíte. Falhas iniciais de overflow/foco foram corrigidas e revalidadas.
- `git diff --check`, comparação de firebase.js/icone.png com CP-0003 e revisão
  dos diffs/artefatos/IDs antes de commit. Hash final registrado em metadados.
- Não realizados: login/CRUD real, regras, testes entre dispositivos, leitor de
  tela e Safari/iOS. Os mocks não certificam integração remota.

### Resultado

**OK para implementação e validação local.** SDK real inicializa corretamente.
**Necessita teste manual** para integração autenticada/produção. CP-0005 é estável
somente nesse nível de validação. Checkpoints e alterações permanecem locais.

## CHANGE-0002

Data: 2026-09-22 (início registrado); trabalho parcial preservado em 2026-09-23.
Hora: 16:53:42 -03:00 (checkpoint inicial); conclusão por CHANGE-0003.
Prompt/Task: PROMPT-0002 — aplicar design system oficial.
Checkpoint inicial: CP-0003, `ac98d0649274c25d885b0e6074764ade3e800406`.
Checkpoint intermediário: CP-0004, `3927d2b19e9d10a93bb66efd273e10880d286bc3`.
Checkpoint final após retomada: CP-0005, `refs/tags/CP-0005`.

### Objetivo

Aplicar design system preservando autenticação, notas, sincronização e banco.

### Arquivos alterados

index.html, style.css, app.js; novos design_system.html, .gitignore,
tests/browser.ps1, browser-checks.js, firebase.mock.js; PROMPTS.md e CP-0003.md.
São arquivos já modificados/novos no início de PROMPT-0003, preservados em CP-0004.

### Alterações realizadas

Implementação recebida: sidebar com busca, editor central, calendário mensal,
resumo do dia, temas, painéis móveis, animação de folha, feedback de gravação,
13 cores e grifos de trecho, edição simples com autosave, rascunhos por data,
proteção contra inclusões duplicadas e limpeza de rascunhos ao trocar sessão.
Ícone Apple passou a apontar para icone.png existente. Testes locais preparados.

### Funcionalidades afetadas

Interface e edição/navegação ampliadas. Login, migração, inclusão, conclusão,
exclusão e sincronização preservados. A aparência de espiral/papel pautado foi
substituída pelo design system solicitado; não houve remoção funcional.

### Possíveis impactos

Novo campo opcional grifos para trechos e preferências locais de tema/painéis.
Sem mudança de firebase.js, regras remotas ou dados existentes.

### Testes realizados

Não há registro conclusivo de testes executados em 2026-09-22. A retomada
encontrou apenas artefato de erro do servidor, não prova de validação completa.
Os testes efetivamente executados e as correções estão em CHANGE-0003.

### Resultado

Implementação parcial preservada em CP-0004 e **concluída por CHANGE-0003**.
Esta entrada retrospectiva descreve arquivos observados e o pedido registrado;
não inventa detalhes de conversa, horários ou validações de ontem.

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
