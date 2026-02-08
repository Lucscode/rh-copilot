from pydantic import BaseModel
from datetime import datetime


class NotificationCreate(BaseModel):
    user_id: str
    type: str
    title: str
    message: str
    link: str | None = None


class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    link: str | None = None
    read: bool
    created_at: datetime

    class Config:
        from_attributes = True
