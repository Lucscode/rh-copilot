// ============================================
// RH PLATFORM - Multi-Portal Navigation
// ============================================

const apiBase = '/api';

// State Management
let currentUser = null;
let authToken = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('[RH Platform] DOMContentLoaded - Inicializando...');
  loadAuth();
  setupEventListeners();
  updateUI();
  console.log('[RH Platform] Inicializado com sucesso!');
});

// ============================================
// AUTH MANAGEMENT
// ============================================

function saveAuth(token, user) {
  authToken = token;
  currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at
  };
  localStorage.setItem('app_token', token);
  localStorage.setItem('app_user', JSON.stringify(currentUser));
}

function loadAuth() {
  const token = localStorage.getItem('app_token');
  const user = localStorage.getItem('app_user');
  if (token && user) {
    authToken = token;
    currentUser = JSON.parse(user);
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('app_token');
  localStorage.removeItem('app_user');
  updateUI();
  showView('auth-view');
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
  console.log('[Setup] Configurando event listeners...');
  
  // Auth forms
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  console.log('[Setup] Login form:', loginForm);
  console.log('[Setup] Register form:', registerForm);
  
  if (loginForm) {
    console.log('[Setup] Adicionando listener ao login form');
    loginForm.addEventListener('submit', handleLogin);
  }
  if (registerForm) {
    console.log('[Setup] Adicionando listener ao register form');
    registerForm.addEventListener('submit', handleRegister);
  }

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.target.dataset.tab;
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      document.getElementById(tab + '-form').classList.add('active');
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Navigation links
  document.querySelectorAll('[data-view]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.target.dataset.view;
      showView(view);
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  // Seed button
  const seedBtn = document.getElementById('seed-btn');
  if (seedBtn) seedBtn.addEventListener('click', loadSeedData);

  // Candidate jobs search
  const searchJobs = document.getElementById('search-jobs');
  if (searchJobs) {
    searchJobs.addEventListener('input', debounce((e) => {
      loadCandidateJobs(e.target.value);
    }, 300));
  }
}

// ============================================
// AUTHENTICATION
// ============================================

async function handleLogin(e) {
  e.preventDefault();
  console.log('[Login] Tentando fazer login...');
  
  const email = e.target.email.value;
  const password = e.target.password.value;
  const result = document.getElementById('login-result');

  console.log('[Login] Email:', email);

  try {
    console.log('[Login] Enviando requisição para', `${apiBase}/auth/login`);
    const response = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    console.log('[Login] Response status:', response.status);
    const data = await response.json();
    console.log('[Login] Response data:', data);
    
    if (response.ok) {
      console.log('[Login] Sucesso! Salvando auth...');
      saveAuth(data.access_token, data.user);
      updateUI();
      showView('rh-metrics');
      e.target.reset();
      result.innerHTML = '';
    } else {
      console.log('[Login] Erro:', data.detail);
      result.innerHTML = `<div class="result-message error show">${data.detail || 'Erro ao fazer login'}</div>`;
    }
  } catch (error) {
    console.error('[Login] Erro:', error);
    result.innerHTML = `<div class="result-message error show">Erro: ${error.message}</div>`;
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = e.target.name.value;
  const email = e.target.email.value;
  const password = e.target.password.value;
  const role = e.target.role.value;
  const result = document.getElementById('register-result');

  try {
    const response = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await response.json();
    if (response.ok) {
      saveAuth(data.access_token, data.user);
      updateUI();
      showView('rh-metrics');
      e.target.reset();
      result.innerHTML = '';
    } else {
      result.innerHTML = `<div class="result-message error show">${data.detail || 'Erro no registro'}</div>`;
    }
  } catch (error) {
    result.innerHTML = `<div class="result-message error show">Erro: ${error.message}</div>`;
  }
}

// ============================================
// UI UPDATES
// ============================================

function updateUI() {
  const header = document.getElementById('main-header');
  const sidebar = document.getElementById('sidebar');
  const userInfo = document.getElementById('user-info');
  const authView = document.getElementById('auth-view');

  if (currentUser) {
    // User logged in
    header.classList.remove('hidden');
    sidebar.classList.remove('hidden');
    userInfo.classList.remove('hidden');
    authView.classList.add('hidden');

    document.getElementById('user-display').textContent = 
      `${currentUser.name} (${currentUser.role.toUpperCase()})`;

    // Show relevant navigation sections
    document.querySelectorAll('.nav-section').forEach(s => s.classList.add('hidden'));
    
    const role = currentUser.role;
    if (role === 'candidato') {
      document.getElementById('nav-candidato').classList.remove('hidden');
      showView('candidate-jobs');
    } else if (role === 'rh') {
      document.getElementById('nav-rh').classList.remove('hidden');
      showView('rh-metrics');
      loadMetrics();
    } else if (role === 'funcionario') {
      document.getElementById('nav-funcionario').classList.remove('hidden');
      showView('employee-chat');
    } else if (role === 'admin') {
      document.getElementById('nav-admin').classList.remove('hidden');
      showView('admin-dashboard');
      loadAdminDashboard();
    }
  } else {
    // User not logged in
    header.classList.add('hidden');
    sidebar.classList.add('hidden');
    userInfo.classList.add('hidden');
    authView.classList.remove('hidden');
    showView('auth-view');
  }
}

function showView(viewName) {
  console.log('[showView] Tentando mostrar:', viewName);
  document.querySelectorAll('.view').forEach(view => {
    view.classList.remove('active');
  });
  const view = document.getElementById(viewName);
  console.log('[showView] Elemento encontrado:', view);
  if (view) {
    view.classList.add('active');
    console.log('[showView] Sucesso! View:', viewName, 'está agora active');
  } else {
    console.error('[showView] Erro! View não encontrada:', viewName);
  }
}

// ============================================
// CANDIDATE PORTAL
// ============================================

async function loadCandidateJobs(search = '') {
  try {
    const url = search 
      ? `${apiBase}/jobs/?search=${encodeURIComponent(search)}`
      : `${apiBase}/jobs/`;
    
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const jobs = await response.json();
    
    const list = document.getElementById('jobs-list');
    if (jobs.length === 0) {
      list.innerHTML = '<p class="muted">Nenhuma vaga encontrada</p>';
      return;
    }

    list.innerHTML = jobs.map(job => `
      <div class="job-item" onclick="viewJobDetail('${job.id}')">
        <strong>${job.title}</strong>
        <p class="muted">${job.short_description || job.description?.substring(0, 100)}</p>
      </div>
    `).join('');
  } catch (error) {
    console.error('Erro ao carregar vagas:', error);
  }
}

// ============================================
// RH PORTAL
// ============================================

async function loadMetrics() {
  try {
    const response = await fetch(`${apiBase}/metrics/`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await response.json();

    document.getElementById('metric-jobs').textContent = data.total_jobs || 0;
    document.getElementById('metric-candidates').textContent = data.total_candidates || 0;
    document.getElementById('metric-applications').textContent = data.total_applications || 0;
    document.getElementById('metric-avg-score').textContent = 
      (data.avg_match_score || 0).toFixed(0) + '%';

    // Status chart
    const chart = document.getElementById('status-chart');
    if (data.applications_by_status) {
      chart.innerHTML = Object.entries(data.applications_by_status)
        .map(([status, count]) => `
          <div style="margin: 8px 0; padding: 8px; background: var(--bg-dark); border-radius: 4px;">
            <strong>${status.replace(/_/g, ' ')}</strong>: ${count}
          </div>
        `).join('');
    }
  } catch (error) {
    console.error('Erro ao carregar métricas:', error);
  }
}

// ============================================
// ADMIN PORTAL
// ============================================

async function loadAdminDashboard() {
  try {
    // Esta seção será expandida com endpoints de admin específicos
    document.getElementById('admin-status').textContent = '✅ Online';
  } catch (error) {
    console.error('Erro ao carregar dashboard admin:', error);
  }
}

// ============================================
// SEED DATA
// ============================================

async function loadSeedData() {
  try {
    const btn = document.getElementById('seed-btn');
    btn.disabled = true;
    btn.textContent = 'Carregando...';

    const response = await fetch(`${apiBase}/seed/`, {
      method: 'POST'
    });

    if (response.ok) {
      alert('Dados demo carregados com sucesso!');
      if (currentUser && currentUser.role === 'rh') {
        loadMetrics();
      }
    } else {
      alert('Erro ao carregar dados demo');
    }
  } catch (error) {
    alert('Erro: ' + error.message);
  } finally {
    const btn = document.getElementById('seed-btn');
    btn.disabled = false;
    btn.textContent = 'Carregar Dados Demo';
  }
}

// ============================================
// UTILITIES
// ============================================

function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Initialize on load
console.log('[RH Platform] Inicializado com sucesso');
