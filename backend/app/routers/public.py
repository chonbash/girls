from datetime import datetime, timedelta
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Girl, AccessCode, Game
from app.schemas import GirlOut, GameOut, RequestCodeIn, VerifyCodeIn, TokenOut, CertificateOut
from app.auth import create_access_token, require_girl
from app.email import send_code_email
from app.config import settings

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/girls", response_model=list[GirlOut])
async def list_girls(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Girl).where(Girl.is_active).order_by(Girl.name))
    return [GirlOut.model_validate(g) for g in result.scalars().all()]


@router.post("/auth/request-code")
async def request_code(data: RequestCodeIn, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Girl).where(Girl.id == data.girl_id, Girl.is_active))
    girl = result.scalar_one_or_none()
    if not girl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Girl not found")
    code = secrets.token_hex(4).upper()[:8]
    expires_at = datetime.utcnow() + timedelta(hours=settings.code_expire_hours)
    access = AccessCode(girl_id=girl.id, code=code, expires_at=expires_at)
    db.add(access)
    await db.flush()
    await send_code_email(girl.email, code, girl.name)
    return {"message": "Code sent to email"}


@router.post("/auth/verify", response_model=TokenOut)
async def verify_code(data: VerifyCodeIn, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AccessCode).where(
            AccessCode.girl_id == data.girl_id,
            AccessCode.code == data.code,
            AccessCode.used_at.is_(None),
            AccessCode.expires_at > datetime.utcnow(),
        )
    )
    access = result.scalar_one_or_none()
    if not access:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired code")
    access.used_at = datetime.utcnow()
    token = create_access_token(access.girl_id)
    return TokenOut(access_token=token, girl_id=access.girl_id)


@router.get("/games", response_model=list[GameOut])
async def list_games(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Game).where(Game.is_active).order_by(Game.sort_order, Game.id))
    return [GameOut.model_validate(g) for g in result.scalars().all()]


@router.get("/games/{slug}")
async def game_stub(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Game).where(Game.slug == slug, Game.is_active))
    game = result.scalar_one_or_none()
    if not game:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Game not found")
    return {"slug": game.slug, "title": game.title, "stub": True}


@router.post("/certificate", response_model=CertificateOut)
async def create_certificate(
    db: AsyncSession = Depends(get_db),
    girl: Girl = Depends(require_girl),
):
    from app.models import Certificate

    token = secrets.token_urlsafe(32)
    cert = Certificate(girl_id=girl.id, token=token)
    db.add(cert)
    await db.flush()
    url = f"{settings.base_url}/certificate/{token}"
    return CertificateOut(url=url, token=token)
