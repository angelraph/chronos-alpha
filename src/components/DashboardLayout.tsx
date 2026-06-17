'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  PlusCircle, 
  History, 
  GitCompare, 
  LogOut, 
  Menu, 
  X, 
  Database, 
  Cpu, 
  Activity,
  Terminal,
  ShieldCheck
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function DashboardLayout({ children, activeTab, setActiveTab }: DashboardLayoutProps) {
  const { user, signOut, isDemoMode } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'generator', label: 'Strategy Lab', icon: PlusCircle },
    { id: 'evolution', label: 'AI Strategy Evolution', icon: GitCompare },
    { id: 'logs', label: 'Activity Logs', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#060814] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[70%] bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[60%] bg-emerald-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#060814]/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="lg:hidden text-slate-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  CHRONOS <span className="text-cyan-400 font-medium">ALPHA</span>
                </span>
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800/40 uppercase tracking-widest">
                  v2.0
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Database & Mode Status Badges */}
            <div className="hidden md:flex items-center gap-2">
              {isDemoMode ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/40 text-amber-400 border border-amber-800/30">
                  <Cpu size={12} className="animate-pulse" />
                  <span>Demo Mode</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/30">
                  <Database size={12} />
                  <span>Supabase Connected</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800">
                <ShieldCheck size={12} className="text-cyan-400" />
                <span>SECURED</span>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
              <span className="text-xs text-slate-400 hidden sm:inline-block max-w-[150px] truncate">
                {user?.email}
              </span>
              <button 
                onClick={signOut}
                className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-950 hover:bg-rose-950/15 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6 relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 p-4 rounded-xl border border-slate-800/80 bg-[#090d1f]/60 backdrop-blur-md shadow-2xl">
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-3 px-2">
              Navigation
            </div>
            <nav className="flex flex-col gap-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 text-cyan-400 border-l-2 border-cyan-400 shadow-md shadow-cyan-950/10' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-4 border-t border-slate-800/60">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-2">
                <Terminal size={12} />
                <span>Live Feed</span>
              </div>
              <div className="bg-black/40 rounded-lg p-2.5 border border-slate-800/40 font-mono text-[9px] text-slate-400 leading-relaxed max-h-[120px] overflow-y-auto">
                <div className="text-cyan-500">[SYS] Lab Ready</div>
                <div className="text-emerald-500">[DB] Mock storage initiated</div>
                <div className="text-slate-500">[NET] Engine listening on port 3000</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            
            {/* Drawer Content */}
            <div className="relative w-64 max-w-xs bg-[#090d1f] p-5 flex flex-col border-r border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-slate-200 tracking-wider text-sm">CHRONOS LABS</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-cyan-950/60 text-cyan-400 border-l-2 border-cyan-400' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-auto pt-6 border-t border-slate-800">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-slate-500 truncate">{user?.email}</span>
                  {isDemoMode && (
                    <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/20 px-2 py-0.5 rounded border border-amber-900/40 w-fit">
                      DEMO MODE
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 mt-2 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-rose-400 hover:text-rose-300 text-sm font-semibold transition-all"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full overflow-hidden">
          {children}
        </main>
      </div>

      <footer className="mt-auto py-6 border-t border-slate-900 bg-[#04060e] text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 Chronos Alpha Strategy Labs. All rights reserved. Advanced execution systems.</p>
      </footer>
    </div>
  );
}
