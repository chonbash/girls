"""Константы для мини-игры «Гороскоп на день»: роли и знаки зодиака."""

from typing import TypedDict


class RoleSignItem(TypedDict):
    id: str
    label: str
    label_rod: str  # род. падеж для фразы «[знак] [роль] ждёт:»


ROLES: list[RoleSignItem] = [
    {"id": "tester", "label": "Тестировщик", "label_rod": "тестировщика"},
    {"id": "analyst", "label": "Аналитик", "label_rod": "аналитика"},
    {"id": "developer", "label": "Разработчик", "label_rod": "разработчика"},
    {"id": "devops", "label": "ДевОпс", "label_rod": "девопса"},
    {"id": "pm", "label": "Проджект", "label_rod": "проджекта"},
]

SIGNS: list[RoleSignItem] = [
    {"id": "aries", "label": "Овен", "label_rod": "Овна"},
    {"id": "taurus", "label": "Телец", "label_rod": "Тельца"},
    {"id": "gemini", "label": "Близнецы", "label_rod": "Близнецов"},
    {"id": "cancer", "label": "Рак", "label_rod": "Рака"},
    {"id": "leo", "label": "Лев", "label_rod": "Льва"},
    {"id": "virgo", "label": "Дева", "label_rod": "Девы"},
    {"id": "libra", "label": "Весы", "label_rod": "Весов"},
    {"id": "scorpio", "label": "Скорпион", "label_rod": "Скорпиона"},
    {"id": "sagittarius", "label": "Стрелец", "label_rod": "Стрельца"},
    {"id": "capricorn", "label": "Козерог", "label_rod": "Козерога"},
    {"id": "aquarius", "label": "Водолей", "label_rod": "Водолея"},
    {"id": "pisces", "label": "Рыбы", "label_rod": "Рыб"},
]

# Пасхалка «Шнеле Пепе вотэфааа» — фразы для вставки с вероятностью ~30–40%
EASTER_EGG_PHRASES = [
    " ОТПепе",
    " ЕпА2faaa",
    " вотэфааа",
    " ШнелеПепе",
    " 2FAааа",
]
