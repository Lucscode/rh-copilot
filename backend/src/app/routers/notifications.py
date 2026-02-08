from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models import Notification
from app.schemas.notifications import NotificationCreate, NotificationOut

router = APIRouter()


@router.get("/user/{user_id}", response_model=list[NotificationOut])
def list_notifications(user_id: str, db: Session = Depends(get_db)):
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()


@router.post("/", response_model=NotificationOut)
def create_notification(payload: NotificationCreate, db: Session = Depends(get_db)):
    notification = Notification(
        user_id=payload.user_id,
        type=payload.type,
        title=payload.title,
        message=payload.message,
        link=payload.link,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.patch("/{notif_id}/read")
def mark_as_read(notif_id: str, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        return {"error": "Notification not found"}
    notif.read = True
    db.commit()
    return {"status": "read"}
