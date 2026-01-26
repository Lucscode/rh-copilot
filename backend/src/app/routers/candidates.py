from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Candidate
from app.schemas.candidates import CandidateCreate, CandidateOut

router = APIRouter()

@router.post("/", response_model=CandidateOut)
def create_candidate(payload: CandidateCreate, db: Session = Depends(get_db)):
    cand = Candidate(name=payload.name, email=payload.email, resume_text=payload.resume_text)
    db.add(cand)
    db.commit()
    db.refresh(cand)
    return cand
