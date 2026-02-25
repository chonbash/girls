from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Girl, Game
from app.schemas import GirlOut, GirlCreate
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
    girl = Girl(name=data.name, email=data.email)
    db.add(girl)
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
