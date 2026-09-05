#!/usr/bin/env bash

echo "==================================================="
echo "    Iniciando Gemini App no seu Computador"
echo "==================================================="
echo ""

if [ ! -f .env ]; then
    echo "[AVISO] Arquivo .env não encontrado."
    echo "Criando .env a partir de .env.example..."
    cp .env.example .env
    echo ""
    echo "ATENÇÃO: Edite o arquivo .env e adicione sua GEMINI_API_KEY!"
    echo "Obtenha grátis em: https://aistudio.google.com/app/apikey"
    echo ""
fi

if [ ! -d "node_modules" ]; then
    echo "[1/2] Instalando dependências (npm install)..."
    npm install
else
    echo "Dependências já estão instaladas."
fi

echo ""
echo "[2/2] Iniciando servidor de desenvolvimento..."
echo "Acesse no seu navegador: http://localhost:3000"
echo ""

npm run dev
