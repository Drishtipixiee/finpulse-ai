import { TrendingUp, CreditCard, PieChart } from 'lucide-react';

export default function PortfolioPage() {
  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Portfolio Intelligence</h1>
      <div className="grid grid-cols-3 gap-6">
        {/* Stat Cards */}
        <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
          <PieChart className="text-purple-400 mb-2" />
          <p className="text-slate-400 text-sm">Wealth Distribution</p>
          <p className="text-2xl font-bold">₹4,50,000</p>
        </div>
        {/* Add 2 more cards for Credit Score and Total Savings */}
      </div>
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 h-64 flex items-center justify-center italic text-slate-500">
        [Live Chart Component Hooked to Python/Java Viz Logic]
      </div>
    </div>
  );
}