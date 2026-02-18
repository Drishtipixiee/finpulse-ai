import React from 'react';
import { Gift, ArrowRight } from 'lucide-react';

interface CrossSellProps {
  message: string;
  product: string | null;
}

export default function CrossSellPanel({ message, product }: CrossSellProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 p-6 rounded-3xl border border-blue-500/30 shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
          <Gift size={20} className="text-white"/>
        </div>
        <h3 className="font-bold text-white tracking-tight">AI Generated Offer</h3>
      </div>
      
      <p className="text-blue-100 text-sm leading-relaxed italic mb-6">
        &quot;{message}&quot;
      </p>

      {product && (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
          <span className="text-xs font-medium text-slate-400">Target Product: <span className="text-blue-400">{product}</span></span>
          <button className="flex items-center gap-2 text-xs font-bold text-white hover:text-blue-400 transition-colors">
            Apply Now <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}