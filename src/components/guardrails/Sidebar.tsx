import { LayoutDashboard, Wallet, ShieldCheck, Gift, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard />, href: '/dashboard' },
    { name: 'Portfolio', icon: <Wallet />, href: '/portfolio' },
    { name: 'Safety Center', icon: <ShieldCheck />, href: '/settings' },
    { name: 'Special Offers', icon: <Gift />, href: '/offers' },
  ];

  return (
    <nav className="w-64 bg-slate-900 h-screen p-6 border-r border-slate-800 flex flex-col">
      <h2 className="text-2xl font-bold text-blue-400 mb-10">FinPulse AI</h2>
      <div className="space-y-2 flex-1">
        {menuItems.map((item) => (
          <Link key={item.name} href={item.href} className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-600/20 text-slate-300 hover:text-white transition-all">
            {item.icon} <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </div>
      <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
        <p className="text-[10px] uppercase text-blue-400 font-bold">System Integrity</p>
        <p className="text-xs text-slate-400">Guardrails: Active</p>
      </div>
    </nav>
  );
}