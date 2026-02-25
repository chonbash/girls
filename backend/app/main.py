from __future__ import annotations
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.routers import public, admin

app = FastAPI(title="8 Марта — Girls", root_path="/girls")
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
