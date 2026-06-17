'use client';

import React, { useState, useEffect } from 'react';
import { Play, Sparkles, AlertCircle } from 'lucide-react';
import { generateLocalStrategy } from '@/lib/aiStrategyEngine';
import { runBacktest } from '@/lib/backtestEngine';

interface StrategyGeneratorProps {
  onGenerated: (strategy: any, backtest: any) => void;
}

const MARKETS = [
  { id: 'BTC', name: 'Bitcoin (BTC/USD)', base: 'BTC' },
  { id: 'ETH', name: 'Ethereum (ETH/USD)', base: 'ETH' },
  { id: 'SOL', name: 'Solana (SOL/USD)', base: 'SOL' },
  { id: 'LINK', name: 'Chainlink (LINK/USD)', base: 'LINK' },
];

const TRADING_STYLES = [
  { id: 'Trend', name: 'Trend Follower', desc: 'Moving average cross algorithms' },
  { id: 'Mean Reversion', name: 'Mean Reversion', desc: 'Oscillators (RSI) extreme bounds' },
  { id: 'Momentum', name: 'Momentum Breakout', desc: 'Bollinger Bands expansion runs' },
  { id: 'Scalping', name: 'Micro-Scalping', desc: 'Short-term high-freq oscillations' }
];

const RISK_LEVELS: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];

const LOADING_STEPS = [
  'Connecting to Chronos Strategy Lab API...',
  'Compiling mathematical variables for market volatility...',
  'Running historical backtest simulation (180 days)...',
  'Executing genetic optimizer to refine risk filters...',
  'Generating Python code exports...',
  'Building TradingView Pine Script v5 file...',
  'Deploying strategy instance to active memory...'
];

export default function StrategyGenerator({ onGenerated }: StrategyGeneratorProps) {
  const [market, setMarket] = useState('BTC');
  const [style, setStyle] = useState('Trend');
  const [risk, setRisk] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [prompt, setPrompt] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating) {
      timer = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < LOADING_STEPS.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 700);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    setLoadingStep(0);

    try {
      // Simulate API lag
      await new Promise(resolve => setTimeout(resolve, 3800));
      
      // Call engine
      const strategy = generateLocalStrategy(market, style, risk, prompt);
      const backtest = runBacktest({
        market: strategy.market,
        tradingStyle: strategy.tradingStyle,
        riskLevel: strategy.riskLevel,
        indicators: strategy.parameters,
        stopLossPercent: strategy.parameters.stopLossPercent,
        takeProfitPercent: strategy.parameters.takeProfitPercent
      });

      // Pass details back up
      onGenerated(strategy, backtest);
      
      // Save strategy and activity to localStorage for guest, or wait for Supabase
      const existingStrats = JSON.parse(localStorage.getItem('chronos_strategies') || '[]');
      existingStrats.unshift({ ...strategy, backtestResults: backtest });
      localStorage.setItem('chronos_strategies', JSON.stringify(existingStrats));
      
      const logs = JSON.parse(localStorage.getItem('chronos_logs') || '[]');
      logs.unshift({
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toISOString(),
        action: 'Strategy Created',
        details: `Generated "${strategy.name}" for ${market} with style ${style} and ${risk} risk.`
      });
      localStorage.setItem('chronos_logs', JSON.stringify(logs));

    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800/80 bg-[#090d1f]/45 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden">
      {/* Absolute background accent */}
      <div className="absolute -right-12 -top-12 w-36 h-36 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-2.5 mb-6">
        <Sparkles className="text-cyan-400" size={20} />
        <h2 className="text-lg font-bold tracking-wide text-slate-100">
          AI Autonomous Strategy Generator
        </h2>
      </div>

      {isGenerating ? (
        <div className="py-12 flex flex-col items-center justify-center min-h-[300px]">
          {/* Neon spinner */}
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-950" />
            <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-indigo-500 animate-spin" />
          </div>
          
          <div className="text-sm font-semibold text-slate-300 animate-pulse text-center max-w-md">
            {LOADING_STEPS[loadingStep]}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            Step {loadingStep + 1} of {LOADING_STEPS.length}
          </div>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Market selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              1. Select Asset Class
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {MARKETS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMarket(item.id)}
                  className={`px-4 py-3 rounded-xl border text-center transition-all cursor-pointer ${
                    market === item.id 
                      ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 shadow-md shadow-cyan-950/30' 
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-sm font-bold">{item.id}</span>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">{item.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Strategy Style */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              2. Select Algorithmic Trading Style
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TRADING_STYLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStyle(item.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    style === item.id 
                      ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 shadow-md shadow-cyan-950/30' 
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm font-bold block">{item.name}</span>
                  <span className="text-xs text-slate-500 mt-1 block">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Risk Levels */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              3. Set Risk Management Profile
            </label>
            <div className="grid grid-cols-3 gap-3">
              {RISK_LEVELS.map((level) => {
                const colors = {
                  Low: { border: 'border-emerald-500 bg-emerald-950/20 text-emerald-400 shadow-emerald-950/30', text: 'Low Drawdown' },
                  Medium: { border: 'border-cyan-500 bg-cyan-950/20 text-cyan-400 shadow-cyan-950/30', text: 'Balanced SL/TP' },
                  High: { border: 'border-amber-500 bg-amber-950/20 text-amber-400 shadow-amber-950/30', text: 'Aggressive' }
                };
                const isSelected = risk === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setRisk(level)}
                    className={`py-3 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected 
                        ? colors[level].border 
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="block text-sm font-bold">{level}</span>
                    <span className="text-[9px] text-slate-500 block mt-0.5">{colors[level].text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description prompt / custom criteria */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              4. Custom Strategy Instructions (Optional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: focus on heavy oversold volume spikes, set stop loss to exactly 2.5%, use 50-period moving average..."
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-black/40 text-slate-300 placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 focus:outline-none p-3.5 text-sm transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all hover:-translate-y-0.5 cursor-pointer active:translate-y-0"
          >
            <Play size={16} fill="currentColor" />
            <span>GENERATE AUTONOMOUS STRATEGY</span>
          </button>
        </form>
      )}
    </div>
  );
}
