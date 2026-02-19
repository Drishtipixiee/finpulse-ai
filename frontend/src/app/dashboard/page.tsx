'use client';

import { useState, useEffect } from 'react';
import AILogger from '@/components/guardrails/AILogger';
import GuardrailShield from '@/components/guardrails/GuardrailShield';
import CrossSellPanel from '@/components/guardrails/CrossSellPanel';
import EventCard from '@/components/guardrails/EventCard';
import { User, Send, CheckCircle } from 'lucide-react';

const FASTAPI_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AnalysisResult {
  pulse: string;
  guardrail: { status: string; ratio: number };
  action: { type: string; message: string; product: string | null };
  _meta: {
    persona: string;
    life_event: string;
    confidence: number;
    reason: string;
    guardrail_note: string;
  };
}

interface Customer {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [mode, setMode] = useState<'auto' | 'simulation'>('auto');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notifSent, setNotifSent] = useState(false);

  useEffect(() => {
  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${FASTAPI_URL}/admin/distinct-users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('RAW API RESPONSE:', data); // ← ADD THIS
      if (data.distinct_users?.length > 0) {
        const mapped = data.distinct_users.map((u: any) => ({
          id: u.user_id,
          name: u.name
        }));
        console.log('MAPPED CUSTOMERS:', mapped); // ← ADD THIS
        setCustomers(mapped);
        setSelectedCustomer(mapped[0]);
      }
    } catch (e) {
      console.error('FETCH ERROR:', e);
    }
  };
  fetchCustomers();
}, []);

  const triggerAgent = async () => {
    if (mode === 'simulation' && !description.trim()) return;
    if (mode === 'auto' && !selectedCustomer) return;
    setIsAnalyzing(true);
    setNotifSent(false);
    setLogs(["PULSE_INBOUND: Scanning transaction patterns..."]);

    const token = localStorage.getItem('token');

    try {
      let response;

      if (mode === 'auto') {
        response = await fetch(`http://localhost:8000/analyze/${selectedCustomer!.id}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        response = await fetch(`${FASTAPI_URL}/analyze-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            description,
            customer_name: customerName.trim() || "Anonymous Customer"
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setLogs(prev => [...prev, "ERROR: Session expired. Please log in again."]);
        } else {
          setLogs(prev => [...prev, `ERROR: ${data.detail || 'Analysis failed'}`]);
        }
        return;
      }

      const result = Array.isArray(data) ? data[0] : data;
      if (!result) {
        setLogs(prev => [...prev, "ERROR: No data found for this customer."]);
        return;
      }

      const formattedData: AnalysisResult = {
        pulse: result.life_event,
        guardrail: {
          status: result.guardrail,
          ratio: result.dti_ratio ?? 0.35
        },
        action: {
          type: "cross-sell",
          message: result.message,
          product: result.product
        },
        _meta: {
          persona: result.persona,
          life_event: result.life_event,
          confidence: result.confidence,
          reason: result.reason,
          guardrail_note: result.guardrail_note ?? "Compliant."
        }
      };

      setAnalysis(formattedData);
      setLogs([
        `PULSE_INBOUND: Life event detected → "${result.life_event}"`,
        `PERSONA_ENGINE: User classified as "${result.persona}"`,
        `REASON: ${result.reason}`,
        `COMPLIANCE_CHECK: Guardrail ${result.guardrail} — ${result.guardrail_note ?? "Compliant."}`,
        `CONFIDENCE_SCORE: ${result.confidence}%`,
        `GEN_AI: Personalized offer generated for "${result.product}"`,
      ]);

    } catch {
      setLogs(prev => [...prev, "ERROR: Could not reach analysis engine."]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-4xl font-black text-white italic underline decoration-blue-500">
          Agentic AI: Cross-Sell Command
        </h1>
        <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest font-mono">
          Solving for: Personalized & Compliant Banking
        </p>
      </header>

      <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-start gap-3">
        <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 animate-pulse shrink-0" />
        <div>
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Bank Analyst Portal</p>
          <p className="text-slate-400 text-xs mt-1">
            The AI engine continuously analyzes all customer transactions in real-time. Review AI-generated offers below, approve and dispatch to customers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-5 space-y-6">
          <div className="bg-[#0d1425] p-6 rounded-3xl border border-slate-800 shadow-2xl">

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setMode('auto'); setAnalysis(null); setLogs([]); setNotifSent(false); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'auto'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Auto Analysis
              </button>
              <button
                type="button"
                onClick={() => { setMode('simulation'); setAnalysis(null); setLogs([]); setNotifSent(false); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'simulation'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Simulation Mode
              </button>
            </div>

            {mode === 'auto' ? (
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                  <p className="text-blue-400 text-xs font-bold uppercase">Auto Analysis</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Select a customer to review their AI-generated offer from the database.
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-blue-500 uppercase mb-3">Select Customer</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customers.length === 0 ? (
                      <p className="text-slate-600 text-xs text-center py-4">
                        No customers found. Seed demo data first.
                      </p>
                    ) : (
                      customers.map((c, index) => (
                        <button
                          type="button"
                          key={`customer-${c.id}-${index}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedCustomer({ id: c.id, name: c.name });
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                            selectedCustomer?.id === c.id
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-slate-800 bg-slate-900/50 hover:border-slate-600'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedCustomer?.id === c.id
                              ? 'bg-blue-500/20'
                              : 'bg-slate-800'
                          }`}>
                            <User size={14} className={selectedCustomer?.id === c.id ? 'text-blue-400' : 'text-slate-500'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-bold truncate">{c.name}</p>
                            <p className="text-slate-500 text-[10px]">Verified Customer</p>
                          </div>
                          {selectedCustomer?.id === c.id && (
                            <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                  <p className="text-yellow-400 text-xs font-bold uppercase">Simulation Mode</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Enter a customer name and their transaction to test the AI engine with new scenarios.
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-blue-500 uppercase mb-2">Customer Name</h3>
                  <input
                    className="w-full bg-[#050914] border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-blue-500 text-sm"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g., Raj Kumar"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-blue-500 uppercase mb-2">Transaction / Life Event</h3>
                  <input
                    className="w-full bg-[#050914] border border-slate-700 p-4 rounded-xl text-white outline-none focus:border-blue-500 text-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g., paid university tuition fees..."
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={triggerAgent}
              disabled={isAnalyzing}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 p-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
            >
              {isAnalyzing ? "Loading Offer..." : "Review AI-Generated Offer"}
            </button>
          </div>

          {analysis && <GuardrailShield dtiRatio={analysis.guardrail.ratio} />}

          {analysis && (
            <div className="bg-gradient-to-br from-slate-900 to-blue-950 border border-blue-500/20 rounded-3xl p-6">
              <p className="text-xs text-slate-500 uppercase font-bold mb-3">
                📱 Customer Receives
              </p>
              <div className="bg-black rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-md" />
                  <p className="text-white text-xs font-bold">FinPulse Bank</p>
                  <p className="text-slate-500 text-[10px] ml-auto">now</p>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">{analysis.action.message}</p>
                <p className="text-blue-400 text-xs font-bold mt-2">
                  Tap to explore {analysis.action.product} →
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNotifSent(true)}
                disabled={notifSent}
                className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  notifSent
                    ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                    : 'bg-green-600 hover:bg-green-500 text-white'
                }`}
              >
                {notifSent
                  ? <><CheckCircle size={14} /> Offer Dispatched to Customer</>
                  : <><Send size={14} /> Approve & Send Offer</>
                }
              </button>
              {notifSent && (
                <p className="text-[10px] text-green-400 text-center mt-2">
                  Delivered via push notification, SMS & in-app banner
                </p>
              )}
            </div>
          )}
        </div>

        <div className="col-span-7 space-y-6">
          <AILogger logs={logs} />
          {analysis && (
            <div className="space-y-6 animate-in slide-in-from-right-10 duration-700">
              <EventCard eventType={analysis.pulse} />
              <CrossSellPanel message={analysis.action.message} product={analysis.action.product} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}