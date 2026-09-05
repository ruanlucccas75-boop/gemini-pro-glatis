@echo off
setlocal
title Compilador do Gemini .EXE
echo ===================================================
echo     Gerando o Executavel (.exe) do Gemini
echo ===================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] O Node.js nao foi encontrado no seu computador!
    echo.
    echo Para gerar o executavel, instale o Node.js em:
    echo https://nodejs.org/ (Recomendado: versao LTS)
    echo.
    pause
    exit /b 1
)

IF NOT EXIST node_modules (
    echo [1/3] Instalando dependencias necessarias (npm install)...
    call npm install
    call npm install --no-save @rollup/rollup-win32-x64-msvc @esbuild/win32-x64
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias.
        pause
        exit /b 1
    )
) ELSE (
    echo [1/3] Dependencias verificadas com sucesso.
)

echo.
echo [2/3] Compilando frontend e backend (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo [ERRO] Falha na compilacao dos arquivos web.
    pause
    exit /b 1
)

echo.
echo [3/3] Empacotando executavel Windows (.exe) com Electron...
echo Aguarde, isso pode levar de 1 a 2 minutos...
call npm run electron:build:win
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao gerar o executavel.
    pause
    exit /b 1
)

echo.
echo ===================================================
echo   SUCESSO! O executavel foi criado com sucesso!
echo ===================================================
echo.
echo Os arquivos instalador (.exe) estao na pasta: dist-electron\
echo.
if exist dist-electron (
    explorer dist-electron
)
pause
