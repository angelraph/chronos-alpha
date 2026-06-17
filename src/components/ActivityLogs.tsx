'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Cpu, 
  ChevronRight, 
  Clock, 
  Trash2,
  PieChart,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ActivityLogsProps {
  onLoadStrategy: (strategy: any) => void;
}

export default function ActivityLogs({ onLoadStrategy }: ActivityLogsProps) {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    // Load lists from local storage
    const loadedStrats = JSON.parse(localStorage.getItem('chronos_strategies') || '[]');
    const loadedLogs = JSON.parse(localStorage.getItem('chronos_logs') || '[]');
    setStrategies(loadedStrats);
    setLogs(loadedLogs);
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to wipe all session laboratory logs?')) {
      localStorage.removeItem('chronos_strategies');
      localStorage.removeItem('chronos_logs');
      setStrategies([]);
      setLogs([]);
    }
  };

  const getAggregates = () => {
    if (strategies.length === 0) return { avgReturn: 0, avgWinRate: 0, totalStrats: 0, bestAsset: 'N/A' };
    
    const totalReturn = strategies.reduce((sum, s) => sum + (s.backtestResults?.totalReturn || 0), 0);
    const totalWinRate = strategies.reduce((sum, s) => sum + (s.backtestResults?.winRate || 0), 0);
    
    // Find best asset
    const assetReturns: { [key: string]: number } = {};
    strategies.forEach((s) => {
      const asset = s.market;
      const ret = s.backtestResults?.totalReturn || 0;
      assetReturns[asset] = (assetReturns[asset] || 0) + ret;
    });
    
    let bestAsset = 'N/A';
    let maxRet = -9999;
    Object.entries(assetReturns).forEach(([asset, ret]) => {
      if (ret > maxRet) {
        maxRet = ret;
        bestAsset = asset;
      }
    });

    return {
      avgReturn: totalReturn / strategies.length,
      avgWinRate: totalWinRate / strategies.length,
      totalStrats: strategies.length,
      bestAsset
    };
  };

  const stats = getAggregates();

  return (
    <div className="space-y-6">
      {/* Aggregates Dashboard Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Systems Compiled */}
        <div className="rounded-xl border border-slate-800/80 bg-[#090d1f]/35 p-4 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Systems Compiled</span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-cyan-400">{stats.totalStrats}</span>
            <Cpu size={14} className="text-cyan-500" />
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Generated AI strategies</span>
        </div>

        {/* Average Simulation Return */}
        <div className="rounded-xl border border-slate-800/80 bg-[#090d1f]/35 p-4 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Average Lab Return</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-black ${stats.avgReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stats.avgReturn >= 0 ? '+' : ''}{stats.avgReturn.toFixed(2)}%
            </span>
            <TrendingUp size={16} className={stats.avgReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'} />
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Combined backtest mean</span>
        </div>

        {/* Average Win Rate */}
        <div className="rounded-xl border border-slate-800/80 bg-[#090d1f]/35 p-4 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Average Win Rate</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-cyan-400">{stats.avgWinRate.toFixed(1)}%</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Trade execution accuracy</span>
        </div>

        {/* Highest Yield Asset */}
        <div className="rounded-xl border border-slate-800/80 bg-[#090d1f]/35 p-4 shadow-xl flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Top Yield Asset</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-400">{stats.bestAsset}</span>
            <PieChart size={16} className="text-indigo-500" />
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Best performing market</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Saved Strategies Panel */}
        <div className="lg:col-span-7 rounded-xl border border-slate-800/80 bg-[#090d1f]/30 p-5 shadow-xl flex flex-col min-h-[350px]">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-800/40 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Laboratory Vault ({strategies.length})
            </h3>
            {strategies.length > 0 && (
              <button 
                onClick={handleClear}
                className="text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Wipe Vault</span>
              </button>
            )}
          </div>

          {strategies.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-8">
              <AlertCircle size={28} className="text-slate-600 mb-2.5" />
              <span>No strategies stored in vault yet. Run a neural compilation inside the Strategy Lab.</span>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {strategies.map((strat) => {
                const isProf = (strat.backtestResults?.totalReturn || 0) >= 0;
                return (
                  <div 
                    key={strat.id}
                    onClick={() => onLoadStrategy(strat)}
                    className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-950/20 hover:bg-slate-900/10 hover:border-slate-700 transition-all flex items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                          {strat.market}
                        </span>
                        <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                          {strat.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate max-w-sm md:max-w-md">
                        {strat.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                      <div className="text-right">
                        <span className={`font-bold block ${isProf ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isProf ? '+' : ''}{strat.backtestResults?.totalReturn}%
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          WR: {strat.backtestResults?.winRate}%
                        </span>
                      </div>
                      <ChevronRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity logs history */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800/80 bg-[#090d1f]/30 p-5 shadow-xl flex flex-col min-h-[350px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-3.5 border-b border-slate-800/40 mb-4 flex items-center gap-1.5">
            <Clock size={14} className="text-cyan-400" />
            <span>Process Log Feed</span>
          </h3>

          {logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-8">
              <span>Log ledger empty. Start strategy generations.</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[380px] overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-400 pr-1">
              {logs.map((log) => (
                <div key={log.id} className="pb-3 border-b border-slate-900 last:border-b-0">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="flex items-center gap-1 text-[9px] font-bold">
                      <Calendar size={10} className="text-cyan-600" />
                      {new Date(log.time).toLocaleTimeString()}
                    </span>
                    <span className="text-cyan-500 uppercase tracking-widest text-[8px] font-bold">
                      {log.action}
                    </span>
                  </div>
                  <p className="text-slate-300">{log.details}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
