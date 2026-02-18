'use client';
import { useEffect, useState } from 'react';
import { ShieldAlert, ShieldCheck, Users, Brain, Target, AlertTriangle, CheckCircle } from 'lucide-react';

const FASTAPI_URL = 'http://localhost:8000';
const PERSONA_COLORS: Record<string, string> = {
  student: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  spender: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  saver: 'text-green-400 bg-green-400/10 border-green-400/30',
  credit_dependent: 'text-red-400 bg-red-400/10 border-red-400/30',
  general: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
};

export default function AnalyticsPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ confidence: 0, users: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setError('Please log in.'); setLoading(false); return; }
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        const [uRes, cRes, gRes] = await Promise.all([
          fetch(`${FASTAPI_URL}/admin/all-users`, { headers }).then(r => r.json()),
          fetch(`${FASTAPI_URL}/admin/confidence-analytics`, { headers }).then(r => r.json()),
          fetch(`${FASTAPI_URL}/admin/guardrail-blocks`, { headers }).then(r => r.json()),
        ]);
        setUsers(uRes.users || []);
        setStats({ confidence: cRes.average_confidence, users: gRes.total_users });
      } catch (err) { setError('Sync Error'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  // Filter to show only ONE unique identity card
  const groupedUsers = (users || []).reduce((acc: any[], current: any) => {
    if (!acc.find(item => item.user_id === current.user_id)) acc.push(current);
    return acc;
  }, []);

  if (loading) return <div className="p-8 text-white">Loading Admin Data...</div>;

  return (
    <div className="p-8 space-y-8 animate-in fade-in">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black text-white italic underline decoration-blue-500">Risk Analytics</h1>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0d1425] p-6 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-bold">Total Sessions</p>
          <p className="text-4xl font-black text-white">{stats.users}</p>
        </div>
        <div className="bg-[#0d1425] p-6 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-bold">Unique Identities</p>
          <p className="text-4xl font-black text-white">{groupedUsers.length}</p>
        </div>
        <div className="bg-[#0d1425] p-6 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-500 uppercase font-bold">Avg Confidence</p>
          <p className="text-4xl font-black text-white">{stats.confidence}%</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Customer Profiles</h3>
        {groupedUsers.length === 0 ? (
          <div className="p-20 border border-dashed border-slate-800 rounded-3xl text-center text-slate-600">No data found. Analyze a transaction first.</div>
        ) : (
          groupedUsers.map((user, idx) => (
            <div key={`${user.user_id}-${idx}`} className="bg-[#0d1425] border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <span className="text-xs font-black text-white">{user.user_id}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${PERSONA_COLORS[user.persona] || PERSONA_COLORS.general}`}>{user.persona}</span>
                  <span className="text-[10px] text-slate-500 capitalize">{(user.life_event || "activity").replace(/_/g, ' ')}</span>
                </div>
                <span className="text-xs font-bold text-blue-500">{user.confidence}%</span>
              </div>
              <p className="text-[10px] text-slate-400 italic">"{user.reason || 'No reasoning provided.'}"</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}