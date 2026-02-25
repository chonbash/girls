"""Seed default tarot (ProPro) cards. Run after migrations and 003_tarot_cards."""
import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select
from app.database import async_session
from app.models import TarotCard


CARDS = [
    {"uuid": "pro-pro", "title": "ПроПро", "description": "Ждёт когда ПроПро превратится в ПроСТО.", "sort_order": 1},
    {"uuid": "kz", "title": "КЗ", "description": "Кто-то думает что это Контрактные задания, а на самом деле это Кибер-змей. Он как Змей Горыныч, только наоборот. Крадёт старых дряхлых программистов и утаскивает их в пещеру.", "sort_order": 2},
    {"uuid": "stand-in", "title": "Stand In", "description": "Вам придётся уработаться, и когда останется раскатить на холодное плечо — узнать, что Исаев выпустил новую версию, обязательную для всех.", "sort_order": 3},
    {"uuid": "sprint-planning", "title": "Планирование Спринта", "description": "Айтишницы говорят, что не верят в судьбу, гадание и гороскопы, а потом планируются на суперспринт вперёд.", "sort_order": 4},
    {"uuid": "katapulta", "title": "Катяпульта", "description": "Вы невнимательно слушали оперативку — и теперь очень быстро придётся навёрстывать всё прослушанное и пролетевшую неделю.", "sort_order": 5},
    {"uuid": "katastrofa", "title": "Катястрофа", "description": "У вас точно скоро покраснеет точка в проекте. Надо срочно что-то сделать, чтобы не предотвратить проблемы.", "sort_order": 6},
    {"uuid": "reginator", "title": "Регинатор", "description": "Твой телефон уже разрывается! Ты не сдала отчёт — и Региниратор пришёл за тобой!", "sort_order": 7},
    {"uuid": "veronikation", "title": "Вероникация", "description": "Ты плохо спланировала спринт? Завела задачки линейной деятельности? Не беда — сейчас пройдёт Вероникация, и всё станет хорошо. Главное — не трогай!", "sort_order": 8},
    {"uuid": "anyakonda", "title": "Аняконда", "description": "Твой сон не будет прежним... Аняконда пробралась мимо тестировщиков и уже готова намотаться на onlineauth. Спасти тебя может только карта Stand In.", "sort_order": 9},
    {"uuid": "dashastika", "title": "Дашастика", "description": "Пока не придумал, что значит — но что-то точно интересное.", "sort_order": 10},
]


async def seed():
    async with async_session() as session:
        for c in CARDS:
            r = await session.execute(select(TarotCard).where(TarotCard.uuid == c["uuid"]))
            if r.scalar_one_or_none() is None:
                session.add(TarotCard(**c))
        await session.commit()


if __name__ == "__main__":
    asyncio.run(seed())
    print("Tarot cards seeded.")
