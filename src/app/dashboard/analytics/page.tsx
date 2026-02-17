'use client';
import { useState } from 'react';
import { Sparkles, ShieldCheck, Zap, BrainCircuit } from 'lucide-react';
import AILogger from '@/components/guardrails/AILogger';

export default function UniversalDashboard() {
  const [description, setDescription] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-1000">
      {/* AI Status Header */}
      <div className="flex items-center justify-between bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-full animate-pulse">
            <BrainCircuit className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-widest">FinPulse Agentic AI</h1>
            <p className="text-[10px] text-blue-400 font-mono">Status: Observing Global Markets & User Patterns</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Input Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-light text-white">What happened in your <span className="text-blue-500 font-bold italic">Financial Life</span> today?</h2>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <textarea 
              className="relative w-full bg-[#050914] border border-white/10 rounded-2xl p-6 text-white text-lg focus:outline-none focus:border-blue-500 transition-all h-32"
              placeholder="e.g. Just paid my apartment rental deposit in Bangalore..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 py-4 rounded-xl font-bold text-white shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3">
            <Sparkles size={20} /> Let AI Analyze Patterns
          </button>
        </div>

        {/* AI Reasoning Log (The "Human" Touch) */}
        <div className="bg-[#0d1425] border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Zap size={100} className="text-blue-500" />
          </div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Agentic Reasoning Core</h3>
          <AILogger logs={logs} />
        </div>
      </div>
    </div>
  );
}