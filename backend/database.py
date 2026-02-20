from sqlalchemy import create_engine, Column, String, Integer, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get DATABASE_URL from Railway or local .env
DATABASE_URL = os.getenv("DATABASE_URL")

# Fail fast if missing (prevents silent localhost fallback crash)
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set. Check Railway Variables or backend/.env file")

# Create engine with production-safe settings
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base model class
Base = declarative_base()


# =========================
# MODELS
# =========================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    employee_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="analyst")  # admin, analyst, viewer
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    employee_id = Column(String, nullable=False)
    customer_id = Column(String, nullable=False)
    product_recommended = Column(String)
    life_event = Column(String)
    persona = Column(String)

    # guardrail + explainability
    confidence = Column(Integer, default=100)
    guardrail = Column(String, default="passed")
    reason = Column(String)

    timestamp = Column(DateTime, default=datetime.utcnow)


# =========================
# DB Dependency
# =========================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# Create Tables
# =========================

def create_tables():
    Base.metadata.create_all(bind=engine)