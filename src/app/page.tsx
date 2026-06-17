'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  TrendingUp, 
  GitBranch, 
  ShieldAlert, 
  ArrowRight, 
  Cpu, 
  LineChart,
  Code
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Cpu,
      title: 'Neural Strategy Compilation',
      desc: 'AI parses trading styles, risk guidelines, and targets to formulate robust strategies in real time.'
    },
    {
      icon: LineChart,
      title: 'High-Fidelity Backtesting',
      desc: 'Evaluate strategy logic against 180 days of simulated daily OHLCV historical asset trends instantly.'
    },
    {
      icon: GitBranch,
      title: 'Algorithmic Evolution',
      desc: 'Underperforming indicators are genetically mutated by our AI engine to refine return and drawdown parameters.'
    },
    {
      icon: ShieldAlert,
      title: 'Risk Intelligence',
      desc: 'Gain detailed confidence scoring, market warning indicators, and risk warnings parsed in simple language.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 font-sans relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] left-[20%] w-[60%] h-[50%] bg-blue-900/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-indigo-950/15 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="w-full sticky top-0 z-40 bg-[#060814]/40 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-md font-bold tracking-widest text-slate-200">
              CHRONOS <span className="text-cyan-400 font-medium">ALPHA</span>
            </span>
          </div>

          <Link
            href={user ? "/dashboard" : "/login"}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-bold tracking-wider transition-all"
          >
            {user ? "ENTER LAB" : "SIGN IN"}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 text-center flex-1 flex flex-col justify-center items-center">
        {/* Glow Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 mb-6 backdrop-blur-md animate-pulse">
          <Sparkles size={12} />
          <span>AUTONOMOUS QUANT LAB V2.0 IS LIVE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.15]">
          AI-Powered Autonomous{' '}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
            Strategy Laboratory
          </span>{' '}
          for Crypto Traders
        </h1>
        
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mt-6 leading-relaxed">
          Formulate, backtest, evolve, and export algorithmic trading strategies. Connect to the local neural simulator or real Supabase and OpenAI infrastructure.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>ACCESS LAB WORKSPACE</span>
            <ArrowRight size={16} />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-sm tracking-wide transition-all backdrop-blur-md"
          >
            EXPLORE MODULES
          </a>
        </div>

        {/* Premium Screen Mockup */}
        <div className="mt-16 w-full max-w-4xl rounded-2xl border border-slate-800 bg-[#090d1f]/40 backdrop-blur-md p-2 shadow-2xl relative">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="rounded-xl bg-[#060814]/80 aspect-video md:aspect-[2.2/1] overflow-hidden border border-slate-800 flex flex-col">
            {/* Top window bar */}
            <div className="h-10 border-b border-slate-900 bg-[#070b18] px-4 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <span className="text-[10px] text-slate-500 font-mono ml-4 tracking-wider">CHRONOS-ALPHA-WORKSPACE</span>
            </div>
            {/* Dummy terminal layout */}
            <div className="flex-1 p-6 font-mono text-[10px] sm:text-xs text-left text-slate-400 leading-relaxed overflow-hidden">
              <span className="text-cyan-500">guest@chronos-alpha:~$</span> npm run dev --labs<br />
              <span className="text-slate-500">&gt; chronos-alpha@0.1.0 dev</span><br />
              <span className="text-slate-500">&gt; next dev --labs</span><br />
              <span className="text-emerald-400">✓ Ready in 1.4s</span><br />
              <span className="text-slate-400">[INFO] AI Agent Engine listening on OpenAI completions API...</span><br />
              <span className="text-slate-400">[DB] Running local SQLite/localStorage vault cache fallback mode.</span><br />
              <span className="text-cyan-500">guest@chronos-alpha:~$</span> <span className="text-white animate-pulse">|</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-20 border-t border-slate-900 bg-slate-950/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
              AUTONOMOUS STRATEGY LABORATORY CORE MODULES
            </h2>
            <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">
              Engineering institutional tools for everyday traders
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div 
                  key={idx} 
                  className="p-6 rounded-2xl border border-slate-800 bg-[#090d1f]/40 backdrop-blur-sm shadow-xl flex flex-col hover:border-slate-700 transition-all group"
                >
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 w-fit group-hover:text-indigo-400 group-hover:border-cyan-800/20 transition-all">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold mt-5 text-slate-100 group-hover:text-white transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed flex-1">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-600 bg-[#04060e] relative z-10">
        <p>© 2026 Chronos Alpha Labs. Designed for institutional backtesting accuracy. Disclaimer: Trading carries risk.</p>
      </footer>
    </div>
  );
}
