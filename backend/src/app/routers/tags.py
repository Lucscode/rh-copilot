from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Tag
from app.schemas.tags import TagCreate, TagOut

router = APIRouter()


@router.get("/", response_model=list[TagOut])
def list_tags(db: Session = Depends(get_db)):
    return db.query(Tag).all()


@router.post("/", response_model=TagOut)
def create_tag(payload: TagCreate, db: Session = Depends(get_db)):
    # Check if tag already exists
    existing = db.query(Tag).filter(Tag.name == payload.name).first()
    if existing:
        return existing
    
    tag = Tag(name=payload.name, color=payload.color)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag
