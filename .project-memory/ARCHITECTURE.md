# Arquitetura real do Caderno Online

Fonte: leitura integral dos cinco arquivos do aplicativo no `BASELINE-0001`,
commit `2eb960f0b473a216e82e4d242dff044ecac0e481`, em 2026-09-22.
Nenhuma arquitetura futura está apresentada como implementada.

## Estrutura

```text
caderno-online/
├── index.html                  estrutura da página
├── style.css                   aparência e responsividade
├── app.js                      estado, eventos e comportamento
├── firebase.js                 conexão e exports Firebase
├── icone.png                   favicon
├── AGENTS.md                   instruções dos agentes
└── .project-memory/
    ├── README.md
    ├── CURRENT_STATE.md
    ├── CHANGELOG.md
    ├── DECISIONS.md
    ├── PROMPTS.md
    ├── ARCHITECTURE.md
    ├── KNOWN_ISSUES.md
    ├── ROLLBACK.md
    └── checkpoints/
        ├── CP-0001.md
        └── CP-0002.md
```

Não existem `design_system.html`, manifest, service worker, regras do Firestore,
configuração Firebase CLI, servidor próprio ou gerenciador de pacotes versionados.
`design_system.html`, se adicionado, será a referência a consultar antes de
alterações visuais. Hoje a referência efetiva é o conjunto HTML/CSS existente.

## Relação entre módulos

```text
index.html ── link stylesheet ──> style.css
     │
     └── script type=module ──> app.js ── import ──> firebase.js
                                    │                    │
                                    │                    └── SDK 12.18.0 via gstatic
                                    └── manipula DOM          ├── Auth
                                                             └── Firestore
```

`index.html` fornece os elementos por ID. `app.js` consulta esses elementos,
instala eventos e executa `renderizar()` na inicialização. Não há framework,
compilação, componentes em diretórios separados ou roteamento por URL.

O site deve ser servido por HTTP(S), com suporte a módulos ES no navegador e
acesso aos endpoints externos do Firebase. Este repositório não define seu
servidor de hospedagem nem um comando de desenvolvimento instalado.

## Estado e renderização

`state` em `app.js` contém `usuario`, `data`, `cor`, `corNome`, `registros`
(mapa data → itens) e `unsubscribe` (cancelamento do listener).
A data começa no dia local e a cor começa em rosa. Esses dois valores não são
salvos como preferências. A autenticação persistente é responsabilidade do SDK.

`renderizar()` atualiza o seletor de data, data por extenso, título, contador e
lista. Usa `innerHTML` para reconstruir as linhas; `escaparHTML()` trata o texto
das notas. A delegação de eventos na lista identifica `data-id` e `data-action`.
O estado vazio é exibido quando não há itens do dia.

## Firebase e autenticação

`firebase.js` importa os módulos `firebase-app.js`, `firebase-auth.js` e
`firebase-firestore.js` da versão **12.18.0** em `www.gstatic.com`.
O projeto configurado é `caderno-online-e5b1f`. A configuração cliente já existia
no baseline e não foi modificada por esta instalação.

Inicialização: `getApps()` / `getApp()` / `initializeApp()`, seguida de
`getAuth()` e `getFirestore()`. `setPersistence(auth, browserLocalPersistence)`
solicita persistência local e registra erro no console caso falhe.

O formulário usa `signInWithEmailAndPassword`. Não há criação de contas,
redefinição de senha, provedores sociais ou funções administrativas no aplicativo.

```text
Autenticação confirmada
  → state.usuario = usuario
  → ocultar login / mostrar aplicativo
  → aguardar migrarLocalStorageParaFirebase()
  → iniciarSincronizacao()

Ausência de usuário / logout
  → pararSincronizacao()
  → limpar usuário e registros em memória
  → mostrar login / ocultar aplicativo
  → renderizar()
```

O caminho por UID separa os documentos usados pelo cliente, mas autorização real
depende de regras do Firestore. Essas regras e configurações remotas de Auth
não estão no Git; não é possível atestar sua configuração a partir deste código.

## Banco e modelo de dados

Coleção: `users/{uid}/caderno`. Documento: `users/{uid}/caderno/{id}`.

| Campo | Valor gravado pelo cliente |
| --- | --- |
| `data` | String no formato `YYYY-MM-DD`. |
| `texto` | Texto do item. |
| `concluido` | Booleano. |
| `cor` | Cor hexadecimal do marca-texto. |
| `criadoEm` | Número em milissegundos, normalmente `Date.now()`. |
| `atualizadoEm` | Número em milissegundos, `Date.now()` no salvamento. |

O ID é gerado por `crypto.randomUUID()` ou fallback de tempo/aleatoriedade e usado
como ID do documento. O cliente reconstrói `id` a partir do snapshot. As datas de
criação/atualização vêm do relógio cliente; não são timestamps de servidor.

`salvarItem()` usa `setDoc(..., { merge: true })`. `excluirItem()` usa `deleteDoc`.
Não há exclusão lógica, histórico de versões de notas, transação ou confirmação
prévia de exclusão na interface.

`iniciarSincronizacao()` lê **toda** a coleção do usuário com `onSnapshot`, ignora
documentos sem `data`, agrupa por dia e ordena por `criadoEm`. Não há paginação ou
consulta remota limitada ao dia. Antes de instalar listener e no logout, o
listener anterior é cancelado por `pararSincronizacao()`.

## Gravação, armazenamento e migração

```text
Usuário → Adicionar / Finalizar / Desmarcar → salvarItem → setDoc
Usuário → Excluir → excluirItem → deleteDoc
Firestore → onSnapshot → state.registros → renderizar → interface
```

Não há autosave por digitação, debounce ou salvamento de rascunho. As ações
gravam diretamente; a renderização dos registros é alimentada pelo listener.
Mensagens de erro são enviadas ao console e/ou ao toast conforme o fluxo.

O localStorage participa apenas da migração legada:

- Dados antigos: `meu-caderno-diario-v1`, objeto de data → lista de itens.
- Marcador: `meu-caderno-diario-migrado-firebase-v1`, valor `"1"` após conclusão
  ou quando não há objeto antigo utilizável.
- A migração grava documentos na conta autenticada com `setDoc(merge: true)`
  e aguarda `Promise.all`. IDs antigos são reaproveitados quando disponíveis.
- Os dados antigos não são apagados. O marcador é global para a origem do
  navegador, sem UID. Não há justificativa histórica registrada para essa escolha.
- Não existe configuração explícita de cache persistente offline do Firestore.
  Não interpretar a sessão persistente do Auth como backup offline das notas.
- `storageBucket` aparece na configuração, mas Firebase Storage não é importado
  nem utilizado; não há upload de arquivos.

## Editor, calendário e navegação

O “editor” atual é `input#novoItem`, com `maxlength="140"`. O valor é aparado com
`trim()`; vazio não é salvo. Botão e Enter chamam `adicionarItem()`. Depois de
salvar, o campo é limpo e recebe foco. Não há edição de texto já salvo, rich text,
Markdown, arrastar itens ou anexos.

O “calendário” é o `input type="date"` nativo. Seu evento `change` altera
`state.data` e renderiza os itens já carregados. `hojeISO()`, `isoParaData()`,
`formatarDataBR()` e `formatarDataLonga()` usam datas locais e localidade `pt-BR`.
Não existe grade mensal, eventos de agenda ou biblioteca de calendário.

## Marca-texto e aparência

Seis botões em `#markerColors` alteram `state.cor`, `state.corNome`, rótulo e
classe ativa. Ao concluir um item, sua cor passa a ser a cor selecionada; ao
desmarcar, a cor é mantida no documento, mas o destaque deixa de ser exibido.
Escolher uma cor não recolore automaticamente todos os itens existentes.

`style.css` aplica o grifo via `.note-row.done .note-text::before` e variável
`--highlight`. O visual imita papel pautado, margem e espiral, com fontes de
sistema/manuscritas e breakpoint de 720 px. Não há fonte web carregada, dark mode,
controle de tema ou media query `prefers-color-scheme`.

## PWA e ícones

Existe `meta name="theme-color"`, favicon `icone.png` e referência Apple para
`icon-192.png` (arquivo ausente). Não há manifest nem service worker registrado,
cache de aplicação, fluxo de instalação ou funcionalidade PWA implementada.
Os links de ícones aparecem depois de `</head>` no HTML recebido; sua organização
também foi preservada. Nenhuma correção de HTML faz parte de `PROMPT-0001`.

## Dependências e limites da análise

O código depende do SDK externo, da configuração remota do Firebase e de APIs
modernas do navegador. Não há bibliotecas de editor/calendário, backend próprio,
testes automatizados persistidos, lockfile ou pipeline de CI neste repositório.
Disponibilidade das URLs do SDK, regras remotas, contas e hospedagem não foram
verificadas nesta tarefa de documentação.

A memória não entra no fluxo do aplicativo: HTML/JS/CSS não carregam seus arquivos.
Checkpoints restauram código e assets versionados, não documentos do Firestore,
usuários Auth, localStorage, cache ou configurações do serviço.
