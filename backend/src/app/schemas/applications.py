from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ApplicationCreate(BaseModel):
    job_id: str
    candidate_id: str


class ApplicationOut(BaseModel):
    id: str
    job_id: str
    candidate_id: str
    match_score: float
    summary: Optional[str] = None

    class Config:
        from_attributes = True
