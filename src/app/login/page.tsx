'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Cpu, Mail, Lock, Sparkles, UserPlus, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { user, signIn, signUp, enterGuestMode, loading } = useAuth();
  const router = useRouter();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all inputs.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) {
          setError(signUpError);
        } else {
          router.push('/dashboard');
        }
      } else {
        const { error: signInError } = await signIn(email, password);
        if (signInError) {
          setError(signInError);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestMode = () => {
    setError(null);
    enterGuestMode();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 font-sans flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#090d1f]/50 backdrop-blur-md p-8 shadow-2xl relative">
        {/* Decorative corner lines */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-cyan-500/30 rounded-tl-2xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-cyan-500/30 rounded-br-2xl pointer-events-none" />

        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/15 mb-3">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <span className="text-sm font-bold tracking-widest text-slate-400">CHRONOS ALPHA</span>
          <h2 className="text-lg font-bold text-slate-200 mt-1">Autonomous Strategy Lab Access</h2>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs flex items-start gap-2.5 leading-normal">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={submitting}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-black/40 text-slate-300 placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 focus:outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-black/40 text-slate-300 placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 focus:outline-none text-sm transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/15 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
            <span>{submitting ? 'PROCESSING...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}</span>
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            disabled={submitting}
            className="text-xs text-slate-400 hover:text-cyan-400 font-semibold transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already registered? Sign In' : 'Need an account? Register'}
          </button>
        </div>

        {/* Guest mode option */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col gap-3">
          <div className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            OR EXPLORE LAB WORKSPACE IMMEDIATELY
          </div>
          <button
            onClick={handleGuestMode}
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-cyan-400 hover:text-cyan-300 font-bold text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} />
            <span>ENTER PUBLIC GUEST DEMO MODE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
