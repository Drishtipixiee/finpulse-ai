from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, create_tables, User, AuditLog
from auth import hash_password, verify_password, create_token, get_current_user

from collections import Counter
from datetime import datetime, timedelta
from dotenv import load_dotenv
from groq import Groq

import jwt
import os
import json

# ========================
# LOAD ENV
# ========================

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "finpulse-secret")
ACCESS_EXPIRE_MINUTES = 60
REFRESH_EXPIRE_DAYS = 7

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI(title="FinPulse AI Backend")

# ========================
# CORS CONFIG (IMPORTANT)
# ========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[

        "http://localhost:3000",
        "http://127.0.0.1:3000",

        "https://finpulse-ai-iota.vercel.app",
        "https://finpulse-61v8909w3-drishtipixiees-projects.vercel.app",

        "https://*.vercel.app",

    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================
# AUTO EMPLOYEE ID GENERATOR
# ========================

def generate_employee_id(db: Session):

    last = db.query(User).order_by(User.id.desc()).first()

    if not last:
        return "EMP001"

    try:
        num = int(last.employee_id.replace("EMP", ""))
        return f"EMP{num+1:03d}"
    except:
        return "EMP001"


# ========================
# DEFAULT ADMIN CREATION
# ========================

def create_default_admin(db: Session):

    admin = db.query(User).filter(User.role == "admin").first()

    if admin:
        return

    admin_user = User(
        employee_id="EMP000",
        name="System Admin",
        email="admin@finpulse.ai",
        password_hash=hash_password("admin123"),
        role="admin"
    )

    db.add(admin_user)
    db.commit()

    print("✅ Default admin created")


# ========================
# JWT REFRESH TOKEN
# ========================

def create_refresh_token(employee_id: str):

    payload = {
        "sub": employee_id,
        "exp": datetime.utcnow() + timedelta(days=REFRESH_EXPIRE_DAYS),
        "type": "refresh"
    }

    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


# ========================
# STARTUP EVENT
# ========================

@app.on_event("startup")
def startup():

    create_tables()

    db = next(get_db())

    create_default_admin(db)

    print("🚀 FinPulse AI Backend Running")


# ========================
# REQUEST MODELS
# ========================

class SignupRequest(BaseModel):

    name: str
    email: str
    password: str
    role: str = "analyst"


class LoginRequest(BaseModel):

    employee_id: str
    password: str


class TextAnalysisRequest(BaseModel):

    description: str
    customer_name: str = "Anonymous Customer"


# ========================
# AUTH ROUTES
# ========================

@app.post("/auth/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):

    employee_id = generate_employee_id(db)

    existing = db.query(User).filter(User.email == req.email).first()

    if existing:
        raise HTTPException(400, "Email already registered")

    user = User(
        employee_id=employee_id,
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        role=req.role
    )

    db.add(user)
    db.commit()

    return {
        "status": "success",
        "employee_id": employee_id,
        "message": f"Account created for {req.name}"
    }


@app.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.employee_id == req.employee_id).first()

    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")

    access_token = create_token({
        "sub": user.employee_id,
        "role": user.role
    })

    refresh_token = create_refresh_token(user.employee_id)

    return {

        "access_token": access_token,
        "refresh_token": refresh_token,

        "user": {
            "employee_id": user.employee_id,
            "name": user.name,
            "role": user.role
        }
    }


@app.post("/auth/refresh")
def refresh_token_endpoint(token: str):

    try:

        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

        if payload.get("type") != "refresh":
            raise HTTPException(401)

        employee_id = payload.get("sub")

        access_token = create_token({
            "sub": employee_id
        })

        return {
            "access_token": access_token
        }

    except:
        raise HTTPException(401, "Invalid refresh token")


@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):

    return {
        "employee_id": current_user.employee_id,
        "name": current_user.name,
        "role": current_user.role,
        "email": current_user.email
    }


@app.post("/auth/logout")
def logout(current_user: User = Depends(get_current_user)):

    return {
        "status": "success",
        "message": "Logged out successfully"
    }


# ========================
# ANALYSIS ROUTES
# ========================

@app.post("/analyze-text")
def analyze_text(
    req: TextAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    prompt = f"Analyze banking transaction: {req.description}"

    chat = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"}
    )

    res = json.loads(chat.choices[0].message.content)

    log = AuditLog(
        employee_id=current_user.employee_id,
        customer_id=req.customer_name,
        product_recommended=res.get("product", ""),
        life_event=res.get("life_event", ""),
        persona=res.get("persona", ""),
        confidence=res.get("confidence", 80),
        reason=res.get("reason", ""),
        guardrail=res.get("guardrail", "passed")
    )

    db.add(log)
    db.commit()

    return res


# ========================
# ADMIN ROUTES
# ========================

@app.get("/admin/distinct-users")
def distinct_users(db: Session = Depends(get_db)):

    logs = db.query(AuditLog.customer_id).distinct().all()

    return {
        "distinct_users": [
            {"user_id": log[0], "name": log[0]}
            for log in logs
        ]
    }


@app.get("/admin/product-stats")
def product_stats(db: Session = Depends(get_db)):

    logs = db.query(AuditLog).all()

    products = Counter(l.product_recommended for l in logs)

    return dict(products)


# ========================
# HEALTH CHECK
# ========================

@app.get("/")
def root():

    return {
        "status": "FinPulse AI Backend Running"
    }


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "FinPulse AI"
    }
