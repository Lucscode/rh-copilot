from pydantic import BaseModel, EmailStr, field_serializer
from datetime import datetime
from typing import Optional


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "candidato"  # "rh" | "candidato"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: datetime

    @field_serializer('role')
    def serialize_role(self, role, _info):
        if hasattr(role, 'value'):
            return role.value
        return role

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
