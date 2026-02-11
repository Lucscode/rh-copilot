#!/bin/bash
set -e

echo "=== RH Copilot - Deploy Automatizado ==="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paths
PROJECT_DIR="/opt/rh-copilot"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

echo -e "${YELLOW}[1/10]${NC} Atualizando sistema..."
apt update && apt install -y git nginx python3-venv python3-pip certbot python3-certbot-nginx

echo -e "${YELLOW}[2/10]${NC} Clonando repositório..."
if [ ! -d "$PROJECT_DIR" ]; then
    git clone https://github.com/Lucscode/rh-copilot.git $PROJECT_DIR
else
    cd $PROJECT_DIR && git pull origin main
fi

echo -e "${YELLOW}[3/10]${NC} Configurando backend..."
cd $BACKEND_DIR
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo -e "${YELLOW}[4/10]${NC} Criando arquivo .env..."
cat > $BACKEND_DIR/.env << 'EOF'
DATABASE_URL=postgresql+psycopg://postgres:RhcopiloT@500490!@#@db.aqelytorrnfnobolpzuz.supabase.co:5432/postgres
DATABASE_ECHO=false
DATABASE_POOL_PRE_PING=true
EOF

echo -e "${YELLOW}[5/10]${NC} Rodando migrations..."
cd $BACKEND_DIR
source .venv/bin/activate
alembic upgrade head

echo -e "${YELLOW}[6/10]${NC} Populando banco com dados demo..."
cd $PROJECT_DIR
python3 populate_demo.py || echo "Dados já existem ou erro ao popular"

echo -e "${YELLOW}[7/10]${NC} Configurando systemd..."
cp $PROJECT_DIR/deploy/rh-copilot-api.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable rh-copilot-api
systemctl restart rh-copilot-api

echo -e "${YELLOW}[8/10]${NC} Configurando frontend..."
mkdir -p /var/www/rh-copilot
cp -r $FRONTEND_DIR/* /var/www/rh-copilot/
chown -R www-data:www-data /var/www/rh-copilot

echo -e "${YELLOW}[9/10]${NC} Configurando Nginx..."
cp $PROJECT_DIR/deploy/nginx-rh-copilot.conf /etc/nginx/sites-available/rh-copilot
ln -sf /etc/nginx/sites-available/rh-copilot /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo -e "${YELLOW}[10/10]${NC} Configurando SSL..."
echo "Execute manualmente: certbot --nginx -d lamtech.org -d www.lamtech.org -d api.lamtech.org"

echo ""
echo -e "${GREEN}=== Deploy concluído! ===${NC}"
echo ""
echo "Status do backend:"
systemctl status rh-copilot-api --no-pager
echo ""
echo "Próximos passos:"
echo "1. Configure DNS: lamtech.org e api.lamtech.org -> 76.13.170.160"
echo "2. Rode SSL: certbot --nginx -d lamtech.org -d www.lamtech.org -d api.lamtech.org"
echo "3. Acesse: https://lamtech.org"
