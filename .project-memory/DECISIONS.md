# Decisões

Preserve entradas anteriores. Ao substituir uma decisão, crie outra e atualize
o status da antiga para `Substituída por DEC-XXXX`, sem apagar seu contexto.
As razões originais das escolhas de código anteriores à memória não são conhecidas;
observações do baseline estão identificadas como tal.

## DEC-0001

Título: Memória obrigatória e Git como mecanismo oficial de rollback.

Status: Ativa.

Motivo: Permitir que agentes futuros entendam o projeto e relacionem cada tarefa
ao estado anterior e posterior, sem depender do histórico de uma conversa.

Impacto: Leitura prévia, registros proporcionais a toda mudança, IDs sequenciais
e checkpoints antes/depois de tarefas significativas. Histórico permanente e
novas entradas no topo; `CURRENT_STATE.md` permanece um retrato do presente.

Arquivos relacionados: `AGENTS.md`, `.project-memory/README.md`, `CHANGELOG.md`,
`CURRENT_STATE.md`, `PROMPTS.md`, `checkpoints/`.

Data: 2026-09-22.

Origem/evidência: Solicitação explícita em `PROMPT-0001`.

## DEC-0002

Título: Preservar integralmente o aplicativo durante a instalação da memória.

Status: Ativa para o escopo de `PROMPT-0001`.

Motivo: O usuário solicitou somente infraestrutura, sem redesign, mudanças de
Firebase, correções funcionais ou alterações na lógica de negócio.

Impacto: Os cinco arquivos originais ficam idênticos ao `BASELINE-0001`.
Problemas encontrados são registrados, sem correção nesta tarefa. Uma solicitação
futura pode autorizar mudanças; este registro conserva o escopo da instalação.

Arquivos relacionados: `app.js`, `firebase.js`, `index.html`, `style.css`, `icone.png`.

Data: 2026-09-22.

Origem/evidência: `PROMPT-0001`, seção de primeira execução.

## DEC-0003

Título: Documentar Firebase Auth e Firestore como arquitetura existente.

Status: Ativa.

Motivo: O código recebido usa login por e-mail/senha e documentos em
`users/{uid}/caderno/{id}` com sincronização por `onSnapshot`. A motivação original
para selecionar Firebase não foi registrada e não é inferida aqui.

Impacto: Mudanças em conta, dados, migração, autenticação ou gravação precisam
considerar esses contratos. Git não substitui backup de dados/configurações remotas.
Não atribuir ao sistema um editor rico, autosave de rascunho ou PWA inexistentes.

Arquivos relacionados: `app.js`, `firebase.js`, `ARCHITECTURE.md`.

Data: 2026-09-22 (data de documentação, não da escolha original).

Origem/evidência: Código no baseline e commit anterior `7f0dbb5` de 2026-09-17.

## DEC-0004

Título: Restaurar por novos commits e preservar a memória atual.

Status: Ativa.

Motivo: O usuário quer rollback reversível, mantendo rastreabilidade e permitindo
desfazer também um rollback. O baseline anterior à instalação não contém memória.

Impacto: Criar checkpoint de segurança antes de restaurar. Excluir `AGENTS.md` e
`.project-memory/` da restauração do código e registrar o rollback como nova tarefa.
Nunca mover tags antigas, apagar registros ou usar limpeza/reset destrutivo como
rotina. “Antes do prompt” indica checkpoint inicial; “para o prompt” indica final.

Arquivos relacionados: `AGENTS.md`, `ROLLBACK.md`, `PROMPTS.md`, `checkpoints/`.

Data: 2026-09-22.

Origem/evidência: Requisitos de preservação/rollback de `PROMPT-0001`; convenção
operacional de destino explicitada em `ROLLBACK.md`.

## DEC-0005

Título: Usar tags imutáveis e permitir commit complementar de hashes.

Status: Ativa.

Motivo: O hash de um commit depende do conteúdo; não pode ser gravado literalmente
no próprio commit que ele identifica. É necessário evitar hashes provisórios falsos
e evitar uma sequência infinita de commits para documentar o hash anterior.

Impacto: Tags anotadas `CP-XXXX`/`BASELINE-0001` nunca são movidas. O checkpoint
final usa inicialmente sua referência exata; um commit posterior apenas de
metadados pode registrar o hash literal sob o mesmo PROMPT/CHANGE. Não é nova tarefa.

Arquivos relacionados: `README.md`, `CURRENT_STATE.md`, `checkpoints/`, `PROMPTS.md`.

Data: 2026-09-22.

Origem/evidência: Implementação do requisito de hashes/checkpoints de `PROMPT-0001`.
