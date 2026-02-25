from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Girl, Game, TarotCard
from app.schemas import GirlOut, GirlCreate, GirlUpdate, TarotCardAdminOut, TarotCardCreate, TarotCardUpdate
from app.auth import verify_admin_password

router = APIRouter(prefix="/api/admin", tags=["admin"])


async def require_admin(x_admin_password: str | None = Header(None, alias="X-Admin-Password")):
    if not x_admin_password or not verify_admin_password(x_admin_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid password")
    return True


@router.get("/girls", response_model=list[GirlOut])
async def admin_list_girls(
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_admin),
):
    result = await db.execute(select(Girl).order_by(Girl.name))
    return [GirlOut.model_validate(g) for g in result.scalars().all()]


@router.post("/girls", response_model=GirlOut)
async def admin_create_girl(
    data: GirlCreate,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_admin),
):
    girl = Girl(name=data.name, email=data.email, gift_certificate_url=data.gift_certificate_url or None)
    db.add(girl)
    await db.flush()
    await db.refresh(girl)
    return GirlOut.model_validate(girl)


@router.patch("/girls/{girl_id}", response_model=GirlOut)
async def admin_update_girl(
    girl_id: int,
    data: GirlUpdate,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_admin),
):
    result = await db.execute(select(Girl).where(Girl.id == girl_id))
    girl = result.scalar_one_or_none()
    if not girl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    update_data = data.model_dump(exclude_unset=True)
    if "name" in update_data:
        girl.name = update_data["name"]
    if "email" in update_data:
        girl.email = update_data["email"]
    if "gift_certificate_url" in update_data:
        girl.gift_certificate_url = update_data["gift_certificate_url"] or None
    await db.flush()
    await db.refresh(girl)
    return GirlOut.model_validate(girl)


@router.delete("/girls/{girl_id}")
async def admin_delete_girl(
    girl_id: int,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_admin),
):
    result = await db.execute(select(Girl).where(Girl.id == girl_id))
    girl = result.scalar_one_or_none()
    if not girl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    await db.delete(girl)
    return {"ok": True}


@router.get("/games", response_model=list[dict])
async def admin_list_games(
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_admin),
):
    result = await db.execute(select(Game).order_by(Game.sort_order, Game.id))
    games = result.scalars().all()
    return [{"id": g.id, "slug": g.slug, "title": g.title, "sort_order": g.sort_order, "is_active": g.is_active} for g in games]


# Tarot cards admin
@router.get("/tarot-cards", response_model=list[TarotCardAdminOut])
async def admin_list_tarot_cards(
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_admin),
):
    result = await db.execute(select(TarotCard).order_by(TarotCard.sort_order, TarotCard.id))
    return [TarotCardAdminOut.model_validate(c) for c in result.scalars().all()]


@router.post("/tarot-cards", response_model=TarotCardAdminOut)
async def admin_create_tarot_card(
    data: TarotCardCreate,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_admin),
):
    card = TarotCard(
        uuid=data.uuid,
        title=data.title,
        description=data.description,
        image_url=data.image_url,
        sort_order=data.sort_order,
    )
    db.add(card)
    await db.flush()
    await db.refresh(card)
    return TarotCardAdminOut.model_validate(card)


@router.patch("/tarot-cards/{card_id}", response_model=TarotCardAdminOut)
async def admin_update_tarot_card(
    card_id: int,
    data: TarotCardUpdate,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_admin),
):
    result = await db.execute(select(TarotCard).where(TarotCard.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(card, key, value)
    if "image_url" in update_data and update_data["image_url"] == "":
        card.image_url = None
    await db.flush()
    await db.refresh(card)
    return TarotCardAdminOut.model_validate(card)


@router.delete("/tarot-cards/{card_id}")
async def admin_delete_tarot_card(
    card_id: int,
    db: AsyncSession = Depends(get_db),
    _: bool = Depends(require_admin),
):
    result = await db.execute(select(TarotCard).where(TarotCard.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found")
    await db.delete(card)
    return {"ok": True}
