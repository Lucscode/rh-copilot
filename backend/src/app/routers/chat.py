from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Document, ChatMessage
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.ai_chatbot import answer_from_documents

router = APIRouter()

@router.post("/", response_model=ChatResponse)
def chat(req: ChatRequest, db: Session = Depends(get_db)):
    docs = db.query(Document).all()
    pairs = [(d.title, d.content) for d in docs]
    answer = answer_from_documents(req.question, pairs)

    msg = ChatMessage(user_id=req.user_id, question=req.question, answer=answer)
    db.add(msg)
    db.commit()

    return {"answer": answer}
