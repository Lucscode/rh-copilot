const apiBase = "/api";

function $(sel){return document.querySelector(sel)}
function $all(sel){return Array.from(document.querySelectorAll(sel))}

// Escape HTML to prevent XSS
function escapeHTML(text) {
  const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Navegação simples entre views
document.querySelectorAll('nav a').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const view = a.dataset.view;
    showView(view);
  });
});

function showView(id){
  $all('.view').forEach(v=>v.classList.add('hidden'));
  const el = document.getElementById(id);
  if(el) el.classList.remove('hidden');
}

// Jobs
async function loadJobs(){
  const res = await fetch(`${apiBase}/jobs`);
  const jobs = await res.json();
  const el = $('#jobs-list');
  if(!jobs || jobs.length===0){ el.innerText = 'Sem vagas no momento'; return }
  el.innerHTML = jobs.map(j=>`
    <div class="job-item" data-id="${j.id}">
      <strong>${escapeHTML(j.title)}</strong>
      <div class="muted">${escapeHTML(j.short_description || 'Sem descrição')}</div>
    </div>
  `).join('');
  // click handlers
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

// Job detail + applications (com cliques habilitados)
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
    el.innerHTML = apps.map(a=>`
      <div class="app-item app-clickable" data-app-id="${a.id}" data-job-id="${jobId}" data-candidate-id="${a.candidate_id}">
        <div>
          <strong>${escapeHTML(a.candidate_id || 'Candidato')}</strong>
          <div class="muted">${escapeHTML(a.summary||'Sem resumo')}</div>
        </div>
        <span class="match-score">${(a.match_score*100).toFixed(0)}% match</span>
      </div>
    `).join('');
    
    // Add click handlers to applications
    $all('.app-clickable').forEach(item => {
      item.addEventListener('click', () => {
        showApplicationDetail(item.dataset.appId, item.dataset.jobId, item.dataset.candidateId);
      });
    });
  }
}

$('#back-to-list').addEventListener('click', ()=>{ showView('dashboard'); });

// Application detail (candidato específico)
async function showApplicationDetail(appId, jobId, candidateId){
  const [notesRes, interviewsRes, candRes] = await Promise.all([
    fetch(`${apiBase}/interview-notes?application_id=${appId}`),
    fetch(`${apiBase}/interviews?application_id=${appId}`),
    fetch(`${apiBase}/candidates/${candidateId}`),
  ]);
  
  const notes = await notesRes.json();
  const interviews = await interviewsRes.json();
  const candidate = await candRes.json();
  
  showView('application-detail');
  $('#app-candidate-name').innerText = candidate.name || 'Candidato';
  $('#app-candidate-email').innerText = candidate.email || '-';
  $('#app-resume').innerText = candidate.resume_text || 'Sem currículo';
  
  // Store current app ID para os formulários usarem
  window.currentAppId = appId;
  window.currentJobId = jobId;
  window.currentCandidateId = candidateId;
  
  // Load notes
  if(!notes || notes.length===0) $('#app-notes-list').innerText = 'Sem notas';
  else $('#app-notes-list').innerHTML = notes.map(n=>`
    <div class="note-item"><strong>💬 ${escapeHTML(n.content)}</strong><div class="muted">em ${new Date(n.created_at).toLocaleDateString('pt-BR')}</div></div>
  `).join('');
  
  // Load interviews
  if(!interviews || interviews.length===0) $('#app-interviews-list').innerText = 'Sem entrevistas agendadas';
  else $('#app-interviews-list').innerHTML = interviews.map(i=>`
    <div class="interview-item">
      📅 ${new Date(i.scheduled_at).toLocaleDateString('pt-BR')} às ${new Date(i.scheduled_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
      <br><strong>${i.type === 'phone' ? '☎️ Telefone' : i.type === 'video' ? '📹 Vídeo' : '👥 Presencial'}</strong>
      <div class="muted">${escapeHTML(i.notes || 'Sem notas')}</div>
    </div>
  `).join('');
  
  // Show CV download link if available
  const cvLink = $('#app-cv-link');
  if(candidate.cv_url) {
    cvLink.innerHTML = `<a href="${apiBase}/cv/download/${candidateId}" style="color:var(--success); text-decoration:none; font-weight:600">✅ Baixar CV atual</a>`;
  } else {
    cvLink.innerHTML = '<span class="muted">Nenhum CV enviado ainda</span>';
  }
}

$('#back-to-job').addEventListener('click', ()=>{ showView('job-detail'); });

// Handler para upload de CV
$('#app-cv-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const file = $('#app-cv-file').files[0];
  if(!file) return;
  
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${apiBase}/cv/upload/${window.currentCandidateId}`, {
    method:'POST',
    body: formData
  });
  const data = await res.json();
  $('#app-cv-result').innerText = data.message ? '✅ '+data.message : '❌ Erro ao fazer upload';
  if(data.cv_url) {
    $('#app-cv-file').value = '';
    setTimeout(() => showApplicationDetail(window.currentAppId, window.currentJobId, window.currentCandidateId), 800);
  }
});

// Handler para agendar entrevista
$('#app-interview-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const payload = Object.fromEntries(fd.entries());
  
  const res = await fetch(`${apiBase}/interviews`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      application_id: window.currentAppId,
      interviewer_id: 'rh@demo.com',
      scheduled_at: payload.scheduled_at,
      type: payload.type,
      notes: payload.notes,
    })
  });
  const data = await res.json();
  $('#app-interview-result').innerText = data.id ? '✅ Entrevista agendada!' : '❌ Erro ao agendar';
  if(data.id) {
    ev.target.reset();
    setTimeout(() => showApplicationDetail(window.currentAppId, window.currentJobId, window.currentCandidateId), 800);
  }
});

// Handler para adicionar nota
$('#app-note-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const payload = Object.fromEntries(fd.entries());
  
  const res = await fetch(`${apiBase}/interview-notes`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      application_id: window.currentAppId,
      author_id: 'rh@demo.com',
      content: payload.content,
      is_internal: true,
    })
  });
  const data = await res.json();
  $('#app-note-result').innerText = data.id ? '✅ Nota adicionada!' : '❌ Erro ao adicionar nota';
  if(data.id) {
    ev.target.reset();
    setTimeout(() => showApplicationDetail(window.currentAppId, window.currentJobId, window.currentCandidateId), 800);
  }
});

// Handler para adicionar tag
$('#app-add-tag-btn').addEventListener('click', async ()=>{
  const tagName = $('#app-new-tag').value.trim();
  if(!tagName) return;
  
  const res = await fetch(`${apiBase}/tags`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({name: tagName, color: 'blue'})
  });
  const data = await res.json();
  if(data.id) {
    $('#app-new-tag').value = '';
    // Reload application detail
    showApplicationDetail(window.currentAppId, window.currentJobId, window.currentCandidateId);
  }
});

$('#apply-form').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const fd = new FormData(ev.target);
  const payload = Object.fromEntries(fd.entries());
  // Primeiro cria o candidato
  const candRes = await fetch(`${apiBase}/candidates`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:payload.name,email:payload.email,resume_text:payload.resume_text})});
  const cand = await candRes.json();
  if(!cand.id){ $('#apply-result').innerText = '❌ Erro ao registrar candidato'; return }
  // Depois cria a application
  const appRes = await fetch(`${apiBase}/applications`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({job_id:payload.job_id,candidate_id:cand.id})});
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
    await fetch(`${apiBase}/seed`, {method:'POST'});
    await loadJobs();
    await loadDocuments();
    alert('🌱 Demo carregada com sucesso!');
  } catch(e) {
    alert('❌ Erro ao carregar demo');
  }
  btn.disabled = false;
  btn.innerText = '🌱 Popular Demo (Seed)';
});

// Inicialização
showView('dashboard');
loadJobs();
loadDocuments();
