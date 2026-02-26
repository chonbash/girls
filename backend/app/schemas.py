from datetime import datetime
from pydantic import BaseModel, EmailStr


class GirlOut(BaseModel):
    id: int
    name: str
    email: str
    gift_certificate_url: str | None = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class GirlCreate(BaseModel):
    name: str
    email: EmailStr
    gift_certificate_url: str | None = None


class GirlUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    gift_certificate_url: str | None = None


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


# Tarot
class TarotCardOut(BaseModel):
    uuid: str
    title: str
    description: str
    image_url: str | None = None

    class Config:
        from_attributes = True


class TarotDrawIn(BaseModel):
    question: str | None = None
    count: int = 3


class TarotDrawOut(BaseModel):
    past: TarotCardOut
    present: TarotCardOut
    future: TarotCardOut


class TarotCardCreate(BaseModel):
    uuid: str | None = None
    title: str
    description: str
    image_url: str | None = None
    sort_order: int = 0


class TarotCardUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    image_url: str | None = None
    is_active: bool | None = None
    sort_order: int | None = None


class TarotCardAdminOut(BaseModel):
    id: int
    uuid: str
    title: str
    description: str
    image_url: str | None = None
    is_active: bool
    sort_order: int

    class Config:
        from_attributes = True
