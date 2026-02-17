'use client';
import { User, ShieldCheck, Mail, MapPin, Briefcase, PieChart } from 'lucide-react';

export default function ProfilePage() {
  // Static data representing the "analyzed customer data" from your problem statement
  const customer = {
    name: "Drishti Mishra",
    email: "drishti.it@student.in",
    segment: "Premier Student",
    location: "Mumbai, India",
    riskScore: "842 (Excellent)",
    dtiRatio: "32.4%",
    employment: "Student / Intern"
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-white tracking-tight">Customer Intelligence Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Data-driven demographics for agentic cross-selling</p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {/* Profile Card */}
        <div className="col-span-12 lg:col-span-4 bg-[#0d1425] border border-slate-800 p-8 rounded-3xl flex flex-col items-center text-center shadow-2xl">
          <div className="w-24 h-24 bg-blue-600/20 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
            <User size={48} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-white">{customer.name}</h2>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase rounded-full mt-2 border border-blue-500/20">
            {customer.segment}
          </span>
          
          <div className="w-full mt-8 space-y-4 text-left border-t border-slate-800 pt-6">
            <div className="flex items-center gap-3 text-slate-400 text-sm"><Mail size={16}/> {customer.email}</div>
            <div className="flex items-center gap-3 text-slate-400 text-sm"><MapPin size={16}/> {customer.location}</div>
            <div className="flex items-center gap-3 text-slate-400 text-sm"><Briefcase size={16}/> {customer.employment}</div>
          </div>
        </div>

        {/* Risk & Financial Health */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-[#0d1425] border border-emerald-500/20 rounded-3xl shadow-xl">
              <ShieldCheck className="text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-slate-500 uppercase">Risk Assessment</p>
              <p className="text-2xl font-black text-white">{customer.riskScore}</p>
            </div>
            <div className="p-6 bg-[#0d1425] border border-purple-500/20 rounded-3xl shadow-xl">
              <PieChart className="text-purple-500 mb-2" />
              <p className="text-xs font-bold text-slate-500 uppercase">DTI Ratio</p>
              <p className="text-2xl font-black text-white">{customer.dtiRatio}</p>
            </div>
          </div>

          <div className="p-8 bg-gradient-to-br from-slate-900 to-[#0d1425] border border-slate-800 rounded-3xl">
            <h3 className="text-sm font-bold text-slate-300 mb-4 uppercase tracking-widest">Agentic Insights</h3>
            <p className="text-slate-400 text-sm leading-relaxed italic">
              &quot;User patterns indicate high spending on education services. Guardrail Engine confirms low-risk status, making the user eligible for <strong>Student Forex Products</strong> and <strong>Semester Loans</strong>.&quot;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}