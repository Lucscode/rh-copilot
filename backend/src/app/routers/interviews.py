from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Interview, Application
from app.schemas.interviews import InterviewCreate, InterviewUpdate, InterviewOut

router = APIRouter()


@router.post("/", response_model=InterviewOut)
def create_interview(payload: InterviewCreate, db: Session = Depends(get_db)):
    interview = Interview(
        application_id=payload.application_id,
        interviewer_id=payload.interviewer_id,
        scheduled_at=payload.scheduled_at,
        type=payload.type,
        notes=payload.notes,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.get("/", response_model=list[InterviewOut])
def list_interviews(application_id: str = Query(None), db: Session = Depends(get_db)):
    if application_id:
        return db.query(Interview).filter(Interview.application_id == application_id).all()
    return db.query(Interview).all()


@router.patch("/{interview_id}", response_model=InterviewOut)
def update_interview(interview_id: str, payload: InterviewUpdate, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        return {"error": "Interview not found"}
    
    if payload.status:
        interview.status = payload.status
    if payload.notes:
        interview.notes = payload.notes
    
    db.commit()
    db.refresh(interview)
    return interview
