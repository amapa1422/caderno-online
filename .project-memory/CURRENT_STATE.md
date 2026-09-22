# Estado atual

Atualizado em: 2026-09-22 — `PROMPT-0001` / `CHANGE-0001`.
Este arquivo descreve somente o presente. Consulte `CHANGELOG.md` para histórico.

## Projeto

**Meu Caderno / Caderno Online** é um aplicativo web estático, em português,
para listar assuntos/anotações de cada dia. Cada conta acessa seus itens no
Firestore, com atualização por listener em tempo real.

## Funcionalidades atuais

- Login por e-mail e senha com mensagens para credenciais inválidas, excesso de
  tentativas e falha de rede; logout; persistência local da sessão via Firebase Auth.
- Seleção de dia por campo nativo de data, inicialmente o dia local atual;
  apresentação da data em português e contador de itens do dia.
- Inclusão de texto pelo botão Adicionar ou Enter, com campo de até 140 caracteres.
- Concluir e desmarcar itens. A conclusão aplica a cor selecionada do marca-texto.
- Seis cores: rosa, amarelo, verde, azul, lilás e laranja.
- Exclusão imediata de itens e mensagens transitórias de sucesso/erro.
- Sincronização da coleção do usuário, agrupada por dia e ordenada por criação.
- Migração de notas legadas do localStorage para a conta autenticada.
- Layout de caderno com adaptação para telas de até 720 px, tela de login e favicon.
- Infraestrutura de memória, histórico e checkpoints Git para os agentes.

Não existem edição posterior do texto, editor rico, autosave durante digitação,
cadastro/recuperação de senha, calendário mensal próprio ou dark mode.
PWA, manifest e service worker não estão implementados. `design_system.html`
não existe nesta versão; deve ser consultado se for adicionado futuramente.

## Stack

- HTML5, CSS e JavaScript nativo, com módulos ES no navegador.
- Firebase JavaScript SDK **12.18.0**, importado de `www.gstatic.com` por URL.
- Firebase Authentication: e-mail/senha, `browserLocalPersistence`.
- Cloud Firestore: documentos de itens e `onSnapshot`.
- APIs do navegador: DOM, localStorage legado, datas, `crypto.randomUUID` com fallback.
- Git para histórico e restauração; Markdown para memória.

Não há framework, bundler, `package.json`, dependências npm, suíte de testes,
pipeline de CI ou configuração de deploy versionados.

## Arquivos principais

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Layout, login, cabeçalho, seletor de data, entrada de texto, cores e lista; carrega CSS e módulo JS. |
| `style.css` | Tema claro de papel, espiral, linhas, marca-texto, login, toasts e responsividade. |
| `app.js` | Estado, eventos, login/logout, datas/navegação diária, inclusão, conclusão, exclusão, migração e renderização. |
| `firebase.js` | Configuração cliente, inicialização do Firebase, Auth/Firestore, persistência da sessão e exports do SDK. |
| `icone.png` | Favicon referenciado pelo HTML. |
| `AGENTS.md` | Protocolo permanente de desenvolvimento e manutenção da memória. |
| `.project-memory/` | Estado, arquitetura, histórico, decisões, problemas, pedidos e checkpoints. |

Editor: somente `#novoItem` em `index.html` e `adicionarItem()` em `app.js`.
Calendário/navegação: `#dataSelecionada`, funções de data e filtro por
`state.data` em `app.js`; não há roteador ou navegação entre páginas.
Manifest/service worker: nenhum arquivo, link de manifest ou registro encontrado.
Referência visual `design_system.html`: ausente.
O HTML aponta `apple-touch-icon` para `icon-192.png`, que não está no repositório
(`ISSUE-0001`). Não confundir esse link com suporte PWA completo.

## Fluxos críticos

```text
Login → Firebase Auth → onAuthStateChanged
      → exibir caderno → migrar localStorage legado
      → onSnapshot(users/{uid}/caderno)
      → agrupar por data / ordenar criadoEm → renderizar

Adicionar / concluir / desmarcar → setDoc(merge: true)
Excluir → deleteDoc
Atualização do listener → state.registros → lista do dia

Selecionar dia → state.data → renderizar itens já carregados
Sair → signOut → cancelar listener → limpar registros → tela de login
```

A gravação ocorre nas ações explícitas, sem autosave do rascunho. O Firestore é
a fonte dos registros atuais; localStorage atende à migração antiga. Não há cache
persistente offline do Firestore configurado explicitamente no código.
As regras/permissões do serviço remoto não estão versionadas e não foram verificadas.

## Estado visual atual

Conforme HTML/CSS: tema claro em bege, papel pautado com margem avermelhada,
espiral escura à esquerda, cabeçalhos em fonte de sistema e notas com fonte
manuscrita disponível no dispositivo. Cores pastéis para marca-texto, botões
escuros e cartão de login centralizado. Desktop limitado a 1100 px; até 720 px,
layout ocupa a largura e reorganiza cabeçalho/compositor. Não houve redesign
nem homologação visual em navegador nesta tarefa.

## Última alteração realizada

`PROMPT-0001` / `CHANGE-0001`: instalação desta infraestrutura e documentação do
código recebido. Checkpoint inicial: `CP-0001`; checkpoint final: `CP-0002`.
Nenhum dos cinco arquivos do aplicativo foi alterado.

## Último checkpoint estável

- Checkpoint final da infraestrutura: **CP-0002**.
- Commit: `refs/tags/CP-0002` (resolver com `git rev-parse 'CP-0002^{commit}'`).
- Nível de validação: documentação revisada, referências Git e restauração do
  baseline verificadas; aplicativo preservado. Integração Firebase e comportamento
  completo no navegador ainda exigem teste manual.
- Baseline do aplicativo: **BASELINE-0001 / CP-0001**,
  commit **2eb960f0b473a216e82e4d242dff044ecac0e481**.
- Branch de instalação: `main`. Checkpoints locais; nenhum push/deploy nesta tarefa.
- Um commit complementar apenas de hashes/metadados pode suceder `CP-0002`;
  ele pertence à mesma tarefa e não muda o aplicativo.

Consulte `KNOWN_ISSUES.md` para os problemas preexistentes. “Estável” aqui indica
uma referência preservada e restaurável com esse nível de validação, não ausência
de defeitos conhecidos.
