from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import User, Job, Candidate, Application, Document, UserRole, ApplicationStatus
from app.services.ai_job_description import generate_full_job_description
from app.services.ai_resume_match import compute_match_score, summarize_candidate
from app.core.auth import hash_password

router = APIRouter()


@router.post("/")
def seed(db: Session = Depends(get_db)):
    # Check if already seeded
    existing_rh = db.query(User).filter(User.email == "rh@demo.com").first()
    if existing_rh:
        return {"status": "already_seeded"}
    
    # user RH com senha "password"
    rh = User(
        name="RH Demo",
        email="rh@demo.com",
        password_hash=hash_password("password"),
        role=UserRole.RH
    )
    db.add(rh)
    db.commit()
    db.refresh(rh)

    # job
    short = "Vaga para Backend Python com FastAPI e PostgreSQL"
    full = generate_full_job_description("Dev Backend Python", short)
    job = Job(title="Dev Backend Python", short_description=short, full_description=full, created_by=rh.id)
    db.add(job)
    db.commit()
    db.refresh(job)

    # candidates
    c1 = Candidate(
        name="João Pereira",
        email="joao@demo.com",
        resume_text="Python, FastAPI, PostgreSQL, Docker, APIs REST, testes com pytest."
    )
    c2 = Candidate(
        name="Ana Souza",
        email="ana@demo.com",
        resume_text="Java, Spring Boot, MySQL, microsserviços, mensageria, cloud."
    )
    db.add_all([c1, c2])
    db.commit()
    db.refresh(c1); db.refresh(c2)

    # applications com status
    base_text = f"{job.title}\n{job.short_description}\n{job.full_description or ''}"
    for c in [c1, c2]:
        score = compute_match_score(base_text, c.resume_text)
        summ = summarize_candidate(c.resume_text)
        app = Application(
            job_id=job.id,
            candidate_id=c.id,
            match_score=score,
            summary=summ,
            status=ApplicationStatus.APLICADO
        )
        db.add(app)
    db.commit()

    # documents
    doc = Document(
        title="Política de Férias",
        content="O colaborador tem direito a 30 dias de férias por ano, após 12 meses trabalhados."
    )
    db.add(doc)
    db.commit()

    return {"status": "seed_ok"}
