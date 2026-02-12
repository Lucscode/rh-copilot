# 🚀 DEPLOY - RH COPILOT

## 📦 Hospedagem: Vercel + Supabase

### ⚡ DEPLOY RÁPIDO (5 minutos)

---

## 1️⃣ **CONFIGURAR SUPABASE** (Banco de Dados)

### **Criar Projeto no Supabase:**

1. Acesse: [https://supabase.com](https://supabase.com)
2. Clique em **"Start your project"**
3. Faça login com GitHub
4. Clique em **"New Project"**
5. Preencha:
   - **Name:** rh-copilot
   - **Database Password:** (escolha uma senha forte e GUARDE)
   - **Region:** South America (São Paulo)
6. Clique em **"Create new project"** (aguarde ~2 minutos)

### **Configurar Tabelas:**

No painel do Supabase:

1. Vá em **"SQL Editor"** (menu lateral)
2. Clique em **"New query"**
3. Cole o SQL abaixo e clique em **"Run"**:

```sql
-- Criar tabela de usuários
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('candidato', 'rh', 'funcionario', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de vagas
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  short_description TEXT NOT NULL,
  full_description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de candidatos
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  resume_text TEXT NOT NULL,
  cv_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de aplicações
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'aplicado' CHECK (status IN ('aplicado', 'em_analise', 'entrevista', 'oferecido', 'rejeitado')),
  match_score REAL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_candidate ON applications(candidate_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir tudo por enquanto - ajuste depois para produção)
CREATE POLICY "Allow all users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all jobs" ON jobs FOR ALL USING (true);
CREATE POLICY "Allow all candidates" ON candidates FOR ALL USING (true);
CREATE POLICY "Allow all applications" ON applications FOR ALL USING (true);
```

### **Obter Credenciais:**

1. No Supabase, vá em **"Settings"** > **"API"**
2. Copie e guarde:
   - **Project URL** (exemplo: `https://xxxxx.supabase.co`)
   - **anon public** key (a chave grande, começa com `eyJ...`)

---

## 2️⃣ **DEPLOY NO VERCEL** (Frontend)

### **Via GitHub (Recomendado):**

1. **Criar repositório no GitHub:**
   ```bash
   cd c:\Users\Lucas\Desktop\rh-copilot\rh-copilot
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/rh-copilot.git
   git push -u origin main
   ```

2. **Deploy no Vercel:**
   - Acesse: [https://vercel.com](https://vercel.com)
   - Faça login com GitHub
   - Clique em **"Add New Project"**
   - Selecione o repositório **rh-copilot**
   - Configure:
     - **Framework Preset:** Other
     - **Root Directory:** `./` (deixe padrão)
   - Clique em **"Deploy"**

3. **Adicionar variáveis de ambiente:**
   - No painel do Vercel, vá em **"Settings"** > **"Environment Variables"**
   - Adicione:
     ```
     VITE_SUPABASE_URL = sua_project_url_do_supabase
     VITE_SUPABASE_ANON_KEY = sua_anon_key_do_supabase
     ```
   - Clique em **"Save"**
   - Vá em **"Deployments"** > clique nos 3 pontinhos do último deploy > **"Redeploy"**

### **Via CLI da Vercel:**

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
cd c:\Users\Lucas\Desktop\rh-copilot\rh-copilot
vercel

# Seguir instruções no terminal
# Quando perguntar sobre variáveis de ambiente, adicione:
# VITE_SUPABASE_URL
# VITE_SUPABASE_ANON_KEY
```

---

## 3️⃣ **POPULAR DADOS DEMO** (Opcional)

### **Via Supabase Dashboard:**

1. No Supabase, vá em **"Table Editor"**
2. Selecione a tabela **users**
3. Clique em **"Insert row"**
4. Adicione usuários demo (use bcrypt para hash de senha ou use SQL):

```sql
-- Inserir usuário RH demo (senha: password)
INSERT INTO users (name, email, password_hash, role) VALUES 
('RH Demo', 'rh@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7ELPBTXPGO', 'rh'),
('Pedro Funcionário', 'pedro@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7ELPBTXPGO', 'funcionario'),
('Admin Sistema', 'admin@demo.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7ELPBTXPGO', 'admin');
```

---

## 4️⃣ **TESTAR O DEPLOY**

1. Acesse a URL do Vercel (algo como `https://rh-copilot.vercel.app`)
2. Faça login com:
   - Email: `rh@demo.com`
   - Senha: `password`
3. ✅ Deve funcionar!

---

## 🔧 **COMANDOS ÚTEIS**

```bash
# Atualizar deploy após mudanças
git add .
git commit -m "Atualização"
git push origin main
# Vercel faz deploy automaticamente!

# Ver logs da aplicação
vercel logs

# Ver domínios configurados
vercel domains ls
```

---

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **Erro 404 no Vercel:**
- Verifique se `vercel.json` está na raiz do projeto
- Confirme que os arquivos do frontend estão em `/frontend`

### **Erro de conexão com Supabase:**
- Verifique se as variáveis de ambiente estão corretas
- Confirme que as políticas RLS estão configuradas

### **Login não funciona:**
- Verifique se os usuários foram criados no Supabase
- Confirme que o hash da senha está correto

---

## 📊 **CUSTOS**

- **Vercel:** $0/mês (Free tier - 100GB bandwidth)
- **Supabase:** $0/mês (Free tier - 500MB DB, 2GB bandwidth)
- **Total:** **$0/mês** 🎉

---

## 🔒 **SEGURANÇA (Produção)**

Antes de usar em produção, ajuste:

1. **Supabase RLS:** Configure políticas restritivas
2. **CORS:** Limite origins permitidas
3. **Senhas:** Use hash bcrypt forte
4. **Secrets:** Nunca commite `.env` no Git

---

## 📚 **DOCUMENTAÇÃO**

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## ✅ **CHECKLIST DE DEPLOY**

- [ ] Criar projeto no Supabase
- [ ] Executar SQL para criar tabelas
- [ ] Copiar credenciais do Supabase
- [ ] Criar repositório no GitHub
- [ ] Fazer push do código
- [ ] Conectar repositório no Vercel
- [ ] Adicionar variáveis de ambiente
- [ ] Fazer deploy
- [ ] Popular dados demo
- [ ] Testar login

---

**🎉 Pronto! Seu projeto está no ar!**
