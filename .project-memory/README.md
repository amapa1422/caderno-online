# Memória do projeto

Este sistema foi criado por `PROMPT-0001` em 22/09/2026. Ele associa solicitações,
mudanças, decisões e checkpoints Git. O baseline é `BASELINE-0001`, equivalente
a `CP-0001`, commit `2eb960f0b473a216e82e4d242dff044ecac0e481`.

## Recuperacao em PROMPT-0009

Em 25/09/2026, os documentos removidos por b57aa73 foram recuperados de ac8158f.
Tags antigas nao vieram neste checkout e nao constavam no remoto consultado;
os hashes historicos continuam no Git. Nao recriar/mover tags antigas para
simular verificacao. CP-0015 e seguintes sao tags novas desta tarefa.

## Arquivos e finalidade

| Arquivo | Conteúdo |
| --- | --- |
| `../AGENTS.md` | Instruções permanentes que cada agente deve seguir. |
| `CURRENT_STATE.md` | Retrato atual, funcionalidades, arquivos e checkpoint estável. |
| `CHANGELOG.md` | Histórico detalhado, novas entradas no topo, sem substituir antigas. |
| `DECISIONS.md` | Decisões, motivos conhecidos e substituições explícitas. |
| `PROMPTS.md` | Pedidos resumidos e vínculo exato com checkpoints antes/depois. |
| `ARCHITECTURE.md` | Estrutura e fluxos efetivamente encontrados no código. |
| `KNOWN_ISSUES.md` | Defeitos conhecidos, evidências e situação de cada um. |
| `ROLLBACK.md` | Localização, comparação e restauração reversível de versões. |
| `checkpoints/CP-XXXX.md` | Registro individual de cada checkpoint Git pré ou pós-tarefa. |

## Leitura antes de trabalhar

`AGENTS.md` → `CURRENT_STATE.md` → entradas relevantes de `CHANGELOG.md` →
`DECISIONS.md` → últimos `PROMPTS.md` → `ARCHITECTURE.md` → problemas pertinentes.
Depois confira branch, alterações locais, último commit e o checkpoint estável.
Para restaurar, leia também `ROLLBACK.md`; para mudar a interface, consulte
`design_system.html` se existir (ausente no baseline).

## Antes de uma alteração

1. Entenda o pedido e o estado atual. Inspecione o Git:

   ```powershell
   git status --short --branch
   git diff
   git diff --cached
   git ls-files --others --exclude-standard
   git log -5 --oneline
   git tag --list 'CP-*' --sort=refname
   ```

2. Examine arquivos modificados/novos antes de adicioná-los. Preserve trabalho
   anterior em checkpoint com descrição da origem; não o atribua à nova tarefa.
   Não inclua credenciais, arquivos externos ou artefatos só por estarem na pasta.
   Evite `git add .` sem revisar o conteúdo.
3. Determine os próximos IDs. Séries independentes, quatro dígitos mínimos, nunca
   reutilizadas. Conte **tarefas**, não commits, ao interpretar “volte um prompt”.
4. Crie checkpoint inicial do estado revisado. Se estiver limpo, um commit vazio
   documenta a fronteira. Exemplo para a próxima tarefa (substitua os IDs depois):

   ```powershell
   git commit --allow-empty -m "checkpoint: before PROMPT-0002 <objetivo>"
   # Só prossiga se o comando anterior terminar com sucesso.
   git tag -a CP-0003 -m "Antes de PROMPT-0002"
   git rev-parse 'CP-0003^{commit}'
   ```

5. Registre o hash no arquivo `checkpoints/CP-0003.md`. Acrescente `PROMPT-0002`
   ao topo de `PROMPTS.md` antes de implementar. Enquanto a tarefa estiver aberta,
   marque seu checkpoint final como pendente; não invente um hash.

## Depois de uma alteração

1. Teste o comportamento afetado. Para interface/JS, verifique console e erros,
   login, dados e responsividade conforme o escopo. Declare testes não realizados.
2. Atualize o retrato em `CURRENT_STATE.md` e acrescente `CHANGE-XXXX` ao topo do
   changelog. Complete o prompt e os registros dos checkpoints. Documente decisões,
   arquitetura e problemas quando mudarem.
3. Revise `git diff --check`, `git diff` e o conteúdo a ser commitado.
4. Adicione os caminhos revisados explicitamente, faça o commit final e crie a tag
   anotada do checkpoint final. Exemplo:

   ```powershell
   git commit -m "feat: <resultado> [PROMPT-0002]"
   git tag -a CP-0004 -m "Depois de PROMPT-0002; <validacao>"
   git rev-parse 'CP-0004^{commit}'
   git status --short --branch
   ```

5. Confira que os registros apontam para os commits corretos e reporte o resultado.
   Não publique/push automaticamente; os checkpoints desta instalação são locais.

## Hashes, tags e estado estável

Um commit não pode incluir seu próprio hash literal sem mudar esse hash. Portanto:

- No commit final, o registro pode usar `refs/tags/CP-XXXX`, que será criado
  imediatamente após o commit. Essa referência deve ser única e nunca movida.
- Resolva a tag com `git rev-parse 'CP-XXXX^{commit}'`. O sufixo importa: uma tag
  anotada também tem um hash próprio, diferente do hash do commit.
- Para guardar o hash literal nos documentos, faça depois um commit complementar
  **somente de metadados**, vinculado ao mesmo PROMPT/CHANGE. Ele não é uma nova
  tarefa nem exige uma sequência infinita de checkpoints. Não mova a tag final.
- O checkpoint estável pode ser ancestral de `HEAD` quando os commits posteriores
  apenas completam esses metadados. Registre isso em `CURRENT_STATE.md`.
- Só declare estabilidade no nível validado. O baseline inicial é restaurável e
  preserva o código recebido; não equivale à homologação de login/Firestore online.
- Se uma tarefa terminar parcialmente, registre esse estado e mantenha a referência
  ao último checkpoint realmente validado, sem rotular a nova versão como estável.

`AGENTS.md` torna a manutenção obrigatória para agentes que trabalham aqui. Não há
hook ou serviço que escreva contexto automaticamente, e um editor externo não é
monitorado. O agente deve executar o fluxo sem depender de lembretes do usuário.

## Formatos para novas entradas

Use estes campos, com conteúdo concreto em vez de “alterações diversas”:

```text
## CHANGE-XXXX
Data: AAAA-MM-DD
Hora: HH:mm:ss -03:00 (America/Sao_Paulo)
Prompt/Task:
Checkpoint inicial:
Checkpoint final:
### Objetivo
### Arquivos alterados
### Alterações realizadas
### Funcionalidades afetadas
### Possíveis impactos
### Testes realizados
### Resultado
OK / Parcial / Necessita teste manual
```

```text
## PROMPT-XXXX
Data:
Resumo do pedido:
Objetivo:
Arquivos afetados:
CHANGE relacionado:
Checkpoint antes:
Checkpoint depois:
Trecho fiel da solicitação:
```

```text
# CP-XXXX
Checkpoint:
Data:
Commit:
Prompt:
Change:
Estado:
Descrição:
Arquivos alterados:
Observações:
```

```text
## DEC-XXXX
Título:
Status: Ativa / Substituída por DEC-XXXX
Motivo:
Impacto:
Arquivos relacionados:
Data:
Origem/evidência:
```

```text
## ISSUE-XXXX
Descrição:
Status: OPEN / INVESTIGATING / FIXED / WONTFIX
Prioridade:
Arquivos relacionados:
Quando começou:
Possível causa:
Observações:
# Se FIXED, informar CHANGE responsável e validação.
```

Não altere entradas passadas do changelog para narrar acontecimentos novos.
Adicione nova entrada e referências cruzadas. Decisões/problemas podem ter o status
atualizado, preservando seu contexto anterior. Finalizar campos pendentes da tarefa
aberta ou inserir seu hash correto é permitido e fica registrado no Git.

## Rollback

Resolva o pedido em `PROMPTS.md`, confirme o checkpoint no Git, preserve o estado
atual e restaure por um novo commit, mantendo esta memória. Para “volte um prompt”,
use o checkpoint inicial da última tarefa; para “volte para PROMPT-XXXX”, seu final.
Consulte os comandos e os cuidados de restauração parcial em `ROLLBACK.md`.
Git restaura arquivos versionados; Firestore e contas não estão nesses checkpoints.
