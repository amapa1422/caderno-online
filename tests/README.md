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

PROMPT-0008 — executar a regressão existente em cada skin:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1 -Skin normal
powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1 -Skin spider
powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1 -Skin venom
powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1 -VisualThemes
```

-Skin seleciona pelo mesmo select do usuário antes da suíte de 112 verificações.
-VisualThemes cobre 50 verificações de preferência/isolamento/cores/fontes/assets,
30 combinações de tamanho/tema/skin, contraste de texto/legendas/botão nas skins,
teclado real no select, reload de cada skin, escolha inválida e armazenamento
bloqueado. Capturas de login, drawer, calendário, paleta e dialog; console/rede.
Transições finitas são finalizadas somente no teste para medições estáveis.
normal-comparison.ps1 lê index/style/app/color do CP-0013 para .artifacts/baseline,
com firebase.mock.js explicitamente copiado, e compara pixels antes/depois no
mesmo navegador em desktop/mobile, claro/escuro. Exclui somente o retângulo do
novo seletor da comparação; não restaura nem modifica arquivos de produto.
Para Edge, acrescente -BrowserPath com o caminho do msedge.exe. Safari/iOS físico
e modo Tela de Início não são emulados por Chrome/Edge. Projeto sem manifest/SW.
