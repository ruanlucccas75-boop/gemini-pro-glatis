# 🚀 Gemini 3.8 App

Aplicativo web completo baseado no Google Gemini com interface moderna, suporte aos modelos **Gemini 3.8 Flash**, **Gemini 3.8 Thinking** e **Gemini 3.1 Pro**, pesquisa na web em tempo real e processamento seguro no backend.

---

## 📋 Pré-requisitos

Para rodar no seu computador você só precisa ter:
- **Node.js** (versão 20, 22 LTS ou superior): [Baixar Node.js](https://nodejs.org/)
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

## 💻 Como rodar como Aplicativo Desktop (Electron) e Gerar o .EXE

O projeto está totalmente configurado para rodar como aplicativo desktop nativo e gerar instaladores `.exe` para Windows:

### 1. Testar o aplicativo desktop no computador:
```bash
# Terminal 1: Inicia o servidor com Vite
npm run dev

# Terminal 2: Abre a janela desktop do Electron
npm run electron:dev
```

### 2. Gerar o executável (.exe) para Windows no seu computador:
Você pode simplesmente dar **dois cliques no arquivo `build-exe.bat`** na raiz do projeto, ou executar no terminal:
```bash
npm run electron:build:win
```
O instalador `.exe` (instalador NSIS e versão portátil) será gerado na pasta **`dist-electron/`**.

---

## ⚙️ GitHub Actions (Download do .EXE pelo GitHub)

Quando você envia o código para o GitHub (`git push`), a esteira do GitHub Actions agora compila o executável Windows automaticamente:
1. Vá na aba **Actions** no seu repositório do GitHub.
2. Clique na execução mais recente ("CI & Windows App Build").
3. Na seção **Artifacts**, você verá o **`Gemini-Windows-EXE-Installer`** pronto para download.

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local com recarregamento rápido (Vite + Express) |
| `npm run build` | Compila o frontend e o servidor TypeScript para a pasta `dist/` |
| `npm start` | Executa a versão compilada de produção |
| `npm run electron:dev` | Abre a janela nativa do Electron conectado ao ambiente local |
| `npm run electron:build:win` | Compila o projeto e gera os arquivos executáveis `.exe` para Windows |
| `npm run lint` | Valida tipagens e integridade do código com TypeScript |

---

## ⚙️ GitHub Actions (CI Integrado)
O projeto já conta com o fluxo de integração contínua configurado em `.github/workflows/ci.yml`. Sempre que você enviar um `git push` para o GitHub, ele testará e validará a compilação do seu aplicativo automaticamente.
