# Arquitetura do Caderno Online

Atualizada por PROMPT-0003 / CHANGE-0003 em 2026-09-23, concluindo PROMPT-0002.

## Estrutura e interface

Aplicativo estático HTTP(S): index.html carrega style.css e app.js; app.js importa
firebase.js, que importa SDK 12.18.0 de gstatic. Sem framework, build, backend
próprio, roteador, manifest ou service worker.

Design_system.html é referência standalone. O produto incorpora seus tokens em
style.css e usa componentes próprios, sem executar seu JS nem copiar seus dados.
Ícones são SVGs no HTML; icone.png atende favicon e ícone Apple.

Shell: sidebar, workspace e calendário. Sidebar flutuante até 900 px; calendário
flutuante até 1180 px. Workspace ocupa explicitamente a segunda coluna da grade.
Busca filtra datas/textos já sincronizados. Calendário mostra 42 dias com notas
sinalizadas e navegação por setas do teclado. Resumo conta notas/conclusões;
não há agenda com horários nem conteúdo fictício em produção.

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
| concluido | Booleano; ativa também grifo da nota inteira. |
| cor | Hexadecimal; cores legadas continuam aceitas. |
| criadoEm / atualizadoEm | Milissegundos do relógio cliente. |
| grifos | Opcional: array de { inicio, fim, cor }, índices UTF-16, fim exclusivo. |

salvarItem mantém setDoc com merge, campos legados e caminho original. O campo
grifos é opcional; remover marcações pode gravar array vazio. Documentos antigos
sem o campo continuam válidos. Exclusão usa deleteDoc, imediata e sem lixeira.
Não houve mudança de regras/configuração ou migração remota. Regras reais devem
aceitar o campo opcional; isso exige conta real para validação.

- Inclusão explícita protegida por addPromise contra repetição. Captura data/ID
  antes do await; resposta não limpa um texto novo digitado durante a gravação.
- Rascunhos por data em Map local à aba, sem persistência; limpos no callback de
  Auth. beforeunload sinaliza conteúdo/gravação pendente.
- Edição existente tem debounce de 650 ms e uma operação por vez. Texto novo
  digitado durante gravação é salvo em seguida. Falhas preservam a edição.
- Navegação aguarda inclusão/edição; erro mantém dia/texto. Usa Web Animations,
  com fade breve sem rotação em prefers-reduced-motion.
- Grifos de trecho são divididos/substituídos ao recolorir/remover. Edição ajusta
  intervalos comparando prefixo/sufixo; concluir usa a cor selecionada.
- Status informa gravação, edição, cache/conexão e falhas; toasts explicam erros.

Não há resolução colaborativa de conflitos entre dispositivos: merge de campos
não equivale a merge de versões concorrentes do texto. Não há histórico remoto.

## Armazenamento e preferências

Migração preservada: meu-caderno-diario-v1 contém mapa data→itens e
meu-caderno-diario-migrado-firebase-v1 é marcador global. Dados antigos não são
apagados; usa IDs antigos, merge e Promise.all. Marcador não separado por UID,
comportamento herdado. Firebase Storage não é utilizado.

Preferências: caderno-theme, caderno-sidebar, caderno-agenda. Tema segue o sistema
até escolha explícita e é aplicado antes do CSS. Auth persistente não significa
notas offline; não há cache persistente Firestore configurado explicitamente.

## Acessibilidade e testes

Painéis flutuantes: dialog, aria-modal, fundo inert, foco inicial, contenção de
Tab, Escape e restauração de foco. Paleta preserva seleção ao abrir, usa setas
no teclado e reposiciona conforme viewport. Rótulos, status, skip link, foco
visível e movimento reduzido presentes. Sem certificação WCAG ou teste com
leitor de tela/Safari físico.

tests/browser.ps1 serve apenas em 127.0.0.1 e abre Chrome/Edge headless em perfil
temporário. No modo padrão substitui firebase.js por tests/firebase.mock.js
somente no servidor local. Scripts reais do app são testados com Map em memória,
sem Firebase remoto. browser-checks.js cobre funções; responsive-checks.js,
teclado/drawers; runner mede overflow/temas, movimento reduzido e console CDP.
-Live carrega SDK real apenas na tela de login, sem credenciais. Saídas em
tests/.artifacts são ignoradas. Instruções em tests/README.md.

Memória/checkpoints não participam da execução. Git restaura arquivos, não Auth,
Firestore, regras remotas ou armazenamento do navegador.
