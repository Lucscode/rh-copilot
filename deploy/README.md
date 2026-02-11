# Deploy RH Copilot - VPS

## Pré-requisitos

1. **DNS configurado na Hostinger:**
   - Tipo A: `@` (ou `lamtech.org`) → `76.13.170.160`
   - Tipo A: `api` → `76.13.170.160`

2. **Acesso SSH à VPS:**
   ```bash
   ssh root@76.13.170.160
   ```

## Deploy Automatizado

Execute este comando único na VPS:

```bash
curl -fsSL https://raw.githubusercontent.com/Lucscode/rh-copilot/main/deploy/deploy.sh | bash
```

Ou clone e execute manualmente:

```bash
cd /root
git clone https://github.com/Lucscode/rh-copilot.git
cd rh-copilot/deploy
chmod +x deploy.sh
./deploy.sh
```

## Após o Deploy

1. **Configure SSL (Let's Encrypt):**
   ```bash
   certbot --nginx -d lamtech.org -d www.lamtech.org -d api.lamtech.org
   ```

2. **Verifique os serviços:**
   ```bash
   # Backend
   systemctl status rh-copilot-api
   
   # Nginx
   systemctl status nginx
   ```

3. **Logs em caso de erro:**
   ```bash
   # Backend
   journalctl -u rh-copilot-api -f
   
   # Nginx
   tail -f /var/log/nginx/error.log
   ```

## URLs Finais

- **App:** https://lamtech.org
- **API:** https://api.lamtech.org
- **Docs API:** https://api.lamtech.org/docs

## Credenciais Demo

- **RH:** rh@demo.com / password
- **Candidato:** joao@demo.com / password
- **Funcionário:** pedro@demo.com / password
- **Admin:** admin@demo.com / password

## Atualizar Deploy

```bash
cd /opt/rh-copilot
git pull origin main
systemctl restart rh-copilot-api
cp -r frontend/* /var/www/rh-copilot/
```

## Troubleshooting

### Backend não inicia
```bash
# Ver logs
journalctl -u rh-copilot-api -n 50

# Testar manualmente
cd /opt/rh-copilot/backend
source .venv/bin/activate
python -m uvicorn backend.src.app.main:app --host 127.0.0.1 --port 8000
```

### Erro de conexão ao banco
```bash
# Verificar .env
cat /opt/rh-copilot/backend/.env

# Testar conexão
cd /opt/rh-copilot/backend
source .venv/bin/activate
python -c "from app.db.session import engine; print(engine.connect())"
```

### Frontend não carrega
```bash
# Verificar permissões
ls -la /var/www/rh-copilot/

# Recarregar nginx
nginx -t && systemctl reload nginx
```
