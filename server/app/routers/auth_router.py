from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # For form data in login
from sqlalchemy.orm import Session

from .. import schemas, crud, auth, dependencies # Local package imports
from ..db.database import get_db # DB session dependency

router = APIRouter(
    prefix="/auth", # All routes in this file will start with /auth
    tags=["Authentication"], # For Swagger UI grouping
)

@router.post("/register", response_model=schemas.user_schemas.User)
def register_user(
    user: schemas.user_schemas.UserCreate, db: Session = Depends(get_db)
):
    db_user = crud.user_crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    created_user = crud.user_crud.create_user(db=db, user=user)
    return created_user # Pydantic will automatically convert if needed

@router.post("/login", response_model=schemas.token_schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    # form_data.username will contain the email
    user = crud.user_crud.get_user_by_email(db, email=form_data.username)
    if not user or not user.hashed_password or not auth.jwt_handler.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    
    access_token = auth.jwt_handler.create_access_token(data={"user_id": user.id})
    # refresh_token = auth.jwt_handler.create_refresh_token(data={"user_id": user.id}) # Optional
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        # "refresh_token": refresh_token # Optional
    }

@router.get("/me", response_model=schemas.user_schemas.User)
async def read_users_me(
    current_user: schemas.user_schemas.User = Depends(dependencies.get_current_active_user)
):
    # current_user is already a Pydantic model from get_current_active_user
    return current_user