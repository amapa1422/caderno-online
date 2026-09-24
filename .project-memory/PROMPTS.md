# Registro de solicitações

Novas solicitações no topo. Não reutilize IDs nem apague pedidos depois de
rollback. Os checkpoints são referências Git reais, confirmadas com
`git rev-parse 'CP-XXXX^{commit}'`. O histórico anterior à instalação existe no
Git, mas seus prompts não foram fornecidos e não recebem IDs inventados.

## PROMPT-0008

Data: 2026-09-24, 12:34:25 -03:00 (checkpoint inicial).
Resumo: Adicionar somente skins opcionais Normal, Homem-Aranha e Venom, com
assets existentes da extensão, CSS isolado, data-visual-theme independente de
data-theme e preferência caderno-visual-theme local aplicada cedo. Seletor discreto,
camada fixa sem interceptar cliques, contraste e responsividade. Preservar Normal,
fontes, grifos e picker, funções do caderno, Firebase, login e dados. Sem APIs da
extensão, redesign, FAB ou alterações PWA. Validar troca/reload, fluxos existentes,
cores livres, viewports desktop/mobile, assets e console; registrar limites reais.
Trecho: “Quero SOMENTE adicionar uma nova camada visual opcional baseada nos
arquivos de tema que já possuo.” Pedido completo: anexo Texto colado.txt desta tarefa.
Inicial: CP-0013, `9f74409dd1329d1dcd34a75a1f1872355f77352f`.
Final: CP-0014, `refs/tags/CP-0014`. CHANGE-0008 (CHANGE-0007 já reservado por PROMPT-0007).
Estado: Concluído localmente. Chrome: 112 verificações por skin; Edge: 50 de skins,
30 combinações viewport/base/skin, persistência/reload, teclado e console limpo.
Normal comparado pixel a pixel com CP-0013, desktop/mobile claro/escuro: diferença
apenas no novo seletor. Cinco assets HTTP 200/decodificados; grifos preservados.
SDK real inicializa sem conta/escrita. Safari/iOS físico, Tela de Início e conta
real continuam pendentes. Sem push/deploy; detalhes e arquivos em CHANGE-0008.
Árvore recebida limpa; tests/.artifacts ignorado e preservado.
Assets localizados em Desktop/aranha_visual_extensao_v12/assets, fora do repo.
Auditoria: HEAD recebido 2f1372281dee2ebaeaa9e9cb6b272876e73de917 só acrescenta
registros e diagnóstico de teste; app.js/style.css idênticos a CP-0011. PROMPT-0007
continua registrado como pendente; esta tarefa não implementa nem atesta seu pedido.
Não existe manifest/service worker neste checkout; não criar PWA neste escopo.

## PROMPT-0007

Data: 2026-09-23, 16:54:30 -03:00 (checkpoint inicial).
Resumo: Correção pontual do ✓: concluir aplica a cor global atual na anotação
inteira pela mesma função de Grifar; desfazer limpa todos os grifos. Preservar
Grifar/Remover independentes da conclusão, quatro estados possíveis e restante
do projeto. Uma gravação coerente de concluido+grifos, sem duplicação/Selection,
com proteção contra cliques rápidos e autosave. Diagnosticar #FF1493; validar
aceitação #E85D75 + dois reloads, equivalência #22AACC e nova nota #FF4F81,
cores antigas intactas, edição, IDs iguais/textos iguais, light/dark e console.
Trecho: “Ao desfazer a conclusão, o grifo é removido.”
Inicial: CP-0012, `d630baaac666721d03589ca48d4463e4ad4b084f`.
Final: Pendente. CHANGE-0007. Estado: Em andamento.
Árvore limpa, apenas artefatos de teste ignorados. Sem rollback, redesign ou push.

## PROMPT-0006

Data: 2026-09-23, 15:37:30 -03:00 (checkpoint inicial).
Resumo: Corrigir Grifar/Remover grifo como ações inversas sobre a anotação inteira,
identificada por ID, sem dependência de seleção do navegador. Ações visíveis sem
clique prévio; controles não selecionáveis, conteúdo continua copiável. Reutilizar
cor global e persistência atual, substituir cor ao regrifar e preservar cores
antigas, conclusão independente, edição, exclusão e todo o restante do sistema.
Manter passada 250–400 ms e adicionar remoção suave 150–250 ms. Eliminar listeners
de seleção desnecessários; testar múltiplas notas, IDs/textos iguais, reload,
edição com tinta, mobile, temas, falhas e console. Sem rollback geral ou redesign.
Trecho: “Marca-texto por anotação inteira, usando cor global selecionada no topo.”
Inicial: CP-0010, `e33ada960336a47b53388dbf3f94193d23b6485f`.
Final: CP-0011, `b238c41e0e4559b4b67e394da375ffe1ca6c160d`. CHANGE-0006.
Estado: Concluído localmente. 75 verificações funcionais + 21 em dois reloads +
16 mobile/teclado; 18 combinações viewport/tema, clique real ignorando seleção,
arraste mouse/toque, console sem erros. Conta real e aparelhos físicos pendentes.
Arquivos: app.js, index.html, style.css, testes e memória. DEC-0011 substitui
interação por trechos; edição/conclusão/exclusão e grifos históricos preservados.
Árvore inicial limpa; apenas tests/.artifacts ignorado. Sem push/deploy.

## PROMPT-0005

Data: 2026-09-23, 15:08:43 -03:00 (checkpoint inicial).
Resumo: Novo Texto colado.txt recebido durante finalização de PROMPT-0004.
Substitui explicitamente remoção de conclusão: restaurar feito/desfazer com
ícone verde discreto à direita e excluir vermelho com confirmação. Remover
três pontinhos e preservar edição/grifos em interação apropriada. Picker apenas
no topo define cor global persistida localmente; aplicar/remover por nota usa
essa cor sem recolorir notas antigas automaticamente. Manter fonte, shell,
calendário, auth e animação de páginas. Testar CRUD/conclusão/cancelamento,
cor global/reload/recoloração explícita, legados, temas, mobile e console.
Inicial: CP-0008, `429955012b01bb6e5d8c91a7b3d084ddfbad1557`.
Final: CP-0009, `13e392a8636fbae4c98810d7b855c92b21f0f2ce`. CHANGE-0005.
Arquivos: app.js, index.html, style.css, testes e memória do projeto.
Estado: Concluído e validado localmente: 64 verificações funcionais, 8 de reload,
13 de teclado/mobile, seleção real via mouse, arraste mouse/toque, 18 combinações
de viewport/tema, viewport curto, movimento reduzido e console sem erros.
SDK real inicializado sem conta/escrita remota. Conta real, regras e dispositivos
físicos pendentes. CP-0007 preserva a etapa anterior localmente validada.
Trecho: “Esta solicitação substitui a decisão anterior de remover completamente
o conceito de item concluído.” Sem push/deploy nem migração destrutiva.

## PROMPT-0004

Data: 2026-09-23, 12:34:58 -03:00 (checkpoint inicial).
Resumo: Pedido anexado em Texto colado.txt e cinco imagens de referência.
Reposicionar criação acima da lista; remover conceito/controles de tarefa e
conclusão; marca-texto livre com HSV, HEX, preview, recentes e remoção; restaurar
a fonte manuscrita original apenas nas anotações, mantendo o design system.
Objetivo: Interface moderna de diário, criação com grifo opcional, edição de
cores existentes, animação orgânica e mobile/toque/teclado. Preservar notas,
campos legados, autenticação, calendário, edição e sincronização, sem migração
destrutiva nem biblioteca pesada. Testar persistência/reload, cores, legados,
layout, acessibilidade, console e fonte; documentar limitações reais.
Fonte investigada: CP-0003 e f4b7e9f usam Segoe Print, Bradley Hand, Comic Sans MS,
cursive. Restaurar as duas primeiras, removendo Comic Sans conforme pedido;
fontes do sistema, sem redistribuir arquivos proprietários.
Checkpoint antes: CP-0006, `3ab3b527c06d0d76990d9483c7e295af8a36811f`.
Checkpoint depois: CP-0007, `5e05485d4400f76409da3be99d0d213c2ceb321f`.
CHANGE: CHANGE-0004.
Arquivos: index.html, style.css, app.js, módulo leve de cores, testes e memória.
Estado: Concluído e validado localmente. 57 testes funcionais, 6 de reload, 11 de
teclado/mobile, 18 combinações de viewport/tema, drag mouse/toque, viewport curto,
fonte original confirmada e console sem erros. Conta real/teclado físico mobile
pendentes. Árvore recebida limpa; artefatos ignorados; sem push/deploy.
Trechos: “REMOVER COMPLETAMENTE O CONCEITO DE CHECKBOX / TAREFA CONCLUÍDA”;
“NÃO escolha imediatamente uma nova fonte parecida”; “Faça as alterações
diretamente no projeto.” Sem autorização de push/deploy.

## PROMPT-0003

Data: 2026-09-23, 10:24:28 -03:00 (checkpoint inicial).

Resumo do pedido: “Pode finalizar a parte que solicitei ontem do sistema?”

Objetivo: Concluir o redesign identificado em PROMPT-0002, preservando a
implementação parcial existente, corrigindo problemas encontrados na revisão,
executando os testes e finalizando a memória e os checkpoints locais.

Arquivos afetados: app.js, style.css, testes e memória; lista em CHANGE-0003.

CHANGE relacionado: CHANGE-0003.

Checkpoint antes: **CP-0004**, `3927d2b19e9d10a93bb66efd273e10880d286bc3`.

Checkpoint depois: **CP-0005**, `fab3e45eb0ac623750cc5191b0b7a4e3ca88cdc4`.

Estado: Concluído localmente; 47 verificações, 18 combinações de viewport/tema,
movimento reduzido, console e inicialização SDK real aprovados. Login/CRUD real,
regras e sincronização entre dispositivos ainda exigem teste manual.
O checkpoint inicial preserva os arquivos modificados/novos de PROMPT-0002,
sem atribuir sua implementação a esta retomada. Artefatos locais ignorados.
Nenhum push ou deploy realizado.

## PROMPT-0002

Data: 2026-09-22, 16:53:42 -03:00 (checkpoint inicial).

Resumo do pedido: Aplicar o design system oficial ao Caderno Online, preservando
autenticação, notas existentes, sincronização e os contratos de banco.

Objetivo: Interface de diário com sidebar recolhível/drawer mobile, editor central,
calendário, temas claro/escuro, navegação entre dias com virada de folha,
marca-textos e feedback discreto de gravação, com acessibilidade e testes.

Arquivos afetados: `index.html`, `style.css`, `app.js`, `design_system.html`,
testes e memória (lista final em CHANGE-0002).

CHANGE relacionado: `CHANGE-0002`; conclusão em `CHANGE-0003`.

Checkpoint antes: **CP-0003**, `ac98d0649274c25d885b0e6074764ade3e800406`.

Checkpoint depois: **CP-0005**, `fab3e45eb0ac623750cc5191b0b7a4e3ca88cdc4`,
após a retomada PROMPT-0003.
Estado intermediário preservado em CP-0004, `3927d2b19e9d10a93bb66efd273e10880d286bc3`.

Trecho fiel: “Faça as alterações diretamente nos arquivos do projeto.” /
“Não remova funcionalidades existentes.”

Referência: `design_system.html` localizado em Downloads, ausente da raiz no início;
será incorporado ao projeto. Tokens oficiais serão preservados, com adaptações
de contraste/acessibilidade documentadas. Não copiar conteúdo demonstrativo para
as notas dos usuários. Não há PWA nem autosave de rascunho no código recebido.

Estado: Concluído pela retomada PROMPT-0003 em 2026-09-23. Os testes válidos e
limitações estão em CHANGE-0003; não se presume validação realizada ontem.

## PROMPT-0001

Data: 2026-09-22, 16:25:04 -03:00 (America/Sao_Paulo; checkpoint inicial).

Resumo do pedido: Instalar um sistema permanente de memória, histórico,
documentação e rollback antes de qualquer nova mudança de produto.

Objetivo: Analisar o projeto inteiro, preservar seu estado como `BASELINE-0001`,
criar `AGENTS.md`, preencher `.project-memory/` e estabelecer leitura/atualização
obrigatórias com checkpoints Git antes/depois de tarefas significativas.

Arquivos afetados: `AGENTS.md`; `.project-memory/README.md`, `CURRENT_STATE.md`,
`CHANGELOG.md`, `DECISIONS.md`, `PROMPTS.md`, `ARCHITECTURE.md`, `KNOWN_ISSUES.md`,
`ROLLBACK.md`, `checkpoints/CP-0001.md`, `checkpoints/CP-0002.md`.

CHANGE relacionado: `CHANGE-0001`.

Checkpoint antes: **CP-0001 / BASELINE-0001** —
`2eb960f0b473a216e82e4d242dff044ecac0e481`.

Checkpoint depois: **CP-0002** — `6d10c7b0b299e2802e9cca026ee427fe6b2d436c`
(`refs/tags/CP-0002`, 2026-09-22 às 16:38:31 -03:00).

Trecho fiel da solicitação: “Agora quero que você faça SOMENTE a configuração
desse sistema.” / “Não prossiga para redesign ou outras modificações nesta tarefa.”

Restrições: Não modificar interface, funcionalidades, Firebase ou lógica de negócio.
Manter o histórico, documentar decisões e tornar os checkpoints restauráveis.

Estado: Concluído; configuração e validações descritas em `CHANGE-0001`.
O commit complementar de hashes pertence a este mesmo pedido; não é outro prompt.

Interpretação futura: “antes de PROMPT-0001” aponta a `CP-0001`; restaurar o
aplicativo para esse estado deve conservar a memória atual, criada depois dele.
