# Validação local

Requer Windows PowerShell e Chrome ou Edge instalados. Na raiz:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1
```

Usa navegador headless em perfil temporário e servidor em 127.0.0.1 em porta
livre. Substitui firebase.js pelo mock apenas no teste: não usa contas nem
Firebase remoto. Exercita os scripts reais, inclusive gravação pendente,
falhas, troca de conta, conclusão, confirmação de exclusão e marca-texto global.

PROMPT-0006: 75 verificações funcionais, 21 em dois reloads e 16 de teclado/mobile.
Cobre nota inteira por ID, textos iguais independentes, controles fora do grifo,
edição com acréscimos, aplicar/remover em falhas, retry e animações de grifo.
Primeiro reload conserva cores distintas; remove uma nota e recarrega novamente
para confirmar a remoção persistida, mantendo cores das demais e cor global.
Também verifica clique real ignorando seleção parcial, arraste mouse/toque via CDP,
nove larguras nos dois temas, viewport reduzido, fonte renderizada, movimento
reduzido e console. Fixtures persistem em sessionStorage apenas pelo mock para
permitir reload; não altera persistência de produção. Relatórios e capturas
ficam em .artifacts/, ignorado pelo Git. Encerra navegador e servidor.

Inicialização com SDK real, sem login ou escrita remota:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1 -Live
```

Conferir login:true, picker:true, initialized:true e console sem erros. Esse
modo não homologa permissões, autenticação nem CRUD. O ambiente precisa permitir
HttpListener, processos headless e, no modo Live, acesso de rede.

Pendente manual: conta de teste real (CRUD, concluir/desfazer e grifar), regras
aceitando grifos/versaoGrifos, sincronização entre dispositivos, teclado físico
mobile, Safari/iOS, fontes em outros sistemas e leitor de tela. Não utilize
documentos importantes como fixtures.

PROMPT-0009 — suite recuperada do historico e adaptada a base b57aa73:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1 -Skin bolsonaro
powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1 -VisualThemes -BrowserPath "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
```

-Skin aceita normal, spider, venom, espetacular, santos, flamengo, sao-paulo e
bolsonaro e seleciona pelo mesmo select antes dos 112 checks de regressao.
-VisualThemes cobre 129 checks, 80 combinacoes (5 telas x 2 modos x 8 skins),
contraste de texto/legenda/botao e navegacao dos novos temas, teclado no select,
reload das oito skins, valor invalido, storage bloqueado, HTTP/decodificacao dos
fundos, preservacao de dados/editor/tinta/fontes e animacao Brasil/reduced-motion.
A leitura fetch dos assets consome o corpo antes de decodificar para nao bloquear
o servidor de teste sequencial com PNGs grandes. Flags do navegador desativam
throttling de abas headless. Ultimo comando CDP e progresso ficam em artefatos.
normal-comparison.ps1 exporta arquivos de CP-0015 (incluindo accounts e temas)
para .artifacts/baseline, usa mock explicito e compara Normal antes/depois em
1440x900 e 390x844, claro/escuro. Nao restaura arquivos ativos. Imagens e resultados
sao ignorados. As quatro comparacoes executadas tiveram zero pixels diferentes.
Mock inclui stub createCadernoUser (sem chamadas remotas). Teste de importacao
foi atualizado para verificar a ausencia de importacao automatica de notas
anonimas, comportamento recebido em b57aa73; fixtures legadas sao semeadas
explicitamente no backend simulado. Testes nao exercitam criacao real de contas.

Transicoes finitas sao finalizadas apenas no teste para medicoes estaveis.
Chrome/Edge headless nao homologam Safari/iOS fisico, leitores de tela, teclado
fisico mobile ou Firebase real. Nao ha manifest/SW no projeto.
