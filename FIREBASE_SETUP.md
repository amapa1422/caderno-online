# Caderno Online — configuração corrigida

Esta versão usa **um caderno privado por login**.

## Estrutura do Firestore

```text
users/{uid}/caderno/{notaId}
```

As regras em `firestore.rules` garantem que um usuário autenticado só consiga ler e alterar o próprio UID. Não é necessário cadastrar UIDs manualmente nas regras.

## Administrador

Somente `caderno@gmail.com` exibe o botão **Criar conta**. A autorização real também é conferida pela Cloud Function `createCadernoUser`; portanto, esconder o botão não é a única proteção.

## Publicar regras e função

Na raiz do projeto:

```bash
npm install
npm --prefix functions install
npx firebase login
npx firebase use caderno-online-e5b1f
npx firebase deploy --only firestore:rules,functions:caderno
```

Depois publique os arquivos estáticos no GitHub Pages normalmente.

## Importante

- Não coloque senhas no Firestore ou no GitHub.
- Perfis `users/{uid}` podem existir ou não para usuários antigos; o caderno funciona pelo UID mesmo assim.
- A antiga coleção `workspaces/main/caderno` não é apagada, apenas fica bloqueada pelas novas regras.
- O campo simples chamado `caderno` dentro de um documento `users/{uid}` não é usado. O conteúdo real fica na **subcoleção** `caderno`.
