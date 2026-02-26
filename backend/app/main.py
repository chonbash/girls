from __future__ import annotations
from pathlib import Path

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers import public, admin

app = FastAPI(title="8 Марта — Girls", root_path="/girls")

# Static uploads (tarot card images)
STATIC_DIR = Path(__file__).resolve().parent.parent / "static"
UPLOADS_DIR = STATIC_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(public.router)
app.include_router(admin.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/certificate/{token}")
async def get_certificate_by_token(token: str, db: AsyncSession = Depends(get_db)):
    """Public view: get certificate info by token (for the certificate page)."""
    from sqlalchemy import select
    from app.models import Certificate, Girl

    result = await db.execute(
        select(Certificate, Girl).join(Girl, Certificate.girl_id == Girl.id).where(Certificate.token == token)
    )
    row = result.one_or_none()
    if not row:
        return {"found": False}
    cert, girl = row
    return {"found": True, "girl_name": girl.name}
