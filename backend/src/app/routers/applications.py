from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Application, Job, Candidate, ApplicationStatus
from app.schemas.applications import ApplicationCreate, ApplicationOut, ApplicationUpdateStatus
from app.services.ai_resume_match import compute_match_score, summarize_candidate
from typing import Optional

router = APIRouter()

@router.get("/", response_model=list[ApplicationOut])
def list_applications(
    status: Optional[str] = Query(None, description="Filtrar por status: aplicado, em_analise, entrevista, oferecido, rejeitado"),
    min_score: Optional[float] = Query(None, description="Score mínimo de match"),
    db: Session = Depends(get_db)
):
    """Lista candidaturas com filtros opcionais"""
    query = db.query(Application)
    
    if status:
        query = query.filter(Application.status == status)
    
    if min_score is not None:
        query = query.filter(Application.match_score >= min_score)
    
    return query.order_by(Application.created_at.desc()).all()

@router.post("/", response_model=ApplicationOut)
def create_application(payload: ApplicationCreate, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == payload.job_id).first()
    cand = db.query(Candidate).filter(Candidate.id == payload.candidate_id).first()
    if not job or not cand:
        raise HTTPException(status_code=404, detail="Vaga ou candidato não encontrado")

    base_text = f"{job.title}\n{job.short_description}\n{job.full_description or ''}"
    score = compute_match_score(base_text, cand.resume_text)
    summary = summarize_candidate(cand.resume_text)

    app = Application(
        job_id=job.id,
        candidate_id=cand.id,
        match_score=score,
        summary=summary,
        status=ApplicationStatus.APLICADO
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.patch("/{application_id}/status", response_model=ApplicationOut)
def update_application_status(
    application_id: str,
    status_update: ApplicationUpdateStatus,
    db: Session = Depends(get_db)
):
    """Atualiza o status de uma candidatura (workflow: aplicado → em_analise → entrevista → oferecido/rejeitado)"""
    
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada")
    
    # Valida status
    valid_statuses = [s.value for s in ApplicationStatus]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status inválido. Use: {valid_statuses}")
    
    app.status = ApplicationStatus(status_update.status)
    db.commit()
    db.refresh(app)
    return app


@router.get("/by-job/{job_id}", response_model=list[ApplicationOut])
def list_applications_by_job(
    job_id: str,
    status: Optional[str] = Query(None, description="Filtrar por status"),
    db: Session = Depends(get_db)
):
    """Lista candidaturas de uma vaga específica com filtros opcionais"""
    query = db.query(Application).filter(Application.job_id == job_id)
    
    if status:
        query = query.filter(Application.status == status)
    
    return query.order_by(Application.match_score.desc()).all()

