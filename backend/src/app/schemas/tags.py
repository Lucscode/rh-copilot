from pydantic import BaseModel


class TagCreate(BaseModel):
    name: str
    color: str = "blue"


class TagOut(BaseModel):
    id: str
    name: str
    color: str

    class Config:
        from_attributes = True
