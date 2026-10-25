import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.exceptions import EleysoraException
from app.core.seed import seed_initial_data

# Import API routers
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.lifepath import router as lifepath_router
from app.api.opportunities import router as opportunities_router
from app.api.documents import router as documents_router
from app.api.barriers import router as barriers_router
from app.api.action_cards import router as action_cards_router
from app.api.schemes import router as schemes_router
from app.api.learning import router as learning_router
from app.api.community import router as community_router
from app.api.sustainability import router as sustainability_router
from app.api.accessibility import router as accessibility_router
from app.api.dashboard import router as dashboard_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("eleysora.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed initial data
    logger.info("Initializing ELEYSORA AI database...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        try:
            await seed_initial_data(session)
        except Exception as e:
            logger.error(f"Error seeding database: {e}")

    logger.info("ELEYSORA AI Backend ready!")
    yield
    # Shutdown
    await engine.dispose()
    logger.info("Database connections closed.")


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for ELEYSORA AI — Beyond the Screen. Beyond Every Barrier. Where Intelligence Meets Inclusion.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for competition preview & seamless cross-port calls
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception Handlers
@app.exception_handler(EleysoraException)
async def handle_eleysora_exception(request: Request, exc: EleysoraException):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail,
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_error(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "The request data failed validation checks.",
                "details": exc.errors(),
            }
        },
    )


@app.exception_handler(Exception)
async def handle_unhandled_exception(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
            }
        },
    )


# Health Check
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "api_version": "v1",
    }


@app.get("/", tags=["System"])
async def root():
    return {
        "name": "ELEYSORA AI Platform API",
        "tagline": "Beyond the Screen. Beyond Every Barrier.",
        "documentation": "/docs",
        "status": "online",
    }


# Register all API routers under API_V1_PREFIX
app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(chat_router, prefix=settings.API_V1_PREFIX)
app.include_router(lifepath_router, prefix=settings.API_V1_PREFIX)
app.include_router(opportunities_router, prefix=settings.API_V1_PREFIX)
app.include_router(documents_router, prefix=settings.API_V1_PREFIX)
app.include_router(barriers_router, prefix=settings.API_V1_PREFIX)
app.include_router(action_cards_router, prefix=settings.API_V1_PREFIX)
app.include_router(schemes_router, prefix=settings.API_V1_PREFIX)
app.include_router(learning_router, prefix=settings.API_V1_PREFIX)
app.include_router(community_router, prefix=settings.API_V1_PREFIX)
app.include_router(sustainability_router, prefix=settings.API_V1_PREFIX)
app.include_router(accessibility_router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_V1_PREFIX)
