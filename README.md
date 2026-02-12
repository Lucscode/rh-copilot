# 🏢 RH Copilot - Sistema Inteligente de Gestão de RH

Sistema completo de gestão de Recursos Humanos com painéis para RH e Funcionários.

## 🚀 Deploy em Produção (Vercel + Supabase)

### **Deploy Rápido (5 minutos):**
Veja o guia completo em: **[QUICK-START.md](./QUICK-START.md)**

### **Documentação Detalhada:**
Veja todas as instruções em: **[DEPLOY.md](./DEPLOY.md)**

### **Custos:**
- ✅ **$0/mês** - Totalmente gratuito (Free tier Vercel + Supabase)

---

## 💻 Desenvolvimento Local

### **Pré-requisitos:**
- Python 3.11+
- Docker (para PostgreSQL)
- Git

### **Configuração Rápida:**

```bash
# 1. Clonar repositório
git clone https://github.com/seu-usuario/rh-copilot.git
cd rh-copilot

# 2. Iniciar banco de dados PostgreSQL
docker compose up -d

# 3. Instalar dependências Python
cd backend
pip install -r requirements.txt

# 4. Criar arquivo .env
cat > .env << EOF
DATABASE_URL=postgresql+psycopg://rh:rh@localhost:5432/rh_copilot
DATABASE_ECHO=false
DATABASE_POOL_PRE_PING=true
EOF

# 5. Popular dados demo
cd ..
python populate_demo.py

# 6. Iniciar servidor
cd backend
uvicorn src.app.main:app --reload --host 0.0.0.0 --port 8000

# 7. Acessar
# Frontend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### **Credenciais Demo:**
- **RH:** rh@demo.com / password
- **Funcionário:** pedro@demo.com / password
- **Admin:** admin@demo.com / password

---

## 📦 Estrutura do Projeto

```
rh-copilot/
├── frontend/           # SPA (HTML + CSS + JS Vanilla)
│   ├── index.html
│   ├── app.js
│   └── styles.css
├── backend/            # API FastAPI + SQLAlchemy
│   ├── src/
│   │   └── app/
│   │       ├── routers/      # Endpoints REST
│   │       ├── schemas/      # Validação Pydantic
│   │       ├── services/     # Lógica de negócio
│   │       ├── db/           # Models SQLAlchemy
│   │       └── core/         # Auth, Config, CORS
│   └── tests/
├── deploy/             # Scripts de deploy
├── supabase-schema.sql # Schema para Supabase
├── populate_demo.py    # Dados demo
├── docker-compose.yml  # PostgreSQL local
├── vercel.json         # Config Vercel
├── DEPLOY.md           # Guia completo deploy
└── QUICK-START.md      # Deploy rápido

```

---

## 🛠️ Tecnologias

**Frontend:**
- HTML5 + CSS3 + JavaScript (Vanilla)
- Design responsivo
- Single Page Application (SPA)

**Backend:**
- FastAPI (Python)
- SQLAlchemy ORM
- PostgreSQL
- JWT Authentication
- Alembic (Migrations)

**Deploy:**
- Vercel (Frontend)
- Supabase (Database + Auth)

---

## 📚 Documentação

- [Guia de Deploy Completo](./DEPLOY.md)
- [Início Rápido](./QUICK-START.md)
- [API Docs](http://localhost:8000/docs) (após iniciar servidor)

---
