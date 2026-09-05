@echo off
setlocal
title Gemini Desktop - Teste Imediato
echo ===================================================
echo   Abrindo o Gemini como Aplicativo Desktop
echo ===================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js nao foi encontrado no seu computador!
    echo Para rodar o app, instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

IF NOT EXIST .env (
    echo Criando arquivo .env...
    copy .env.example .env >nul 2>nul
)

IF NOT EXIST node_modules (
    echo [1/3] Instalando dependencias necessarias (npm install)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    )
) ELSE (
    echo [1/3] Dependencias verificadas.
)

echo.
echo [2/3] Verificando arquivos de inicializacao do aplicativo...
if not exist "dist\server.cjs" (
    echo Compilando arquivos pela primeira vez (npm run build)...
    call npm run build
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao compilar arquivos.
        pause
        exit /b 1
    )
) ELSE (
    echo Arquivos compilados prontos.
)

echo.
echo [3/3] Abrindo janela desktop do Electron...
call npx electron .
pause
