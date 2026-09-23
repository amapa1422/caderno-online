# Problemas conhecidos

Levantamento inicial no BASELINE-0001, atualizado por CHANGE-0003 em 2026-09-23.
Estados: `OPEN`, `INVESTIGATING`, `FIXED`, `WONTFIX`. Ao corrigir, preserve a entrada,
marque `FIXED` e indique o CHANGE responsável e a validação.

## ISSUE-0001

Descrição: O HTML referencia `./icon-192.png` como `apple-touch-icon`, mas esse
arquivo não existe no repositório. Só existe `icone.png`, usado como favicon.

Status: FIXED — CHANGE-0002, validado em CHANGE-0003. index.html agora referencia
icone.png dentro do head; recurso existente e navegador sem erro de carregamento.

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

Status: FIXED — CHANGE-0002, validado em CHANGE-0003. addPromise impede inclusões
concorrentes; teste de Enter repetido com gravação suspensa gera uma única escrita.

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

Status: FIXED — CHANGE-0002, validado em CHANGE-0003. Inclusão só limpa o valor
original e mantém rascunhos por data. Verificado com digitação durante gravação.

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

Status: FIXED — CHANGE-0002, validado em CHANGE-0003. Callback de Auth limpa
campo, edição e Map de rascunhos. Logout/relogin e troca de conta testados.

Prioridade: Média.

Arquivos relacionados: `app.js`, callback `onAuthStateChanged`, linhas 153–169
no baseline; `index.html`, campo `#novoItem`.

Quando começou: Presente no `BASELINE-0001`; início exato não investigado.

Possível causa: O logout limpa o usuário e registros em memória, mas apenas oculta
o aplicativo; não limpa o valor de `novoItem`.

Observações: Reproduzido acionando o callback de autenticação com `null` em V8 e
DOM simulados; o rascunho permaneceu no input oculto. Não implica leitura cruzada
de documentos remotos; trata-se do texto local não enviado. Não corrigido.

## ISSUE-0005

Descrição: Layout em 768 px apresentava overflow horizontal no workspace,
reproduzido no teste de navegador da implementação parcial de PROMPT-0002.
Status: FIXED — CHANGE-0003.
Prioridade: Alta para responsividade.
Arquivos: style.css, tests/browser.ps1.
Causa observada: Tooltip do controle de calendário ultrapassava o limite direito;
além disso, workspace precisava manter coluna explícita quando painéis flutuam.
Correção: Alinhamento do tooltip pela direita e grid-column: 2 no workspace.
Validação: 320, 375, 390, 430, 768, 1024, 1280, 1440 e 1920 px em ambos os temas,
sem overflow de documento/workspace. Capturas inspecionadas em desktop/mobile.

## ISSUE-0006

Descrição: Edição/navegação aguardando gravação podia continuar após trocar a
sessão, pois a navegação capturava a sessão somente depois dos awaits.
Status: FIXED — CHANGE-0003.
Prioridade: Média.
Arquivos: app.js, tests/browser-checks.js.
Correção: Capturar sessão antes de aguardar e verificá-la após awaits de edição
e navegação. Renderizar o estado atualizado quando navegação não puder prosseguir.
Validação: Troca de conta com edição pendente; texto da nova conta preservado,
sem escrita nela nem navegação originada da conta antiga.

## ISSUE-0007

Descrição: Foco inicial do drawer falhava ao abrir, comprometendo contenção de Tab.
Status: FIXED — CHANGE-0003.
Prioridade: Média.
Arquivos: style.css, tests/responsive-checks.js.
Causa: Transição de visibility impedia foco imediato no painel ao abrir.
Correção: Painéis abertos transitam apenas transform; visibility fica imediata.
Validação: Foco inicial, Tab/Shift+Tab, Escape, backdrop, calendário por teclado
e paleta no viewport de 320 px aprovados.

## Limites de validação atuais

CHANGE-0003 executou scripts reais no Chrome headless com backend simulado:
37 verificações funcionais, 10 de teclado/painéis, 18 combinações viewport/tema,
movimento reduzido e zero erros de console. SDK real inicializou na tela de login,
com 13 cores e zero erros, sem autenticar ou gravar documentos.

Pendente manual: Auth/CRUD/grifos reais, regras permitindo o campo grifos,
sincronização entre dispositivos, Safari/iOS e leitores de tela. Rascunhos da
aba não são backup; conflitos de edição remota não têm merge colaborativo.
As notas abaixo documentam os limites da auditoria inicial, anteriores ao redesign.

## Limites de validação em CHANGE-0001 (histórico)

Os testes simulados exercitaram os fluxos locais do `app.js`, com importações
substituídas por dependências falsas; não validam SDK, rede, permissões remotas
ou integração real. Não foi adicionada suíte de testes ao projeto.

Login/Firestore reais, comportamento entre dispositivos, disponibilidade das
dependências externas e aparência em navegador não foram homologados nesta tarefa.
Ausência de PWA, dark mode, editor rico e calendário mensal são limites atuais
de funcionalidade, não bugs presumidos. As regras de banco ausentes no Git não
provam que o projeto remoto esteja sem regras.
