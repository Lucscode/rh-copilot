from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import InterviewNote
from app.schemas.interview_notes import InterviewNoteCreate, InterviewNoteOut

router = APIRouter()


@router.post("/", response_model=InterviewNoteOut)
def create_note(payload: InterviewNoteCreate, db: Session = Depends(get_db)):
    note = InterviewNote(
        application_id=payload.application_id,
        author_id=payload.author_id,
        content=payload.content,
        is_internal=payload.is_internal,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/", response_model=list[InterviewNoteOut])
def list_notes(application_id: str = Query(None), db: Session = Depends(get_db)):
    if application_id:
        return db.query(InterviewNote).filter(InterviewNote.application_id == application_id).order_by(InterviewNote.created_at.desc()).all()
    return db.query(InterviewNote).order_by(InterviewNote.created_at.desc()).all()

