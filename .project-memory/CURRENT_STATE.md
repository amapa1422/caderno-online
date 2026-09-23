# Estado atual

Atualizado em: 2026-09-23 — PROMPT-0003 / CHANGE-0003.
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
  Shift+Enter insere nova linha. Novas notas não têm autosave.
- Edição de notas existentes com autosave após 650 ms, salvamento serializado
  e preservação de texto em falhas. Navegação aguarda inclusão/edição pendente.
- Conclusão/desmarcação, exclusão imediata e 13 cores de marca-texto.
- Grifo de nota inteira e de trechos selecionados, recoloração e remoção.
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
| firebase.js | Configuração e exports Firebase, preservados do baseline. |
| icone.png | Favicon e apple-touch-icon existente. |
| design_system.html | Referência visual standalone incorporada em PROMPT-0002. |
| tests/ | Testes de navegador via PowerShell/CDP e Firebase simulado. |
| .project-memory/ | Histórico, decisões, problemas e checkpoints. |

## Dados e limites

Coleção users/{uid}/caderno; campos legados data, texto, concluido, cor,
criadoEm, atualizadoEm. grifos é opcional e contém intervalos de texto e cor;
setDoc com merge preserva campos desconhecidos. Não houve migração remota,
mudança de configuração Firebase nem exclusão de funcionalidades anteriores.

Regras remotas não são versionadas. Seu suporte ao campo opcional grifos e a
integração autenticada exigem validação com conta real. Não há persistência
offline de notas explicitamente configurada. Git não restaura dados remotos.

## Última alteração e checkpoint estável

PROMPT-0003 concluiu o redesign iniciado em PROMPT-0002. CP-0004 preservou a
implementação parcial recebida; CP-0005 registra a conclusão com ajustes de
responsividade, foco, proteção de sessão e documentação atualizada.

- Checkpoint final: **CP-0005**, commit em `refs/tags/CP-0005`.
- Inicial da retomada: CP-0004, `3927d2b19e9d10a93bb66efd273e10880d286bc3`.
- Antes do redesign: CP-0003, `ac98d0649274c25d885b0e6074764ade3e800406`.
- Baseline: BASELINE-0001 / CP-0001, `2eb960f0b473a216e82e4d242dff044ecac0e481`.
- Nível validado: 37 verificações funcionais, 10 de teclado/painéis, nove larguras
  (320–1920 px) nos dois temas, movimento reduzido e console sem erros em Chrome
  headless com backend simulado. Capturas desktop/mobile inspecionadas.
- SDK real: inicialização na tela de login, 13 cores carregadas, console sem erros,
  em perfil temporário sem autenticação ou escrita remota.
- Pendente manual: login/CRUD/grifos em conta real, regras, sincronização entre
  dispositivos, Safari/iOS e leitores de tela. Não é homologação de produção.
- Checkpoints locais, sem push/deploy. Commit complementar de hashes pertence
  ao mesmo PROMPT-0003 e não altera o aplicativo nem move CP-0005.
