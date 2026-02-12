import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.routers import users, jobs, candidates, applications, documents, chat, seed, interviews, interview_notes, tags, notifications, cv_uploads, auth, metrics, employees
from app.db.session import engine
from app.db.models import Base
from app.core.cors import setup_cors


app = FastAPI(title="RH Copilot - Sistema Inteligente de Gestão de Talentos")

# Setup CORS para demo público
setup_cors(app)


@app.get("/health")
def health():
    return {"status": "ok"}



# Cria tabelas automaticamente (MVP)
Base.metadata.create_all(bind=engine)

# Registra todos os routers ANTES de montar StaticFiles
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(employees.router, prefix="/api/employees", tags=["employees"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(jobs.router, prefix="/api/jobs", tags=["jobs"])
app.include_router(candidates.router, prefix="/api/candidates", tags=["candidates"])
app.include_router(applications.router, prefix="/api/applications", tags=["applications"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(interviews.router, prefix="/api/interviews", tags=["interviews"])
app.include_router(interview_notes.router, prefix="/api/interview-notes", tags=["interview-notes"])
app.include_router(tags.router, prefix="/api/tags", tags=["tags"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(cv_uploads.router, prefix="/api/cv", tags=["cv"])
app.include_router(seed.router, prefix="/api/seed", tags=["seed"])

# Monta frontend estático (HTML/CSS/JS) DEPOIS dos routers
# Isso garante que /api/* não seja interceptado pelo StaticFiles
import os

# Tenta múltiplos caminhos para compatibilidade local e Render
possible_frontend_paths = [
    Path(__file__).resolve().parents[2] / "frontend",  # Local: backend/src/app/main.py -> raiz
    Path(os.getcwd()) / "frontend",                     # Render: cwd é backend, mas tentamos cwd/frontend
    Path(os.getcwd()).parent / "frontend",              # Render: vai um nível acima de backend
    Path("/opt/render/project/src/frontend"),           # Render: path absoluto comum
]

frontend_path = None
for path in possible_frontend_paths:
    if path.exists() and path.is_dir():
        frontend_path = path
        print(f"[OK] Frontend encontrado em: {frontend_path}")
        break

if frontend_path:
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")
else:
    print(f"[AVISO] Frontend nao encontrado. Caminhos testados:")
    for path in possible_frontend_paths:
        print(f"   - {path} (exists: {path.exists()})")

