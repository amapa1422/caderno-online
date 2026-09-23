# Arquitetura do Caderno Online

Atualizada por PROMPT-0005 / CHANGE-0005 em 2026-09-23.

## Estrutura e interface

Aplicativo estático HTTP(S): index.html carrega style.css e app.js; app.js importa
firebase.js, que importa SDK 12.18.0 de gstatic, e color.js (conversão/normalização
de cores). Sem framework, build, backend
próprio, roteador, manifest ou service worker.

Design_system.html é referência standalone. O produto incorpora seus tokens em
style.css e usa componentes próprios, sem executar seu JS nem copiar seus dados.
Ícones são SVGs no HTML; icone.png atende favicon e ícone Apple.

Shell: sidebar, workspace e calendário. Sidebar flutuante até 900 px; calendário
flutuante até 1180 px. Workspace ocupa explicitamente a segunda coluna da grade.
Busca filtra datas/textos já sincronizados. Calendário mostra 42 dias com notas
sinalizadas e navegação por setas do teclado. Resumo conta somente anotações;
não há agenda com horários nem conteúdo fictício em produção.

Compositor antes da lista: textarea, seletor global de marca-texto, Adicionar e
ajuda. Notas novas sem grifo. Cada linha tem ✓ feito/desfazer e × excluir à
direita, sem checkbox à esquerda nem três pontinhos. Tocar/focar/selecionar texto
revela Editar, Grifar e Remover grifo, preservando funcionalidades antigas.
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
Auth usa e-mail/senha e browserLocalPersistence. Não há cadastro/reset de senha.

onAuthStateChanged incrementa sessão, cancela listener, limpa dados/rascunhos/
edição e campos locais e alterna login/caderno. Com usuário, executa migração
legada e instala onSnapshot(users/{uid}/caderno). Snapshots validam datas,
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
- Grifos de trecho são divididos/substituídos ao recolorir/remover. Edição ajusta
  intervalos comparando prefixo/sufixo. Remover grifo nunca remove o texto.
- Status informa gravação, edição, cache/conexão e falhas; toasts explicam erros.

Não há resolução colaborativa de conflitos entre dispositivos: merge de campos
não equivale a merge de versões concorrentes do texto. Não há histórico remoto.

## Armazenamento e preferências

Migração preservada: meu-caderno-diario-v1 contém mapa data→itens e
meu-caderno-diario-migrado-firebase-v1 é marcador global. Dados antigos não são
apagados; usa IDs antigos, merge e Promise.all. A importação mantém concluido
como dado legado, mas não inventa rosa para registros sem cor. Marcador não
separado por UID, comportamento herdado. Firebase Storage não é utilizado.

Preferências: caderno-theme, caderno-sidebar, caderno-agenda e
caderno-recent-colors (até seis HEX distintos, sem textos/notas) e
caderno-marker-color (HEX atual global; default #E85D75). Picker só existe no
topo, atualiza cor/indicador/preferência ao vivo, nunca recolore notas sozinho.
Ao aplicar na linha/seleção, captura cor atual e salva somente essa nota. Remover
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
Texto selecionado aceita grifo parcial; pointerdown captura seleção antes do
foco mudar para o botão. Paleta fecha fora/Escape, mantém foco e seleção, respeita
visualViewport e safe-area, com rolagem interna quando a altura é pequena.
O shell acompanha visualViewport; com compositor focado, resize traz Adicionar
para a área visível. Teclado real de iOS/Android ainda exige teste manual.

Grifos são mark inline, background-size 76% de altura, bordas assimétricas,
color-mix com opacidade .38 clara/.25 escura e animação CSS 340 ms da esquerda
para a direita. Rótulos, status, skip link, foco
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
