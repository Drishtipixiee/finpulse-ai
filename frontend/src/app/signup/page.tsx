'use client';
import { useState } from 'react';
import axios from 'axios';
import { ShieldPlus, Sparkles, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    employee_id: '',
    name: '',
    email: '',
    password: '',
    role: 'analyst'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Connects to your FastAPI signup endpoint
      const response = await axios.post(`${API_URL}/auth/signup`, formData);

      if (response.data.status === 'success') {
        // Redirect to login page after successful registration
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Try a different Employee ID.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050914] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">

        {/* Header */}
        <div className="flex items-center justify-center bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
          <div className="p-2 bg-blue-500/20 rounded-full animate-pulse">
            <ShieldPlus className="text-blue-400" size={28} />
          </div>
          <div className="ml-3">
            <h1 className="text-sm font-black text-white uppercase tracking-widest">
              FinPulse AI Enrollment
            </h1>
            <p className="text-[10px] text-blue-400 font-mono">
              Create Analyst Credentials
            </p>
          </div>
        </div>

        {/* Signup Form */}
        <form
          onSubmit={handleSignup}
          className="bg-[#0d1425] border border-slate-800 rounded-3xl p-8 space-y-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={80} className="text-blue-500" />
          </div>

          <h2 className="text-xl font-light text-white text-center mb-4">
            New Account 🚀
          </h2>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#050914] border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 transition-all outline-none"
              required
            />
            <input
              type="text"
              placeholder="Employee ID (e.g., alex505)"
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full bg-[#050914] border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 transition-all outline-none"
              required
            />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#050914] border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 transition-all outline-none"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#050914] border border-white/10 rounded-xl p-3.5 text-white focus:border-blue-500 transition-all outline-none"
              required
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center font-mono bg-red-400/10 p-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-white shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>

          <Link href="/" className="flex items-center justify-center gap-2 text-slate-500 hover:text-white text-xs mt-4 transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}