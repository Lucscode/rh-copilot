# RH Copilot - Frontend

## 📁 Estrutura do Projeto

```
frontend/
├── index.html          # Página principal (SPA)
├── app.js              # Lógica JavaScript principal
├── styles.css          # Estilos CSS
└── README.md           # Este arquivo
```

## 🎯 Arquitetura

### Single Page Application (SPA)
- **index.html**: Contém todas as "views" do sistema
- **app.js**: Gerencia navegação, autenticação e chamadas API
- **styles.css**: Estilos organizados por componente

### Estrutura de Views

#### 1. **Autenticação** (`auth-view`)
- Formulários de login e registro
- Alternância entre tabs
- Validação de senhas

#### 2. **Painel RH**
- `rh-dashboard`: Dashboard gerencial com métricas
- `rh-metrics`: Métricas detalhadas
- `rh-employees`: Gestão de funcionários
- `rh-teams`: Gestão de equipes
- `rh-service-orders`: Ordens de serviço
- `rh-feed`: Feed de atividades
- `rh-documents`: Documentos para IA

#### 3. **Painel Funcionário**
- `employee-dashboard`: Dashboard do funcionário
- `employee-profile`: Perfil pessoal e profissional
- `employee-requests`: Solicitações (férias, folgas, etc.)
- `employee-timesheet`: Registro de ponto
- `employee-goals`: Metas e desempenho
- `employee-documents`: Documentos pessoais
- `employee-chat`: Chat com IA

#### 4. **Painel Admin**
- `admin-dashboard`: Dashboard administrativo
- `admin-users`: Gerenciamento de usuários
- `admin-system`: Configurações do sistema

## 🔧 Funções Principais (app.js)

### Autenticação
```javascript
- saveAuthToStorage(token, user)  // Salvar autenticação
- loadAuthFromStorage()            // Carregar autenticação
- clearAuth()                      // Limpar autenticação
- logout()                         // Fazer logout
- handleLogin(e)                   // Processar login
- handleRegister(e)                // Processar registro
```

### Navegação
```javascript
- showView(viewName)               // Exibir view específica
- showNavigationForRole(role)      // Mostrar navegação por role
- updateUIBasedOnAuth()            // Atualizar UI conforme autenticação
```

### Carregamento de Dados
```javascript
// RH
- loadRHDashboard()                // Carregar dashboard RH
- loadRHMetrics()                  // Carregar métricas RH

// Funcionário
- loadEmployeeDashboard()          // Carregar dashboard funcionário
- loadEmployeeProfile()            // Carregar perfil
- loadEmployeeTimesheet()          // Carregar registro de ponto
- loadEmployeeGoals()              // Carregar metas
- loadEmployeeDocuments()          // Carregar documentos
```

### Event Listeners
```javascript
- setupAllEventListeners()         // Configurar todos os listeners
- setupAuthListeners()             // Listeners de autenticação
- setupNavigationListeners()       // Listeners de navegação
- setupPasswordToggle()            // Toggle de visualização de senha
```

## 🎨 Convenções de Código

### IDs e Classes
- **IDs de seções**: `{role}-{funcionalidade}` (ex: `rh-dashboard`, `employee-profile`)
- **IDs de elementos**: `{contexto}-{elemento}` (ex: `dash-total-employees`, `prof-name`)
- **Classes de navegação**: `.nav-item`, `.nav-section`
- **Classes de botões**: `.btn-primary`, `.btn-secondary`, `.btn-logout`

### Estrutura CSS
```css
/* Layout principal */
.main-header, .sidebar, .main-content

/* Cards e containers */
.dashboard-card, .metric-card, .profile-card

/* Formulários */
.auth-form, .form-grid, .form-field

/* Estados */
.active, .hidden, .disabled, .error
```

## 🔐 Segurança

1. **Tokens**: Armazenados em `localStorage`
2. **Autenticação**: Bearer token em headers
3. **Roles**: `rh`, `funcionario`, `admin`
4. **Validação**: Client-side e server-side

## 📡 API

### Base URL
```javascript
const API_BASE = isLocal ? '/api' : 'https://api.lamtech.org/api';
```

### Endpoints Principais
```
POST /api/auth/login
POST /api/auth/register
GET  /api/metrics/
GET  /api/metrics/dashboard
GET  /api/employees/me/dashboard
GET  /api/employees/me/profile
```

## 🚀 Como Usar

### Desenvolvimento Local
1. Certifique-se de que o backend está rodando
2. Abra `http://localhost:8000` no navegador
3. Use as credenciais demo: `rh@demo.com` / `password`

### Adicionar Nova View

1. **HTML**: Adicione a seção na `index.html`
```html
<section id="nova-view" class="view">
  <h2>Título da View</h2>
  <!-- Conteúdo -->
</section>
```

2. **Navegação**: Adicione link no sidebar
```html
<a href="#" data-view="nova-view" class="nav-item">📋 Nova View</a>
```

3. **JavaScript**: Adicione função de carregamento
```javascript
function loadNovaView() {
  console.log('[Nome] Carregando...');
  // Lógica de carregamento
}
```

4. **CSS**: Adicione estilos específicos
```css
#nova-view {
  /* Estilos */
}
```

## 🎯 Próximos Passos

### Funcionalidades Pendentes
- [ ] Implementar endpoints de funcionário no backend
- [ ] Adicionar gráficos interativos
- [ ] Implementar chat com IA
- [ ] Sistema de notificações em tempo real
- [ ] Upload de arquivos (documentos, fotos)
- [ ] Exportação de relatórios (PDF, Excel)

### Melhorias de UX
- [ ] Loading states
- [ ] Animações de transição
- [ ] Toast notifications
- [ ] Confirmações de ações
- [ ] Modo escuro

### Performance
- [ ] Lazy loading de views
- [ ] Cache de dados
- [ ] Otimização de imagens
- [ ] Minificação de assets

## 📝 Manutenção

### Adicionar Novo Campo
1. Atualize o HTML
2. Atualize a função de carregamento
3. Teste a funcionalidade

### Corrigir Bug
1. Identifique o problema (console.log)
2. Corrija a lógica
3. Teste em diferentes cenários
4. Verifique em diferentes navegadores

### Atualizar Estilos
1. Mantenha consistência com variáveis CSS
2. Use classes reutilizáveis
3. Teste responsividade

## 🐛 Debug

### Logs Disponíveis
```javascript
// Autenticação
console.log('[RH Copilot] Iniciando aplicação...');

// Views
console.log('[showView] Mostrando view:', viewName);

// Dados
console.log('[RH] Carregando dashboard...');
console.log('[Funcionário] Carregando perfil...');
```

### Verificar Estado
```javascript
// No console do navegador
console.log(currentUser);  // Usuário atual
console.log(authToken);    // Token de autenticação
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs no console
2. Verifique a aba Network para erros de API
3. Confirme que o backend está rodando
4. Limpe o localStorage se necessário: `localStorage.clear()`

---

**Versão**: 2.0
**Última atualização**: Fevereiro 2026
