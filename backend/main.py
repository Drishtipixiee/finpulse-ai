from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db, create_tables, User, AuditLog
from auth import hash_password, verify_password, create_token, get_current_user
from collections import Counter
import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://finpulse-ai-8dxwlxqba-drishtipixiees-projects.vercel.app"
        "https://finpulse-ai-production.up.railway.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_tables()

class SignupRequest(BaseModel):
    employee_id: str
    name: str
    email: str
    password: str
    role: str = "analyst"

class LoginRequest(BaseModel):
    employee_id: str
    password: str

# ✅ Added customer_name field
class TextAnalysisRequest(BaseModel):
    description: str
    customer_name: str = "Anonymous Customer"

@app.post("/auth/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.employee_id == req.employee_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    user = User(
        employee_id=req.employee_id,
        name=req.name,
        email=req.email,
        password_hash=hash_password(req.password),
        role=req.role
    )
    db.add(user)
    db.commit()
    return {"status": "success", "message": f"Account created for {req.name}"}

@app.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.employee_id == req.employee_id).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": user.employee_id, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "employee_id": user.employee_id,
            "name": user.name,
            "role": user.role
        }
    }

@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "employee_id": current_user.employee_id,
        "name": current_user.name,
        "role": current_user.role,
        "email": current_user.email
    }

@app.get("/analyze/{user_id}")
def analyze(user_id: str, db: Session = Depends(get_db)):
    logs = db.query(AuditLog).filter(
        AuditLog.customer_id == user_id
    ).order_by(AuditLog.timestamp.desc()).all()
    if not logs:
        return []
    return [
        {
            "user_id": log.customer_id,
            "persona": log.persona or "general",
            "life_event": log.life_event or "activity",
            "product": log.product_recommended or "N/A",
            "confidence": log.confidence or 100,
            "reason": log.reason or "Processed by Agentic Core.",
            "guardrail": log.guardrail or "passed",
            "guardrail_note": "Compliant.",
            "message": f"Recommended: {log.product_recommended}",
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M")
        } for log in logs
    ]

@app.post("/analyze-text")
def analyze_text(
    req: TextAnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        prompt = f"""Analyze this banking transaction: '{req.description}'. 
Return JSON with these exact keys:
- persona: one of (student, spender, saver, credit_dependent, general)
- life_event: one of (higher_education, frequent_traveler, renter, employed, dining_out, entertainment, shopping, major_purchase, debt_management, auto_loan, unknown)
- product: recommended banking product name
- confidence: integer between 60 and 95
- reason: one sentence explaining why
- message: friendly 2 line personalized recommendation message
- guardrail: "blocked" only if the customer shows signs of excessive debt, multiple loans, or the product offer would be predatory. Otherwise "passed".
- guardrail_note: one sentence explaining the compliance decision
- dti_ratio: higher (0.7-0.9) if customer has existing heavy debt burden, lower (0.1-0.4) for healthy financial situation"""

        chat = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"}
        )
        res = json.loads(chat.choices[0].message.content)

        log = AuditLog(
            employee_id=current_user.employee_id,
            # ✅ Now stores actual customer name, not analyst name
            customer_id=req.customer_name,
            product_recommended=res.get("product", "N/A"),
            life_event=res.get("life_event", "activity"),
            persona=res.get("persona", "general"),
            confidence=res.get("confidence", 75),
            reason=res.get("reason", "Analysis logged."),
            guardrail=res.get("guardrail", "passed")
        )
        db.add(log)
        db.commit()
        return {**res, "guardrail": res.get("guardrail", "passed")}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/seed-demo-data")
def seed_demo_data(db: Session = Depends(get_db)):
    demo_data = [
        {
            "employee_id": "EMP001",
            "customer_id": "Arjun Mehta",
            "product_recommended": "Travel Credit Card",
            "life_event": "frequent_traveler",
            "persona": "spender",
            "confidence": 87,
            "reason": "Customer has 29 international transactions in last 3 months including flights and hotels",
            "guardrail": "passed"
        },
        {
            "employee_id": "EMP001",
            "customer_id": "Priya Sharma",
            "product_recommended": "Education Loan",
            "life_event": "higher_education",
            "persona": "student",
            "confidence": 92,
            "reason": "Multiple tuition fee payments and university bookstore transactions detected",
            "guardrail": "passed"
        },
        {
            "employee_id": "EMP001",
            "customer_id": "Rahul Verma",
            "product_recommended": "Debt Consolidation Loan",
            "life_event": "debt_management",
            "persona": "credit_dependent",
            "confidence": 78,
            "reason": "Customer has 4 active EMI payments with DTI ratio exceeding safe threshold",
            "guardrail": "blocked"
        },
        {
            "employee_id": "EMP001",
            "customer_id": "Sneha Patel",
            "product_recommended": "Home Insurance",
            "life_event": "renter",
            "persona": "saver",
            "confidence": 83,
            "reason": "Regular monthly rent payments detected with consistent savings deposits",
            "guardrail": "passed"
        },
        {
            "employee_id": "EMP001",
            "customer_id": "Vikram Nair",
            "product_recommended": "Investment Portfolio",
            "life_event": "employed",
            "persona": "saver",
            "confidence": 91,
            "reason": "Stable salary credits with low expense ratio indicating investable surplus",
            "guardrail": "passed"
        },
    ]
    for d in demo_data:
        log = AuditLog(
            employee_id=d["employee_id"],
            customer_id=d["customer_id"],
            product_recommended=d["product_recommended"],
            life_event=d["life_event"],
            persona=d["persona"],
            confidence=d["confidence"],
            reason=d["reason"],
            guardrail=d["guardrail"]
        )
        db.add(log)
    db.commit()
    return {"status": "success", "message": "Demo data seeded with 5 realistic customers"}

@app.get("/admin/all-users")
def all_users(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).all()
    return {
        "total_users": len(logs),
        "users": [
            {
                "user_id": log.customer_id,
                "persona": log.persona,
                "life_event": log.life_event,
                "product": log.product_recommended,
                "confidence": log.confidence,
                "reason": log.reason,
                "guardrail": log.guardrail
            } for log in logs
        ]
    }

@app.get("/admin/distinct-users")
def distinct_users(db: Session = Depends(get_db)):
    logs = db.query(AuditLog.customer_id).distinct().all()
    return {
        "distinct_users": [
            {"user_id": log[0], "name": log[0]}
            for log in logs
        ]
    }

@app.get("/admin/confidence-analytics")
def confidence_analytics(db: Session = Depends(get_db)):
    logs = db.query(AuditLog.confidence).all()
    scores = [l[0] for l in logs if l[0]] if logs else [0]
    return {
        "average_confidence": round(sum(scores) / len(scores), 2) if scores else 0
    }

@app.get("/admin/product-stats")
def product_stats(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).all()
    products = Counter(l.product_recommended for l in logs)
    personas = Counter(l.persona for l in logs)
    return {
        "product_distribution": dict(products),
        "persona_distribution": dict(personas)
    }

@app.get("/admin/guardrail-blocks")
def guardrail_blocks(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).all()
    blocked = [l for l in logs if l.guardrail == "blocked"]
    return {
        "total_users": len(logs),
        "total_blocked": len(blocked),
        "blocked_cases": []
    }

@app.get("/admin/audit-log")
def audit_log(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
    return {"logs": [
        {
            "employee_id": l.employee_id,
            "customer_id": l.customer_id,
            "product_recommended": l.product_recommended,
            "life_event": l.life_event,
            "persona": l.persona,
            "timestamp": l.timestamp
        } for l in logs
    ]}

@app.post("/auth/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {
        "status": "success",
        "message": f"Session ended for {current_user.name}"
    }

@app.get("/")
def root():
    return {"status": "FinPulse AI Engine is live!"}