import os
from datetime import datetime, timedelta

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin")
ALGORITHM = "HS256"
TOKEN_TTL_HOURS = 8

bearer_scheme = HTTPBearer(auto_error=False)


def check_admin_password(password: str) -> bool:
    return password == ADMIN_PASSWORD


def create_access_token() -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_TTL_HOURS)
    payload = {"sub": "admin", "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)


def require_admin(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> None:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing admin credentials.",
        )
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("sub") != "admin":
            raise JWTError("Bad subject")
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin session. Please log in again.",
        )
