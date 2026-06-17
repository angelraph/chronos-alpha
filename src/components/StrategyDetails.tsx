'use client';

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  AlertTriangle,
  FileCode,
  Sliders,
  Sparkles,
  Percent
} from 'lucide-react';
import { StrategyOutput } from '@/lib/aiStrategyEngine';
import { BacktestResults } from '@/lib/backtestEngine';

interface StrategyDetailsProps {
  strategy: StrategyOutput;
  backtest: BacktestResults;
  onEvolveTriggered?: () => void;
  isEvolving?: boolean;
}

export default function StrategyDetails({ strategy, backtest, onEvolveTriggered, isEvolving }: StrategyDetailsProps) {
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'pine' | 'json'>('python');
  const [copied, setCopied] = useState(false);

  const getCodeString = () => {
    if (activeCodeTab === 'python') return strategy.codePython;
    if (activeCodeTab === 'pine') return strategy.codePine;
    return strategy.codeJson;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  const isProfitable = backtest.totalReturn >= 0;

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-[#090d1f]/45 backdrop-blur-md p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/40 uppercase tracking-wider">
                {strategy.market}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-400 border border-slate-800 uppercase tracking-wider">
                {strategy.tradingStyle}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                strategy.riskLevel === 'Low' 
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800/30' 
                  : strategy.riskLevel === 'Medium' 
                    ? 'bg-cyan-950 text-cyan-400 border-cyan-800/30' 
                    : 'bg-amber-950 text-amber-400 border-amber-800/30'
              }`}>
                {strategy.riskLevel} Risk
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-wide text-white">{strategy.name}</h1>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-3xl">
              {strategy.description}
            </p>
          </div>
          
          {onEvolveTriggered && (
            <button
              onClick={onEvolveTriggered}
              disabled={isEvolving}
              className="px-4 py-2.5 shrink-0 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs tracking-wider shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>{isEvolving ? 'EVOLVING STRATEGY...' : 'EVOLVE STRATEGY'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Performance Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Return */}
        <div className="rounded-xl border border-slate-800/80 bg-[#090d1f]/30 p-4 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Return</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black ${isProfitable ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isProfitable ? '+' : ''}{backtest.totalReturn}%
            </span>
            {isProfitable ? (
              <TrendingUp size={16} className="text-emerald-500" />
            ) : (
              <TrendingDown size={16} className="text-rose-500" />
            )}
          </div>
          <span className="text-[9px] text-slate-500 mt-1">
            Final equity: {formatCurrency(backtest.finalBalance)}
          </span>
        </div>

        {/* Win Rate */}
        <div className="rounded-xl border border-slate-800/80 bg-[#090d1f]/30 p-4 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Win Rate</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-cyan-400">{backtest.winRate}%</span>
            <Percent size={14} className="text-cyan-500" />
          </div>
          <div className="w-full bg-slate-800/40 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-cyan-500 h-1.5 rounded-full" 
              style={{ width: `${backtest.winRate}%` }} 
            />
          </div>
        </div>

        {/* Profit Factor */}
        <div className="rounded-xl border border-slate-800/80 bg-[#090d1f]/30 p-4 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Profit Factor</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black ${backtest.profitFactor >= 1.5 ? 'text-emerald-400' : backtest.profitFactor >= 1.0 ? 'text-cyan-400' : 'text-rose-400'}`}>
              {backtest.profitFactor}
            </span>
            <Award size={16} className={backtest.profitFactor >= 1.0 ? 'text-cyan-500' : 'text-rose-500'} />
          </div>
          <span className="text-[9px] text-slate-500 mt-1">
            Gross gains vs gross losses
          </span>
        </div>

        {/* Sharpe Ratio */}
        <div className="rounded-xl border border-slate-800/80 bg-[#090d1f]/30 p-4 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Sharpe Ratio</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black ${backtest.sharpeRatio >= 2.0 ? 'text-emerald-400' : backtest.sharpeRatio >= 1.0 ? 'text-cyan-400' : 'text-slate-400'}`}>
              {backtest.sharpeRatio}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1">
            Risk-adjusted return multiplier
          </span>
        </div>

        {/* Max Drawdown */}
        <div className="rounded-xl border border-slate-800/80 bg-[#090d1f]/30 p-4 shadow-xl col-span-2 lg:col-span-1 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Max Drawdown</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-rose-400">-{backtest.maxDrawdown}%</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1">
            Peak-to-trough drop risk
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 3. Parameter and Risk Intelligence Column */}
        <div className="lg:col-span-5 space-y-6">
          {/* Strategy parameters */}
          <div className="rounded-xl border border-slate-800/80 bg-[#090d1f]/30 p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3.5 pb-2 border-b border-slate-800/50">
              <Sliders size={15} className="text-cyan-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Algorithm Parameters
              </h3>
            </div>
            
            <div className="space-y-3.5">
              {Object.entries(strategy.parameters).map(([key, val]: [string, any]) => {
                // Formatting key
                const formattedKey = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase());
                
                return (
                  <div key={key} className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-mono">{formattedKey}</span>
                    <span className="font-bold text-slate-200 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono">
                      {typeof val === 'number' ? val.toFixed(key.includes('Percent') || key.includes('StdDev') ? 1 : 0) : String(val)}
                    </span>
                  </div>
                );
              })}
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Total Trades Executed</span>
                <span className="font-bold text-slate-200 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded font-mono">
                  {backtest.totalTrades}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Intelligence */}
          <div className="rounded-xl border border-slate-800/80 bg-[#090d1f]/30 p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/50">
              <ShieldAlert size={15} className="text-rose-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Risk Intelligence
              </h3>
            </div>

            <div className="space-y-4">
              {/* Confidence score */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-400">Chronos Confidence Score</span>
                  <span className="font-bold text-cyan-400">{strategy.confidenceScore}/100</span>
                </div>
                <div className="w-full bg-slate-800/40 rounded-full h-2 overflow-hidden border border-slate-800/40">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                    style={{ width: `${strategy.confidenceScore}%` }}
                  />
                </div>
              </div>

              {/* Explanation */}
              <div className="text-xs leading-relaxed text-slate-300">
                <p>{strategy.riskExplanation}</p>
              </div>

              {/* Warning flags */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <AlertTriangle size={11} className="text-amber-500" />
                  <span>Key Risk Vectors</span>
                </div>
                <ul className="space-y-1 text-slate-400 text-xs">
                  {strategy.riskWarnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-1.5 leading-normal">
                      <span className="text-rose-500 font-bold shrink-0 mt-0.5">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Code Exporter Panel */}
        <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-800/80 bg-[#090d1f]/35 shadow-xl overflow-hidden min-h-[420px]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/30">
            <div className="flex items-center gap-2">
              <FileCode size={15} className="text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Strategy Script Compiler</span>
            </div>

            {/* Code Tabs */}
            <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveCodeTab('python')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeCodeTab === 'python' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveCodeTab('pine')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeCodeTab === 'pine' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pine Script
              </button>
              <button
                onClick={() => setActiveCodeTab('json')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase transition-all cursor-pointer ${
                  activeCodeTab === 'json' ? 'bg-cyan-500 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                JSON
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="relative flex-1 bg-black/60 font-mono text-xs leading-relaxed p-5 overflow-auto max-h-[380px] text-slate-300">
            <button
              onClick={handleCopy}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer hover:border-slate-600"
              title="Copy Code"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
            <pre className="text-left select-all whitespace-pre-wrap font-mono">{getCodeString()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
