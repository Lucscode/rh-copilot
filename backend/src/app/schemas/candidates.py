from pydantic import BaseModel, EmailStr

class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    resume_text: str


class CandidateOut(BaseModel):
    id: str
    name: str
    email: EmailStr

    class Config:
        from_attributes = True
