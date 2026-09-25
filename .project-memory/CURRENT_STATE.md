# Estado atual

Atualizado em 2026-09-25 — PROMPT-0009 / CHANGE-0009.
Historico completo preservado em CHANGELOG.md; este documento descreve o presente.

## Base e funcionalidades preservadas

Caderno Online: app HTML/CSS/JavaScript nativo, Firebase Auth por email/senha e
Firestore em users/{uid}/caderno. Base recebida b57aa73f69e0d72da514fbc069e54e291565f555,
confirmada como HEAD/main do GitHub por git ls-remote nesta sessao; sem push/deploy.
Notas de ate 140 caracteres, inclusao explicita, edicao com autosave, calendario,
busca, marca-texto global por nota, concluir/desfazer, exclusao confirmada,
rascunhos por dia na aba, tema claro/escuro e paineis responsivos permanecem.
Fonte Segoe Print com fallbacks do sistema. Nao ha manifest, service worker ou PWA.
Desde b57aa73: criacao administrativa de contas via accounts.js/callable
createCadernoUser, rules/config Firebase versionadas, sem importacao automatica
de notas anonimas do localStorage. Estas funcoes nao foram alteradas na tarefa.

## Categorias visuais

Oito opcoes no mesmo seletor #visualTheme, na ordem solicitada:
Normal, Homem-Aranha, Venom, Espetacular-Homem Aranha, Santos, Flamengo, Sao Paulo,
Bolsonaro. data-visual-theme independente de data-theme; caderno-visual-theme no
localStorage, aplicado no head antes do CSS. Sem chave nova ou migracao.
Espetacular/Flamengo herdam Spider; Santos/Sao Paulo herdam Venom. Times sem teias.
Bolsonaro: superficies verde-escuras, dourado e azul, brilho suave de opacidade
em ::after com 12s, exclusivamente quando o sistema permite movimento. Camadas
fixas atras do conteudo com pointer-events:none. Normal e skins antigas preservados.
As cinco artes fornecidas estao em assets/themes/categories/; somente a skin
ativa referencia seu fundo. Resolucao de Bolsonaro 499x367 pode perder nitidez
em telas grandes. Imagens copiadas do anexo, sem regeneracao ou novas dependencias.

## Arquivos

- index.html: estrutura existente; alteracao somente nas cinco options do seletor.
- visual-themes.js: whitelist ampliada; mesmo algoritmo de persistencia/fallback.
- visual-themes.css: heranca de paletas, fundos, paleta Brasil e animacao isolada.
- assets/themes/categories/: cinco PNGs fornecidos e README de origem/dimensoes.
- app.js, style.css, color.js, accounts.js, firebase.js, rules/config/functions:
  identicos a CP-0015; nenhuma alteracao de logica, dados ou autenticacao.
- tests/: suite recuperada do historico e adaptada aos oito temas e a base b57aa73;
  servidor local e Firebase simulado, artefatos ignorados.
- .project-memory/: documentos recuperados de ac8158f, removidos em b57aa73;
  fatos atuais corrigidos sem inventar prompts/testes para aquele commit.

## Checkpoints e validacao

Inicial: CP-0015, ad3490ec58ee93570c63c1d21299ab87f2c767d5, tag anotada local.
Final: 387733c580bc536e9ce0ebed6786b1a9db3caa6c (refs/tags/CP-0016), validado localmente. Hash literal registrado em commit complementar da mesma tarefa; HEAD pode conter somente esses metadados posteriores. Edge: 129 checks de skins, 80 combinacoes, reload/storage/reduced-motion/teclado e zero diferencas de pixels em quatro comparacoes Normal. Chrome: 112 checks funcionais, mouse/toque, nove larguras nos dois modos, viewport curto. Console limpo; Firebase simulado. Detalhes em CHANGE-0009.
Ultimo checkpoint historico com validacao documentada: CP-0014,
bd0217ebd101f47b713176396c80284ad12d0aab. Commit existe, mas a tag nao esta neste
checkout nem no remoto consultado; nao foi recriada. Testes historicos nao sao
homologacao de b57aa73 nem de producao. Tags antigas registradas nos documentos
sao referencias historicas; confira os hashes antes de qualquer restauracao.
PROMPT-0007 continua pendente no historico, sem alteracao nesta tarefa.
Limites: Firebase real/contas/regras/sincronizacao, Safari/iOS, leitores de tela
e teclado fisico mobile nao homologados nesta tarefa. Git nao restaura dados remotos.
Scripts npm de build/backend/emuladores ja apontavam para arquivos ausentes na base;
nao foram alterados nem usados para validar os temas.
