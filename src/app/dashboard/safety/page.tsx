'use client';
import { ShieldCheck, Lock, Eye, AlertCircle, Scale } from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Compliance & Safety Controls</h1>
        <p className="text-slate-500 text-sm mt-1">Configuring Agentic Guardrails for Responsible Banking</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Active Guardrails */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="bg-[#0d1425] border border-slate-800 p-6 rounded-3xl shadow-2xl">
            <h3 className="font-bold text-slate-300 mb-6 flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-500" />
              Live Guardrail Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <Scale className="text-blue-500" size={20} />
                  <div>
                    <p className="text-sm font-bold text-white">DTI Threshold Check</p>
                    <p className="text-[10px] text-slate-500">Auto-block if Debt-to-Income exceeds 40%</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-bold uppercase">Active</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <Lock className="text-purple-500" size={20} />
                  <div>
                    <p className="text-sm font-bold text-white">PII Data Masking</p>
                    <p className="text-[10px] text-slate-500">Encrypting sensitive customer demographics</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-bold uppercase">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Integrity Sidebar */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Eye size={20} />
              <span className="font-bold text-sm">Explainability Hub</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              &quot;The agent must explain WHY an offer was made. Every cross-sell message is logged with its supporting transaction metadata.&quot;
            </p>
          </div>

          <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle size={20} />
              <span className="font-bold text-sm">Regulatory Breach Prevention</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If risk scoring indicates high vulnerability, the agent switches from cross-selling to financial counseling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}