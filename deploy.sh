#!/bin/bash

# ====================================
# RH COPILOT - SCRIPT DE DEPLOY
# ====================================

echo "🚀 Iniciando deploy do RH Copilot..."
echo ""

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git não encontrado. Instale o Git primeiro."
    exit 1
fi

# Verificar se vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Inicializar git se necessário
if [ ! -d ".git" ]; then
    echo "🔧 Inicializando repositório Git..."
    git init
    git add .
    git commit -m "Deploy inicial - RH Copilot"
    echo "✅ Git inicializado!"
fi

echo ""
echo "📋 CHECKLIST DE PRÉ-DEPLOY:"
echo ""
echo "Antes de continuar, certifique-se de:"
echo "1. ✅ Ter criado um projeto no Supabase"
echo "2. ✅ Executado o script supabase-schema.sql no Supabase"
echo "3. ✅ Copiado a URL e Anon Key do Supabase"
echo ""

read -p "Você completou estes passos? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Complete os passos acima antes de continuar."
    echo "📖 Veja o guia: QUICK-START.md"
    exit 1
fi

echo ""
echo "🔑 Digite suas credenciais do Supabase:"
echo ""

read -p "Supabase URL (ex: https://xxx.supabase.co): " SUPABASE_URL
read -p "Supabase Anon Key: " SUPABASE_KEY

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "❌ URL ou Key não podem estar vazios!"
    exit 1
fi

echo ""
echo "🚀 Fazendo deploy no Vercel..."
echo ""

# Deploy no Vercel com variáveis de ambiente
vercel --prod \
    --env VITE_SUPABASE_URL="$SUPABASE_URL" \
    --env VITE_SUPABASE_ANON_KEY="$SUPABASE_KEY"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ =================================="
    echo "✅   DEPLOY CONCLUÍDO COM SUCESSO!"
    echo "✅ =================================="
    echo ""
    echo "🌐 Seu sistema está online!"
    echo "📧 Credenciais demo:"
    echo "   Email: rh@demo.com"
    echo "   Senha: password"
    echo ""
    echo "🔧 Para atualizar:"
    echo "   git add ."
    echo "   git commit -m 'Atualização'"
    echo "   vercel --prod"
    echo ""
else
    echo ""
    echo "❌ Erro no deploy!"
    echo "📖 Consulte a documentação: DEPLOY.md"
    exit 1
fi
