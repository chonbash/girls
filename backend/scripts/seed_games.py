"""Seed default games (stubs). Run after migrations."""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from app.database import async_session, engine
from app.models import Game, Base


GAMES = [
    {"slug": "pro-pro-cards", "title": "Карты гадания ПроПро", "sort_order": 1},
    {"slug": "horoscope", "title": "Гороскоп на день", "sort_order": 2},
    {"slug": "compliment-wheel", "title": "Комплимент-рулетка", "sort_order": 3},
]


async def seed():
    async with async_session() as session:
        for g in GAMES:
            r = await session.execute(select(Game).where(Game.slug == g["slug"]))
            if r.scalar_one_or_none() is None:
                session.add(Game(**g))
        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
    print("Games seeded.")
