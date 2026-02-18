import pandas as pd
from groq import Groq

# ── Config ────────────────────────────────────────────────
USE_DATABASE = False  # flip to True tomorrow if adding PostgreSQL

ACCOUNT_TO_USER = {
    "Platinum Card": "user_001",
    "Silver Card":   "user_002",
    "Checking":      "user_003"
}

CATEGORY_MAP = {
    "Restaurants":          "Food",
    "Fast Food":            "Food",
    "Groceries":            "Food",
    "Paycheck":             "Salary",
    "Mortgage & Rent":      "Rent",
    "Gas & Fuel":           "Travel",
    "Air Travel":           "Travel",
    "Shopping":             "Shopping",
    "Movies & Dvds":        "Entertainment",
    "Music":                "Entertainment",
    "Utilities":            "Utilities",
    "Mobile Phone":         "Utilities",
    "Home Improvement":     "Lifestyle",
    "Credit Card Payment":  "Payment",
    "Education":            "Education",
    "Transfer":             "Transfer"
}

GROQ_API_KEY = "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"  

# ── Function 1: Load Data ─────────────────────────────────
def load_user_transactions(user_id: str):
    df = pd.read_csv("data/transactions.csv")

    df["user_id"]  = df["Account Name"].map(ACCOUNT_TO_USER)
    df["category"] = df["Category"].map(CATEGORY_MAP).fillna("Other")
    df = df.rename(columns={
        "Date":             "date",
        "Amount":           "amount",
        "Transaction Type": "type",
        "Description":      "description"
    })

    user_df = df[df["user_id"] == user_id]

    if user_df.empty:
        return []

    return user_df[["user_id", "date", "amount", "category", "type", "description"]].to_dict(orient="records")

# ── Function 2: Behaviour Detection ──────────────────────
def detect_behaviour(transactions):
    food        = sum(1 for t in transactions if t["category"] == "Food")
    travel      = sum(1 for t in transactions if t["category"] == "Travel")
    salary      = sum(1 for t in transactions if t["category"] == "Salary")
    education   = sum(1 for t in transactions if t["category"] == "Education")
    rent        = sum(1 for t in transactions if t["category"] == "Rent")
    shopping    = sum(1 for t in transactions if t["category"] == "Shopping")
    entertainment = sum(1 for t in transactions if t["category"] == "Entertainment")

    amounts  = [t["amount"] for t in transactions]
    credits  = [t["amount"] for t in transactions if t["type"] == "credit"]
    debits   = [t["amount"] for t in transactions if t["type"] == "debit"]

    total_spent  = sum(debits)
    total_income = sum(credits)
    low_balance  = (total_income - total_spent) < 500

    return {
        "food_count":           food,
        "travel_count":         travel,
        "salary_detected":      salary > 0,
        "education_count":      education,
        "rent_count":           rent,
        "shopping_count":       shopping,
        "entertainment_count":  entertainment,
        "total_spent":          round(total_spent, 2),
        "total_income":         round(total_income, 2),
        "low_balance":          low_balance,
        "food_spending":        "high" if food > 5 else "low",
        "is_traveler":          travel > 3,
    }

# ── Function 3: Life Event Detection ─────────────────────
def detect_life_event(behaviour):
    if behaviour["education_count"] >= 2:
        return "higher_education"
    if behaviour["is_traveler"]:
        return "frequent_traveler"
    if behaviour["rent_count"] >= 2:
        return "renter"
    if behaviour["salary_detected"]:
        return "employed"
    return "unknown"

# ── Function 4: Persona Creation ─────────────────────────
def detect_persona(behaviour, life_event):
    if life_event == "higher_education":
        return "student"
    if behaviour["low_balance"] and behaviour["salary_detected"]:
        return "credit_dependent"
    if behaviour["food_spending"] == "high" or behaviour["is_traveler"]:
        return "spender"
    if behaviour["shopping_count"] > 5:
        return "spender"
    if not behaviour["low_balance"] and behaviour["salary_detected"]:
        return "saver"
    return "general"

# ── Function 5: Product Recommendation ───────────────────
def recommend_product(persona, life_event):
    if life_event == "frequent_traveler":
        return "travel card"
    mapping = {
        "spender":          "cashback card",
        "student":          "education loan",
        "credit_dependent": "overdraft protection",
        "saver":            "SIP investment",
        "general":          "basic savings account"
    }
    return mapping.get(persona, "basic savings account")

# ── Function 6: Confidence Score ─────────────────────────
def calculate_confidence(behaviour, persona, life_event):
    score = 0
    if behaviour["salary_detected"]:        score += 30
    if behaviour["food_count"] > 10:        score += 40
    elif behaviour["food_count"] > 5:       score += 20
    if behaviour["is_traveler"]:            score += 20
    if behaviour["education_count"] >= 2:   score += 30
    if behaviour["rent_count"] >= 2:        score += 20
    if behaviour["shopping_count"] > 5:     score += 15
    if life_event != "unknown":             score += 20
    if persona != "general":               score += 10
    return min(score, 100)

# ── Function 7: Guardrail Safety Check ───────────────────
def guardrail_check(persona, behaviour, product):
    blocked       = False
    reason        = "all checks passed"
    final_product = product

    if behaviour["low_balance"] and product in ["education loan", "overdraft protection"]:
        blocked       = True
        final_product = "basic savings account"
        reason        = "blocked: low balance — safer product assigned"

    if product == "travel card" and not behaviour["is_traveler"]:
        blocked       = True
        final_product = "cashback card"
        reason        = "blocked: travel card not suitable — cashback assigned"

    if product == "SIP investment" and behaviour["low_balance"]:
        blocked       = True
        final_product = "recurring deposit"
        reason        = "blocked: low balance — recurring deposit suggested instead"

    return {
        "guardrail":        "blocked" if blocked else "passed",
        "guardrail_reason": reason,
        "final_product":    final_product
    }

# ── Function 8: Generate Reason ──────────────────────────
def generate_reason(behaviour, persona, life_event):
    parts = []
    if behaviour["food_count"] > 5:
        parts.append(f"frequent food transactions ({behaviour['food_count']} times)")
    if behaviour["is_traveler"]:
        parts.append(f"travel spending detected ({behaviour['travel_count']} trips)")
    if behaviour["education_count"] >= 2:
        parts.append(f"education payments found ({behaviour['education_count']} times)")
    if behaviour["low_balance"]:
        parts.append("low balance detected")
    if behaviour["salary_detected"]:
        parts.append("regular salary income confirmed")
    if behaviour["shopping_count"] > 5:
        parts.append(f"high shopping activity ({behaviour['shopping_count']} transactions)")
    if behaviour["rent_count"] >= 2:
        parts.append(f"regular rent payments ({behaviour['rent_count']} times)")

    reason = ", ".join(parts) if parts else "general spending pattern observed"
    return f"User identified as {persona} due to: {reason}."

# ── Function 9: LLM Personalised Message ─────────────────
def generate_llm_message(persona, product, reason):
    try:
        client = Groq(api_key=GROQ_API_KEY)
        prompt = f"""
        You are a warm friendly bank assistant.
        Customer type: {persona}
        Recommended product: {product}
        Why: {reason}
        Write a short 2 line personalised message recommending 
        this product. Be friendly and specific, not robotic.
        """
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"GROQ ERROR: {e}")
        return f"Based on your profile, we recommend our {product} — perfectly suited for your lifestyle."

# ── Function 10: Master analyze_user Function ─────────────
def analyze_user(user_id: str):
    transactions = load_user_transactions(user_id)

    if not transactions:
        return {"error": f"No data found for user {user_id}"}

    behaviour  = detect_behaviour(transactions)
    life_event = detect_life_event(behaviour)
    persona    = detect_persona(behaviour, life_event)
    product    = recommend_product(persona, life_event)
    confidence = calculate_confidence(behaviour, persona, life_event)
    guardrail  = guardrail_check(persona, behaviour, product)
    reason     = generate_reason(behaviour, persona, life_event)
    message    = generate_llm_message(persona, guardrail["final_product"], reason)

    return {
        "user_id":        user_id,
        "persona":        persona,
        "life_event":     life_event,
        "product":        guardrail["final_product"],
        "confidence":     confidence,
        "reason":         reason,
        "guardrail":      guardrail["guardrail"],
        "guardrail_note": guardrail["guardrail_reason"],
        "message":        message
    }

# ── Quick Test ────────────────────────────────────────────
if __name__ == "__main__":
    for user in ["user_001", "user_002", "user_003"]:
        print(f"\n{'='*50}")
        result = analyze_user(user)
        for key, value in result.items():
            print(f"{key}: {value}")            