'use client';
import { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Points to your local FastAPI backend
      const response = await axios.post(`${API_URL}/auth/login`, {
        employee_id: employeeId,
        password: password,
      });

      // Store JWT token for subsequent authenticated requests
      localStorage.setItem('token', response.data.access_token);

      const decoded: any = jwtDecode(response.data.access_token);
      console.log('Session started for:', decoded.sub);

      // Successfully authenticated, moving to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050914] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-center bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-2xl">
          <div className="p-2 bg-blue-500/20 rounded-full animate-pulse">
            <ShieldCheck className="text-blue-400" size={28} />
          </div>
          <div className="ml-3">
            <h1 className="text-sm font-black text-white uppercase tracking-widest">
              FinPulse AI Secure Login
            </h1>
            <p className="text-[10px] text-blue-400 font-mono">
              Agentic Compliance Dashboard
            </p>
          </div>
        </div>

        {/* Login Form Container */}
        <form 
          onSubmit={handleLogin} 
          className="bg-[#0d1425] border border-slate-800 rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={80} className="text-blue-500" />
          </div>

          <h2 className="text-xl font-light text-white text-center">
            Welcome Back 
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-[#050914] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all outline-none"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#050914] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 transition-all outline-none"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
              <p className="text-red-400 text-xs text-center font-mono">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 py-4 rounded-xl font-bold text-white shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              <ShieldCheck size={20} /> {loading ? 'Authenticating...' : 'Login Securely'}
            </button>

            {/* Added Signup Link for UI Accessibility */}
            <Link 
              href="/signup" 
              className="flex items-center justify-center gap-2 text-slate-500 hover:text-blue-400 text-xs transition-colors duration-300"
            >
              <UserPlus size={14} /> New here? Create an account
            </Link>
          </div>
        </form>

        <p className="text-center text-slate-600 text-[10px] font-mono uppercase tracking-widest">
          Secured by FinPulse Agentic Core
        </p>
      </div>
    </div>
  );
}