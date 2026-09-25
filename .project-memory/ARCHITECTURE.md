# Arquitetura do Caderno Online

Atualizada por PROMPT-0009 / CHANGE-0009 em 2026-09-25. Memoria recuperada de ac8158f; observacoes de b57aa73 incorporadas sem alterar seu codigo.

## Estrutura e interface

Aplicativo estático HTTP(S): index.html carrega style.css e app.js; app.js importa
firebase.js, que importa SDK 12.18.0 de gstatic, e color.js (conversão/normalização
de cores). Sem framework, roteador, manifest ou service worker. b57aa73 adicionou
accounts.js, functions/index.js (createCadernoUser), firestore.rules, firebase.json
e ferramentas em package.json. Scripts npm referenciam arquivos ausentes no checkout;
nao foram criados/corrigidos nesta tarefa visual.

Design_system.html é referência standalone. O produto incorpora seus tokens em
style.css e usa componentes próprios, sem executar seu JS nem copiar seus dados.
Ícones são SVGs no HTML; icone.png atende favicon e ícone Apple.

Skins opcionais: visual-themes.js é um script clássico pequeno no head, antes
dos stylesheets, sem importar app.js/Firebase. Aplica data-visual-theme cedo,
valida preferência local e conecta somente change do select #visualTheme após
DOMContentLoaded. Não altera data-theme nem eventos/estado do caderno. Bloqueio
de localStorage é tolerado; ausência/valor inválido usa Normal. A preferência
vale por origem/navegador e colore também o login no próximo acesso.
visual-themes.css carrega apos style.css; overrides opt-in por data-visual-theme:
normal, spider, venom, espetacular, santos, flamengo, sao-paulo e bolsonaro.
Espetacular/Flamengo compartilham tokens de Spider; Santos/Sao Paulo os de Venom.
Normal nao recebe override. Preferencia caderno-visual-theme permanece inalterada.
Body isolado nas skins; pseudo-elementos fixed com z-index -2/-1 e
pointer-events:none atras do conteudo. Workspace transparente, papel quase opaco,
drawers opacos no mobile. Novas skins aplicam --panel-bg tambem a navegacao de datas para contraste sobre fotos claras. Geometria, fontes e camadas dos componentes preservadas.
Assets anteriores em assets/themes/spider/ preservados da base b57aa73. As cinco
artes anexadas em PROMPT-0009 foram copiadas sem regeneracao para
assets/themes/categories/{espetacular,santos,flamengo,sao-paulo,bolsonaro}.png.
Total adicional: 10.318.928 bytes; cada tema referencia somente seu proprio fundo
(0,26 a 4,86 MB), sem preload de todos os temas, CDN ou biblioteca. Cover/center
mantidos; recorte depende do viewport. Resolucao de Bolsonaro e 499x367, conforme
anexo; pode perder nitidez em telas grandes. Sem inventar detalhes/upscale.
Times usam --visual-web:none. Bolsonaro define paleta verde/dourada, selecao azul
e gradientes suaves; uma animacao CSS brazil-glow de opacidade (12s) em ::after,
somente sob prefers-reduced-motion:no-preference. Trocar tema remove a animacao.
Sem timer JS, canvas ou filtros; reduced-motion fica estatico.
Marca-texto e suas variáveis/cores/transparência não recebem overrides. Tema
claro/escuro continua independente, inclusive sua transparência original de grifo.
Sem manifest/SW: não há novo mecanismo de cache/offline/PWA nesta implementação.

Shell: sidebar, workspace e calendário. Sidebar flutuante até 900 px; calendário
flutuante até 1180 px. Workspace ocupa explicitamente a segunda coluna da grade.
Busca filtra datas/textos já sincronizados. Calendário mostra 42 dias com notas
sinalizadas e navegação por setas do teclado. Resumo conta somente anotações;
não há agenda com horários nem conteúdo fictício em produção.

Compositor antes da lista: textarea, seletor global de marca-texto, Adicionar e
ajuda. Notas novas sem grifo. Cada linha tem ✓ feito/desfazer e × excluir à
direita, sem checkbox à esquerda nem três pontinhos. Editar, Grifar e Remover grifo
ficam sempre visíveis abaixo do texto, exceto durante edição. Remover fica
desabilitado quando não há destaque. As ações usam exclusivamente o ID da linha.
Feitas ficam com opacidade .86 no texto (incluindo grifo visível), check mais
forte e microanimação 180 ms ao alternar. Não há riscado ou progresso de tarefas.
Exclusão usa dialog nativo, foco inicial Cancelar, Escape/cancelamento e retry
sem perder documento em falhas. Auth limpa a confirmação ao mudar de sessão.
Tipografia das notas: Segoe Print, Bradley Hand, cursive; recuperada do CSS em
f4b7e9f/CP-0003. Sem import/@font-face anterior; usa instalação do sistema, sem
redistribuir fontes proprietárias. UI/compositor continuam com fonte do design
system; inline-editor e exemplo de grifo representam conteúdo manuscrito.

## Estado e renderização

state centraliza usuário, sessão, data, cor, registros, listener, gravação,
edição, rascunhos, grifos e painéis. O contador de sessão protege contra retornos
assíncronos de outra conta. renderizarItens reconcilia linhas por ID/assinatura,
preservando textarea e foco durante snapshots. Textos são escapados antes de
virar HTML, cores limitadas a hexadecimal de seis dígitos e ranges normalizados.

## Autenticação e sincronização

Firebase permanece configurado em firebase.js, projeto caderno-online-e5b1f.
Auth usa e-mail/senha e browserLocalPersistence. Sem cadastro publico/reset de senha; accounts.js exibe criacao de contas administrativas via callable createCadernoUser (southamerica-east1), presente em b57aa73 e preservada.

onAuthStateChanged incrementa sessão, cancela listener, limpa dados/rascunhos/
edição e campos locais e alterna login/caderno. Com usuário, instala onSnapshot(users/{uid}/caderno). Migracao automatica de notas anonimas locais foi removida em b57aa73; preservado nesta tarefa. Snapshots validam datas,
agrupam por dia e ordenam por criadoEm. Metadata distingue cache/conexão.
Toda a coleção é lida, sem paginação nem consulta limitada ao dia.

Logout aguarda edição e inclusão em andamento; recusa saída enquanto outras
gravações continuam pendentes. Sessão é verificada após awaits de edição/
navegação para não executar ações antigas em uma nova conta.

## Dados e gravação

Documento: users/{uid}/caderno/{id}. UUID com fallback tempo/aleatoriedade.

| Campo | Tipo/finalidade |
| --- | --- |
| data | YYYY-MM-DD do dia original da operação. |
| texto | Texto simples; entrada/edição limitada a 140 caracteres na interface. |
| concluido | Booleano existente reutilizado; ausente significa não concluído. |
| cor | Campo histórico de tinta; HEX curto/longo, nomes CSS/aliases e RGB aceitos na leitura. |
| criadoEm / atualizadoEm | Milissegundos do relógio cliente. |
| grifos | Opcional: array de { inicio, fim, cor }, índices UTF-16, fim exclusivo. |
| versaoGrifos | 2 nas novas gravações; torna grifos a fonte exclusiva dos destaques. |

salvarItem mantém setDoc com merge e caminho original. Grava concluido apenas
na criação e na alternância de feito; edição/grifo não o sobrescrevem. Não há
completed/done/checked duplicados. Campos antigos/extra permanecem no documento.
Novas notas usam grifos:[], concluido:false e versaoGrifos:2. Mudanças de
texto/cor gravam v2 somente na nota afetada. Não há migração em massa.

grifosDoItem adapta documentos anteriores: cor+concluido:true define a tinta
integral antiga; cor válida sem flag também é aceita; concluido:false não ativa
tinta que antes era apenas preferência. Sobrepõe ranges parciais existentes.
Assim grifos:[] antigo não apaga tinta integral. Já em v2, grifos:[] significa
remoção explícita, mesmo que cor/concluido antigos continuem intactos. A versão
é necessária para distinguir esses casos sem modificar campos históricos.
Cores ausentes/inválidas ficam sem grifo. Alternar conclusão também grava ranges
visuais atuais e v2 na nota afetada; assim desfazer feito não apaga tinta legada.

Exclusão usa deleteDoc apenas depois de confirmar, sem lixeira. Configuração, regras remotas
e autenticação não mudaram. Regras devem aceitar grifos e versaoGrifos e não
exigir cor legada em notas novas; isso requer validação em conta real.

- Inclusão explícita protegida por addPromise contra repetição. Captura data/ID
  antes do await; resposta não limpa um texto novo digitado durante a gravação.
- Rascunhos por data em Map local à aba, sem persistência; limpos no callback de
  Auth. beforeunload sinaliza conteúdo/gravação pendente.
- Edição existente tem debounce de 650 ms e uma operação por vez. Texto novo
  digitado durante gravação é salvo em seguida. Falhas preservam a edição.
- Navegação aguarda inclusão/edição; erro mantém dia/texto. Usa Web Animations,
  com fade breve sem rotação em prefers-reduced-motion.
- Grifar salva um único intervalo sobre o texto inteiro, substituindo qualquer
  tinta anterior. Remover salva array vazio v2 e não altera texto/conclusão/cor
  global. Reutiliza salvarItem e campos existentes, sem novo esquema.
- Edição de grifo integral mantém a cor em todo o texto, inclusive acréscimos.
  Intervalos parciais antigos continuam renderizados; ao editar, ajustam-se por
  prefixo/sufixo. Helpers de intervalos preservados para compatibilidade de dados,
  sem captura de seleção do navegador ou novas ações sobre trechos.
- Status informa gravação, edição, cache/conexão e falhas; toasts explicam erros.

Não há resolução colaborativa de conflitos entre dispositivos: merge de campos
não equivale a merge de versões concorrentes do texto. Não há histórico remoto.

## Armazenamento e preferências

Nao ha importacao automatica do antigo localStorage para novas contas desde b57aa73.
Dados de notas sao isolados por UID; a tarefa visual nao modifica esses caminhos.
Firebase Storage nao e utilizado.

Preferências: caderno-theme, caderno-sidebar, caderno-agenda e
caderno-recent-colors (até seis HEX distintos, sem textos/notas) e
caderno-marker-color (HEX atual global; default #E85D75). Picker só existe no
topo, atualiza cor/indicador/preferência ao vivo, nunca recolore notas sozinho.
Ao aplicar pelo ID da linha, captura cor atual e salva somente essa nota. Remover
grifo não muda preferência global. Novas notas sem tinta automaticamente.
Tema segue o sistema
até escolha explícita e é aplicado antes do CSS. Auth persistente não significa
notas offline; não há cache persistente Firestore configurado explicitamente.

## Acessibilidade e testes

Painéis flutuantes: dialog, aria-modal, fundo inert, foco inicial, contenção de
Tab, Escape e restauração de foco. Picker usa Pointer Events/capture no campo
HSV, range Hue nativo, input HEX validado, fallback input color, preview ao vivo
e recentes. Setas ajustam S/V (Shift acelera). Drag/input atualizam preview e
preferência global local, sem escrita Firestore. Pronto fecha; recentes registrados
ao fechar/aplicar. Ações Grifar/Remover grifo na nota não abrem seletor individual.
Não há listeners selectionchange nem captura de Selection/Range para grifo.
Botões da linha usam user-select:none; conteúdo continua selecionável/copiável.
Paleta fecha fora/Escape, mantém gerenciamento de foco e respeita
visualViewport e safe-area, com rolagem interna quando a altura é pequena.
O shell acompanha visualViewport; com compositor focado, resize traz Adicionar
para a área visível. Teclado real de iOS/Android ainda exige teste manual.

Grifos são mark inline, background-size 76% de altura, bordas assimétricas,
color-mix com opacidade .38 clara/.25 escura e animação CSS 340 ms da esquerda
para a direita, inclusive ao regrifar com a mesma cor. Remoção retrai apenas
o background dos marks por 200 ms via Web Animations, sem sumir com o texto.
Aguarda animação, verifica sessão/ID atual e grava; falhas cancelam o efeito e
restauram a tinta. Movimento reduzido desativa ambas as animações de grifo.
Rótulos, status, skip link, foco
visível e movimento reduzido presentes. Sem certificação WCAG ou teste com
leitor de tela/Safari físico.

tests/browser.ps1 serve apenas em 127.0.0.1 e abre Chrome/Edge headless em perfil
temporário. No modo padrão substitui firebase.js por tests/firebase.mock.js
somente no servidor local. Scripts reais do app são testados com Map em memória,
sem Firebase remoto. Mock mantém fixtures em sessionStorage apenas no servidor
de teste para permitir reload real. browser-checks.js cobre funções;
reload-checks.js, persistência; responsive-checks.js, teclado/drawers; runner
mede overflow/temas, arraste mouse/toque, viewport curto, fonte renderizada,
movimento reduzido e console CDP.
-Live carrega SDK real apenas na tela de login, sem credenciais. Saídas em
tests/.artifacts são ignoradas. Instruções em tests/README.md.

Memória/checkpoints não participam da execução. Git restaura arquivos, não Auth,
Firestore, regras remotas ou armazenamento do navegador.
