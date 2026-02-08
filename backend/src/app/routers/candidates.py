from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Candidate
from app.schemas.candidates import CandidateCreate, CandidateOut

router = APIRouter()

@router.get("/", response_model=list[CandidateOut])
def list_candidates(db: Session = Depends(get_db)):
    return db.query(Candidate).all()

@router.get("/{candidate_id}", response_model=CandidateOut)
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    cand = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not cand:
        raise HTTPException(status_code=404, detail="Candidato não encontrado")
    return cand

@router.post("/", response_model=CandidateOut)
def create_candidate(payload: CandidateCreate, db: Session = Depends(get_db)):
    cand = Candidate(name=payload.name, email=payload.email, resume_text=payload.resume_text)
    db.add(cand)
    db.commit()
    db.refresh(cand)
    return cand
