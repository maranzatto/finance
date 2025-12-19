# 💰 Pague Finanças

Um aplicativo web moderno e intuitivo para gerenciar suas contas financeiras e transações com segurança, utilizando autenticação Firebase e banco de dados em tempo real.

💻 **Teste o app online:** [https://maranzatto.github.io/finance](https://maranzatto.github.io/finance)

---

## 📋 Descrição

O **Pague Finanças** é uma aplicação completa de gestão financeira que permite:

-   ✅ Autenticação segura com Firebase
-   ✅ Criar e gerenciar múltiplas contas
-   ✅ Registrar transações (entrada e saída)
-   ✅ Visualizar histórico de movimentações
-   ✅ Acompanhar saldo em tempo real
-   ✅ Interface responsiva e amigável

---

## 🛠️ Tecnologias Utilizadas

### Frontend

-   **React 19.1.0** - Biblioteca para construção de interfaces
-   **React Router DOM 7.6.0** - Roteamento de páginas
-   **React Toastify 11.0.5** - Notificações elegantes
-   **React Icons 5.5.0** - Ícones customizáveis

### Backend & Banco de Dados

-   **Firebase 11.7.1** - Backend como serviço com:
    -   **Authentication** - Autenticação de usuários
    -   **Firestore** - Banco de dados em tempo real (NoSQL)

### Ferramentas de Desenvolvimento

-   **React Scripts 5.0.1** - Build e dev server
-   **Create React App** - Scaffolding do projeto
-   **ESLint** - Linter para qualidade de código

---

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── AccountForm.js  # Formulário para criar/editar contas
│   ├── Navbar.js       # Barra de navegação
│   └── TransactionForm.js # Formulário para transações
├── contexts/           # Context API para state management
│   ├── AuthContext.js  # Autenticação
│   └── SelectedAccountContext.js # Conta selecionada
├── pages/             # Páginas da aplicação
│   ├── LoginPage.js   # Página de login
│   ├── AccountsPage.js # Gerenciamento de contas
│   └── TransactionsPage.js # Gerenciamento de transações
├── services/          # Serviços e integrações
│   └── firestoreService.js # Operações com Firestore
├── App.js            # Componente principal
├── firebaseConfig.js # Configuração do Firebase
└── index.js          # Entrada da aplicação
```

---

## 🚀 Como Começar

### Pré-requisitos

-   Node.js 14+ instalado
-   npm ou yarn
-   Conta no [Firebase](https://firebase.google.com/)

### Instalação

1. **Clone o repositório**

    ```bash
    git clone https://github.com/maranzatto/finance.git
    cd finance
    ```

2. **Instale as dependências**

    ```bash
    npm install
    ```

3. **Configure as variáveis de ambiente**

    Crie um arquivo `.env` na raiz do projeto:

    ```env
    REACT_APP_FIREBASE_API_KEY=sua_api_key
    REACT_APP_FIREBASE_AUTH_DOMAIN=seu_auth_domain
    REACT_APP_FIREBASE_PROJECT_ID=seu_project_id
    REACT_APP_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
    REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
    REACT_APP_FIREBASE_APP_ID=seu_app_id
    ```

    > **Nota:** Obtenha essas credenciais no [Firebase Console](https://console.firebase.google.com/)

4. **Inicie o servidor de desenvolvimento**

    ```bash
    npm start
    ```

    A aplicação abrirá automaticamente em [http://localhost:3000](http://localhost:3000)

---

## 📝 Scripts Disponíveis

### Desenvolvimento

```bash
npm start
```

Inicia o servidor em modo de desenvolvimento com hot reload.

### Build

```bash
npm run build
```

Cria a versão otimizada para produção na pasta `build`.

### Testes

```bash
npm test
```

Executa os testes em modo interativo.

### Deploy

```bash
npm run deploy
```

Faz deploy automático para GitHub Pages.

---

## 🔐 Configuração do Firebase

### Criar um Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Crie um novo projeto
3. Ative **Authentication** (Email/Password)
4. Crie um banco **Firestore Database** (modo teste)
5. Copie as credenciais e adicione ao arquivo `.env`

### Estrutura do Firestore

```
users/
├── {userId}/
│   ├── accounts/
│   │   └── {accountId}/
│   │       ├── name: string
│   │       ├── balance: number
│   │       └── createdAt: timestamp
│   └── transactions/
│       └── {transactionId}/
│           ├── accountId: string
│           ├── type: "income" | "expense"
│           ├── amount: number
│           ├── description: string
│           └── date: timestamp
```

---

## 💡 Recursos Principais

### Autenticação

-   Login com email e senha
-   Registro de novos usuários
-   Logout seguro
-   Proteção de rotas privadas

### Gerenciamento de Contas

-   Criar novas contas
-   Editar informações da conta
-   Deletar contas
-   Visualizar saldo em tempo real

### Gerenciamento de Transações

-   Registrar entradas e saídas
-   Adicionar descrição às transações
-   Visualizar histórico completo
-   Filtrar por conta

### Interface

-   Design responsivo (mobile, tablet, desktop)
-   Notificações toast para feedback
-   Dark mode integrado
-   Navegação intuitiva

---

## 📦 Dependências Principais

| Pacote           | Versão | Descrição              |
| ---------------- | ------ | ---------------------- |
| react            | 19.1.0 | Framework principal    |
| firebase         | 11.7.1 | Backend e autenticação |
| react-router-dom | 7.6.0  | Roteamento             |
| react-toastify   | 11.0.5 | Notificações           |
| react-icons      | 5.5.0  | Ícones                 |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um Fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abrir um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ por [Maranzatto](https://github.com/maranzatto)

---

## 📞 Suporte

Se encontrar algum problema ou tiver dúvidas, abra uma [issue](https://github.com/maranzatto/finance/issues) no repositório.

---

## 🔗 Links Úteis

-   [Documentação do React](https://react.dev/)
-   [Firebase Documentation](https://firebase.google.com/docs)
-   [React Router Documentation](https://reactrouter.com/)
-   [Create React App Docs](https://create-react-app.dev/)
