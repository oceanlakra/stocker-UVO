from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm # For form data in login
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse
from .. import schemas, crud, auth, dependencies, config # Local package imports
from ..db.database import get_db # DB session dependency
from ..auth.oauth_handler import oauth

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


# --- Google OAuth Routes ---
@router.get("/google/login")
async def login_via_google(request: Request):
    if not config.settings.GOOGLE_REDIRECT_URI: # Check if configured
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    # The redirect_uri for authorize_redirect must match one in Google Cloud Console
    return await oauth.google.authorize_redirect(request, config.settings.GOOGLE_REDIRECT_URI)

@router.get("/google/callback", response_model=schemas.token_schemas.Token) # Or RedirectResponse to frontend
async def google_auth_callback(request: Request, db: Session = Depends(get_db)):
    if not config.settings.GOOGLE_CLIENT_ID: # Check if configured
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    try:
        token = await oauth.google.authorize_access_token(request)
    except Exception as e:
        # Log the actual error from Authlib for debugging
        print(f"Google OAuth Error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Could not get access token from Google: {e}")

    user_info = token.get('userinfo') # userinfo is standard in OIDC
    if not user_info or not user_info.get('email'):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not fetch user info from Google")

    email = user_info.get('email')
    full_name = user_info.get('name')
    google_id = user_info.get('sub') # 'sub' (subject) is the standard unique ID in OIDC

    db_user = crud.user_crud.get_or_create_user_by_oauth(
        db, email=email, full_name=full_name, provider_name="google", provider_user_id=google_id
    )

    access_token = auth.jwt_handler.create_access_token(data={"user_id": db_user.id})
    
    # IMPORTANT FOR FRONTEND INTEGRATION LATER:
    # Instead of returning the token directly, you'll usually redirect to your frontend
    # with the token in a query parameter or set it in an HttpOnly cookie.
    # Example frontend redirect:
    # frontend_url = f"http://localhost:3000/oauth-callback?token={access_token}" # Assuming React runs on 3000
    # return RedirectResponse(url=frontend_url)
    
    # For now, returning token directly for backend testing:
    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# # --- Facebook OAuth Routes ---
# @router.get("/facebook/login")
# async def login_via_facebook(request: Request):
#     if not config.settings.FACEBOOK_REDIRECT_URI:
#         raise HTTPException(status_code=500, detail="Facebook OAuth not configured")
#     return await oauth.facebook.authorize_redirect(request, config.settings.FACEBOOK_REDIRECT_URI)

# @router.get("/facebook/callback", response_model=schemas.token_schemas.Token) # Or RedirectResponse
# async def facebook_auth_callback(request: Request, db: Session = Depends(get_db)):
    if not config.settings.FACEBOOK_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Facebook OAuth not configured")

    try:
        
        token = await oauth.facebook.authorize_access_token(request)
    except Exception as e:
        print(f"Facebook OAuth Error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Could not get access token from Facebook: {e}")

    # For Facebook, userinfo is usually fetched via a separate call with the token
    user_info_resp = await oauth.facebook.get('', token=token) # Endpoint path is in oauth_handler config
    user_info_resp.raise_for_status() # Check for HTTP errors from Facebook
    user_info = user_info_resp.json()

    if not user_info or (not user_info.get('email') and not user_info.get('id')): # Email might not always be present
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not fetch user info from Facebook, or email missing.")

    email = user_info.get('email')
    # If email is not provided by Facebook (user might have restricted it),
    # you might need a different strategy, e.g., use facebook_id + "@facebook.placeholder.com"
    # or prompt the user to enter an email on your frontend.
    # For simplicity, we'll assume email is usually there or raise error.
    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email not provided by Facebook. Cannot proceed.")

    full_name = user_info.get('name')
    facebook_id = user_info.get('id') # Facebook's unique ID for the user

    db_user = crud.user_crud.get_or_create_user_by_oauth(
        db, email=email, full_name=full_name, provider_name="facebook", provider_user_id=facebook_id
    )
    
    access_token = auth.jwt_handler.create_access_token(data={"user_id": db_user.id})
    
    # Again, for frontend, you'd redirect:
    # frontend_url = f"http://localhost:3000/oauth-callback?token={access_token}"
    # return RedirectResponse(url=frontend_url)

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }