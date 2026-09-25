# Problemas conhecidos

Levantamento inicial no BASELINE-0001, atualizado por CHANGE-0009 em 2026-09-25.
Estados: `OPEN`, `INVESTIGATING`, `FIXED`, `WONTFIX`. Ao corrigir, preserve a entrada,
marque `FIXED` e indique o CHANGE responsável e a validação.

## ISSUE-0010

Descricao: b57aa73 removeu .project-memory/ e tests/, embora AGENTS.md continue
exigindo memoria e checkpoints. Tags antigas tambem nao constam no checkout/remoto.
Status: FIXED — CHANGE-0009 quanto aos arquivos; tags antigas nao recriadas.
Evidencia: git show --stat b57aa73; git tag e git ls-remote origin refs/tags/*.
Correcao: recuperar arquivos de ac8158f sem rollback do app, atualizar fatos atuais
e adaptar testes a b57aa73. Commits historicos referidos existem. Para restaurar
checkpoints antigos, usar hashes documentados e conferir objetos antes de agir.

## ISSUE-0011

Descricao: package.json recebido referencia scripts/build-site.cjs,
functions test e tests/firebase-integration.test.cjs inexistentes nesta base.
Status: OPEN. Prioridade: baixa para esta tarefa exclusivamente visual.
Quando: observado em b57aa73 durante PROMPT-0009. Nao inferida causa historica.
Impacto: scripts npm nao usados como evidencia de build/teste; validacao feita
pela suite local PowerShell/CDP. Nenhuma mudanca de backend/build solicitada.

## Limites de validacao em CHANGE-0009

Artes copiadas dos anexos, total 10.318.928 bytes, somente fundo ativo referenciado.
Bolsonaro tem 499x367; nitidez limitada em desktop e recorte cover varia por tela.
Nao e defeito novo de dados. Sem dependencias novas ou processamento JS de imagens.
Conta real, regras, sincronizacao remota, Safari/iOS, leitores de tela e teclado
fisico mobile continuam exigindo teste manual. Nao houve escrita remota.
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

## ISSUE-0008

Descrição: Grifar/Remover grifo usavam seleção nativa e podiam afetar somente
um trecho, contrariando o novo fluxo direto por anotação inteira solicitado.
Status: FIXED — CHANGE-0006. Prioridade: Alta para a interação solicitada.
Arquivos: app.js, style.css, index.html e testes.
Quando: Observado em CP-0009; relato do usuário em PROMPT-0006.
Causa: capturarSelecao, selectionchange e estado de range direcionavam o tamanho
do grifo; ações estavam ocultas até ativar a linha. Não há evidência reproduzida
de gravação da palavra do botão; DOM já separava controles do texto.
Correção: ID explícito, nota inteira, ações visíveis, sem Selection/Range no app.
Validação: Seleção parcial ignorada, texto duplicado com IDs independentes,
controles nunca grifados, remover/reload/recolorir/falhar/retry aprovados.

## ISSUE-0009

Descrição: Acrescentar texto ao final de uma nota integralmente grifada podia
manter fim do intervalo antigo, deixando o acréscimo sem tinta.
Status: FIXED — CHANGE-0006. Prioridade: Média.
Arquivos: app.js (ajustarGrifos) e tests/browser-checks.js.
Quando: Observado na lógica de CP-0009 durante PROMPT-0006.
Causa: Ajuste genérico de trecho preservava fim <= prefixo comum ao acrescentar.
Correção: Detectar intervalo integral e estender ao comprimento novo; manter
ajuste por prefixo/sufixo somente para dados históricos parciais.
Validação: Grifar, editar para acrescentar e depois substituir texto mantém
todo o conteúdo grifado na mesma cor; persistência confirmada após reload.

## Limites de validação em CHANGE-0008

Sem novo defeito de produto confirmado. Chrome: 112 verificações por skin (336),
mouse/toque, teclado, responsividade e console. Edge: 50 verificações de skins,
30 combinações de viewport/modo/skin, reload/storage, contraste e console/rede.
Comparação pixel a pixel Normal/CP-0013 em claro/escuro, desktop/mobile: somente
novo seletor difere. Marca-texto e fontes preservados. SDK real inicializou sem
login ou escrita remota. Testes e capturas em artefatos ignorados.
Safari/iOS e modo Tela de Início/teclado físico não foram testados. Projeto sem
manifest/SW/cache: skins não adicionam garantia de funcionamento offline nem PWA.
Fundos estáticos fixed com pointer-events:none e safe areas existentes mantidas.
Conta real, regras/sincronização e leitores de tela continuam pendentes.
PROMPT-0007 segue pendente no histórico; produto recebido era igual a CP-0011,
com apenas documentação/diagnóstico adicionais, preservados nesta tarefa.

## Limites de validação em CHANGE-0006

112 verificações: 75 funcionais, 21 em dois reloads, 16 de teclado/mobile.
Clique CDP com seleção parcial ignorada, mouse/toque no picker, 18 combinações
viewport/tema, viewport curto, movimento reduzido e console sem erros.
Capturas desktop/mobile inspecionadas. Backend simulado, sem escrita remota.
SDK real não repetido (último teste CHANGE-0005). Permanecem pendentes conta
real/regras, sincronização entre aparelhos, teclado físico mobile, Safari/iOS,
fontes em outros sistemas e leitores de tela. Sem homologação de produção.

## Limites de validação em CHANGE-0005 (histórico)

64 verificações funcionais, 8 de reload, 13 de teclado/mobile; seleção com mouse,
arraste mouse/toque CDP, 18 combinações de viewport/tema, viewport 390x360,
movimento reduzido e console sem erros. Exclusão com cancelar/retry e mensagem
de falha dentro do dialog; conclusão legada e cor global persistida verificadas.
SDK real inicializado sem conta. Sem novos bugs confirmados nem escrita remota.
Pendentes: conta real/regras aceitando grifos/versaoGrifos, sincronização entre
dispositivos, teclado físico mobile, Safari/iOS e leitor de tela. Fonte original
depende da instalação no SO. Não equivale a homologação de produção.

## Limites de validação em CHANGE-0004 (histórico)

57 verificações funcionais, 6 de reload, 11 de teclado/mobile, mouse/toque CDP,
18 viewports/temas, viewport 390x360, fonte Segoe Print efetiva e console sem erros.
SDK real inicializado sem conta. Regras de grifos/versaoGrifos e notas sem campos
antigos não verificadas remotamente. Teclado físico, Safari/iOS e leitor de tela
pendentes; cursive depende do SO quando faltam Segoe Print e Bradley Hand.
Não são novos bugs confirmados. Nenhum dado remoto foi alterado.

## Limites de validação em CHANGE-0003 (histórico)

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
