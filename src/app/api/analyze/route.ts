import { NextResponse } from 'next/server';

// Interface to prevent TypeScript errors
interface Action {
  type: string;
  message: string;
  product: string | null;
}

const DTI_LIMIT = 0.45; // Banking safety threshold

export async function POST(req: Request) {
  try {
    const { amount, description, monthlyIncome = 80000 } = await req.json();

    // 1. PULSE ENGINE: Pattern Recognition
    const isEducation = description.toLowerCase().includes('university');

    // 2. GUARDRAIL ENGINE: Risk Assessment
    const dtiRatio = amount / monthlyIncome;
    const isSafe = dtiRatio < DTI_LIMIT;

    // 3. CONTEXT ENGINE: Intelligent Decisioning
    let action: Action = {
      type: "NEUTRAL",
      message: "Transaction analyzed successfully.",
      product: null
    };

    if (isEducation) {
      if (isSafe) {
        action = {
          type: "PROACTIVE_OFFER",
          message: "University fee detected. We recommend our 0% Forex Student Card for your international studies.",
          product: "Student Forex Card"
        };
      } else {
        action = {
          type: "SAFETY_ADVICE",
          message: "Education payment detected. To maintain financial health, we suggest a Smart Savings SIP.",
          product: "Education SIP Plan"
        };
      }
    }

    return NextResponse.json({
      success: true,
      pulse: isEducation ? "Education Event" : "Standard",
      guardrail: { status: isSafe ? "PASS" : "ALERT", ratio: dtiRatio },
      action
    });
 } catch {
    // Simply remove the (_error) entirely if you aren't using it
    return NextResponse.json({ success: false, error: "System Latency" }, { status: 500 });
  }
}