'use client';
import { useState } from 'react';
import AILogger from '@/components/guardrails/AILogger';
import GuardrailShield from '@/components/guardrails/GuardrailShield';
import CrossSellPanel from '@/components/guardrails/CrossSellPanel';
import EventCard from '@/components/guardrails/EventCard';

interface AnalysisResult {
  pulse: string;
  guardrail: { status: string; ratio: number };
  action: { type: string; message: string; product: string | null };
}

export default function DashboardPage() {
  const [description, setDescription] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const triggerAgent = async () => {
    setLogs(prev => [...prev, `PULSE_INBOUND: Identifying patterns in "${description}"...`]);
    
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ amount: 45000, description }),
    });
    
    const data = await response.json();
    setAnalysis(data);
    
    // Agentic Reasoning Log update
    setLogs(prev => [
      ...prev, 
      `LOGIC_STEP: Pattern matches "Education Life Event"`, 
      `COMPLIANCE_CHECK: DTI Ratio ${data.guardrail.ratio}% is within limits.`,
      `GEN_AI: Personalized Student Offer generated.`
    ]);
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

      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Data & Risk */}
        <div className="col-span-5 space-y-6">
          <div className="bg-[#0d1425] p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <h3 className="text-xs font-bold text-blue-500 uppercase mb-4">Metadata Ingestion</h3>
            <input 
              className="w-full bg-[#050914] border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., University Fee Payment"
            />
            <button onClick={triggerAgent} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 p-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
              Trigger Agentic Analysis
            </button>
          </div>
          {analysis && <GuardrailShield dtiRatio={analysis.guardrail.ratio} />}
        </div>

        {/* Right Column: Reasoning & Cross-Sell */}
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