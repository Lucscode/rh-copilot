from pydantic import BaseModel

class DocumentCreate(BaseModel):
    title: str
    content: str


class DocumentOut(BaseModel):
    id: str
    title: str
    content: str

    class Config:
        from_attributes = True
