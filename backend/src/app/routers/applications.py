from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Application, Job, Candidate
from app.schemas.applications import ApplicationCreate, ApplicationOut
from app.services.ai_resume_match import compute_match_score, summarize_candidate

router = APIRouter()

@router.post("/", response_model=ApplicationOut)
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == payload.job_id).first()
    cand = db.query(Candidate).filter(Candidate.id == payload.candidate_id).first()
    if not job or not cand:
        raise HTTPException(status_code=404, detail="Vaga ou candidato não encontrado")

    base_text = f"{job.title}\n{job.short_description}\n{job.full_description or ''}"
    score = compute_match_score(base_text, cand.resume_text)
    summary = summarize_candidate(cand.resume_text)

    app = Application(job_id=job.id, candidate_id=cand.id, match_score=score, summary=summary)
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.get("/by-job/{job_id}", response_model=list[ApplicationOut])
def list_applications_by_job(job_id: str, db: Session = Depends(get_db)):
    return (
        db.query(Application)
        .filter(Application.job_id == job_id)
        .order_by(Application.match_score.desc())
        .all()
    )
