from datetime import datetime
from pydantic import BaseModel, EmailStr


class GirlOut(BaseModel):
    id: int
    name: str
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class GirlCreate(BaseModel):
    name: str
    email: EmailStr


class GameOut(BaseModel):
    id: int
    slug: str
    title: str
    sort_order: int
    is_active: bool

    class Config:
        from_attributes = True


class RequestCodeIn(BaseModel):
    girl_id: int


class VerifyCodeIn(BaseModel):
    girl_id: int
    code: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    girl_id: int


class CertificateOut(BaseModel):
    url: str
    token: str
