# Rollback e comparação de versões

Git é o mecanismo de restauração. Esta memória fornece o contexto para escolher
o destino correto. Restaurar código não restaura documentos do Firestore, contas
Auth, regras remotas, localStorage ou configurações da hospedagem.

## Resolver a solicitação

Leia `AGENTS.md`, `CURRENT_STATE.md`, os últimos `PROMPTS.md`/`CHANGELOG.md`,
`DECISIONS.md` e os checkpoints envolvidos antes de agir.

| Pedido | Destino/operação |
| --- | --- |
| “Volte um prompt” / “Desfaça a última alteração” | Checkpoint inicial da última tarefa registrada. Não usar simplesmente `HEAD~1`. |
| “Volte duas alterações” | Checkpoint inicial da mais antiga das duas últimas tarefas; commits só de metadados não contam como tarefa. |
| “Volte para antes do redesign” | Buscar o pedido do redesign e usar seu checkpoint inicial; esclarecer se houver mais de um candidato. |
| “Volte para PROMPT-0014” | Checkpoint final de `PROMPT-0014`. “Antes de PROMPT-0014” usa o inicial. |
| “Restaure CP-0010” | Commit identificado pela tag e pelo registro de `CP-0010`. |
| “Qual era o site antes dessa mudança?” | Examinar/exportar o checkpoint inicial sem mudar a árvore ativa. |
| “Compare com PROMPT-0007” | Diff entre o checkpoint final desse prompt e o estado atual, incluindo pendências relevantes. |
| “Mostre o que mudou desde o último checkpoint” | Diff do último checkpoint registrado para a árvore atual; listar também novos arquivos. |
| “Restaure apenas style.css do checkpoint anterior” | Resolver o checkpoint anterior e restaurar somente esse caminho. |
| “Recupere a lógica antiga do calendário sem desfazer o redesign” | Comparar implementações e integrar apenas trechos necessários, verificando dependências. |

Os IDs acima são exemplos de pedidos futuros, não registros existentes.
O projeto atual possui lógica de datas em `app.js`, não calendário mensal próprio.
Um rollback é uma nova tarefa com novo PROMPT/CHANGE; não reutilize o ID restaurado.
Se o usuário pedir para desfazer um rollback, use o checkpoint anterior a ele.

## Localizar e conferir checkpoints

Execute na raiz do repositório:

```powershell
git status --short --branch
git log --oneline --decorate -15
git tag --list 'CP-*' --sort=refname
git rev-parse 'CP-0001^{commit}'
git rev-parse 'BASELINE-0001^{commit}'
git show --stat 'CP-0001^{commit}'
```

`CP-0001` e `BASELINE-0001` apontam a
`2eb960f0b473a216e82e4d242dff044ecac0e481`.
Leia também `checkpoints/CP-0001.md`. Use `^{commit}` para obter o hash do commit,
não o objeto da tag anotada. Se documento e Git divergirem, investigue antes de
restaurar; não mova a tag para fazê-la coincidir artificialmente.

## Antes de qualquer restauração

1. Leia o prompt e determine explicitamente destino e escopo (todo código,
   um arquivo ou funções). Compare o destino com as alterações posteriores.
2. Inspecione `git status --short --untracked-files=all`, `git diff`,
   `git diff --cached` e, quando pertinente, `git ls-files --others --ignored --exclude-standard`.
3. Preserve trabalho pendente. Adicione ao checkpoint apenas arquivos revisados,
   incluindo código novo relevante. Não descarte mudanças preexistentes nem inclua
   segredos no Git. Preserve arquivos ignorados/não versionáveis separadamente se
   puderem ser afetados. Não execute `git clean` para obter uma árvore limpa.
4. Crie checkpoint de segurança antes da restauração e registre seu hash.
   Use IDs livres; os próximos após a instalação serão PROMPT-0002 e CP-0003/0004.
   Exemplo com esses IDs, **somente após revisar e adicionar os arquivos pendentes**:

   ```powershell
   git commit --allow-empty -m "checkpoint: before PROMPT-0002 rollback"
   if ($LASTEXITCODE -ne 0) { throw 'Checkpoint de seguranca falhou.' }
   git tag -a CP-0003 -m "Antes de PROMPT-0002 rollback"
   if ($LASTEXITCODE -ne 0) { throw 'Registro da tag falhou.' }
   git rev-parse 'CP-0003^{commit}'
   ```

5. Acrescente o novo PROMPT e registro do checkpoint. Só então restaure.
   Não avance se algum comando falhar. No Windows PowerShell,
   `$ErrorActionPreference = 'Stop'` não substitui a checagem de `$LASTEXITCODE`
   para comandos Git.

## Restaurar todo o código sem apagar a memória

Após o checkpoint de segurança, para retornar o código ao baseline:

```powershell
git restore --source=CP-0001 --staged --worktree -- ':(top)' ':(top,exclude)AGENTS.md' ':(top,exclude).project-memory'
if ($LASTEXITCODE -ne 0) { throw 'Falha ao restaurar o codigo.' }
git diff --cached --stat
git diff --cached
git status --short
```

Troque `CP-0001` pelo alvo confirmado. O comando restaura os arquivos versionados,
incluindo adições/exclusões necessárias para o alvo, mas exclui a memória e o
manual dos agentes. Esses documentos devem continuar na versão atual e registrar
o rollback. Arquivos não rastreados/ignorados não são uma cópia do checkpoint;
analise sobras e possíveis colisões separadamente, sem exclusão automática.

Depois de testar, atualize `CURRENT_STATE.md`, arquitetura quando necessário,
changelog, prompt e checkpoints. Adicione somente os documentos revisados e
crie o commit final do rollback com nova tag, por exemplo:

```powershell
git add -- AGENTS.md .project-memory
if ($LASTEXITCODE -ne 0) { throw 'Falha ao preparar documentacao.' }
git commit -m "revert: restore application to CP-0001 [PROMPT-0002]"
if ($LASTEXITCODE -ne 0) { throw 'Falha ao registrar rollback.' }
git tag -a CP-0004 -m "Depois de PROMPT-0002 rollback"
if ($LASTEXITCODE -ne 0) { throw 'Falha ao registrar checkpoint final.' }
git rev-parse 'CP-0004^{commit}'
git diff --exit-code CP-0001 HEAD -- ':(top)' ':(top,exclude)AGENTS.md' ':(top,exclude).project-memory'
if ($LASTEXITCODE -ne 0) { throw 'O codigo final diverge do destino.' }
git status --short --branch
```

Registre o hash final conforme o procedimento de metadados no `README.md`.
Os IDs de exemplo devem ser substituídos se já usados. Nunca force/crie novamente
uma tag existente. O checkpoint de segurança permite desfazer este rollback pelo
mesmo procedimento, sem apagar nenhum commit.

Esse comando foi validado em `PROMPT-0001` num repositório temporário: recuperou
um arquivo alterado e outro excluído, removeu uma adição posterior e preservou
o SHA-256 do manual e da memória aninhada. O repositório ativo não foi restaurado
durante esse teste.

## Restaurar somente um arquivo

Depois de resolver o alvo e preservar pendências:

```powershell
git diff CP-0001 -- style.css
git restore --source=CP-0001 --staged --worktree -- style.css
if ($LASTEXITCODE -ne 0) { throw 'Falha ao restaurar style.css.' }
git diff --cached -- style.css
```

Teste a compatibilidade com HTML/JS atuais. Registre e faça o commit de rollback
parcial com checkpoints antes/depois. Para recuperar um arquivo apagado no presente,
o mesmo comando funciona se ele existir no alvo. Não substitua `AGENTS.md` nem a
memória atual por suas versões antigas; consulte-as com `git show`.

## Comparar versões e consultar o passado

```powershell
# Dois estados commitados.
git diff CP-0001 CP-0002 -- app.js firebase.js index.html style.css icone.png
# Estado atual, inclusive alteracoes locais em arquivos rastreados.
git diff CP-0002 -- app.js firebase.js index.html style.css icone.png
# Descobrir arquivos novos, que nao aparecem em diff normal.
git ls-files --others --exclude-standard
# Inspecionar um arquivo antigo sem modifica-lo.
git show CP-0001:app.js
# Localizar alteracoes de uma funcao no historico.
git log -p -S 'formatarDataLonga' -- app.js
```

Para comparações gerais, omita a lista de arquivos ou use os pathspecs que excluem
a memória, conforme o objetivo. Use a tag obtida do PROMPT, sem adivinhar um hash.

## Recuperar lógica antiga mantendo mudanças posteriores

Compare o arquivo no alvo e no presente. Identifique funções, eventos, IDs do DOM,
CSS e contratos de dados necessários; transplante somente o trecho compatível.
Por exemplo, a seleção de dia depende do HTML `#dataSelecionada` e das funções de
data/estado em `app.js`. Restaurar `app.js` inteiro pode desfazer outras funções.

Quando adequado, `git restore --patch --source=CP-0001 -- app.js` permite selecionar
trechos interativamente. Reveja o diff completo e faça testes da função recuperada
e das funcionalidades preservadas antes de registrar o checkpoint final.

## Inspeção isolada e prova de restauração do baseline

É possível exportar a versão antiga sem tocar no aplicativo ativo ou no índice:

```powershell
$baselinePreview = Join-Path ([System.IO.Path]::GetTempPath()) ('caderno-preview-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $baselinePreview | Out-Null
$baselineZip = Join-Path $baselinePreview 'baseline.zip'
# O baseline usa LF; esta opcao evita conversao de linhas na exportacao.
git -c core.autocrlf=false archive --format=zip --output=$baselineZip BASELINE-0001
if ($LASTEXITCODE -ne 0) { throw 'Falha ao exportar baseline.' }
Expand-Archive -LiteralPath $baselineZip -DestinationPath (Join-Path $baselinePreview 'site')
```

Em `PROMPT-0001`, esse procedimento foi executado e os cinco arquivos extraídos
tiveram SHA-256 idêntico ao aplicativo recebido (valores em `CP-0001.md`). O primeiro
ensaio com a configuração local `core.autocrlf=true` exportou textos em CRLF; a
execução acima preservou LF e confirmou igualdade byte a byte. A configuração do
repositório e os arquivos originais não foram alterados.

Para visualizar o site exportado, use um servidor HTTP local disponível. A cópia
mantém a configuração Firebase original: entrar ou manipular notas ainda pode
acessar os dados remotos reais. Uma exportação não é um ambiente de banco isolado.
Não use redirecionamento `git show > arquivo` para restaurar, pois o PowerShell
pode mudar a codificação. Use `git restore` ou `git archive`.

## Limites e preservação

- `CP-0001` não contém `AGENTS.md` nem `.project-memory/`, pois antecede sua criação.
  Por isso restaurar a branch com reset/checkout integral perderia as instruções
  atuais; use a restauração com exclusões acima.
- Não usar `reset --hard`, `clean -fd`, rebase destrutivo ou force-push como rotina.
- Não apagar histórico, reutilizar IDs ou mover tags para esconder uma mudança.
- Checkpoints são locais nesta instalação. Cópia remota/backup do repositório não
  foi criada nem enviada. A recuperação depende de preservar também a pasta `.git`.
