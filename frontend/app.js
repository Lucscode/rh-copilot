// ============================================
// RH COPILOT - Sistema de Gestão de RH
// ============================================

// ============================================
// CONFIGURAÇÃO E ESTADO
// ============================================

// Configuração da API - Supabase ou Backend Local
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Para usar Supabase, defina estas variáveis no Vercel:
// VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = window.ENV?.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = window.ENV?.VITE_SUPABASE_ANON_KEY || '';

// Se Supabase estiver configurado, usa Supabase, senão usa backend local
const USE_SUPABASE = SUPABASE_URL && SUPABASE_KEY;

// Se em desenvolvimento (localhost) usa /api, se em produção (Vercel) e tiver Supabase usa Supabase, senão tenta /api
let API_BASE;
if (isLocal) {
  API_BASE = '/api';
} else if (USE_SUPABASE) {
  API_BASE = `${SUPABASE_URL}/rest/v1`;
} else {
  API_BASE = '/api'; // Fallback para mesmo domínio
}

let currentUser = null;
let authToken = null;

console.log('[Config] Modo:', USE_SUPABASE ? 'Supabase' : 'Backend Local');

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('[RH Copilot] Iniciando aplicação...');
  loadAuthFromStorage();
  setupAllEventListeners();
  updateUIBasedOnAuth();
  console.log('[RH Copilot] Aplicação iniciada com sucesso!');
});

// ============================================
// GERENCIAMENTO DE AUTENTICAÇÃO
// ============================================

function saveAuthToStorage(token, user) {
  authToken = token;
  currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  localStorage.setItem('app_token', token);
  localStorage.setItem('app_user', JSON.stringify(currentUser));
}

function loadAuthFromStorage() {
  const token = localStorage.getItem('app_token');
  const user = localStorage.getItem('app_user');
  if (token && user) {
    authToken = token;
    currentUser = JSON.parse(user);
  }
}

function clearAuth() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('app_token');
  localStorage.removeItem('app_user');
}

function logout() {
  clearAuth();
  updateUIBasedOnAuth();
  showView('auth-view');
}

// ============================================
// CONFIGURAÇÃO DE EVENT LISTENERS
// ============================================

function setupAllEventListeners() {
  setupAuthListeners();
  setupNavigationListeners();
  setupPasswordToggle();
}

function setupAuthListeners() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const logoutBtn = document.getElementById('logout-btn');

  if (loginForm) loginForm.addEventListener('submit', handleLogin);
  if (registerForm) registerForm.addEventListener('submit', handleRegister);
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Tabs de login/registro
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      switchAuthTab(tab);
    });
  });
}

function setupNavigationListeners() {
  document.querySelectorAll('[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const viewName = e.target.closest('[data-view]').dataset.view;
      showView(viewName);
      
      // Atualiza navegação ativa
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
      e.target.closest('.nav-item')?.classList.add('active');
    });
  });
}

function setupPasswordToggle() {
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const wrapper = e.target.closest('.password-wrapper');
      const input = wrapper?.querySelector('input');
      if (!input) return;

      if (input.type === 'password') {
        input.type = 'text';
        e.target.textContent = 'Ocultar';
      } else {
        input.type = 'password';
        e.target.textContent = 'Mostrar';
      }
    });
  });
}

function switchAuthTab(tabName) {
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  const targetForm = document.getElementById(`${tabName}-form`);
  const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
  
  if (targetForm) targetForm.classList.add('active');
  if (targetTab) targetTab.classList.add('active');
}

// ============================================
// HANDLERS DE AUTENTICAÇÃO
// ============================================

async function handleLogin(e) {
  e.preventDefault();
  console.log('[Login] Iniciando processo de login...');
  
  const email = e.target.email.value;
  const password = e.target.password.value;
  const resultDiv = document.getElementById('login-result');

  console.log('[Login] Email:', email);

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    console.log('[Login] Response status:', response.status);
    const data = await response.json();
    console.log('[Login] Response data:', data);
    
    if (response.ok) {
      console.log('[Login] Login bem-sucedido! Salvando autenticação...');
      if (resultDiv) showSuccessMessage(resultDiv, 'Login realizado com sucesso!');
      
      // Aguarda um pouco para mostrar a mensagem de sucesso
      setTimeout(() => {
        saveAuthToStorage(data.access_token, data.user);
        console.log('[Login] Autenticação salva. Atualizando UI...');
        updateUIBasedOnAuth();
        e.target.reset();
        if (resultDiv) resultDiv.innerHTML = '';
      }, 500);
    } else {
      console.error('[Login] Erro no login:', data.detail);
      showErrorMessage(resultDiv, data.detail || 'Erro ao fazer login');
    }
  } catch (error) {
    console.error('[Login] Erro na requisição:', error);
    showErrorMessage(resultDiv, `Erro: ${error.message}`);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const name = e.target.name.value;
  const email = e.target.email.value;
  const password = e.target.password.value;
  const confirmPassword = e.target.confirm_password.value;
  const resultDiv = document.getElementById('register-result');

  // Validação de senha
  if (password !== confirmPassword) {
    showErrorMessage(resultDiv, 'As senhas não coincidem!');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role: 'funcionario' })
    });

    const data = await response.json();
    
    if (response.ok) {
      if (resultDiv) showSuccessMessage(resultDiv, 'Cadastro realizado com sucesso!');
      
      setTimeout(() => {
        saveAuthToStorage(data.access_token, data.user);
        updateUIBasedOnAuth();
        e.target.reset();
        if (resultDiv) resultDiv.innerHTML = '';
      }, 500);
    } else {
      showErrorMessage(resultDiv, data.detail || 'Erro no registro');
    }
  } catch (error) {
    showErrorMessage(resultDiv, `Erro: ${error.message}`);
  }
}

function showErrorMessage(element, message) {
  if (element) {
    element.innerHTML = `<div style="color: #ff4444; padding: 12px 16px; background: #ffe5e5; border-left: 4px solid #ff4444; border-radius: 8px; margin: 15px 0; font-weight: 500; box-shadow: 0 2px 4px rgba(255,68,68,0.1);">⚠️ ${message}</div>`;
    // Remove a mensagem após 5 segundos
    setTimeout(() => {
      if (element) element.innerHTML = '';
    }, 5000);
  }
}

function showSuccessMessage(element, message) {
  if (element) {
    element.innerHTML = `<div style="color: #00aa00; padding: 12px 16px; background: #e5ffe5; border-left: 4px solid #00aa00; border-radius: 8px; margin: 15px 0; font-weight: 500; box-shadow: 0 2px 4px rgba(0,170,0,0.1);">✓ ${message}</div>`;
    // Remove a mensagem após 3 segundos
    setTimeout(() => {
      if (element) element.innerHTML = '';
    }, 3000);
  }
}

// ================================
// 3. UI Update and Navigation
// ================================

function updateUIBasedOnAuth() {
  console.log('[UI] Atualizando UI baseado em autenticação...');
  console.log('[UI] Current User:', currentUser);
  console.log('[UI] Auth Token:', authToken ? 'presente' : 'ausente');

  const header = document.getElementById('main-header');
  const sidebar = document.getElementById('sidebar');
  const userInfo = document.getElementById('user-info');
  const authView = document.getElementById('auth-view');

  if (currentUser && authToken) {
    console.log('[UI] Usuário autenticado, mostrando interface...');
    // Usuário logado
    header?.classList.remove('hidden');
    sidebar?.classList.remove('hidden');
    userInfo?.classList.remove('hidden');
    authView?.classList.add('hidden');

    const userDisplay = document.getElementById('user-display');
    if (userDisplay) {
      userDisplay.textContent = `${currentUser.name} (${currentUser.role.toUpperCase()})`;
    }

    console.log('[UI] Mostrando navegação para role:', currentUser.role);
    showNavigationForRole(currentUser.role);
  } else {
    console.log('[UI] Usuário não autenticado, mostrando tela de login...');
    // Usuário não logado
    header?.classList.add('hidden');
    sidebar?.classList.add('hidden');
    userInfo?.classList.add('hidden');
    authView?.classList.remove('hidden');
    showView('auth-view');
  }
}

function showNavigationForRole(role) {
  console.log('[Navigation] Configurando navegação para role:', role);
  
  // Esconde todas as navegações
  document.querySelectorAll('.nav-section').forEach(section => section.classList.add('hidden'));

  // Mostra navegação apropriada e view inicial
  if (role === 'rh') {
    console.log('[Navigation] Mostrando painel RH...');
    document.getElementById('nav-rh')?.classList.remove('hidden');
    showView('rh-dashboard');
    loadRHDashboard();
  } else if (role === 'funcionario') {
    console.log('[Navigation] Mostrando painel Funcionário...');
    const navFuncionario = document.getElementById('nav-funcionario');
    console.log('[Navigation] nav-funcionario encontrado:', navFuncionario);
    navFuncionario?.classList.remove('hidden');
    showView('employee-dashboard');
    loadEmployeeDashboard();
  } else if (role === 'admin') {
    console.log('[Navigation] Mostrando painel Admin...');
    document.getElementById('nav-admin')?.classList.remove('hidden');
    showView('admin-dashboard');
  } else {
    console.log('[Navigation] Role desconhecido, usando painel RH como default...');
    // Default: RH
    document.getElementById('nav-rh')?.classList.remove('hidden');
    showView('rh-dashboard');
  }
}

function showView(viewName) {
  console.log('[showView] Mostrando view:', viewName);
  
  // Remove active de todas as views
  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  
  // Ativa a view solicitada
  const targetView = document.getElementById(viewName);
  if (targetView) {
    targetView.classList.add('active');
    loadViewData(viewName);
  } else {
    console.error('[showView] View não encontrada:', viewName);
  }
}

function loadViewData(viewName) {
  // Carrega dados específicos para cada view
  switch(viewName) {
    case 'rh-dashboard':
      loadRHDashboard();
      break;
    case 'rh-metrics':
      loadRHMetrics();
      break;
    case 'employee-dashboard':
      loadEmployeeDashboard();
      break;
    case 'employee-profile':
      loadEmployeeProfile();
      break;
    case 'employee-timesheet':
      loadEmployeeTimesheet();
      break;
    case 'employee-goals':
      loadEmployeeGoals();
      break;
    case 'employee-documents':
      loadEmployeeDocuments();
      break;
  }
}

// ============================================
// FUNÇÕES DE CARREGAMENTO DE DADOS - RH
// ============================================

async function loadRHDashboard() {
  console.log('[RH] Carregando dashboard...');
  try {
    const response = await fetch(`${API_BASE}/metrics/dashboard`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      updateRHDashboard(data);
    }
  } catch (error) {
    console.error('[RH] Erro ao carregar dashboard:', error);
  }
}

function updateRHDashboard(data) {
  const elements = {
    'dash-total-employees': data.total_employees || 0,
    'dash-total-teams': data.total_teams || 0,
    'dash-pending-os': data.pending_os || 0,
    'dash-messages-today': data.messages_today || 0
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

async function loadRHMetrics() {
  console.log('[RH] Carregando métricas...');
  try {
    const response = await fetch(`${API_BASE}/metrics/`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      updateRHMetrics(data);
    }
  } catch (error) {
    console.error('[RH] Erro ao carregar métricas:', error);
  }
}

function updateRHMetrics(data) {
  const metrics = {
    'metric-employees': data.total_employees || 0,
    'metric-teams': data.total_teams || 0,
    'metric-os-pending': data.pending_os || 0,
    'metric-requests': data.total_requests || 0
  };

  Object.entries(metrics).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });
}

// ============================================
// FUNÇÕES DE CARREGAMENTO DE DADOS - FUNCIONÁRIO
// ============================================

async function loadEmployeeDashboard() {
  console.log('[Funcionário] Carregando dashboard...');
  try {
    const response = await fetch(`${API_BASE}/employees/me/dashboard`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      updateEmployeeDashboard(data);
    }
  } catch (error) {
    console.error('[Funcionário] Erro ao carregar dashboard:', error);
    showPlaceholderData('employee');
  }
}

function updateEmployeeDashboard(data) {
  const welcomeMsg = document.querySelector('.employee-welcome-card h2');
  if (welcomeMsg && currentUser) {
    welcomeMsg.textContent = `Bem-vindo, ${currentUser.name.split(' ')[0]}! 👋`;
  }
}

async function loadEmployeeProfile() {
  console.log('[Funcionário] Carregando perfil...');
  try {
    const response = await fetch(`${API_BASE}/employees/me/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      updateEmployeeProfile(data);
    }
  } catch (error) {
    console.error('[Funcionário] Erro ao carregar perfil:', error);
  }
}

function updateEmployeeProfile(data) {
  // Atualizar campos do perfil quando o endpoint estiver implementado
  console.log('[Funcionário] Dados do perfil:', data);
}

async function loadEmployeeTimesheet() {
  console.log('[Funcionário] Carregando registro de ponto...');
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
}

function updateCurrentTime() {
  const timeElement = document.querySelector('.current-time');
  if (timeElement) {
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString('pt-BR');
  }
}

async function loadEmployeeGoals() {
  console.log('[Funcionário] Carregando metas...');
  // Implementar quando o endpoint estiver pronto
}

async function loadEmployeeDocuments() {
  console.log('[Funcionário] Carregando documentos...');
  // Implementar quando o endpoint estiver pronto
}

function showPlaceholderData(type) {
  console.log(`[${type}] Mostrando dados de exemplo`);
  // Dados de exemplo para desenvolvimento
}

// ============================================
// FUNÇÕES DE ADMIN
// ============================================

async function loadAdminDashboard() {
  console.log('[Admin] Carregando dashboard administrativo...');
  // Implementar quando necessário
}

// ============================================
// UTILITÁRIOS
// ============================================

function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
}

// ============================================
// INICIALIZAÇÃO FINAL
// ============================================

console.log('[RH Copilot] Módulo carregado com sucesso');
