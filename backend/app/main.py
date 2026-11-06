from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import api_router
from app.schemas.schemas import HealthResponse

# Create tables if not created
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="API REST do Travel Manager - Sistema pessoal e familiar de gestão de viagens."
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:80",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Healthcheck
@app.get("/api/v1/health", response_model=HealthResponse, tags=["Saúde"])
def health_check():
    return HealthResponse(
        status="healthy",
        app=settings.APP_NAME,
        version="1.0.0",
        database="connected"
    )

# Include API v1 router
app.include_router(api_router, prefix="/api/v1")

# Mount uploads static folder if exists
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
