'use client';
import { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const PERSONA_COLORS: Record<string, string> = {
  student: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  spender: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  saver: 'text-green-400 bg-green-400/10 border-green-400/30',
  credit_dependent: 'text-red-400 bg-red-400/10 border-red-400/30',
  general: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
};

export default function AnalyticsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, number>>({});
  const [personas, setPersonas] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setError('Please log in.'); setLoading(false); return; }
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [uRes, pRes] = await Promise.all([
          fetch(`${FASTAPI_URL}/admin/all-users`, { headers }).then(r => r.json()),
          fetch(`${FASTAPI_URL}/admin/product-stats`, { headers }).then(r => r.json()),
        ]);
        setUsers(uRes.users || []);
        setProducts(pRes.product_distribution || {});
        setPersonas(pRes.persona_distribution || {});
      } catch { setError('Sync Error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const totalSessions = users.length;
  const topProduct = Object.entries(products).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const groupedUsers = users.reduce((acc: any[], current: any) => {
    if (!acc.find(item => item.user_id === current.user_id)) acc.push(current);
    return acc;
  }, []);

  if (loading) return <div className="p-8 text-white">Loading Analytics...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black text-white italic underline decoration-blue-500">Risk Analytics</h1>
        <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-mono">AI Recommendation Intelligence</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0d1425] p-6 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-bold mb-2">Total Sessions</p>
          <p className="text-4xl font-black text-white">{totalSessions}</p>
          <p className="text-[10px] text-slate-500 mt-1">Analyses run by analysts</p>
        </div>
        <div className="bg-[#0d1425] p-6 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-bold mb-2">Unique Customers</p>
          <p className="text-4xl font-black text-white">{groupedUsers.length}</p>
          <p className="text-[10px] text-slate-500 mt-1">Distinct customer profiles</p>
        </div>
        <div className="bg-[#0d1425] p-6 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-bold mb-2">Top Product</p>
          <p className="text-lg font-black text-white capitalize">{topProduct}</p>
          <p className="text-[10px] text-slate-500 mt-1">Most recommended product</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Customer Sessions */}
        <div className="col-span-7 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Session Feed</h3>
          {groupedUsers.length === 0 ? (
            <div className="p-20 border border-dashed border-slate-800 rounded-3xl text-center text-slate-600">
              No data found. Analyze a transaction first.
            </div>
          ) : (
            groupedUsers.map((user, idx) => (
              <div key={`${user.user_id}-${idx}`} className="bg-[#0d1425] border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <span className="text-xs font-black text-white">{user.user_id}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${PERSONA_COLORS[user.persona] || PERSONA_COLORS.general}`}>
                      {user.persona}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {(user.life_event || "activity").replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {user.guardrail === 'passed'
                      ? <ShieldCheck size={14} className="text-green-500" />
                      : <ShieldAlert size={14} className="text-red-500" />
                    }
                    <span className="text-xs font-bold text-blue-500">{user.confidence}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-400 italic">"{user.reason || 'No reasoning provided.'}"</p>
                  <span className="text-[10px] text-blue-400 font-bold capitalize ml-4 shrink-0">{user.product}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column — Product + Persona Distribution */}
        <div className="col-span-5 space-y-6">
          <div className="bg-[#0d1425] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Product Distribution</h3>
            <div className="space-y-3">
              {Object.entries(products).length === 0 ? (
                <p className="text-slate-600 text-xs">No data yet.</p>
              ) : Object.entries(products).sort((a, b) => b[1] - a[1]).map(([product, count]) => (
                <div key={product} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 capitalize">{product}</span>
                    <span className="text-slate-500">{count} sessions</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${(count / totalSessions) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0d1425] border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Persona Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(personas).length === 0 ? (
                <p className="text-slate-600 text-xs">No data yet.</p>
              ) : Object.entries(personas).map(([persona, count]) => (
                <div key={persona} className="flex items-center justify-between p-2 rounded-lg bg-slate-900">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${PERSONA_COLORS[persona] ?? PERSONA_COLORS.general}`}>
                    {persona}
                  </span>
                  <span className="text-xs text-slate-400">{count} sessions</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}