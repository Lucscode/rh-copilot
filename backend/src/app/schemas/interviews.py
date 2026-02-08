from pydantic import BaseModel
from datetime import datetime


class InterviewCreate(BaseModel):
    application_id: str
    interviewer_id: str
    scheduled_at: datetime
    type: str | None = None  # "phone", "video", "in-person"
    notes: str | None = None


class InterviewUpdate(BaseModel):
    status: str | None = None
    notes: str | None = None


class InterviewOut(BaseModel):
    id: str
    application_id: str
    interviewer_id: str
    scheduled_at: datetime
    status: str
    type: str | None = None
    notes: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
