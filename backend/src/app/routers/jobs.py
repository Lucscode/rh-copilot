from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Job
from app.schemas.jobs import JobCreate, JobOut
from app.services.ai_job_description import generate_full_job_description
from typing import Optional

router = APIRouter()

@router.get("/", response_model=list[JobOut])
def list_jobs(
    search: Optional[str] = Query(None, description="Buscar por título"),
    db: Session = Depends(get_db)
):
    """Lista vagas com busca opcional por título"""
    query = db.query(Job)
    
    if search:
        query = query.filter(Job.title.ilike(f"%{search}%"))
    
    return query.order_by(Job.created_at.desc()).all()


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: str, db: Session = Depends(get_db)):
    return db.query(Job).filter(Job.id == job_id).first()


@router.post("/", response_model=JobOut)
def create_job(payload: JobCreate, db: Session = Depends(get_db)):
    full = generate_full_job_description(payload.title, payload.short_description)
    job = Job(
        title=payload.title,
        short_description=payload.short_description,
        full_description=full,
        created_by=payload.created_by,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job
