import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, description } = await req.json();

    // 1. Pulse Engine: Logic to detect Life-Events
    const isEducation = description.toLowerCase().includes('university');
    
    // 2. Persona Check: Simulated Vector DB logic
    const userPersona = "Second Year Student"; 

    // 3. Guardrail: Compliance & DTI Safety Check
    const dtiRatio = 0.35; // Simulated data
    const isSafe = dtiRatio < 0.45; 

    // 4. Context Engine: Personalized Advice
    const recommendation = isEducation && isSafe 
      ? "Preparing for studies? Get 0% Forex on our Student Travel Card instead of a standard loan."
      : "Standard transaction recorded. Focus on your monthly savings goal.";

    return NextResponse.json({
      status: "success",
      analysis: isEducation ? "Higher Ed Life-Event" : "Standard Transaction",
      recommendation: recommendation,
      persona: userPersona,
      guardrailPassed: isSafe
    });
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Failed to analyze" }, { status: 500 });
  }
}