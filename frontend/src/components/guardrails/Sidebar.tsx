import React from 'react';
import { LayoutDashboard, User, ShieldCheck, TrendingUp, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const menuItems = [
    { name: 'Intelligence Hub', icon: <LayoutDashboard size={20}/>, href: '/dashboard' },
    { name: 'Customer Profile', icon: <User size={20}/>, href: '/dashboard/profile' },
    { name: 'Risk Analytics', icon: <TrendingUp size={20}/>, href: '/dashboard/analytics' },
    { name: 'Safety Controls', icon: <ShieldCheck size={20}/>, href: '/dashboard/safety' },
  ];

  return (
    <nav className="w-72 bg-[#0d1425] border-r border-slate-800 p-8 flex flex-col shadow-2xl">
      <div className="mb-12">
        <h2 className="text-2xl font-black text-blue-500 tracking-tighter">FinPulse AI</h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Agentic Banking Core</p>
      </div>

      <div className="space-y-3 flex-1">
        {menuItems.map((item) => (
          <Link 
            key={item.name} 
            href={item.href} 
            className="flex items-center gap-4 p-4 rounded-xl hover:bg-blue-600/10 hover:text-blue-400 text-slate-400 transition-all group"
          >
            <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-semibold text-sm">{item.name}</span>
          </Link>
        ))}
      </div>

      <div className="pt-6 border-t border-slate-800">
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Guardrail Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">System compliant with DTI & Risk protocols.</p>
        </div>
      </div>
    </nav>
  );
}