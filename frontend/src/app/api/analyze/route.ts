import { NextResponse } from 'next/server';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

const PULSE_MAP: Record<string, string> = {
  higher_education:  "Education Event",
  frequent_traveler: "Travel Pattern",
  renter:            "Rental Payment",
  employed:          "Salary Detected",
  unknown:           "Standard",
};

const ACTION_TYPE_MAP: Record<string, string> = {
  student:          "PROACTIVE_OFFER",
  spender:          "PROACTIVE_OFFER",
  saver:            "PROACTIVE_OFFER",
  credit_dependent: "SAFETY_ADVICE",
  general:          "NEUTRAL",
};

export async function POST(req: Request) {
  try {
    const { user_id = "user_001", description = "" } = await req.json();

    // ✅ Endpoint logic is INSIDE the function
    const endpoint = description.trim()
      ? `${FASTAPI_URL}/analyze-text`
      : `${FASTAPI_URL}/analyze/${user_id}`;

    const fastapiRes = await fetch(endpoint, {
      method: description.trim() ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
      ...(description.trim() && { body: JSON.stringify({ description }) })
    });

    if (!fastapiRes.ok) {
      throw new Error(`FastAPI error: ${fastapiRes.status}`);
    }

    const data = await fastapiRes.json();
    const dtiRatio = data.confidence / 100;

    return NextResponse.json({
      success: true,
      pulse:     PULSE_MAP[data.life_event] ?? "Standard",
      guardrail: {
        status: data.guardrail === "passed" ? "PASS" : "ALERT",
        ratio:  dtiRatio,
      },
      action: {
        type:    ACTION_TYPE_MAP[data.persona] ?? "NEUTRAL",
        message: data.message,
        product: data.product,
      },
      _meta: {
        persona:        data.persona,
        life_event:     data.life_event,
        confidence:     data.confidence,
        reason:         data.reason,
        guardrail_note: data.guardrail_note,
      }
    });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "System Latency" },
      { status: 500 }
    );
  }
}