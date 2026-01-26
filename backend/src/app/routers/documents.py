from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Document
from app.schemas.documents import DocumentCreate, DocumentOut

router = APIRouter()

@router.get("/", response_model=list[DocumentOut])
def list_documents(db: Session = Depends(get_db)):
    return db.query(Document).order_by(Document.created_at.desc()).all()


@router.post("/", response_model=DocumentOut)
def create_document(payload: DocumentCreate, db: Session = Depends(get_db)):
    doc = Document(title=payload.title, content=payload.content)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
