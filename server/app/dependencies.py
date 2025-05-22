from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .schemas import token_schemas, user_schemas # Pydantic schemas
from .crud import user_crud # CRUD operations
from .db.database import get_db # DB session dependency
from .config import settings # App settings

# This tells FastAPI where the token URL is (the login endpoint)
# The tokenUrl should match the path to your login endpoint.
# We will create an auth router with prefix /api/v1/auth, and login endpoint as /login
# So the full path will be /api/v1/auth/login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> user_schemas.User: # Return type hint for clarity
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id_str: str = payload.get("sub") # 'sub' is where we stored user_id
        if user_id_str is None:
            raise credentials_exception
        
        # Try to convert user_id_str to int. If it fails, it's not a valid ID.
        try:
            user_id = int(user_id_str)
        except ValueError:
            raise credentials_exception

        token_data = token_schemas.TokenData(user_id=user_id)

    except JWTError:
        raise credentials_exception
    
    user = user_crud.get_user(db, user_id=token_data.user_id)
    if user is None:
        raise credentials_exception
    
    # Convert SQLAlchemy model instance to Pydantic model instance
    return user_schemas.User.model_validate(user) # Pydantic v2
    # For Pydantic v1: return user_schemas.User.from_orm(user)


async def get_current_active_user(
    current_user: user_schemas.User = Depends(get_current_user)
) -> user_schemas.User:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user

async def get_current_active_superuser(
    current_user: user_schemas.User = Depends(get_current_active_user)
) -> user_schemas.User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user