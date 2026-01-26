from pydantic import BaseModel

class ApplicationCreate(BaseModel):
    job_id: str
    candidate_id: str


class ApplicationOut(BaseModel):
    id: str
    job_id: str
    candidate_id: str
    match_score: float
    summary: str | None = None

    class Config:
        from_attributes = True
