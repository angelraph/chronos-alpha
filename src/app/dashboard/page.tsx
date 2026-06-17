'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import StrategyGenerator from '@/components/StrategyGenerator';
import BacktestChart from '@/components/BacktestChart';
import StrategyDetails from '@/components/StrategyDetails';
import StrategyEvolution from '@/components/StrategyEvolution';
import ActivityLogs from '@/components/ActivityLogs';
import { proposeEvolution, StrategyOutput } from '@/lib/aiStrategyEngine';
import { runBacktest, BacktestResults } from '@/lib/backtestEngine';
import { Sparkles, Terminal } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('generator');
  
  // Strategy States
  const [activeStrategy, setActiveStrategy] = useState<StrategyOutput | null>(null);
  const [activeBacktest, setActiveBacktest] = useState<BacktestResults | null>(null);
  
  // Evolution States
  const [evolvedStrategy, setEvolvedStrategy] = useState<StrategyOutput | null>(null);
  const [evolvedBacktest, setEvolvedBacktest] = useState<BacktestResults | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);

  // Authenticate router check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load latest compiled strategy from local cache on mount if available
  useEffect(() => {
    if (user) {
      const existingStrats = JSON.parse(localStorage.getItem('chronos_strategies') || '[]');
      if (existingStrats.length > 0) {
        const latest = existingStrats[0];
        setActiveStrategy(latest);
        setActiveBacktest(latest.backtestResults);
      }
    }
  }, [user]);

  const handleStrategyGenerated = (strategy: StrategyOutput, backtest: BacktestResults) => {
    setActiveStrategy(strategy);
    setActiveBacktest(backtest);
    // Clear out outdated evolution when a brand new strategy is compiled
    setEvolvedStrategy(null);
    setEvolvedBacktest(null);
  };

  const handleEvolve = async () => {
    if (!activeStrategy || !activeBacktest) return;
    setIsEvolving(true);
    
    try {
      // Simulate genetic optimizer computation duration
      await new Promise((resolve) => setTimeout(resolve, 2500));
      
      const evolved = proposeEvolution(activeStrategy);
      const backtest = runBacktest({
        market: evolved.market,
        tradingStyle: evolved.tradingStyle,
        riskLevel: evolved.riskLevel,
        indicators: evolved.parameters,
        stopLossPercent: evolved.parameters.stopLossPercent,
        takeProfitPercent: evolved.parameters.takeProfitPercent
      });

      setEvolvedStrategy(evolved);
      setEvolvedBacktest(backtest);
      
      // Save evolved strategy to list
      const existingStrats = JSON.parse(localStorage.getItem('chronos_strategies') || '[]');
      existingStrats.unshift({ ...evolved, backtestResults: backtest });
      localStorage.setItem('chronos_strategies', JSON.stringify(existingStrats));

      // Append action to log feed
      const logs = JSON.parse(localStorage.getItem('chronos_logs') || '[]');
      logs.unshift({
        id: Math.random().toString(36).substring(2, 9),
        time: new Date().toISOString(),
        action: 'Strategy Evolved',
        details: `Evolved "${activeStrategy.name}" to v2. Optimized Sharpe Ratio to ${backtest.sharpeRatio}.`
      });
      localStorage.setItem('chronos_logs', JSON.stringify(logs));

      // Redirect tab view to comparative analysis
      setActiveTab('evolution');
    } catch (error) {
      console.error('Evolution failed:', error);
    } finally {
      setIsEvolving(false);
    }
  };

  const handleLoadStrategyFromLogs = (strat: any) => {
    setActiveStrategy(strat);
    setActiveBacktest(strat.backtestResults);
    // Load matching parent/child if available, or just clear evolution state
    setEvolvedStrategy(null);
    setEvolvedBacktest(null);
    setActiveTab('generator');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#060814] flex flex-col items-center justify-center">
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-950" />
          <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 animate-spin" />
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Loading Laboratory Workspace...
        </span>
      </div>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'generator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Input Form Panel */}
            <div className="xl:col-span-4">
              <StrategyGenerator onGenerated={handleStrategyGenerated} />
            </div>
            
            {/* Backtest Chart Panel */}
            <div className="xl:col-span-8">
              {activeBacktest ? (
                <BacktestChart 
                  equityCurve={activeBacktest.equityCurve} 
                  trades={activeBacktest.trades} 
                />
              ) : (
                <div className="w-full h-full min-h-[400px] border border-slate-800/80 bg-[#090d1f]/20 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-xs p-6 text-center">
                  <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-500/60 mb-4 animate-pulse">
                    <Sparkles size={24} />
                  </div>
                  <span className="font-bold text-slate-400 block mb-1">Laboratory Status: Idle</span>
                  <span>Select parameters on the left sidebar to compile and execute a backtest.</span>
                </div>
              )}
            </div>
          </div>

          {/* Detailed analysis / code section */}
          {activeStrategy && activeBacktest && (
            <StrategyDetails 
              strategy={activeStrategy} 
              backtest={activeBacktest} 
              onEvolveTriggered={handleEvolve}
              isEvolving={isEvolving}
            />
          )}
        </div>
      )}

      {activeTab === 'evolution' && (
        <>
          {activeStrategy && activeBacktest && evolvedStrategy && evolvedBacktest ? (
            <StrategyEvolution 
              originalStrategy={activeStrategy}
              originalBacktest={activeBacktest}
              evolvedStrategy={evolvedStrategy}
              evolvedBacktest={evolvedBacktest}
            />
          ) : (
            <div className="w-full border border-slate-800/80 bg-[#090d1f]/20 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-xs p-12 text-center min-h-[450px]">
              <div className="p-4 rounded-full bg-slate-900 border border-slate-800 mb-4 text-cyan-400">
                <Terminal size={28} />
              </div>
              <span className="font-bold text-slate-400 block mb-1">Comparative Engine Off</span>
              <span className="max-w-md">Compile a basic strategy model under Strategy Lab, then hit the "Evolve Strategy" button to view optimization shifts.</span>
            </div>
          )}
        </>
      )}

      {activeTab === 'logs' && (
        <ActivityLogs onLoadStrategy={handleLoadStrategyFromLogs} />
      )}
    </DashboardLayout>
  );
}
