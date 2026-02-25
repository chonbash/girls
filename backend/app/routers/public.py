from datetime import datetime, timedelta
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Girl, AccessCode, Game, TarotCard, TarotReading
from app.schemas import GirlOut, GameOut, RequestCodeIn, VerifyCodeIn, TokenOut, CertificateOut, TarotCardOut, TarotDrawIn, TarotDrawOut
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


@router.get("/tarot-cards", response_model=list[TarotCardOut])
async def list_tarot_cards(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TarotCard).where(TarotCard.is_active).order_by(TarotCard.sort_order, TarotCard.id)
    )
    return [TarotCardOut.model_validate(c) for c in result.scalars().all()]


@router.post("/tarot-cards/draw", response_model=TarotDrawOut)
async def draw_tarot_cards(data: TarotDrawIn, db: AsyncSession = Depends(get_db)):
    import random
    count = min(max(data.count, 1), 10)
    result = await db.execute(
        select(TarotCard).where(TarotCard.is_active).order_by(TarotCard.sort_order, TarotCard.id)
    )
    cards = list(result.scalars().all())
    if len(cards) < count:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Not enough cards in deck (need {count}, have {len(cards)})",
        )
    drawn = random.sample(cards, count)
    # Log reading for analytics
    reading = TarotReading(
        question_text=(data.question or "").strip() or None,
        past_card_uuid=drawn[0].uuid,
        present_card_uuid=drawn[1].uuid if len(drawn) > 1 else drawn[0].uuid,
        future_card_uuid=drawn[2].uuid if len(drawn) > 2 else drawn[0].uuid,
    )
    db.add(reading)
    await db.flush()
    # Return exactly 3 for past/present/future
    past = drawn[0]
    present = drawn[1] if len(drawn) > 1 else drawn[0]
    future = drawn[2] if len(drawn) > 2 else drawn[0]
    return TarotDrawOut(
        past=TarotCardOut.model_validate(past),
        present=TarotCardOut.model_validate(present),
        future=TarotCardOut.model_validate(future),
    )


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
