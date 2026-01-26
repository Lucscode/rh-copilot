from pydantic import BaseModel

class JobCreate(BaseModel):
    title: str
    short_description: str
    created_by: str | None = None


class JobOut(BaseModel):
    id: str
    title: str
    short_description: str
    full_description: str | None = None
    created_by: str | None = None

    class Config:
        from_attributes = True
