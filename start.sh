#!/usr/bin/env bash

echo "==================================================="
echo "    Iniciando Gemini App no seu Computador"
echo "==================================================="
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "[ERRO] Node.js não foi encontrado no sistema!"
    echo "Instale o Node.js (versão 20 ou 22 LTS) em: https://nodejs.org/"
    exit 1
fi

if [ ! -f .env ]; then
    echo "[AVISO] Arquivo .env não encontrado."
    echo "Criando .env a partir de .env.example..."
    cp .env.example .env
    echo ""
    echo "==================================================="
    echo " ATENÇÃO: Edite o arquivo .env e cole sua GEMINI_API_KEY!"
    echo " Obtenha grátis em: https://aistudio.google.com/app/apikey"
    echo "==================================================="
    echo ""
fi

if [ ! -d "node_modules" ]; then
    echo "[1/2] Instalando dependências (npm install)..."
    npm install
else
    echo "Dependências já estão instaladas."
fi

echo ""
echo "[2/2] Iniciando servidor em http://localhost:3000..."
echo "(Pressione Ctrl+C para encerrar)"
echo ""

# Tentar abrir o navegador automaticamente
if command -v xdg-open &> /dev/null; then
    (sleep 1 && xdg-open http://localhost:3000) &
elif command -v open &> /dev/null; then
    (sleep 1 && open http://localhost:3000) &
fi

npm run dev

