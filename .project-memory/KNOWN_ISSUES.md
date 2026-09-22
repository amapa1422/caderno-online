# Problemas conhecidos

Levantamento do código recebido em `BASELINE-0001`, sem correções funcionais.
Estados: `OPEN`, `INVESTIGATING`, `FIXED`, `WONTFIX`. Ao corrigir, preserve a entrada,
marque `FIXED` e indique o CHANGE responsável e a validação.

## ISSUE-0001

Descrição: O HTML referencia `./icon-192.png` como `apple-touch-icon`, mas esse
arquivo não existe no repositório. Só existe `icone.png`, usado como favicon.

Status: OPEN.

Prioridade: Baixa.

Arquivos relacionados: `index.html`, `icone.png`; referência ausente `icon-192.png`.

Quando começou: A referência foi adicionada no commit `b7a7c17` de 2026-09-17;
identificada nesta auditoria de 2026-09-22.

Possível causa: O link Apple foi incluído sem o asset correspondente.

Observações: Confirmado pela leitura do HTML e inventário Git. Requisições em uma
hospedagem somente com esses arquivos não encontrarão o asset. Não foi testada a
resposta da hospedagem real. Nenhum ícone foi adicionado nesta tarefa.

## ISSUE-0002

Descrição: Pressionar Enter repetidamente durante uma inclusão pendente pode
criar documentos diferentes com o mesmo texto.

Status: OPEN.

Prioridade: Média.

Arquivos relacionados: `app.js`, função `adicionarItem()` e evento `keydown` de
`novoItem` (linhas 343–380 no baseline).

Quando começou: Presente no `BASELINE-0001`; início exato não investigado.

Possível causa: Somente o botão é desativado. A função e o evento de teclado não
verificam uma gravação em andamento; cada chamada cria outro ID antes do `await`.

Observações: Reproduzido com o código real em V8, substituindo importações por
DOM/Auth/Firestore simulados: dois Enter antes de resolver `setDoc` geraram dois
documentos com IDs distintos. Não houve escrita no Firebase real. Correção adiada
por estar fora do escopo de `PROMPT-0001`.

## ISSUE-0003

Descrição: Um novo rascunho digitado enquanto a inclusão anterior está pendente
pode ser apagado quando a gravação anterior termina.

Status: OPEN.

Prioridade: Média.

Arquivos relacionados: `app.js`, função `adicionarItem()`, linhas 359–361 no baseline.

Quando começou: Presente no `BASELINE-0001`; início exato não investigado.

Possível causa: O campo continua editável durante `await salvarItem(item)`; depois
a rotina executa `novoItem.value = ""` sem verificar se o usuário alterou o texto.

Observações: Reproduzido em execução V8 com dependências simuladas, mantendo
`setDoc` pendente, digitando outro texto e concluindo a primeira operação.
O texto novo desapareceu. Não corrigido nesta tarefa de documentação.

## ISSUE-0004

Descrição: O rascunho do campo de inclusão permanece no DOM após logout e pode
reaparecer ao autenticar outra conta na mesma página, sem recarregá-la.

Status: OPEN.

Prioridade: Média.

Arquivos relacionados: `app.js`, callback `onAuthStateChanged`, linhas 153–169
no baseline; `index.html`, campo `#novoItem`.

Quando começou: Presente no `BASELINE-0001`; início exato não investigado.

Possível causa: O logout limpa o usuário e registros em memória, mas apenas oculta
o aplicativo; não limpa o valor de `novoItem`.

Observações: Reproduzido acionando o callback de autenticação com `null` em V8 e
DOM simulados; o rascunho permaneceu no input oculto. Não implica leitura cruzada
de documentos remotos; trata-se do texto local não enviado. Não corrigido.

## Limites de validação

Os testes simulados exercitaram os fluxos locais do `app.js`, com importações
substituídas por dependências falsas; não validam SDK, rede, permissões remotas
ou integração real. Não foi adicionada suíte de testes ao projeto.

Login/Firestore reais, comportamento entre dispositivos, disponibilidade das
dependências externas e aparência em navegador não foram homologados nesta tarefa.
Ausência de PWA, dark mode, editor rico e calendário mensal são limites atuais
de funcionalidade, não bugs presumidos. As regras de banco ausentes no Git não
provam que o projeto remoto esteja sem regras.
