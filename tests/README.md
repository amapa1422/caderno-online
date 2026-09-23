# Validação local

Requer Windows PowerShell e Chrome ou Edge instalados. Na raiz:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1
```

Usa navegador headless em perfil temporário e servidor em 127.0.0.1 em porta
livre. Substitui firebase.js pelo mock apenas no teste: não usa contas nem
Firebase remoto. Exercita os scripts reais, inclusive gravação pendente,
falhas e troca de conta. São 37 verificações funcionais, 10 de teclado/painéis,
nove larguras nos dois temas, movimento reduzido e console. A versão de
PROMPT-0004 cobre 57 verificações funcionais, 6 de reload, 11 de teclado/painéis,
mouse/toque real via CDP e viewport reduzido. Fixtures persistidas em sessionStorage
apenas pelo mock para permitir reload; não altera persistência de produção.
Relatórios e
capturas ficam em .artifacts/, ignorado pelo Git. Encerra navegador/servidor.

Inicialização com SDK real, sem login ou escrita remota:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/browser.ps1 -Live
```

Conferir login:true, picker:true, initialized:true e console sem erros. Esse modo não homologa
permissões, autenticação nem CRUD. O ambiente precisa permitir HttpListener,
processos headless e, no modo Live, acesso de rede.

Pendente manual: conta de teste real (adicionar/editar/excluir/grifar),
regras aceitando grifos/versaoGrifos, sincronização entre dispositivos, teclado
mobile físico, Safari/iOS e leitor
de tela. Não utilize documentos importantes como fixtures.
