# 🚀 INÍCIO RÁPIDO - Deploy em 5 Minutos

## ⚡ **PASSO A PASSO SUPER RÁPIDO**

### **1. Criar Conta no Supabase (2 min)**
1. Acesse: https://supabase.com
2. Login com GitHub
3. **New Project** → Nome: `rh-copilot` → Senha: (escolha uma) → **Create**
4. Aguarde 2 minutos ⏳

### **2. Criar Tabelas (1 min)**
1. No Supabase → **SQL Editor** → **New query**
2. Copie TODO o conteúdo do arquivo `supabase-schema.sql` deste projeto
3. Cole no editor e clique **RUN** ▶️
4. ✅ Tabelas criadas!

### **3. Pegar Credenciais (30 seg)**
No Supabase → **Settings** → **API**:
- Copie **Project URL** (ex: `https://abc123.supabase.co`)
- Copie **anon public** key (chave grande)

### **4. Deploy no Vercel (1 min)**

#### **Opção A: Via GitHub (Recomendado)**
```bash
# No terminal do projeto:
git init
git add .
git commit -m "Deploy inicial"
gh repo create rh-copilot --public --source=. --push
```

- Vá em https://vercel.com
- **New Project** → Selecione `rh-copilot` → **Import**
- **Settings** → **Environment Variables** → Adicione:
  ```
  VITE_SUPABASE_URL = (cole a URL do Supabase)
  VITE_SUPABASE_ANON_KEY = (cole a key do Supabase)
  ```
- **Deployments** → **Redeploy**

#### **Opção B: Via CLI** 
```bash
npm install -g vercel
vercel
# Siga instruções e adicione as variáveis quando solicitado
```

### **5. Testar (30 seg)**
1. Acesse a URL do Vercel (ex: `https://rh-copilot.vercel.app`)
2. Login com:
   - **Email:** rh@demo.com
   - **Senha:** password
3. 🎉 **FUNCIONANDO!**

---

## 📋 **CHECKLIST RÁPIDO**

- [ ] Criar projeto no Supabase
- [ ] Executar `supabase-schema.sql`
- [ ] Copiar URL e Key do Supabase
- [ ] Fazer deploy no Vercel
- [ ] Adicionar variáveis de ambiente
- [ ] Testar o sistema

---

## 🆘 **PROBLEMAS?**

**Erro 404:** Verifique se `vercel.json` existe na raiz
**Login não funciona:** Verifique se executou o SQL de criação de usuários
**Página em branco:** Confira as variáveis de ambiente no Vercel

Precisa de mais ajuda? Veja o guia completo em [DEPLOY.md](./DEPLOY.md)

---

## 💰 **CUSTOS**
**$0/mês** - Tudo gratuito! 🎉
