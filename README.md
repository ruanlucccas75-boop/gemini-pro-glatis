# 🚀 Gemini 3.8 App

Aplicativo web completo baseado no Google Gemini com interface moderna, suporte aos modelos **Gemini 3.8 Flash**, **Gemini 3.8 Thinking** e **Gemini 3.1 Pro**, pesquisa na web em tempo real e processamento seguro no backend.

---

## 📋 Pré-requisitos

Para rodar no seu computador você só precisa ter:
- **Node.js** (versão 18, 20 ou superior): [Baixar Node.js](https://nodejs.org/)
- **Chave de API do Gemini** (gratuita): [Obter no Google AI Studio](https://aistudio.google.com/app/apikey)

---

## ⚡ Início Rápido (Mais Fácil)

### 🪟 No Windows:
1. Baixe ou clone o repositório no seu computador.
2. Dê dois cliques no arquivo **`start.bat`**.
3. Ele criará o arquivo `.env` e instalará tudo automaticamente.
4. Abra o arquivo `.env` criado e cole sua chave:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```
5. Acesse no navegador: **`http://localhost:3000`**

### 🍏 No Linux ou Mac:
1. Abra o terminal na pasta do projeto e execute:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```
2. Abra o `.env` e cole sua `GEMINI_API_KEY`.
3. Acesse no navegador: **`http://localhost:3000`**

---

## 💻 Passo a Passo Manual pelo Terminal

### 1. Clonar o repositório
```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
cd SEU_REPOSITORIO
```

### 2. Configurar variáveis de ambiente
Copie o arquivo de exemplo:
```bash
cp .env.example .env
```
Abra o arquivo `.env` com qualquer editor e coloque sua chave:
```env
GEMINI_API_KEY=AIzaSy...
```

### 3. Instalar as dependências
```bash
npm install
```

### 4. Iniciar em modo de desenvolvimento
```bash
npm run dev
```
Abra seu navegador em: **`http://localhost:3000`**

---

## 📦 Como rodar em Produção (Otimizado)

Para compilar e rodar a versão final de alta performance:

```bash
npm run build
npm start
```

---

## 🐳 Como rodar com Docker (Opcional)

Se você utiliza Docker:

```bash
docker compose up --build
```
Acesse: **`http://localhost:3000`**

---

## 🛠️ Comandos disponíveis no projeto

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local com recarregamento rápido |
| `npm run build` | Compila o frontend e o servidor TypeScript para a pasta `dist/` |
| `npm start` | Executa a versão compilada de produção |
| `npm run lint` | Valida tipagens e integridade do código com TypeScript |

---

## ⚙️ GitHub Actions (CI Integrado)
O projeto já conta com o fluxo de integração contínua configurado em `.github/workflows/ci.yml`. Sempre que você enviar um `git push` para o GitHub, ele testará e validará a compilação do seu aplicativo automaticamente.
