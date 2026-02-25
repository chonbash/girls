import secrets
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, HTTPHeader
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import Girl, AccessCode

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer(auto_error=False)


def verify_admin_password(password: str) -> bool:
    if not settings.admin_password_hash:
        return False
    return pwd_context.verify(password, settings.admin_password_hash)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(girl_id: int) -> str:
    expire = datetime.utcnow() + timedelta(days=1)
    payload = {"sub": str(girl_id), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def decode_access_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=["HS256"])
        return int(payload.get("sub"))
    except (JWTError, ValueError):
        return None


async def get_current_girl(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Girl | None:
    if not credentials or credentials.credentials is None:
        return None
    girl_id = decode_access_token(credentials.credentials)
    if not girl_id:
        return None
    result = await db.execute(select(Girl).where(Girl.id == girl_id, Girl.is_active))
    return result.scalar_one_or_none()


def require_girl(girl: Girl | None = Depends(get_current_girl)) -> Girl:
    if girl is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return girl
