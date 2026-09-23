# Validação local

Requer Windows PowerShell e Chrome ou Edge instalados. Na raiz:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1
```

Usa navegador headless em perfil temporário e servidor em 127.0.0.1 em porta
livre. Substitui firebase.js pelo mock apenas no teste: não usa contas nem
Firebase remoto. Exercita os scripts reais, inclusive gravação pendente,
falhas, troca de conta, conclusão, confirmação de exclusão e marca-texto global.

PROMPT-0005: 64 verificações funcionais, 8 de reload e 13 de teclado/mobile.
Também verifica seleção real de texto com mouse, arraste mouse/toque via CDP,
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
