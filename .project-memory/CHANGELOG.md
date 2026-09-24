# Histórico de alterações

Adicione novas entradas no topo, após esta introdução. Preserve as anteriores;
não substitua uma mudança antiga por outra. Datas usam America/Sao_Paulo.

## CHANGE-0008

Data: 2026-09-24. Hora inicial: 12:34:25 -03:00; validações finais: 12:51 -03:00.
Prompt: PROMPT-0008. Inicial: CP-0013, `9f74409dd1329d1dcd34a75a1f1872355f77352f`.
Final: CP-0014, `refs/tags/CP-0014` (hash registrado após criar a tag).
CHANGE-0007 permanece reservado pelo pedido anterior, ainda pendente no histórico.

### Objetivo

Adicionar apenas as skins visuais nativas Normal, Homem-Aranha e Venom.
As skins não alteram dados, Firebase ou lógica das anotações.

### Arquivos adicionados

- visual-themes.css e visual-themes.js.
- assets/themes/spider/bg-classic-ai.png, bg-venom-ai.png,
  web-pattern-classic.svg, web-pattern-venom.svg e spider-mark.svg.
- tests/visual-theme-checks.js, visual-themes.ps1 e normal-comparison.ps1.
- .project-memory/checkpoints/CP-0013.md e CP-0014.md.

### Arquivos alterados

index.html; tests/browser.ps1 e README.md; .project-memory/CURRENT_STATE.md,
CHANGELOG.md, PROMPTS.md, DECISIONS.md, ARCHITECTURE.md e KNOWN_ISSUES.md.
app.js, style.css, color.js, firebase.js, ícone e design_system.html inalterados.

### Alterações realizadas / funcionalidades afetadas

Seletor nativo discreto junto ao claro/escuro, sem aumentar altura do rodapé.
data-visual-theme independente de data-theme; preferência caderno-visual-theme
validada/aplicada no head antes do CSS. Valor inválido/armazenamento indisponível
usa Normal; seleção funciona na visita mesmo sem conseguir persistir.
CSS isolado por atributo; tokens de cor/superfície sem mudar geometria ou fontes.
Normal sem regras de skin; única diferença visual é o novo seletor.
Fundos fixos em pseudo-elementos atrás do conteúdo e pointer-events:none.
Teias discretas, página quase opaca, drawers móveis opacos, sem alterar z-index
de controles/dialog/picker/toast. Sem animação decorativa, filtros ou loops JS.
Assets copiados intactos de Desktop/aranha_visual_extensao_v12/assets; PNGs
1672x941, cerca de 1,75 MB cada. Sem APIs/código da extensão ou novos serviços.
Marca-texto livre, transparência da tinta, fonte manuscrita, ações, login,
calendário e salvamento preservados. DEC-0012 documenta a camada independente.

### Possíveis impactos / contexto preservado

Preferência local por navegador; não sincroniza entre aparelhos. Primeira carga
de cada skin baixa seu PNG/SVG; sem duplicação de imagens nem garantia offline.
O checkout não tem manifest/service worker: nenhum mecanismo PWA foi criado ou
alterado, apesar da premissa do pedido. Não afirmar homologação Tela de Início.
HEAD recebido 2f13722 só tinha registros de PROMPT-0007 e diagnóstico de teste;
produto idêntico a CP-0011. Pedido anterior não foi implementado nem encerrado
nesta tarefa. Sem rollback, migração, escrita remota, push ou deploy.

### Testes realizados

Chrome headless/CDP, Firebase simulado: suíte anterior antes da implementação e
112 verificações em cada skin depois (336). Inclui login/erro, criar, editar,
grifar/remover, concluir/desfazer, excluir/cancelar/falhar/retry, calendário,
rascunhos, sessão e cores/reload. Mouse/toque no picker, nove larguras 320–1920
nos dois modos base por skin, viewport 390x360, reduced-motion e console limpo.
Skins: 50 verificações de HEX livre #22AACC, igualdade do background-image dos
marks nas trocas, fontes, draft/data/editor, nenhuma escrita/exclusão/subscrição
gerada pela skin, preferência, HTTP 200 e decodificação dos cinco assets.
Matriz de 30 combinações: 1920x1080, 1440x900, 1280x720, 390x844 e 430x932,
dois temas base e três skins. Sem overflow. Contraste de texto, legendas e botão
principal nas skins >=4,5:1 (não é certificação WCAG de todos os componentes).
Edge executou a suíte específica completa: 50 checks + matriz, select via
teclado CDP, reload de três skins/tinta, aplicação no DOMContentLoaded, valor
inválido, storage bloqueado, reduced-motion, assets/rede e console sem erros.
Comparação pixel a pixel com arquivos CP-0013 copiados para artefatos ignorados
e Firebase explicitamente simulado, mesmo Edge/perfil/fixtures: em 1440x900,
3103 pixels diferentes somente dentro do novo seletor em cada modo; em 390x844,
zero pixels diferentes no claro e escuro (sidebar recolhida). Nenhum pixel
diferente fora do seletor nas quatro comparações. Sem restaurar código do repo.
Capturas desktop/mobile/login/sidebar/calendário/picker/dialog inspecionadas.
O teste foi ajustado para aguardar DOM assíncrono e finalizar transições finitas
somente na medição, evitando falhas por capturas de estados intermediários.
SDK real: -Live inicializou login/picker/app com console limpo, sem autenticar
nem gravar Firestore. git diff --check aprovado; lógica/base CSS idênticos ao
checkpoint; hashes dos PNGs iguais aos originais. Não houve teste físico iOS.

### Resultado

Concluído e validado localmente em Chrome/Edge com backend simulado. Safari/iOS,
teclado real, Tela de Início, conta real/regras e sincronização ainda exigem teste
manual. Checkpoints locais; memória e hashes finalizados no mesmo PROMPT-0008.

## CHANGE-0006

Data: 2026-09-23. Hora inicial: 15:37:30 -03:00.
Prompt: PROMPT-0006. Inicial: CP-0010, `e33ada960336a47b53388dbf3f94193d23b6485f`.
Final: CP-0011, `b238c41e0e4559b4b67e394da375ffe1ca6c160d`, 15:46:07 -03:00.

### Objetivo / comportamento anterior

Marca-texto por anotação inteira, usando cor global selecionada no topo.
Antes, Grifar/Remover consultavam Selection/Range e podiam agir somente no trecho
selecionado. Ações exigiam ativar a linha. A edição de uma nota integralmente
grifada podia deixar palavras acrescentadas ao final fora do grifo.

### Arquivos alterados

app.js, index.html, style.css; tests/browser-checks.js, browser.ps1,
reload-checks.js, responsive-checks.js e README.md; CURRENT_STATE.md,
ARCHITECTURE.md, DECISIONS.md, PROMPTS.md, CHANGELOG.md, KNOWN_ISSUES.md e
checkpoints CP-0010/CP-0011 na memória.

### Alterações realizadas / funcionalidades afetadas

Mesma função aplicarMarca(noteId, color) aplica um único intervalo integral com
cor atual ou remove todos com array vazio. Reutiliza salvarItem, grifos,
versaoGrifos:2 e setDoc merge, sem campo novo. Seleção no navegador não determina
destino ou tamanho. Removidos captura/estado/listeners de seleção; helpers de
intervalos preservados somente para ler/editar notas históricas sem migração.

Editar/Grifar/Remover grifo ficam visíveis sem ativar a nota; botões não selecionáveis,
conteúdo copiável. Remover desabilitado sem tinta. DOM mantém controles fora dos
marks inline, que cobrem somente o texto. Ações usam ID, inclusive em textos iguais.
Edição mantém tinta integral ao acrescentar/substituir texto. Animação de passada
340 ms também ao reaplicar a mesma cor; remoção retrai 200 ms e restaura tinta
em falha, respeitando movimento reduzido e troca de sessão antes de gravar.
Dica de uso atualizada para não orientar seleção de trechos. Mobile usa ações
com quebra de linha, altura 40 px e texto legível. Conclusão/exclusão, fonte,
shell, calendário, login, preferência global e picker continuam preservados.
DEC-0011 substitui interação parcial de DEC-0010; ISSUE-0008/0009 corrigidos.

### Possíveis impactos

Novas ações não permitem grifar trechos: remoção solicitada explicitamente.
Ranges parciais históricos mantêm aparência até Grifar/Remover naquela nota.
Cor global, outras notas e conclusão permanecem independentes. Sem rollback,
migração destrutiva, alterações de Firebase/configuração/regras ou dados remotos.

### Testes realizados

PowerShell/CDP: 75 verificações funcionais, 11 no primeiro reload, 10 no segundo,
16 de teclado/mobile (112 no total). Grifo integral mesmo com seleção parcial,
recoloração sem empilhar, controles separados, falhas de aplicar/remover e retry,
animação de remoção 200 ms e reaplicação, edição com acréscimo/substituição,
IDs diferentes/textos iguais, exclusão sem afetar cores restantes aprovados.
Primeiro reload preserva A ciano/B rosa/C sem tinta; remove A diretamente e
segundo reload mantém A sem tinta/B rosa/C sem tinta. Cor global preservada.
Clique real via CDP ignora seleção parcial e grifa texto inteiro. Arraste
mouse/toque no picker, 18 combinações de viewport/tema (320–1920 px), viewport
390x360, movimento reduzido e console sem erros. Capturas 375/light e 1440/dark
inspecionadas, destaque inline sem preencher linha. Fonte CDP: Segoe Print.
Última mudança de produto após suíte: apenas texto da dica sobre marca-texto.
git diff --check sem erros; ausência de APIs/listeners de seleção no app conferida.
SDK real não repetido nesta tarefa; Firebase/configuração sem alterações.

### Resultado

Concluído e validado localmente. Firebase autenticado/regras, sincronização
entre aparelhos, teclado físico mobile, Safari/iOS e leitores de tela exigem
teste manual. Checkpoints locais, sem push/deploy. Metadados registram hash final.

## CHANGE-0005

Data: 2026-09-23. Hora inicial: 15:08:43 -03:00.
Prompt: PROMPT-0005. Inicial: CP-0008, `429955012b01bb6e5d8c91a7b3d084ddfbad1557`.
Final: CP-0009, `13e392a8636fbae4c98810d7b855c92b21f0f2ce`, 15:24:45 -03:00.

### Objetivo

Restaurar feito discreto, confirmar exclusão, remover três pontinhos e tornar
global a preferência de marca-texto, substituindo explicitamente DEC-0008.

### Arquivos alterados

app.js, index.html, style.css; tests/browser-checks.js, browser.ps1,
reload-checks.js, responsive-checks.js e README.md; CURRENT_STATE.md,
ARCHITECTURE.md, DECISIONS.md, PROMPTS.md, CHANGELOG.md, KNOWN_ISSUES.md e
checkpoints CP-0008/CP-0009 na memória. color.js e firebase.js preservados.

### Alterações realizadas / funcionalidades afetadas

Cada linha tem check verde feito/desfazer e × vermelho à direita, sem checkbox
à esquerda. Conclusão reutiliza concluido, mantém grifo e texto visíveis com
opacidade .86 e animação 180 ms. Exclusão abre dialog com Cancelar em foco;
falha mantém documento, informa erro no dialog e permite tentar novamente.
Removidos três pontinhos e picker individual. Tocar/focar/selecionar texto
revela Editar, Grifar e Remover grifo, preservando funções anteriores.

Picker do topo mantém HSV/HEX/preview/recentes e atualiza indicador e preferência
caderno-marker-color em localStorage. Alterar preferência não grava no Firestore
nem recolore notas antigas. Aplicar na nota/trecho usa explicitamente cor atual;
remover mantém texto e conclusão. Novas notas começam sem grifo. Toggle converte
somente os ranges da nota afetada para v2, preservando tinta legada ao desfazer.
Fonte manuscrita, compositor acima, shell, calendário e autenticação mantidos.
DEC-0010 registra substituição da decisão anterior, preservando seu histórico.

### Possíveis impactos

Sem migração em massa ou campos duplicados de conclusão. Merge preserva campos
antigos/extra. Preferência de cor vale para este navegador, sem sincronização
entre dispositivos. Regras remotas precisam aceitar grifos/versaoGrifos.

### Testes realizados

PowerShell/CDP: 64 verificações funcionais + 8 de reload + 13 de teclado/mobile.
CRUD, concluir/desfazer, exclusão/cancelar/falha/retry, persistência de cor,
grifos antigos, recoloração explícita e compatibilidade legada aprovados.
Seleção real com mouse preservada ao clicar em Grifar; arraste mouse/toque
atualiza preview sem escrita. Nove larguras (320–1920 px) nos dois temas sem
overflow; viewport 390x360, movimento reduzido e console sem erros. Capturas
desktop/mobile inspecionadas. Fonte renderizada confirmada como Segoe Print.
SDK real inicializado em perfil temporário sem autenticar/escrever remotamente;
executado antes do ajuste final da mensagem de erro do dialog, coberta pela
última suíte completa. git diff --check sem erros.

### Resultado

Concluído localmente. Conta real/Firestore, regras, sincronização entre dispositivos,
teclado físico mobile, Safari/iOS e leitores de tela exigem validação manual.
Checkpoints locais, sem push/deploy. Hash final registrado por commit de metadados.

## CHANGE-0004

Data: 2026-09-23. Hora inicial: 12:34:58 -03:00.
Prompt: PROMPT-0004. Inicial: CP-0006, `3ab3b527c06d0d76990d9483c7e295af8a36811f`.
Final: CP-0007, `5e05485d4400f76409da3be99d0d213c2ceb321f`, 15:07:59 -03:00.

### Objetivo

Criar acima da lista, retirar tarefas, restaurar caligrafia e usar marca-texto livre.

### Arquivos alterados

index.html, style.css, app.js, novo color.js; tests/browser-checks.js, browser.ps1,
firebase.mock.js, responsive-checks.js, novo reload-checks.js e README.md;
CURRENT_STATE.md, ARCHITECTURE.md, DECISIONS.md, PROMPTS.md, CHANGELOG.md,
KNOWN_ISSUES.md e checkpoints CP-0006/CP-0007 na memória.

### Alterações realizadas / funcionalidades afetadas

Compositor acima da lista; removidos checkboxes, ações/estado de conclusão e
resumo de tarefas. Menu discreto de opções preserva edição, grifo e exclusão.
Picker livre próprio HSV/HEX/nativo, preview em tempo real, seis recentes locais,
remoção e grifo opcional na criação. Arraste apenas atualiza preview; aplicar
grava. Highlights inline com opacidade .38/.25 e animação 340 ms.
Fonte original localizada em f4b7e9f/CP-0003: Segoe Print, Bradley Hand; restaurada
apenas no conteúdo, sem redistribuição nem escolha de fonte nova. Comic Sans
foi retirado do fallback por pedido. UI conserva o design system.

Compatibilidade: grifos existentes adaptados em leitura. Novas gravações usam
versaoGrifos:2 para distinguir remoção explícita de arrays vazios históricos
com grifo integral; cor/concluido antigos permanecem intactos via merge.
Importação legada deixou de inventar rosa quando falta cor. Não houve alteração
de autenticação, firebase.js, regras ou dados remotos.

### Possíveis impactos

Regras remotas precisam aceitar grifos/versaoGrifos e notas sem campos de tarefa.
Fonte depende das famílias instaladas no dispositivo. Sem migração destrutiva.
Durante finalização, usuário enviou nova solicitação que restaura conclusão e
substitui menu de opções/cor individual; será tratada como PROMPT-0005 após CP-0007.

### Testes realizados

Runner PowerShell/CDP: 57 verificações funcionais, 6 de reload real com fixtures
persistidas pelo mock e 11 de teclado/mobile. Nove larguras (320–1920 px) x dois
temas sem overflow. Mouse e toque via Input.dispatch* alteraram preview sem
escritas; viewport 390x360 manteve Adicionar e picker visíveis. Movimento reduzido
e console sem erros. Fontes renderizadas via CDP: Segoe Print (não customizada).
Capturas 1440/dark, 375/light e picker mobile inspecionadas. Cálculo de contraste
nos extremos das misturas: 6,63:1 claro e 6,91:1 escuro (não certificação WCAG).
SDK real: login/seletor inicializados sem erros, sem autenticar/gravar remotamente.
git diff --check e firebase.js preservado. A última alteração após suíte foi
somente rótulo Concluir → Fechar edição, sem alteração de lógica.

### Resultado

Implementação local concluída; conta real, regras, teclado físico mobile,
Safari/iOS, leitores de tela e outras fontes de SO exigem teste manual.
Checkpoint intermediário preservado antes da nova direção de PROMPT-0005.

## CHANGE-0003

Data: 2026-09-23.
Hora: 10:24:28 -03:00 (checkpoint inicial); 10:37:58 -03:00 (final).
Prompt/Task: PROMPT-0003 — finalizar o pedido de ontem, identificado em PROMPT-0002.
Checkpoint inicial: CP-0004, `3927d2b19e9d10a93bb66efd273e10880d286bc3`.
Checkpoint final: CP-0005, `fab3e45eb0ac623750cc5191b0b7a4e3ca88cdc4`.

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
Checkpoint final após retomada: CP-0005, `fab3e45eb0ac623750cc5191b0b7a4e3ca88cdc4`.

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
