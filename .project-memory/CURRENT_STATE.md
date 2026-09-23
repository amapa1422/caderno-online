# Estado atual

Atualizado em: 2026-09-23 — PROMPT-0004 / CHANGE-0004.
Este arquivo descreve somente o presente. Histórico em CHANGELOG.md.

## Projeto e funcionalidades

**Caderno Online** é um aplicativo web estático para anotações diárias por conta,
com Firebase Auth e sincronização Firestore em tempo real.

- Login por e-mail/senha, tratamento de erros, sessão persistente e logout.
- Interface baseada em design_system.html: sidebar com busca nas páginas,
  editor central, calendário mensal e resumo do dia.
- Temas claro/escuro, seguindo a preferência do sistema até escolha explícita;
  tema e recolhimento dos painéis salvos no navegador.
- Navegação por data, calendário, Hoje e dia anterior/seguinte com virada de folha.
- Painéis móveis com fundo inerte, Escape, contenção e devolução de foco.
- Inclusão explícita de anotações de até 140 caracteres por Adicionar/Enter;
  Shift+Enter insere nova linha. Compositor acima da lista, com grifo opcional.
  Novas notas não têm autosave.
- Edição de notas existentes com autosave após 650 ms, salvamento serializado
  e preservação de texto em falhas. Navegação aguarda inclusão/edição pendente.
- Anotações sem checkbox, conclusão, progresso ou estado de tarefa.
- Fonte original Segoe Print nas notas, com Bradley Hand/cursive como fallbacks
  do sistema; tipografia do design system preservada no restante da interface.
- Marca-texto livre: campo saturação/brilho, barra Hue, HEX, seletor nativo,
  preview ao vivo, seis cores recentes locais e opção sem marca-texto.
- Grifo de nota inteira/trechos, recoloração e remoção; animação de passada de
  340 ms e transparência ajustada por tema. Arraste não escreve no Firestore.
- Botão discreto de opções em cada nota: edição, marca-texto e exclusão imediata.
- Feedback de gravação, carregamento, erro/conexão e movimento reduzido.
- Rascunhos separados por dia em memória da aba, limpos ao mudar de sessão;
  aviso de saída com texto pendente. Não persistem após fechar/recarregar a aba.
- Migração legada do localStorage e documentos existentes preservados.

Não há editor rico, anexos, eventos com horário, PWA, manifest, service worker,
cadastro ou recuperação de senha. O calendário resume notas reais; conteúdo
demonstrativo do design system não é importado para as contas.

## Stack e arquivos

HTML, CSS e JavaScript nativo com módulos ES. Firebase SDK 12.18.0 via gstatic,
Firebase Auth com browserLocalPersistence e Cloud Firestore com onSnapshot.
Sem framework, bundler, package.json ou pipeline de deploy versionados.

| Arquivo | Responsabilidade |
| --- | --- |
| index.html | Login, shell, painéis, compositor, paleta, SVGs e tema inicial. |
| style.css | Tokens da referência, componentes, temas e responsividade. |
| app.js | Auth, migração, gravação, edição, grifos, calendário e interação. |
| color.js | Conversão HSV/HEX e normalização compatível de cores, sem bibliotecas. |
| firebase.js | Configuração e exports Firebase, preservados do baseline. |
| icone.png | Favicon e apple-touch-icon existente. |
| design_system.html | Referência visual standalone incorporada em PROMPT-0002. |
| tests/ | Testes de navegador via PowerShell/CDP e Firebase simulado. |
| .project-memory/ | Histórico, decisões, problemas e checkpoints. |

## Dados e limites

Coleção users/{uid}/caderno, gravação por setDoc com merge. Novas operações usam
data, texto, criadoEm, atualizadoEm, grifos e versaoGrifos: 2. Campos antigos
cor/concluido são mantidos intactos nos documentos existentes, sem alternar
conclusão. Um adaptador de leitura conserva grifos antigos. O discriminador
versaoGrifos distingue remoção explícita de grifo de arrays vazios legados sem
apagar campos ou migrar a coleção. Apenas notas criadas/editadas recebem v2.
Removidas por solicitação: ações de conclusão, checkboxes e paleta fixa.
Autenticação, configuração Firebase e regras remotas permanecem inalteradas.

Regras remotas não são versionadas. Seu suporte a grifos/versaoGrifos e a
integração autenticada exigem validação com conta real. Não há persistência
offline de notas explicitamente configurada. Git não restaura dados remotos.

## Última alteração e checkpoint estável

PROMPT-0004 recuperou criação acima da lista e caligrafia original, retirou o
conceito de tarefa e implementou marca-texto livre, mantendo o shell moderno.

- Checkpoint final: **CP-0007**, `5e05485d4400f76409da3be99d0d213c2ceb321f`.
- Inicial: CP-0006, `3ab3b527c06d0d76990d9483c7e295af8a36811f`.
- Antes do redesign: CP-0003, `ac98d0649274c25d885b0e6074764ade3e800406`.
- Baseline: BASELINE-0001 / CP-0001, `2eb960f0b473a216e82e4d242dff044ecac0e481`.
- Nível validado: 57 verificações funcionais, 6 de reload, 11 de teclado/painéis,
  arraste via CDP com mouse/toque, viewport reduzido 390x360, nove larguras
  (320–1920 px) nos dois temas, movimento reduzido e console sem erros em Chrome
  headless com backend simulado. Capturas desktop/mobile inspecionadas.
- Fonte efetivamente renderizada confirmada por CDP: Segoe Print, não customizada.
- SDK real: inicialização na tela de login e seletor livre, console sem erros,
  em perfil temporário sem autenticação ou escrita remota.
- Pendente manual: login/CRUD/grifos em conta real, regras, sincronização entre
  dispositivos, Safari/iOS, teclado físico mobile e leitores de tela. Dispositivos
  sem as fontes originais usam cursive do sistema. Não é homologação de produção.
- Checkpoints locais, sem push/deploy. Commit complementar de hashes pertence
  ao mesmo PROMPT-0004 e não altera o aplicativo nem move CP-0007.
