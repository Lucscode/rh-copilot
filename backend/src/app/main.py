from fastapi import FastAPI
from app.core.config import settings
from app.routers import users, jobs, candidates, applications, documents, chat, seed
from app.db.session import engine
from app.db.models import Base
from app.core.cors import setup_cors


app = FastAPI(title=settings.app_name)

# Setup CORS para demo público
setup_cors(app)


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

# Seed endpoint para popular demo
app.include_router(seed.router, prefix="/api/seed", tags=["seed"])
