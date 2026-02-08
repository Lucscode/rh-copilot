from pydantic import BaseModel
from datetime import datetime


class InterviewNoteCreate(BaseModel):
    application_id: str
    author_id: str
    content: str
    is_internal: bool = True


class InterviewNoteOut(BaseModel):
    id: str
    application_id: str
    author_id: str
    content: str
    is_internal: bool
    created_at: datetime

    class Config:
        from_attributes = True
