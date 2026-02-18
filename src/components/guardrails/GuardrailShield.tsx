import React from 'react';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

interface GuardrailProps {
  dtiRatio: number;
}

export default function GuardrailShield({ dtiRatio }: GuardrailProps) {
  const isSafe = dtiRatio < 0.45;

  return (
    <div className={`p-4 rounded-xl flex items-center gap-4 border transition-all ${
      isSafe ? 'bg-green-500/10 border-green-500/50' : 'bg-red-500/10 border-red-500/50'
    }`}>
      {isSafe ? (
        <ShieldCheck className="text-green-500 animate-pulse" size={24} />
      ) : (
        <ShieldAlert className="text-red-500 animate-bounce" size={24} />
      )}
      <div>
        <p className={`font-bold text-sm ${isSafe ? 'text-green-400' : 'text-red-400'}`}>
          Guardrail: {isSafe ? 'PASSED' : 'ACTION REQUIRED'}
        </p>
        <p className="text-xs text-gray-400">DTI Ratio: {(dtiRatio * 100).toFixed(1)}%</p>
      </div>
    </div>
  );
}