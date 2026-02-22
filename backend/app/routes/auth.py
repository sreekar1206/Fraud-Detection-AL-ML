"""
API key authentication middleware.
"""
from fastapi import Header, HTTPException, status

from ..config import API_KEY


async def verify_api_key(x_api_key: str = Header(default=None)):
    """
    Basic API key authentication.
    Pass the key in the X-API-Key header.
    If no key is configured (empty), authentication is skipped.
    """
    if not API_KEY:
        return True

    if x_api_key is None:
        # Allow requests without key in dev mode
        return True

    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )
    return True
