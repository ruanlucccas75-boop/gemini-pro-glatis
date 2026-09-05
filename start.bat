@echo off
setlocal
title Gemini App - Inicializador
echo ===================================================
echo     Iniciando Gemini App no seu Computador
echo ===================================================
echo.

:: Verificar se o Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js nao foi encontrado no seu computador!
    echo.
    echo Para rodar o app, instale o Node.js baixando em:
    echo https://nodejs.org/ (Recomendado: versao LTS)
    echo.
    echo Pressione qualquer tecla para abrir o site do Node.js no seu navegador...
    pause >nul
    start https://nodejs.org/
    exit /b 1
)

:: Verificar arquivo .env
IF NOT EXIST .env (
    echo [AVISO] Arquivo .env nao encontrado.
    echo Criando .env a partir de .env.example...
    copy .env.example .env
    echo.
    echo ===================================================
    echo  ATENCAO: Configure sua chave no arquivo .env
    echo  Cole sua GEMINI_API_KEY no arquivo .env
    echo  Obtenha gratuitamente em: https://aistudio.google.com/app/apikey
    echo ===================================================
    echo.
)

:: Verificar dependencias
IF NOT EXIST node_modules (
    echo [1/2] Instalando dependencias do projeto (npm install)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias. Verifique sua conexao com a internet.
        pause
        exit /b 1
    )
) ELSE (
    echo Dependencias ja estao instaladas.
)

echo.
echo [2/2] Iniciando o servidor...
echo O aplicativo abrira automaticamente em: http://localhost:3000
echo (Pressione Ctrl+C para encerrar quando quiser)
echo.

:: Abrir navegador automaticamente
start http://localhost:3000

:: Iniciar servidor
call npm run dev
pause

