@echo off
title Gemini App - Inicializador
echo ===================================================
echo     Iniciando Gemini App no seu Computador
echo ===================================================
echo.

IF NOT EXIST .env (
    echo [AVISO] Arquivo .env nao encontrado.
    echo Criando .env a partir de .env.example...
    copy .env.example .env
    echo.
    echo ATENCAO: Abra o arquivo .env e cole sua GEMINI_API_KEY!
    echo Obtenha gratis em: https://aistudio.google.com/app/apikey
    echo.
)

IF NOT EXIST node_modules (
    echo [1/2] Instalando dependencias (npm install)...
    call npm install
) ELSE (
    echo Dependencias ja estao instaladas.
)

echo.
echo [2/2] Iniciando o servidor de desenvolvimento...
echo Acesse no seu navegador: http://localhost:3000
echo.
call npm run dev
pause
