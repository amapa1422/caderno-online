# Decisões

Preserve entradas anteriores. Ao substituir uma decisão, crie outra e atualize
o status da antiga para `Substituída por DEC-XXXX`, sem apagar seu contexto.
As razões originais das escolhas de código anteriores à memória não são conhecidas;
observações do baseline estão identificadas como tal.

## DEC-0012

Título: Skins nativas opcionais e independentes do tema claro/escuro e dos dados.
Status: Ativa. Complementa decisões anteriores, sem substituir sua lógica.
Data: 2026-09-24. Origem: PROMPT-0008 / CHANGE-0008.
Decisão: data-visual-theme normal/spider/venom, preferência local
caderno-visual-theme aplicada por visual-themes.js no head antes do CSS. Normal
não recebe regras de skin. Somente o seletor novo usa regras próprias comuns.
Seletor nativo junto ao controle claro/escuro, sem aumentar a altura do rodapé.
Tokens de cor/superfície isolados em visual-themes.css, preservando dimensões,
fontes, --highlight, --marker-opacity, z-indexes e todos os eventos existentes.
Fundos e SVGs originais copiados da extensão sem código/APIs chrome.*. Camadas
body::before/after fixas, negativas, pointer-events:none, com isolation no body
somente das skins. Conteúdo legível em superfícies quase opacas; drawers móveis
opacos. Sem animação decorativa, filtros, intervalos, Canvas ou dependências.
Armazenamento indisponível: Normal na carga, escolha funciona durante a visita.
Sem sincronização da skin entre contas/aparelhos ou escrita Firestore. Tema
persistido também colore login, sem modificar seus campos ou Auth.
Não criar manifest/SW/cache: inexistem neste checkout, apesar da premissa do pedido.
Não prometer offline/PWA ou homologação Safari/iOS sem validação física.
Arquivos: index.html, visual-themes.js/css, assets/themes/spider/, tests/.

## DEC-0011

Título: Marca-texto por anotação inteira, usando cor global selecionada no topo.
Status: Ativa. Substitui DEC-0010 quanto a seleção parcial e ações contextuais.
Data: 2026-09-23. Origem: PROMPT-0006 / CHANGE-0006.
Motivo: Pedido explícito de Grifar/Remover grifo diretos e inversos, sem selecionar
trechos ou clicar antes na nota. Edição, conclusão e exclusão continuam existentes.
Decisão: Aplicar/remover pelo ID da linha, com a mesma função de gravação e merge.
Grifar substitui grifos por um único intervalo [0, texto.length] na cor global;
remover grava grifos:[] e versaoGrifos:2. Sem campo novo, migração ou mudança global.
Editar, Grifar e Remover grifo ficam visíveis abaixo da nota, exceto durante edição;
remoção desabilitada quando não há tinta. Controles não selecionáveis; texto copiável.
Removidos listeners/estado/captura de Selection/Range da interação de destaque.
Helpers de intervalos permanecem somente para renderizar e editar dados históricos.
Grifos parciais antigos não são convertidos até ação explícita na nota.
Edição de grifo integral estende a cor por todo o texto atualizado. Aplicar anima
340 ms, inclusive na reaplicação da mesma cor; remover retrai 200 ms, restaura
visual em erro e respeita movimento reduzido. A remoção aguarda animação e verifica
sessão/ID novamente antes de gravar, evitando escrita após troca de conta.
Arquivos: app.js, index.html, style.css, testes e memória. Demais decisões mantidas.

## DEC-0010

Título: Feito discreto à direita, exclusão confirmada e marca-texto global.
Status: Substituída por DEC-0011 quanto a seleção parcial e ações contextuais;
ativa nos demais aspectos. Substitui DEC-0008 em conclusão, ações e seleção de cor.
Data: 2026-09-23. Origem: PROMPT-0005 / CHANGE-0005.
Motivo: O novo pedido substitui explicitamente a retirada de conclusão e remove
três pontinhos. Preserva a caligrafia e o compositor acima da lista.
Decisão: Reutilizar concluido no Firestore, sem campos duplicados. Botões ✓ verde
e × vermelho à direita, sem checkbox à esquerda. Conclusão reduz discretamente
intensidade, permanece visível e conserva grifos; microanimação de 180 ms.
Excluir abre dialog nativo com Cancelar focado, confirmação e retry em falha.
Edição/grifar/remover grifo ficam em ações contextuais ao tocar/focar/selecionar
o texto, sem três pontinhos nem seletor individual. Seleção preservada no clique.

Cor global em caderno-marker-color local; fallback #E85D75. Picker do topo altera
preferência/indicador ao vivo, sem escrever nas notas; fechar registra recentes.
Aplicar por nota/trecho usa a cor atual; remover só altera ranges. Notas novas
nascem sem grifo e não concluídas. Grifos antigos só mudam por ação explícita.
Mantém grifos/versaoGrifos:2; ao alternar feito, converte visual legado em ranges
da nota afetada para desfazer conclusão sem apagar tinta. Sem migração em massa,
mudança de auth/configuração/regras ou estrutura de coleção.
Arquivos: app.js, index.html, style.css, testes e memória. DEC-0009 permanece ativa.

## DEC-0008

Título: Diário sem tarefas; destaque definido por grifos independentes de conclusão.
Status: Substituída por DEC-0010 em conclusão, ações da linha e cor global.
Substituiu DEC-0006 nos aspectos de interação e paleta; texto histórico preservado.
Data: 2026-09-23. Origem: PROMPT-0004 / CHANGE-0004.
Motivo: O usuário solicitou retirar integralmente checkbox/conclusão, criar acima
da lista e oferecer qualquer cor, mantendo o shell moderno.
Impacto: Removidos controles de conclusão, resumo/progresso e paleta fixa. Menu
de opções mantém edição, grifo e exclusão. Picker próprio HSV/HEX/nativo/recentes,
sem biblioteca. Preview local durante drag; gravação somente ao aplicar/adicionar.

Dados: manter coleção e setDoc merge. Nenhuma alteração de auth/configuração ou
regras remotas; nenhuma migração em massa. cor/concluido legados não são escritos
pelas novas ações. Reutiliza grifos e adiciona discriminador versaoGrifos:2 para
distinguir remoção explícita de arrays vazios antigos com tinta integral ativa.
Sem essa distinção, remover grifo faria a cor histórica reaparecer ou exigiria
alterar campos de conclusão. Apenas notas afetadas recebem v2. Adaptador de
leitura preserva toda a tinta antiga e normaliza cores; sem cor fica sem grifo.
Regras que restrinjam campos precisam aceitar v2; integração real pendente.
Arquivos: app.js, color.js, index.html, style.css, ARCHITECTURE.md, testes.

## DEC-0009

Título: Restaurar a tipografia real do histórico, restrita ao conteúdo das notas.
Status: Ativa.
Data: 2026-09-23. Origem: PROMPT-0004 / CHANGE-0004.
Evidência: f4b7e9f e CP-0003: .note-text usava Segoe Print, Bradley Hand,
Comic Sans MS, cursive; 19 px desktop e 17 px mobile. Não havia @font-face,
Google Fonts nem arquivo de fonte versionado no estado antigo inspecionado.
Decisão: Usar Segoe Print, Bradley Hand, cursive, sem fallback explícito Comic
Sans conforme solicitação. Restaurar fonte do sistema, sem baixar/redistribuir
arquivos proprietários. 19 px desktop / 18 px mobile, line-height 1.65, tracking
.01em nas notas; UI e compositor mantêm fonte do design system. Inline-editor e
preview usam caligrafia por representarem conteúdo da nota.
Validação: CDP identificou Segoe Print efetivamente renderizada no Windows.
Limite: Em dispositivos sem essas fontes, aparência depende do cursive local;
não foi inventada uma substituta nem prometida fonte idêntica em todos os SOs.
Arquivos: style.css; histórico Git; tests/.artifacts/fonts.json (ignorado).

## DEC-0006

Título: Design system aplicado ao diário, preservando notas e contratos legados.
Status: Substituída por DEC-0008 quanto a conclusão/paleta; texto histórico preservado.
Data: 2026-09-23 (registro da implementação iniciada em 2026-09-22).
Origem: PROMPT-0002, concluído em PROMPT-0003 / CHANGE-0003.

Motivo: Aplicar a referência visual oficial sem remover funcionalidades ou
introduzir conteúdo demonstrativo nas contas. Tokens de fontes, espaçamento,
temas, layout e cores vêm de design_system.html. Contraste foi adaptado no
produto: text-muted claro #6b7280, botões/eyebrow com accent-700 e erro escuro
#f28c8c. A referência permanece preservada como fornecida.

Impacto: Sidebar, calendário, temas e edição de texto simples com autosave de
notas existentes. Inclusão continua explícita e rascunhos são apenas da aba.
Grifo de trechos usa campo opcional grifos, mantendo campos/caminho legados,
setDoc com merge, configurações Firebase e migração existente. Sem PWA ou agenda
com eventos inventados. Regras remotas devem aceitar grifos; pendente teste real.

Arquivos: index.html, style.css, app.js, design_system.html, ARCHITECTURE.md.
DEC-0002 permanece como decisão histórica restrita à instalação PROMPT-0001;
não proíbe o redesign autorizado posteriormente.

## DEC-0007

Título: Validar o redesign localmente com navegador real e backend simulado.
Status: Ativa.
Data: 2026-09-23.
Origem: PROMPT-0002 / PROMPT-0003.

Motivo: Exercitar DOM, layout e operações assíncronas sem alterar dados remotos.
Impacto: Runner PowerShell/CDP com Chrome/Edge, perfil temporário e substituição
de firebase.js somente pelo servidor de teste. Modo Live verifica inicialização
sem autenticar. Artefatos são ignorados; scripts versionados. Resultado local
não equivale a homologação de regras, contas, dados ou dispositivos reais.
Arquivos: tests/, .gitignore, KNOWN_ISSUES.md.

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
