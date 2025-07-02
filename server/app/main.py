import secrets
from sys import prefix
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # For frontend later
from starlette.middleware.sessions import SessionMiddleware
from .config import settings # App settings
from .routers import auth_router, analysis_router, history_router, prediction_router, comparison_router# Import your auth router
# from .db.database import engine, Base # If you were creating tables directly

# Optional: If you weren't using Alembic and wanted FastAPI to create tables
# (Not recommended if using Alembic for schema management)
# Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url="/api/v1/openapi.json" # Standard practice to version your API docs URL
)


app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    same_site='lax',       # Most compatible for HTTP GET redirects       
    https_only=False,     # MUST be False for HTTP (same as secure=False)
    max_age=14 * 24 * 60 * 60  # Optional: e.g., 2 weeks for session cookie
)
# CORS (Cross-Origin Resource Sharing) - for when your frontend is on a different domain/port
# For now, allow all origins for local development. Be more restrictive in production.
origins = [
    "http://localhost:5173", # Default Vite dev port
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://stocker-ov.vercel.app"  # Default React dev port
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

# Include the authentication router
# All routes from auth_router will be prefixed with /api/v1
app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(analysis_router.router, prefix="/api/v1")
app.include_router(history_router.router, prefix="/api/v1")
app.include_router(prediction_router.router, prefix="/api/v1")
app.include_router(comparison_router.router, prefix="/api/v1")

@app.get("/api/v1") # Root for v1 API
async def api_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API v1"}

# Keep the old root path for general app info, or remove if not needed
@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} (App Root)"}