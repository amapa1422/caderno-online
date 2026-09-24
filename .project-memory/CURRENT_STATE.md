# Estado atual

Atualizado em: 2026-09-24 — PROMPT-0008 / CHANGE-0008.
Este arquivo descreve somente o presente. Histórico em CHANGELOG.md.

## Projeto e funcionalidades

**Caderno Online** é um aplicativo web estático para anotações diárias por conta,
com Firebase Auth e sincronização Firestore em tempo real.

- Login por e-mail/senha, tratamento de erros, sessão persistente e logout.
- Interface baseada em design_system.html: sidebar com busca nas páginas,
  editor central, calendário mensal e resumo do dia.
- Temas claro/escuro, seguindo a preferência do sistema até escolha explícita;
  tema e recolhimento dos painéis salvos no navegador.
- Aparência opcional Normal/Homem-Aranha/Venom junto ao botão claro/escuro.
  Skins nativas com fundos e teias originais, cores isoladas e preferência local
  caderno-visual-theme, independente de data-theme. Normal mantém o desenho
  anterior; único controle novo no rodapé existente, sem aumentar sua altura.
  Preferência aplicada no head, também no login. Skins não alteram dados,
  Firebase, fontes/cores de grifo ou lógica das anotações. Sem extensão necessária.
- Navegação por data, calendário, Hoje e dia anterior/seguinte com virada de folha.
- Painéis móveis com fundo inerte, Escape, contenção e devolução de foco.
- Inclusão explícita de anotações de até 140 caracteres por Adicionar/Enter;
  Shift+Enter insere nova linha. Compositor acima da lista; novas notas sem grifo.
  Novas notas não têm autosave.
- Edição de notas existentes com autosave após 650 ms, salvamento serializado
  e preservação de texto em falhas. Navegação aguarda inclusão/edição pendente.
- Anotações com feito/desfazer verde e excluir vermelho à direita, sem checkbox
  à esquerda ou progresso de tarefas. Feitas permanecem visíveis com grifo intacto.
- Fonte original Segoe Print nas notas, com Bradley Hand/cursive como fallbacks
  do sistema; tipografia do design system preservada no restante da interface.
- Marca-texto livre: campo saturação/brilho, barra Hue, HEX, seletor nativo,
  preview ao vivo e seis cores recentes locais. Cor global persistida no navegador,
  definida exclusivamente pelo seletor do topo para os próximos grifos.
- Marca-texto por anotação inteira, usando cor global selecionada no topo.
  Grifar substitui toda a tinta; Remover grifo limpa toda a nota pelo mesmo ID.
  Passada de 340 ms e remoção de 200 ms; transparência ajustada por tema.
  Grifos parciais históricos preservados até ação explícita; edição de grifo
  integral mantém a cor por todo o texto. Arraste não escreve no Firestore.
- Concluir usa o campo legado concluido. Exclusão só ocorre após confirmação
  em dialog; cancelar/Escape preservam a nota. Microanimação de feito de 180 ms.
- Sem três pontinhos: Editar, Grifar e Remover grifo sempre visíveis abaixo da
  nota, exceto durante edição. Sem dependência de seleção; texto continua copiável.
  Alterar cor global não recolore notas existentes; remover não altera cor global.
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
| visual-themes.js / visual-themes.css | Preferência visual local e skins isoladas; sem acesso ao estado ou Firebase. |
| assets/themes/spider/ | Dois fundos PNG, duas teias SVG e spider-mark.svg originais. |
| firebase.js | Configuração e exports Firebase, preservados do baseline. |
| icone.png | Favicon e apple-touch-icon existente. |
| design_system.html | Referência visual standalone incorporada em PROMPT-0002. |
| tests/ | Testes de navegador via PowerShell/CDP e Firebase simulado. |
| .project-memory/ | Histórico, decisões, problemas e checkpoints. |

## Dados e limites

Coleção users/{uid}/caderno, gravação por setDoc com merge. Novas operações usam
data, texto, criadoEm, atualizadoEm, grifos e versaoGrifos: 2; criação/conclusão
também gravam concluido (sem campos duplicados). cor legada permanece intacta;
edição/grifo não mudam conclusão. Um adaptador de leitura conserva grifos antigos. O discriminador
versaoGrifos distingue remoção explícita de grifo de arrays vazios legados sem
apagar campos ou migrar a coleção. Apenas notas criadas ou alteradas recebem v2.
Removidos por solicitação atual: lógica de seleção para grifo e ocultação das
ações. Mantida ausência de três pontinhos e seletor individual de cor.
Conclusão foi restaurada por PROMPT-0005, substituindo DEC-0008 via DEC-0010.
Autenticação, configuração Firebase e regras remotas permanecem inalteradas.

Regras remotas não são versionadas. Seu suporte a grifos/versaoGrifos e a
integração autenticada exigem validação com conta real. Não há persistência
offline de notas explicitamente configurada. Git não restaura dados remotos.

## Última alteração e checkpoint estável

PROMPT-0008 adicionou as skins nativas opcionais Normal, Homem-Aranha e Venom.
app.js, style.css, color.js e firebase.js permanecem idênticos ao início da tarefa.
PROMPT-0007 consta como pendente: HEAD recebido só acrescentava seus registros
e um diagnóstico de teste, sem alteração de produto. Não foi concluído neste escopo.

- Checkpoint final: **CP-0014**, `bd0217ebd101f47b713176396c80284ad12d0aab`.
- Inicial: CP-0013, `9f74409dd1329d1dcd34a75a1f1872355f77352f`.
- Antes do redesign: CP-0003, `ac98d0649274c25d885b0e6074764ade3e800406`.
- Baseline: BASELINE-0001 / CP-0001, `2eb960f0b473a216e82e4d242dff044ecac0e481`.
- Nível validado: Chrome, 112 verificações por skin (336), mouse/toque, viewport
  390x360, nove larguras (320–1920 px) nos dois temas e console limpo. Testes de
  skins: 50 verificações, 30 combinações viewport/base/skin, contraste, preferência,
  reload, armazenamento bloqueado e teclado nativo. Backend simulado.
  Comparação visual Normal com CP-0013 e validação Edge descritas em CHANGE-0008.
  Capturas de desktop/mobile/login/picker/drawers/dialog inspecionadas.
- Fonte efetivamente renderizada confirmada por CDP: Segoe Print, não customizada.
- SDK real: inicialização na tela de login validada nesta tarefa, console limpo,
  sem autenticar nem gravar dados remotos.
- Pendente manual: login/CRUD/grifos em conta real, regras, sincronização entre
  dispositivos, Safari/iOS, teclado físico mobile e leitores de tela. Dispositivos
  sem as fontes originais usam cursive do sistema. Não é homologação de produção.
- Checkpoints locais, sem push/deploy. Commit complementar de hashes pertence
  ao mesmo PROMPT-0008 e não altera o aplicativo nem move CP-0014.
