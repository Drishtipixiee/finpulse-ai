'use client';
import { useState } from 'react';
import GuardrailShield from '@/components/guardrails/GuardrailShield';
import AILogger from '@/components/guardrails/AILogger';

// Define the shape of our data to satisfy TypeScript
interface AnalysisData {
  pulse: string;
  guardrail: { status: string; ratio: number };
  action: { type: string; message: string; product: string | null };
}

export default function FinPulseDashboard() {
  const [description, setDescription] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  // Fix 1: Replaced 'any' with the proper 'AnalysisData' interface
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSimulate = async () => {
    if (!description) return;
    setLoading(true);
    setLogs(prev => [...prev, `PULSE_START: Analyzing "${description}"...`]);
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 25000, description }),
      });
      const data = await response.json();
      setAnalysis(data);
      setLogs(prev => [...prev, `EVENT: ${data.pulse}`, `ACTION: ${data.action.type}`]);
   } catch {
  // Removing '(_err)' entirely clears the "defined but never used" warning
  setLogs(prev => [...prev, "SYSTEM_ERROR: Intelligence Core Latency"]);
}
      finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          FinPulse AI Core
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <input 
              type="text" 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., University Fee"
            />
            <button onClick={handleSimulate} className="w-full bg-blue-600 p-3 rounded-lg font-bold">
              {loading ? 'Processing...' : 'Run Pulse Engine'}
            </button>
            {analysis && <GuardrailShield dtiRatio={analysis.guardrail.ratio} />}
          </div>

          <div className="space-y-4">
            <AILogger logs={logs} />
            {analysis && (
              <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                <h3 className="text-blue-400 font-bold mb-2 uppercase text-xs">AI recommendation</h3>
                {/* Fix 3: Replaced raw quotes with &quot; to satisfy ESLint */}
                <p className="text-sm leading-relaxed text-blue-100 italic">
                  &quot;{analysis.action.message}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}