# Manual permanente dos agentes — Caderno Online

Este repositório mantém sua memória de desenvolvimento em `.project-memory/`.
Leia e mantenha essa memória em toda tarefa que modificar o projeto, sem depender
de o usuário repetir a instrução. Git é o mecanismo de versionamento e rollback;
os documentos explicam o contexto e relacionam pedidos a commits reais.

## Antes de qualquer alteração

1. Leia este `AGENTS.md`.
2. Leia `.project-memory/CURRENT_STATE.md`.
3. Leia o início e as entradas relevantes de `.project-memory/CHANGELOG.md`.
4. Leia `.project-memory/DECISIONS.md`.
5. Consulte os últimos registros e os pedidos relacionados em `.project-memory/PROMPTS.md`.
6. Leia `.project-memory/ARCHITECTURE.md` e os problemas relevantes em `KNOWN_ISSUES.md`.
7. Verifique `git status --short --branch`, `git diff`, `git diff --cached` e `git log -5 --oneline`.
8. Localize o último checkpoint estável em `CURRENT_STATE.md`, abra seu registro
   em `checkpoints/` e confirme a tag/commit no Git. Não confunda baseline com
   aplicativo testado em produção: respeite o nível de validação registrado.

Não comece uma alteração importante sem essas leituras. Para mudanças visuais,
consulte também `design_system.html` se existir; sua ausência atual está documentada.

## Fluxo obrigatório de trabalho

1. Defina o escopo e escolha os próximos IDs pelo maior número já utilizado;
   nunca reutilize IDs, inclusive após rollback.
2. Preserve alterações preexistentes. Revise diffs, arquivos novos e ignorados
   antes de criar um checkpoint; não sobrescreva trabalho não commitado.
3. Antes de uma tarefa significativa, crie um commit de checkpoint, mesmo vazio
   se a árvore estiver limpa, e uma tag anotada `CP-XXXX`. Registre seu hash.
4. Registre `PROMPT-XXXX` com resumo fiel e checkpoint inicial antes de implementar.
5. Implemente somente o escopo pedido, preservando funcionalidades não substituídas.
6. Valide o comportamento afetado, console e erros quando aplicável. Registre
   exatamente o que foi executado e o que ainda exige teste manual.
7. Acrescente uma entrada no topo de `CHANGELOG.md`; atualize `CURRENT_STATE.md`,
   `PROMPTS.md` e os registros de checkpoints. Atualize `ARCHITECTURE.md`,
   `DECISIONS.md` e `KNOWN_ISSUES.md` quando necessário.
8. Crie o commit final e sua tag anotada `CP-XXXX`. Resolva e confira os hashes.
   Se necessário, faça um commit complementar só de metadados da mesma tarefa
   para registrar o hash final, conforme `.project-memory/README.md`.
9. Confira o estado final do Git e informe os checkpoints, validações e limitações.

Mensagens de commit: `checkpoint: before PROMPT-XXXX <objetivo>` e
`docs|feat|fix: <resultado> [PROMPT-XXXX]`. O usuário autorizou checkpoints locais
como parte desse fluxo; não há autorização implícita para publicar ou fazer push.

Toda mudança deve ter registro proporcional. Ajustes mínimos podem ter uma
entrada breve, mas mudanças em layout importante, funcionalidades, JavaScript,
Firebase, banco, editor, calendário, login, salvamento, PWA, responsividade ou
arquitetura sempre exigem o fluxo completo com checkpoints antes e depois.

## Preservação e decisões

- Não remova funcionalidades silenciosamente. Descreva toda remoção solicitada.
- Firebase, dados, autenticação, migração, gravação e PWA exigem cuidado especial.
  Não altere dados remotos para testar documentação. Git não restaura Firestore
  nem contas, regras remotas ou armazenamento do navegador.
- Documente mudanças estruturais e seus impactos em `ARCHITECTURE.md`.
- `CURRENT_STATE.md` representa somente o presente; o histórico pertence ao
  `CHANGELOG.md`, com novas entradas no topo, sem apagar ou sobrescrever antigas.
- Preserve decisões anteriores, salvo nova solicitação que as substitua. Registre
  nova decisão e marque a anterior como `Substituída por DEC-XXXX`, conservando
  seu texto, motivo e vínculo histórico.
- **Se houver conflito entre uma nova solicitação e uma decisão histórica, siga a nova solicitação, mas registre claramente que a decisão anterior foi substituída.**
- Problemas corrigidos permanecem registrados como `FIXED`, com o CHANGE responsável.
- Nunca apague `AGENTS.md`, `.project-memory/`, commits ou tags de checkpoints
  durante refatorações ou rollbacks. Não reescreva tags/commits publicados.
- Não invente prompts antigos, datas, testes, funcionalidades ou razões históricas.
  Distinga observação no código, decisão solicitada e hipótese.

## Rollback e comparações

Consulte `.project-memory/ROLLBACK.md` antes de restaurar. Interprete “volte um
prompt” como o checkpoint **anterior à última tarefa** em `PROMPTS.md`, e não
simplesmente `HEAD~1`. “Volte para PROMPT-XXXX” significa seu checkpoint final;
“antes do PROMPT-XXXX” significa seu checkpoint inicial. Pedidos por assunto
devem ser resolvidos pelos registros; esclareça somente se houver ambiguidade real.

Antes de rollback amplo, crie checkpoint do estado atual. Preserve a memória,
restaure o código em um novo commit e documente o rollback como nova tarefa.
Compare alterações posteriores antes de recuperar trechos isolados. Não use
`reset --hard`, `clean -fd`, rebase destrutivo ou force-push como rotina de rollback.

## IDs

Use `PROMPT-0001`, `CHANGE-0001`, `CP-0001`, `DEC-0001`, `ISSUE-0001` e seguintes,
com séries independentes. Cada checkpoint pré/pós possui seu próprio arquivo.
`BASELINE-0001` identifica o estado inicial preservado; não mova essa tag.

## Escopo da instalação inicial

`PROMPT-0001` instala somente memória, documentação e checkpoints. Na criação
inicial, os documentos ainda inexistentes são preenchidos a partir da auditoria
do repositório; essa exceção de bootstrap não se aplica a tarefas futuras.
Não fazer redesign, correções funcionais ou alterações de Firebase nessa tarefa.
