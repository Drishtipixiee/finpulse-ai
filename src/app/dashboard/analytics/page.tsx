'use client';
import { TrendingUp, AlertTriangle, CheckCircle2, BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in zoom-in-95 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Behavioral Risk Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time pattern recognition and risk scoring</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Spending Patterns */}
        <div className="col-span-12 lg:col-span-8 bg-[#0d1425] border border-slate-800 p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-300 flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-500" />
              Category Spend Analysis
            </h3>
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 uppercase font-mono">Status: High Confidence</span>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                <span className="text-slate-400">Education & Fees</span>
                <span className="text-blue-400">72% of Monthly Outflow</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-blue-500 w-[72%] shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                <span className="text-slate-400">Lifestyle & Travel</span>
                <span className="text-slate-500">12%</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-slate-700 w-[12%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <CheckCircle2 size={20} />
              <span className="font-bold text-sm">Compliant Profile</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              DTI Ratio is 32.4%. User is cleared for personalized credit products.
            </p>
          </div>

          <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <TrendingUp size={20} />
              <span className="font-bold text-sm">Life-Event Signal</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Consistent university fee payments detected in Semester 1, 2, and 3.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}