'use client';
import { useEffect, useState } from 'react';
import { User, Brain, Target, ShieldCheck, ShieldAlert, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

interface UserResult {
  user_id: string;
  persona: string;
  life_event: string;
  product: string;
  confidence: number;
  reason: string;
  guardrail: string;
  guardrail_note: string;
  message: string;
  timestamp?: string;
}

interface UserListItem {
  user_id: string;
  name: string;
}

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const PERSONA_COLORS: Record<string, string> = {
  student: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  spender: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  saver: 'text-green-400 bg-green-400/10 border-green-400/30',
  credit_dependent: 'text-red-400 bg-red-400/10 border-red-400/30',
  general: 'text-slate-400 bg-slate-400/10 border-slate-400/30',
};

export default function ProfilePage() {
  const [userList, setUserList] = useState<UserListItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [sessions, setSessions] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch unique identities for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication session missing. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        // ✅ Fixed: using distinct-users endpoint
        const res = await fetch(`${FASTAPI_URL}/admin/distinct-users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.distinct_users && data.distinct_users.length > 0) {
          setUserList(data.distinct_users);
          setSelectedUserId(data.distinct_users[0].user_id);
        } else {
          setError('No analysis history found. Run a simulation in the Intelligence Hub.');
          setLoading(false);
        }
      } catch (err: any) {
        setError('Failed to load user list.');
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 2. Fetch ALL sessions for the selected identity
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');

      try {
        const res = await fetch(`${FASTAPI_URL}/analyze/${selectedUserId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.detail || 'Data not available.');
        setSessions(Array.isArray(data) ? data : [data]);
      } catch (err: any) {
        setError(err.message || 'Could not connect to engine.');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [selectedUserId]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black text-white italic underline decoration-blue-500">
          Unified Customer Profile
        </h1>
        <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-mono">
          Consolidated Identity & Session History
        </p>
      </header>

      {/* Unique Identity Selector */}
      <div className="bg-[#0d1425] border border-slate-800 rounded-2xl p-5 shadow-2xl">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Select Registered Identity</h3>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="w-full bg-[#050914] border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
        >
          {userList.map((user) => (
            <option key={`user-opt-${user.user_id}`} value={user.user_id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-64">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && !loading && (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3">
          <AlertTriangle className="text-red-400" size={20} />
          <p className="text-red-400 text-sm font-mono">{error}</p>
        </div>
      )}

      {/* List of Sessions */}
      <div className="space-y-6">
        {!loading && sessions.map((session, index) => (
          <div
            key={`session-${session.user_id}-${index}`}
            className="grid grid-cols-12 gap-6 p-8 bg-[#0d1425] border border-slate-800 rounded-[2rem] shadow-2xl animate-in slide-in-from-bottom-4 duration-500"
          >
            {/* Left Card */}
            <div className="col-span-12 lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className="text-blue-500" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                  Analysis Session {sessions.length - index} • {session.timestamp || 'Recent'}
                </span>
              </div>

              <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
                  <User size={24} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-black tracking-tight text-xl">{session.user_id}</p>
                  <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Verified Profile Entry</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Brain size={14} className="text-purple-400" />
                    <span className="text-xs text-slate-400 font-bold uppercase">Persona</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border capitalize ${PERSONA_COLORS[session.persona] ?? PERSONA_COLORS.general}`}>
                    {session.persona}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-blue-400" />
                    <span className="text-xs text-slate-400 font-bold uppercase">Event</span>
                  </div>
                  <span className="text-xs text-white capitalize">
                    {(session.life_event || "activity").replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Target size={14} className="text-green-400" />
                    <span className="text-xs text-slate-400 font-bold uppercase">Target Product</span>
                  </div>
                  <span className="text-xs text-blue-400 font-bold capitalize">{session.product}</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">AI Accuracy</span>
                  <span className="text-xs font-black text-white">{session.confidence}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    style={{ width: `${session.confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Card */}
            <div className="col-span-12 lg:col-span-7 space-y-4">
              <div className="bg-[#050914] border border-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Brain size={12} /> Agentic Reasoning Trail
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed font-light italic">
                    "{session.reason || "No detailed logs available for this session."}"
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/50">
                  <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <TrendingUp size={12} /> Personalized Recommendation
                  </h3>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    {session.message}
                  </p>
                </div>

                <div className={`mt-6 rounded-xl p-4 border ${session.guardrail === 'passed' ? 'bg-green-500/5 border-green-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest flex items-center gap-2">
                    {session.guardrail === 'passed'
                      ? <ShieldCheck size={12} className="text-green-500" />
                      : <ShieldAlert size={12} className="text-red-500" />
                    }
                    Safety Guard: {session.guardrail_note}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}