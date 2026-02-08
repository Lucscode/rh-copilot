from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ApplicationCreate(BaseModel):
    job_id: str
    candidate_id: str


class ApplicationUpdateStatus(BaseModel):
    status: str  # "aplicado" | "em_analise" | "entrevista" | "oferecido" | "rejeitado"


class ApplicationOut(BaseModel):
    id: str
    job_id: str
    candidate_id: str
    status: str
    match_score: float
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
