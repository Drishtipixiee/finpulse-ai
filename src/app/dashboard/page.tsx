'use client';
import { useState } from 'react';
import AILogger from '@/components/guardrails/AILogger';
import GuardrailShield from '@/components/guardrails/GuardrailShield';
import CrossSellPanel from '@/components/guardrails/CrossSellPanel';

// Fix for Line 12: Define the interface for the Analysis
interface AnalysisResult {
  pulse: string;
  guardrail: { status: string; ratio: number };
  action: { type: string; message: string; product: string | null };
}

export default function DashboardPage() {
  const [description, setDescription] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  // Fix for Line 12: Use the interface instead of 'any'
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const triggerAgent = async () => {
    setLogs(prev => [...prev, `PULSE: Analyzing "${description}"...`]);
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ amount: 45000, description }),
    });
    const data = await response.json();
    setAnalysis(data);
    setLogs(prev => [...prev, `EVENT: ${data.pulse}`, `STATUS: COMPLIANT`]);
  };

  return (
    <div className="p-8 grid grid-cols-12 gap-6">
      <div className="col-span-5 space-y-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
          <input 
            className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter metadata..."
          />
          <button onClick={triggerAgent} className="w-full mt-4 bg-blue-600 p-4 rounded-xl font-bold">
            Analyze Life-Event
          </button>
        </div>
        {analysis && <GuardrailShield dtiRatio={analysis.guardrail.ratio} />}
      </div>

      <div className="col-span-7 space-y-6">
        <AILogger logs={logs} />
        {analysis && <CrossSellPanel message={analysis.action.message} product={analysis.action.product} />}
      </div>
    </div>
  );
}