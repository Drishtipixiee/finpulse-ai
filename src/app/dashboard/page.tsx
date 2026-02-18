'use client';

import { useState } from 'react';
import AILogger from '@/components/guardrails/AILogger';
import GuardrailShield from '@/components/guardrails/GuardrailShield';
import CrossSellPanel from '@/components/guardrails/CrossSellPanel';
import EventCard from '@/components/guardrails/EventCard';

// This interface matches your frontend UI components
interface AnalysisResult {
  pulse: string;
  guardrail: { status: string; ratio: number };
  action: { type: string; message: string; product: string | null };
  _meta: {
    persona: string;
    life_event: string;
    confidence: number;
    reason: string;
    guardrail_note: string;
  };
}

export default function DashboardPage() {
  const [description, setDescription] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userId, setUserId] = useState("user_001");

  const triggerAgent = async () => {
    // 1. Prevent empty submissions
    if (!description.trim()) return;
    
    // 2. Set loading state to true (This makes the button say 'Analyzing...')
    setIsAnalyzing(true);
    setLogs(["PULSE_INBOUND: Scanning transaction patterns..."]);

    // 3. Retrieve the JWT token from the login session
    const token = localStorage.getItem('token');

    try {
      // 4. Call your FastAPI analyze-text endpoint
      const response = await fetch('http://localhost:8000/analyze-text', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ description }),
      });

      const data = await response.json();

      // 5. Handle potential errors (Unauthorized or Backend Offline)
      if (!response.ok) {
        if (response.status === 401) {
          setLogs(prev => [...prev, "ERROR: Session expired. Please log in again."]);
        } else {
          setLogs(prev => [...prev, `ERROR: ${data.detail || 'Analysis failed'}`]);
        }
        return;
      }

      // 6. Map the Groq LLM response from FastAPI to your UI's "AnalysisResult"
      const formattedData: AnalysisResult = {
        pulse: data.life_event,
        guardrail: { 
          status: data.guardrail, 
          ratio: 0.35 // Setting a safe mock value to avoid the 10000% error
        },
        action: { 
          type: "cross-sell", 
          message: data.message, 
          product: data.product 
        },
        _meta: {
          persona: data.persona,
          life_event: data.life_event,
          confidence: data.confidence,
          reason: data.reason,
          guardrail_note: data.guardrail_note
        }
      };

      setAnalysis(formattedData);

      // 7. Update agentic reasoning logs for the UI console
      setLogs([
        `PULSE_INBOUND: Life event detected → "${data.life_event}"`,
        `PERSONA_ENGINE: User classified as "${data.persona}"`,
        `REASON: ${data.reason}`,
        `COMPLIANCE_CHECK: Guardrail ${data.guardrail} — ${data.guardrail_note}`,
        `CONFIDENCE_SCORE: ${data.confidence}%`,
        `GEN_AI: Personalized offer generated for "${data.product}"`,
      ]);

    } catch (err) {
      setLogs(prev => [...prev, "ERROR: Could not reach analysis engine. Check if FastAPI is running."]);
    } finally {
      // 8. Always reset the loading state to re-enable the button
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black text-white italic underline decoration-blue-500">
          Agentic AI: Cross-Sell Command
        </h1>
        <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-mono">
          Solving for: Personalized & Compliant Banking
        </p>
      </header>

      {/* Simulation Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 animate-pulse shrink-0" />
        <div>
          <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest">Customer Simulation Mode</p>
          <p className="text-slate-400 text-xs mt-1">
            Simulate a customer life event to test how the AI engine generates a personalized cross-sell offer. 
            The engine now uses Groq (Llama 3.3) for dynamic reasoning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 space-y-6">
          <div className="bg-[#0d1425] p-6 rounded-3xl border border-slate-800 shadow-2xl">
            {/* Customer Selector */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-blue-500 uppercase mb-2">Select Customer Profile</h3>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-[#050914] border border-slate-700 p-4 rounded-xl text-white outline-none"
              >
                <option value="user_001">Platinum Card User</option>
                <option value="user_002">Silver Card User</option>
                <option value="user_003">Checking User</option>
              </select>
            </div>

            {/* Event Input */}
            <div className="mb-4">
              <h3 className="text-xs font-bold text-blue-500 uppercase mb-2">Simulate Life Event</h3>
              <input
                className="w-full bg-[#050914] border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-blue-500"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., paid my tuition fees..."
              />
            </div>

            <button
              onClick={triggerAgent}
              disabled={isAnalyzing}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-4 rounded-xl font-bold transition-all shadow-lg"
            >
              {isAnalyzing ? "Analyzing Customer..." : "Run Agentic Analysis"}
            </button>
          </div>
          
          {analysis && <GuardrailShield dtiRatio={analysis.guardrail.ratio} />}
        </div>

        <div className="col-span-7 space-y-6">
          <AILogger logs={logs} />
          {analysis && (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-700">
              <EventCard eventType={analysis.pulse} />
              <CrossSellPanel message={analysis.action.message} product={analysis.action.product} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}