import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.routers import users, jobs, candidates, applications, documents, chat, seed, interviews, interview_notes, tags, notifications, cv_uploads
from app.db.session import engine
from app.db.models import Base
from app.core.cors import setup_cors


app = FastAPI(title=settings.app_name)

# Setup CORS para demo público
setup_cors(app)


# Monta frontend estático (HTML/CSS/JS)
# Assumimos que a pasta `frontend` fica duas pastas acima deste arquivo
root_dir = Path(__file__).resolve().parents[2] / "frontend"
if root_dir.exists():
    app.mount("/", StaticFiles(directory=str(root_dir), html=True), name="frontend")


@app.get("/health")
def health():
    return {"status": "ok"}


# Cria tabelas automaticamente (MVP)
Base.metadata.create_all(bind=engine)

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

# Seed endpoint para popular demo
app.include_router(seed.router, prefix="/api/seed", tags=["seed"])
