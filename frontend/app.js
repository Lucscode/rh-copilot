const apiBase = "/api";

// State management
let currentUser = null;
let authToken = null;

function $(sel){return document.querySelector(sel)}
function $all(sel){return Array.from(document.querySelectorAll(sel))}

// Escape HTML to prevent XSS
function escapeHTML(text) {
  const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Auth functions
function saveAuth(token, user) {
  authToken = token;
  currentUser = user;
  localStorage.setItem('authToken', token);
  localStorage.setItem('currentUser', JSON.stringify(user));
}

function loadAuth() {
  const token = localStorage.getItem('authToken');
  const userStr = localStorage.getItem('currentUser');
  if (token && userStr) {
    authToken = token;
    currentUser = JSON.parse(userStr);
    return true;
  }
  return false;
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  updateUI();
  showView('auth');
}

function updateUI() {
  const mainNav = $('#main-nav');
  const userInfo = $('#user-info');
  
  if (currentUser) {
    mainNav.classList.remove('hidden');
    userInfo.classList.remove('hidden');
    $('#user-name').textContent = currentUser.name;
    $('#user-role').textContent = currentUser.role;
    
    // Show/hide based on role
    const metricsLink = $('a[data-view="metrics"]');
    const createJobLink = $('a[data-view="create-job"]');
    const documentsLink = $('a[data-view="documents"]');
    const chatLink = $('a[data-view="chat"]');
    
    if (currentUser.role === 'rh') {
      metricsLink?.classList.remove('hidden');
      createJobLink?.classList.remove('hidden');
      documentsLink?.classList.remove('hidden');
      chatLink?.classList.remove('hidden');
      showView('metrics');
      loadMetrics();
    } else {
      metricsLink?.classList.add('hidden');
      createJobLink?.classList.add('hidden');
      documentsLink?.classList.add('hidden');
      chatLink?.classList.add('hidden');
      showView('dashboard');
    }
    loadJobs();
  } else {
    mainNav.classList.add('hidden');
    userInfo.classList.add('hidden');
  }
}

// Navegação simples entre views
document.querySelectorAll('nav a').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const view = a.dataset.view;
    showView(view);
    
    // Load data when switching views
    if (view === 'metrics') loadMetrics();
    if (view === 'dashboard') loadJobs();
    if (view === 'documents') loadDocuments();
  });
});

function showView(id){
  $all('.view').forEach(v=>v.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
}

// Auth tab switching
$all('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $all('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const tab = btn.dataset.tab;
    $('#login-form').classList.toggle('hidden', tab !== 'login');
    $('#register-form').classList.toggle('hidden', tab !== 'register');
  });
});

// Login
$('#login-form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const payload = Object.fromEntries(new FormData(ev.target).entries());
  
  try {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const data = await res.json();
      saveAuth(data.access_token, data.user);
      $('#login-result').innerHTML = '<div style="color:green">✅ Login realizado! Redirecionando...</div>';
      ev.target.reset();
      setTimeout(() => {
        updateUI();
      }, 500);
    } else {
      const error = await res.json();
      $('#login-result').innerHTML = `<div style="color:red">❌ ${error.detail}</div>`;
    }
  } catch (e) {
    $('#login-result').innerHTML = '<div style="color:red">❌ Erro de conexão</div>';
  }
});

// Register
$('#register-form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const payload = Object.fromEntries(new FormData(ev.target).entries());
  
  try {
    const res = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      const data = await res.json();
      saveAuth(data.access_token, data.user);
      $('#register-result').innerHTML = '<div style="color:green">✅ Conta criada! Redirecionando...</div>';
      ev.target.reset();
      setTimeout(() => {
        updateUI();
      }, 500);
    } else {
      const error = await res.json();
      $('#register-result').innerHTML = `<div style="color:red">❌ ${error.detail}</div>`;
    }
  } catch (e) {
    $('#register-result').innerHTML = '<div style="color:red">❌ Erro de conexão</div>';
  }
});

// Logout
$('#logout-btn').addEventListener('click', logout);

// Metrics (RH only)
async function loadMetrics() {
  try {
    const res = await fetch(`${apiBase}/metrics`);
    const data = await res.json();
    
    $('#metric-jobs').textContent = data.total_jobs;
    $('#metric-candidates').textContent = data.total_candidates;
    $('#metric-applications').textContent = data.total_applications;
    $('#metric-avg-score').textContent = data.avg_match_score.toFixed(1) + '%';
    
    // Status breakdown
    const statusMap = {
      'aplicado': 'Aplicado',
      'em_analise': 'Em Análise',
      'entrevista': 'Entrevista',
      'oferecido': 'Oferecido',
      'rejeitado': 'Rejeitado'
    };
    
    const html = Object.entries(data.applications_by_status).map(([status, count]) => `
      <div class="status-item">
        <strong>${count}</strong>
        <span>${statusMap[status] || status}</span>
      </div>
    `).join('');
    
    $('#status-breakdown').innerHTML = html;
  } catch (e) {
    console.error('Error loading metrics:', e);
  }
}

// Jobs with search filter
let jobSearchTimeout;
$('#job-search')?.addEventListener('input', (ev) => {
  clearTimeout(jobSearchTimeout);
  jobSearchTimeout = setTimeout(() => {
    loadJobs(ev.target.value);
  }, 300);
});

async function loadJobs(search = ''){
  let url = `${apiBase}/jobs`;
  if (search) url += `?search=${encodeURIComponent(search)}`;
  
  const res = await fetch(url);
  const jobs = await res.json();
  const el = $('#jobs-list');
  if(!jobs || jobs.length===0){ el.innerText = 'Sem vagas encontradas'; return }
  el.innerHTML = jobs.map(j=>`
    <div class="job-item" data-id="${j.id}">
      <strong>${escapeHTML(j.title)}</strong>
      <div class="muted">${escapeHTML(j.short_description || 'Sem descrição')}</div>
    </div>
  `).join('');
  
  $all('.job-item').forEach(item=>{
    item.addEventListener('click', ()=>{
      const id = item.dataset.id;
      showJobDetail(id);
    });
  });
}

$('#job-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const payload = Object.fromEntries(fd.entries());
  const res = await fetch(`${apiBase}/jobs`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data = await res.json();
  $('#job-result').innerText = data.title ? '✅ Vaga publicada: '+data.title : '❌ Erro: '+JSON.stringify(data);
  if(data.title) {
    ev.target.reset();
    loadJobs();
  }
});

// Candidates
$('#candidate-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const payload = Object.fromEntries(fd.entries());
  const res = await fetch(`${apiBase}/candidates`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data = await res.json();
  $('#candidate-result').innerText = data.name ? '✅ Candidato registrado: '+data.name : '❌ Erro: '+JSON.stringify(data);
  if(data.name) ev.target.reset();
});

// Documents
async function loadDocuments(){
  const res = await fetch(`${apiBase}/documents`);
  const docs = await res.json();
  const el = $('#documents-list');
  if(!docs || docs.length===0){ el.innerText = 'Sem documentos no momento'; return }
  el.innerHTML = docs.map(d=>`<div class="doc-item"><strong>📄 ${escapeHTML(d.title)}</strong><div class="muted">${escapeHTML(d.content)}</div></div>`).join('');
}

// Job detail + applications with status
async function showJobDetail(jobId){
  const [jr, ar] = await Promise.all([
    fetch(`${apiBase}/jobs/${jobId}`),
    fetch(`${apiBase}/applications/by-job/${jobId}`),
  ]);
  const job = await jr.json();
  const apps = await ar.json();

  showView('job-detail');
  $('#job-title').innerText = job.title || '—';
  $('#job-full').innerText = job.full_description || job.short_description || '';
  $('#apply-job-id').value = jobId;

  const el = $('#applications-list');
  if(!apps || apps.length===0){ el.innerText = 'Sem candidaturas'; }
  else{
    el.innerHTML = apps.map(a=> {
      const statusClass = `status-${a.status || 'aplicado'}`;
      const statusLabel = {
        'aplicado': 'Aplicado',
        'em_analise': 'Em Análise',
        'entrevista': 'Entrevista',
        'oferecido': 'Oferecido',
        'rejeitado': 'Rejeitado'
      }[a.status] || a.status;
      
      return `
      <div class="app-item app-clickable" data-app-id="${a.id}" data-job-id="${jobId}" data-candidate-id="${a.candidate_id}">
        <div>
          <strong>Candidato #${a.candidate_id.substring(0,8)}...</strong>
          <span class="match-score">${Math.round(a.match_score)}% match</span>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>
        <div class="muted">${escapeHTML(a.summary || 'Sem resumo')}</div>
      </div>
    `}).join('');
    
    $all('.app-clickable').forEach(item=>{
      item.addEventListener('click', ()=>{
        const appId = item.dataset.appId;
        const jobId = item.dataset.jobId;
        const candId = item.dataset.candidateId;
        showApplicationDetail(appId, jobId, candId);
      });
    });
  }
}

$('#back-to-list').addEventListener('click', ()=>{
  showView('dashboard');
  loadJobs();
});

// Application detail with status update
async function showApplicationDetail(applicationId, jobId, candidateId){
  window.currentAppId = applicationId;
  window.currentJobId = jobId;
  window.currentCandidateId = candidateId;

  showView('application-detail');

  const [candRes, appRes, interviewsRes, notesRes] = await Promise.all([
    fetch(`${apiBase}/candidates/${candidateId}`),
    fetch(`${apiBase}/applications/${applicationId}`),
    fetch(`${apiBase}/interviews?application_id=${applicationId}`),
    fetch(`${apiBase}/interview-notes?application_id=${applicationId}`)
  ]);

  const candidate = await candRes.json();
  const application = await appRes.json();
  const interviews = await interviewsRes.json();
  const notes = await notesRes.json();

  $('#app-candidate-name').textContent = escapeHTML(candidate.name || 'Nome não disponível');
  $('#app-candidate-email').textContent = escapeHTML(candidate.email || '—');
  $('#app-match-display').textContent = `${Math.round(application.match_score || 0)}% match`;
  $('#app-resume').textContent = candidate.resume_text || 'Sem currículo cadastrado';

  // Status selector (RH only)
  if (currentUser && currentUser.role === 'rh') {
    const statusSection = document.createElement('div');
    statusSection.style.cssText = 'margin-bottom:24px;padding:16px;background:#f8fafc;border-radius:8px';
    statusSection.innerHTML = `
      <h3 style="margin-top:0">⚙️ Atualizar Status</h3>
      <select id="status-selector" style="padding:8px 12px;border-radius:6px;border:2px solid #e2e8f0;font-size:14px;width:100%">
        <option value="aplicado" ${application.status === 'aplicado' ? 'selected' : ''}>Aplicado</option>
        <option value="em_analise" ${application.status === 'em_analise' ? 'selected' : ''}>Em Análise</option>
        <option value="entrevista" ${application.status === 'entrevista' ? 'selected' : ''}>Entrevista Agendada</option>
        <option value="oferecido" ${application.status === 'oferecido' ? 'selected' : ''}>Oferecido</option>
        <option value="rejeitado" ${application.status === 'rejeitado' ? 'selected' : ''}>Rejeitado</option>
      </select>
    `;
    $('#app-resume').parentElement.insertBefore(statusSection, $('#app-resume').parentElement.children[1]);
    
    $('#status-selector').addEventListener('change', async (ev) => {
      const newStatus = ev.target.value;
      try {
        const res = await fetch(`${apiBase}/applications/${applicationId}/status`, {
          method: 'PATCH',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({status: newStatus})
        });
        
        if (res.ok) {
          alert('✅ Status atualizado com sucesso!');
        } else {
          alert('❌ Erro ao atualizar status');
        }
      } catch (e) {
        alert('❌ Erro de conexão');
      }
    });
  }

  // Interviews
  const interviewsEl = $('#app-interviews-list');
  if(!interviews || interviews.length===0){
    interviewsEl.innerText = 'Sem entrevistas agendadas';
  } else {
    interviewsEl.innerHTML = interviews.map(i => `
      <div class="interview-item">
        <strong>${i.type || 'Entrevista'}</strong> - ${new Date(i.scheduled_at).toLocaleString('pt-BR')}
        <div class="muted">${escapeHTML(i.notes || 'Sem observações')}</div>
      </div>
    `).join('');
  }

  // Notes
  const notesEl = $('#app-notes-list');
  if(!notes || notes.length===0){
    notesEl.innerText = 'Sem notas';
  } else {
    notesEl.innerHTML = notes.map(n => `
      <div class="note-item">${escapeHTML(n.content)}</div>
    `).join('');
  }
}

$('#back-to-job').addEventListener('click', ()=>{
  if(window.currentJobId) showJobDetail(window.currentJobId);
  else showView('dashboard');
});

// Interview scheduling
$('#app-interview-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const payload = {
    application_id: window.currentAppId,
    interviewer_id: currentUser?.id || 'rh-user-id',
    scheduled_at: fd.get('scheduled_at'),
    type: fd.get('type'),
    notes: fd.get('notes')
  };

  const res = await fetch(`${apiBase}/interviews`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  const data = await res.json();
  $('#app-interview-result').innerText = data.id ? '✅ Entrevista agendada!' : '❌ Erro ao agendar';
  if(data.id){
    ev.target.reset();
    showApplicationDetail(window.currentAppId, window.currentJobId, window.currentCandidateId);
  }
});

// Notes
$('#app-note-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const payload = {
    application_id: window.currentAppId,
    author_id: currentUser?.id || 'rh-user-id',
    content: fd.get('content')
  };

  const res = await fetch(`${apiBase}/interview-notes`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  const data = await res.json();
  $('#app-note-result').innerText = data.id ? '✅ Nota adicionada!' : '❌ Erro';
  if(data.id){
    ev.target.reset();
    showApplicationDetail(window.currentAppId, window.currentJobId, window.currentCandidateId);
  }
});

// Tags
$('#app-add-tag-btn').addEventListener('click', async ()=>{
  const tagName = $('#app-new-tag').value.trim();
  if(!tagName) return;

  const res = await fetch(`${apiBase}/tags`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name: tagName})
  });
  const data = await res.json();
  if(data.id){
    $('#app-new-tag').value = '';
    showApplicationDetail(window.currentAppId, window.currentJobId, window.currentCandidateId);
  }
});

// CV Upload
$('#app-cv-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fileInput = $('#app-cv-file');
  const file = fileInput.files[0];
  if(!file){ $('#app-cv-result').innerText = '❌ Selecione um arquivo'; return }

  const fd = new FormData();
  fd.append('file', file);

  const res = await fetch(`${apiBase}/cv/upload/${window.currentCandidateId}`, {
    method:'POST',
    body:fd
  });
  const data = await res.json();
  $('#app-cv-result').innerText = data.filename ? '✅ CV enviado!' : '❌ Erro no upload';
  if(data.filename){
    $('#app-cv-link').innerHTML = `<a href="${apiBase}/cv/download/${window.currentCandidateId}" target="_blank">📥 Baixar CV</a>`;
  }
});

$('#apply-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const payload = Object.fromEntries(fd.entries());
  
  const candRes = await fetch(`${apiBase}/candidates`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name:payload.name,email:payload.email,resume_text:payload.resume_text})
  });
  const cand = await candRes.json();
  if(!cand.id){ $('#apply-result').innerText = '❌ Erro ao registrar candidato'; return }
  
  const appRes = await fetch(`${apiBase}/applications`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({job_id:payload.job_id,candidate_id:cand.id})
  });
  const appData = await appRes.json();
  $('#apply-result').innerText = appData.id ? '🎉 Candidatura enviada com sucesso!' : '❌ Erro ao enviar candidatura';
  if(appData.id) {
    ev.target.reset();
    setTimeout(() => showJobDetail(payload.job_id), 1000);
  }
});

$('#document-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const payload = Object.fromEntries(new FormData(ev.target).entries());
  const res = await fetch(`${apiBase}/documents`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data = await res.json();
  if(data.id) {
    ev.target.reset();
    alert('✅ Documento salvo com sucesso!');
  } else {
    alert('❌ Erro ao salvar documento');
  }
  loadDocuments();
});

// Chat
$('#chat-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const payload = Object.fromEntries(new FormData(ev.target).entries());
  const res = await fetch(`${apiBase}/chat`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const data = await res.json();
  $('#chat-answer').innerText = data.answer ? '🤖 '+data.answer : '❌ Sem resposta disponível';
  ev.target.reset();
});

// Seed
$('#seed-btn').addEventListener('click', async ()=>{
  const btn = $('#seed-btn');
  btn.disabled = true;
  btn.innerText = '⏳ Carregando...';
  try {
    await fetch(`${apiBase}/seed/`, {method:'POST'});
    await loadJobs();
    await loadDocuments();
    if (currentUser && currentUser.role === 'rh') {
      await loadMetrics();
    }
    alert('Demo carregada com sucesso!');
  } catch(e) {
    alert('Erro ao carregar demo');
  }
  btn.disabled = false;
  btn.innerText = '🌱 Popular Demo (Seed)';
});

// Inicialização
if (loadAuth()) {
  updateUI();
  if (currentUser.role === 'rh') {
    loadMetrics();
  } else {
    loadJobs();
  }
} else {
  showView('auth');
}
