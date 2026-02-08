from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models import Job, Candidate, Application, ApplicationStatus
from pydantic import BaseModel
from typing import Dict

router = APIRouter()


class MetricsOut(BaseModel):
    total_jobs: int
    active_jobs: int
    total_candidates: int
    total_applications: int
    applications_by_status: Dict[str, int]
    avg_match_score: float


@router.get("/", response_model=MetricsOut)
def get_metrics(db: Session = Depends(get_db)):
    """Retorna métricas gerais do RH"""
    
    # Total de vagas
    total_jobs = db.query(Job).count()
    
    # Vagas com candidaturas recentes (últimos 30 dias)
    active_jobs = db.query(Job).join(Application).distinct().count()
    
    # Total de candidatos
    total_candidates = db.query(Candidate).count()
    
    # Total de candidaturas
    total_applications = db.query(Application).count()
    
    # Candidaturas por status
    applications_by_status = {}
    for status in ApplicationStatus:
        count = db.query(Application).filter(Application.status == status).count()
        applications_by_status[status.value] = count
    
    # Score médio de match
    avg_score_result = db.query(func.avg(Application.match_score)).scalar()
    avg_match_score = float(avg_score_result) if avg_score_result else 0.0
    
    return MetricsOut(
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        total_candidates=total_candidates,
        total_applications=total_applications,
        applications_by_status=applications_by_status,
        avg_match_score=round(avg_match_score, 2)
    )
