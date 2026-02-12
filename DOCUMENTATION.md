# 🎯 RH Copilot - Sistema de Gestão de RH

Sistema completo de gestão de recursos humanos com foco em gestão interna de funcionários, registro de ponto, metas, documentos e assistente IA.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Funcionalidades](#funcionalidades)
- [Uso](#uso)
- [API](#api)
- [Desenvolvimento](#desenvolvimento)

## 🎯 Visão Geral

O RH Copilot é uma aplicação web moderna para gestão de recursos humanos que oferece:

- **Painel RH**: Dashboard gerencial, gestão de funcionários, equipes e ordens de serviço
- **Painel Funcionário**: Dashboard pessoal, perfil, solicitações, registro de ponto, metas e chat com IA
- **Painel Admin**: Gerenciamento de usuários e configurações do sistema

### Foco do Sistema

✅ **Gestão Interna**: O sistema é focado em gerenciar funcionários internos
✅ **Auto-atendimento**: Funcionários têm acesso a suas informações e podem fazer solicitações
✅ **IA Integrada**: Chat inteligente alimentado por documentos de RH
❌ **Não é**: Sistema de recrutamento externo ou portal de vagas

## 🏗 Arquitetura

### Stack Tecnológico

**Frontend**:
- HTML5 + CSS3 + JavaScript (Vanilla)
- SPA (Single Page Application)
- localStorage para autenticação

**Backend**:
- Python 3.11+
- FastAPI
- SQLAlchemy (ORM)
- PostgreSQL
- Alembic (Migrations)
- Uvicorn (ASGI Server)

**Infraestrutura**:
- Docker (PostgreSQL)
- Docker Compose

### Fluxo de Autenticação

```
1. Usuário faz login
2. Backend valida credenciais
3. Retorna JWT token + dados do usuário
4. Frontend armazena no localStorage
5. Requisições incluem Bearer token
6. Backend valida token em rotas protegidas
```

## 🚀 Instalação

### Pré-requisitos

- Python 3.11+
- Docker & Docker Compose
- Git

### Passo a Passo

1. **Clone o repositório**
```bash
git clone <repo-url>
cd rh-copilot
```

2. **Inicie o PostgreSQL**
```bash
docker compose up -d
```

3. **Instale dependências Python**
```bash
cd backend
pip install -r requirements.txt
```

4. **Execute as migrations**
```bash
alembic upgrade head
```

5. **Inicie o servidor**
```bash
# Windows
..\run.bat

# Linux/Mac
uvicorn backend.src.app.main:app --host 0.0.0.0 --port 8000
```

6. **Acesse a aplicação**
```
http://localhost:8000
```

### Credenciais Demo

- **Email**: `rh@demo.com`
- **Senha**: `password`
- **Role**: RH

## 📁 Estrutura do Projeto

```
rh-copilot/
├── frontend/               # Frontend (SPA)
│   ├── index.html         # Página principal
│   ├── app.js             # Lógica JavaScript
│   ├── styles.css         # Estilos
│   └── README.md          # Documentação frontend
├── backend/               # Backend (FastAPI)
│   ├── src/
│   │   └── app/
│   │       ├── main.py           # Aplicação FastAPI
│   │       ├── core/             # Configurações e auth
│   │       ├── db/               # Modelos e sessão
│   │       ├── routers/          # Endpoints da API
│   │       ├── schemas/          # Schemas Pydantic
│   │       └── services/         # Lógica de negócio
│   ├── alembic/           # Migrations
│   ├── requirements.txt   # Dependências Python
│   └── tests/             # Testes
├── docker-compose.yml     # PostgreSQL
├── run.bat                # Script para iniciar (Windows)
└── README.md              # Este arquivo
```

## ✨ Funcionalidades

### 👔 Painel RH

#### Dashboard Gerencial
- Visão geral de métricas
- Total de funcionários e equipes
- OS pendentes
- Aniversariantes do mês
- Ações pendentes

#### Gestão de Funcionários
- Lista de funcionários
- Busca e filtros por departamento
- Adicionar/editar funcionários
- Visualizar histórico

#### Gestão de Equipes
- Criar e gerenciar equipes
- Atribuir membros
- Definir líderes

#### Ordens de Serviço (OS)
- Abertura de OS
- Acompanhamento de status
- Categorização (TI, Facilities, etc.)
- Estatísticas de OS

#### Documentos IA
- Upload de documentos
- Alimentar base de conhecimento da IA
- Políticas, procedimentos, manuais

### 👤 Painel Funcionário

#### Dashboard Pessoal
- Horas trabalhadas no mês
- Férias disponíveis
- Solicitações pendentes
- Progresso de metas

#### Perfil
- Informações pessoais
- Informações profissionais
- Edição de dados

#### Solicitações
- Férias
- Folgas
- Ajuste de ponto
- Reembolsos
- Acompanhamento de status

#### Registro de Ponto
- Clock in/out em tempo real
- Histórico de registros
- Resumo de horas

#### Metas & Desempenho
- Metas ativas
- Progresso visual
- Avaliações de desempenho

#### Documentos
- Holerites
- Contratos
- Comunicados
- Outros documentos

#### Chat com IA
- Assistente inteligente
- Dúvidas sobre políticas
- Informações sobre benefícios
- Procedimentos internos

### 🔧 Painel Admin

#### Dashboard Administrativo
- Estatísticas gerais
- Status do sistema

#### Gerenciar Usuários
- Lista completa de usuários
- Alterar roles
- Ativar/desativar contas

#### Configurações
- Configurações do banco
- Status da API
- Logs do sistema

## 🔌 API

### Documentação Interativa

Acesse `/docs` para ver a documentação Swagger completa.

### Principais Endpoints

#### Autenticação
```
POST /api/auth/register  # Registrar novo usuário
POST /api/auth/login     # Fazer login
```

#### Métricas (RH)
```
GET /api/metrics/          # Métricas gerais
GET /api/metrics/dashboard # Dashboard RH
```

#### Funcionários
```
GET  /api/employees/me/dashboard  # Dashboard do funcionário
GET  /api/employees/me/profile    # Perfil do funcionário
POST /api/employees/me/timesheet  # Registrar ponto
GET  /api/employees/me/documents  # Listar documentos
```

### Autenticação de Requisições

Todas as rotas protegidas requerem header de autorização:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## 👨‍💻 Desenvolvimento

### Adicionar Nova Funcionalidade

#### 1. Backend (API)

**Criar Schema (schemas/)**:
```python
from pydantic import BaseModel

class NovaFuncionalidadeSchema(BaseModel):
    campo1: str
    campo2: int
```

**Criar Router (routers/)**:
```python
from fastapi import APIRouter, Depends

router = APIRouter(prefix="/nova-funcionalidade", tags=["Nova"])

@router.get("/")
def listar():
    return {"data": []}
```

**Registrar no main.py**:
```python
from app.routers import nova_funcionalidade
app.include_router(nova_funcionalidade.router)
```

#### 2. Frontend

**HTML (index.html)**:
```html
<section id="nova-view" class="view">
  <h2>Nova Funcionalidade</h2>
  <div id="nova-content"></div>
</section>
```

**JavaScript (app.js)**:
```javascript
async function loadNovaFuncionalidade() {
  const response = await fetch(`${API_BASE}/nova-funcionalidade/`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const data = await response.json();
  updateNovaView(data);
}
```

**CSS (styles.css)**:
```css
#nova-view {
  padding: var(--spacing-lg);
}
```

### Executar Testes

```bash
cd backend
pytest
```

### Criar Migration

```bash
cd backend
alembic revision --autogenerate -m "descrição da mudança"
alembic upgrade head
```

## 🎨 Guia de Estilo

### CSS

- Use variáveis CSS para cores e espaçamentos
- Mantenha classes reutilizáveis
- Prefixe classes específicas com o contexto (ex: `employee-`, `rh-`)

### JavaScript

- Use `const` e `let` (nunca `var`)
- Funções assíncronas devem ter `async/await`
- Adicione `console.log` para debug em desenvolvimento
- Trate erros com try/catch

### Python

- Siga PEP 8
- Type hints em todas as funções
- Docstrings para funções públicas
- Separação de concerns (routers, schemas, services)

## 🐛 Troubleshooting

### Frontend não carrega

1. Verifique se o backend está rodando
2. Abra o console do navegador (F12)
3. Verifique a aba Network para erros de requisição
4. Limpe o localStorage: `localStorage.clear()`

### Erro de autenticação

1. Verifique se o token está válido
2. Tente fazer login novamente
3. Verifique o console para erros

### Banco de dados

```bash
# Resetar banco
docker compose down -v
docker compose up -d
alembic upgrade head
```

### Porta em uso

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

## 📚 Recursos Adicionais

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)

## 🤝 Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das mudanças
3. Escreva testes se aplicável
4. Abra um Pull Request

## 📝 Changelog

### Versão 2.0 (Atual)
- ✅ Removidas funcionalidades de recrutamento
- ✅ Foco em gestão interna de funcionários
- ✅ Painel de funcionário completo
- ✅ Sistema de registro de ponto
- ✅ Gestão de metas
- ✅ Chat com IA
- ✅ Código refatorado e documentado

### Versão 1.0
- Portal de recrutamento
- CV Builder
- Sistema de vagas e candidaturas

## 📄 Licença

MIT License

---

**Desenvolvido com ❤️ para gestão eficiente de RH**
