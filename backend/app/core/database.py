import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

def get_database_url():
    if settings.DATABASE_URL:
        return settings.DATABASE_URL
    # Check if explicit postgres host is configured or fallback to local sqlite
    if os.getenv("POSTGRES_HOST") and os.getenv("POSTGRES_HOST") != "localhost":
        user = settings.POSTGRES_USER
        password = settings.POSTGRES_PASSWORD
        host = settings.POSTGRES_HOST
        port = settings.POSTGRES_PORT
        db = settings.POSTGRES_DB
        return f"postgresql://{user}:{password}@{host}:{port}/{db}"
    # Local SQLite fallback for instant zero-dependency testing & dev
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "travel_manager.db")
    return f"sqlite:///{sqlite_path}"

db_url = get_database_url()
is_sqlite = db_url.startswith("sqlite")

connect_args = {"check_same_thread": False} if is_sqlite else {}

try:
    engine = create_engine(db_url, connect_args=connect_args)
    # Test connection
    with engine.connect() as conn:
        pass
except Exception:
    # If postgres connection failed (e.g. postgres not running locally), fallback to sqlite
    sqlite_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "travel_manager.db")
    db_url = f"sqlite:///{sqlite_path}"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
