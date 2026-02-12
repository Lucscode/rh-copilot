# ===================================
# RH COPILOT - SCRIPT DE DEPLOY (Windows)
# ===================================

Write-Host "`n🚀 Iniciando deploy do RH Copilot...`n" -ForegroundColor Cyan

# Verificar se Git está instalado
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git não encontrado. Instale o Git primeiro.`n" -ForegroundColor Red
    exit 1
}

# Verificar se Vercel CLI está instalado
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Instalando Vercel CLI...`n" -ForegroundColor Yellow
    npm install -g vercel
}

# Inicializar Git se necessário
if (!(Test-Path ".git")) {
    Write-Host "🔧 Inicializando repositório Git...`n" -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Deploy inicial - RH Copilot"
    Write-Host "✅ Git inicializado!`n" -ForegroundColor Green
}

Write-Host "📋 CHECKLIST DE PRÉ-DEPLOY:`n" -ForegroundColor Cyan
Write-Host "Antes de continuar, certifique-se de:"
Write-Host "1. ✅ Ter criado um projeto no Supabase"
Write-Host "2. ✅ Executado o script supabase-schema.sql no Supabase"
Write-Host "3. ✅ Copiado a URL e Anon Key do Supabase`n"

$confirmacao = Read-Host "Você completou estes passos? (s/n)"
if ($confirmacao -ne "s" -and $confirmacao -ne "S") {
    Write-Host "`n❌ Complete os passos acima antes de continuar." -ForegroundColor Red
    Write-Host "📖 Veja o guia: QUICK-START.md`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🔑 Digite suas credenciais do Supabase:`n" -ForegroundColor Cyan

$SUPABASE_URL = Read-Host "Supabase URL (ex: https://xxx.supabase.co)"
$SUPABASE_KEY = Read-Host "Supabase Anon Key"

if ([string]::IsNullOrWhiteSpace($SUPABASE_URL) -or [string]::IsNullOrWhiteSpace($SUPABASE_KEY)) {
    Write-Host "`n❌ URL ou Key não podem estar vazios!`n" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Fazendo deploy no Vercel...`n" -ForegroundColor Cyan

# Deploy no Vercel com variáveis de ambiente
$env:VITE_SUPABASE_URL = $SUPABASE_URL
$env:VITE_SUPABASE_ANON_KEY = $SUPABASE_KEY

vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ ==================================" -ForegroundColor Green
    Write-Host "✅   DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
    Write-Host "✅ ==================================`n" -ForegroundColor Green
    Write-Host "🌐 Seu sistema está online!" -ForegroundColor Cyan
    Write-Host "📧 Credenciais demo:"
    Write-Host "   Email: rh@demo.com"
    Write-Host "   Senha: password`n"
    Write-Host "🔧 Para atualizar:"
    Write-Host "   git add ."
    Write-Host "   git commit -m 'Atualização'"
    Write-Host "   vercel --prod`n"
} else {
    Write-Host "`n❌ Erro no deploy!" -ForegroundColor Red
    Write-Host "📖 Consulte a documentação: DEPLOY.md`n" -ForegroundColor Yellow
    exit 1
}
