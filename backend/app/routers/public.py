from datetime import datetime, timedelta
import random
import secrets

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Girl, AccessCode, Game, TarotCard, TarotReading, HoroscopePrediction
from app.schemas import (
    GirlOut,
    GameOut,
    RequestCodeIn,
    VerifyCodeIn,
    TokenOut,
    CertificateOut,
    TarotCardOut,
    TarotDrawIn,
    TarotDrawOut,
    HoroscopeRoleOut,
    HoroscopeSignOut,
    HoroscopePredictionOut,
    HoroscopePredictionRequest,
)
from app.auth import create_access_token, require_girl
from app.email import send_code_email
from app.config import settings
from app.horoscope_data import ROLES, SIGNS, EASTER_EGG_PHRASES

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


# --- Horoscope (8 March mini-game) ---

@router.get("/horoscope/roles", response_model=list[HoroscopeRoleOut])
async def list_horoscope_roles():
    return [HoroscopeRoleOut.model_validate(r) for r in ROLES]


@router.get("/horoscope/signs", response_model=list[HoroscopeSignOut])
async def list_horoscope_signs():
    return [HoroscopeSignOut.model_validate(s) for s in SIGNS]


EASTER_EGG_START = "{{EASTER}}"
EASTER_EGG_END = "{{/EASTER}}"


def _insert_easter_egg(text: str) -> str:
    """Вставляет несколько пасхалок (2–4) в текст, каждая в маркерах для стилизации на фронте."""
    if not EASTER_EGG_PHRASES:
        return text
    words = text.split()
    if len(words) < 2:
        wrapped = f"{EASTER_EGG_START}{random.choice(EASTER_EGG_PHRASES).strip()}{EASTER_EGG_END}"
        return text + " " + wrapped
    n_insert = random.randint(2, 4)
    for _ in range(n_insert):
        phrase = random.choice(EASTER_EGG_PHRASES).strip()
        wrapped = f"{EASTER_EGG_START}{phrase}{EASTER_EGG_END}"
        pos = random.randint(0, len(words))
        words.insert(pos, wrapped)
    return " ".join(words)


def _get_role_and_sign(role_id: str, sign_id: str) -> tuple[dict, dict]:
    role_by_id = {r["id"]: r for r in ROLES}
    sign_by_id = {s["id"]: s for s in SIGNS}
    role = role_by_id.get(role_id)
    sign = sign_by_id.get(sign_id)
    if not role or not sign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unknown role_id or sign_id",
        )
    return role, sign


async def _fetch_horoscope_text(role_id: str, sign_id: str, db: AsyncSession) -> str:
    role, sign = _get_role_and_sign(role_id, sign_id)
    result = await db.execute(
        select(HoroscopePrediction).where(HoroscopePrediction.is_active).order_by(HoroscopePrediction.sort_order, HoroscopePrediction.id)
    )
    predictions = list(result.scalars().all())
    if not predictions:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No predictions in database",
        )
    pred = random.choice(predictions)
    sentence = f"{sign['label_rod']} {role['label_rod']} ждёт: {pred.text}"
    return _insert_easter_egg(sentence)


@router.get("/horoscope/prediction", response_model=HoroscopePredictionOut)
async def get_horoscope_prediction_get(
    role_id: str = Query(..., alias="role_id"),
    sign_id: str = Query(..., alias="sign_id"),
    db: AsyncSession = Depends(get_db),
):
    text = await _fetch_horoscope_text(role_id, sign_id, db)
    return HoroscopePredictionOut(text=text)


@router.post("/horoscope/prediction", response_model=HoroscopePredictionOut)
async def get_horoscope_prediction_post(
    body: HoroscopePredictionRequest,
    db: AsyncSession = Depends(get_db),
):
    text = await _fetch_horoscope_text(body.role_id, body.sign_id, db)
    return HoroscopePredictionOut(text=text)
    if not rid or not sid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="role_id and sign_id are required",
        )
    role_by_id = {r["id"]: r for r in ROLES}
    sign_by_id = {s["id"]: s for s in SIGNS}
    role = role_by_id.get(rid)
    sign = sign_by_id.get(sid)
    if not role or not sign:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Unknown role_id or sign_id",
        )
    result = await db.execute(
        select(HoroscopePrediction).where(HoroscopePrediction.is_active).order_by(HoroscopePrediction.sort_order, HoroscopePrediction.id)
    )
    predictions = list(result.scalars().all())
    if not predictions:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No predictions in database",
        )
    pred = random.choice(predictions)
    # Итоговая фраза: «[Знак род.] [роль род.] ждёт: [текст]»
    sentence = f"{sign['label_rod']} {role['label_rod']} ждёт: {pred.text}"
    sentence = _insert_easter_egg(sentence)
    return HoroscopePredictionOut(text=sentence)
