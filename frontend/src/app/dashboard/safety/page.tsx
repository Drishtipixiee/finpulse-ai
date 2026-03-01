'use client';
import { useEffect, useState } from 'react';
import { ShieldCheck, Lock, Eye, AlertCircle, Scale, Activity } from 'lucide-react';

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
export default function SafetyPage() {
  const [stats, setStats] = useState({
    total_analyses: 0,
    total_blocked: 0,
    compliance_rate: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { 'Authorization': `Bearer ${token}` };
      try {
        const guardRes = await fetch(`${FASTAPI_URL}/admin/guardrail-blocks`, { headers }).then(r => r.json());
        const total = guardRes.total_users ?? 0;
        const blocked = guardRes.total_blocked ?? 0;
        setStats({
          total_analyses: total,
          total_blocked: blocked,
          compliance_rate: total > 0 ? Math.round(((total - blocked) / total) * 100) : 100,
        });
      } catch {
        // silently fail
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white tracking-tight">Compliance & Safety Controls</h1>
        <p className="text-slate-500 text-sm mt-1">Configuring Agentic Guardrails for Responsible Banking</p>
      </header>

      {/* 2 Compliance-only stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0d1425] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-green-400" />
            <p className="text-xs text-slate-500 uppercase font-bold">Compliance Rate</p>
          </div>
          <p className="text-5xl font-black text-white">{stats.compliance_rate}%</p>
          <p className="text-[10px] text-green-400 mt-2">Offers that passed all safety checks</p>
        </div>
        <div className="bg-[#0d1425] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={16} className="text-red-400" />
            <p className="text-xs text-slate-500 uppercase font-bold">Offers Blocked</p>
          </div>
          <p className="text-5xl font-black text-white">{stats.total_blocked}</p>
          <p className="text-[10px] text-red-400 mt-2">Predatory offers prevented by guardrails</p>
        </div>
      </div>

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
                    <p className="text-[10px] text-slate-500">Auto-block if Debt-to-Income exceeds 60%</p>
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

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <Activity className="text-yellow-500" size={20} />
                  <div>
                    <p className="text-sm font-bold text-white">Audit Trail Logging</p>
                    <p className="text-[10px] text-slate-500">Every analysis logged with employee ID + timestamp</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-bold uppercase">Active</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-500" size={20} />
                  <div>
                    <p className="text-sm font-bold text-white">Predatory Offer Prevention</p>
                    <p className="text-[10px] text-slate-500">Switches to financial counseling for high-risk profiles</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-bold uppercase">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Eye size={20} />
              <span className="font-bold text-sm">Explainability Hub</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "Every cross-sell recommendation is logged with its supporting reasoning, persona classification, and confidence score — ensuring full auditability."
            </p>
          </div>

          <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-3xl">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertCircle size={20} />
              <span className="font-bold text-sm">Regulatory Breach Prevention</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              If risk scoring indicates high vulnerability, the agent switches from cross-selling to financial counseling automatically.
            </p>
          </div>

          <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-3xl">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <ShieldCheck size={20} />
              <span className="font-bold text-sm">Compliance Summary</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              <span className="text-white font-bold">{stats.compliance_rate}%</span> of all analyses passed compliance checks.
              {' '}<span className="text-white font-bold">{stats.total_blocked}</span> offers were blocked to protect customers from predatory recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}