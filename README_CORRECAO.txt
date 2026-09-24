CADERNO ONLINE — VERSÃO CORRIGIDA

Correções principais:
- cada login usa seu próprio caderno em users/{uid}/caderno;
- removida a exigência de custom claim cadernoMember para entrar;
- Firestore Rules isolam os usuários por UID;
- caderno@gmail.com continua sendo o único usuário com interface para criar contas;
- criação de contas usa Cloud Function protegida no backend;
- os temas e o ícone enviados foram preservados.

Para o site funcionar com as novas regras, publique firestore.rules.
Para o botão Criar conta funcionar, publique também a função Firebase.
Veja FIREBASE_SETUP.md.
