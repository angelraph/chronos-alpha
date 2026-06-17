'use client';

import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Trade } from '@/lib/backtestEngine';

interface ChartDataPoint {
  time: string;
  balance: number;
  drawdown: number;
  price: number;
  trade?: Trade;
}

interface BacktestChartProps {
  equityCurve: ChartDataPoint[];
  trades: Trade[];
}

export default function BacktestChart({ equityCurve, trades }: BacktestChartProps) {
  // Merge trades into the equity curve data points for display
  const chartData = equityCurve.map((point) => {
    // Find if there was a trade on this date
    const dayTrades = trades.filter((t) => t.time === point.time);
    
    // Pick the last trade on this day if multiple exist, or just primary one
    const trade = dayTrades.length > 0 ? dayTrades[dayTrades.length - 1] : undefined;

    return {
      ...point,
      trade
    };
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#090d1f]/95 border border-slate-800 rounded-xl p-3.5 shadow-2xl font-sans text-xs space-y-1.5 backdrop-blur-md">
          <div className="text-slate-400 font-semibold mb-1">{label}</div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-slate-400">Equity Balance:</span>
            <span className="font-bold text-cyan-400">{formatCurrency(data.balance)}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-slate-400">Asset Price:</span>
            <span className="font-bold text-slate-200">{formatCurrency(data.price)}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="text-slate-400">Drawdown:</span>
            <span className="font-bold text-rose-400">-{data.drawdown.toFixed(1)}%</span>
          </div>
          {data.trade && (
            <div className={`mt-2 p-1.5 rounded border text-[10px] uppercase font-bold text-center ${
              data.trade.type === 'BUY' 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30' 
                : 'bg-rose-950/40 text-rose-400 border-rose-900/30'
            }`}>
              {data.trade.type} Order executed @ {formatCurrency(data.trade.price)}
              {data.trade.profit !== undefined && data.trade.profit !== null && (
                <span className="block text-[9px] mt-0.5 font-medium">
                  Profit: {data.trade.profit >= 0 ? '+' : ''}{formatCurrency(data.trade.profit)} ({data.trade.profitPercent?.toFixed(2)}%)
                </span>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot renderer for BUY/SELL signals
  const renderSpecialDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.trade) return null;

    const isBuy = payload.trade.type === 'BUY';
    const color = isBuy ? '#10b981' : '#f43f5e';

    return (
      <svg 
        key={`dot-${payload.time}-${payload.trade.id}`}
        x={cx - 7} 
        y={cy - 7} 
        width={14} 
        height={14} 
        viewBox="0 0 100 100" 
        className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] cursor-pointer"
      >
        {isBuy ? (
          <polygon points="50,15 90,85 10,85" fill={color} stroke="#000" strokeWidth="6" />
        ) : (
          <polygon points="50,85 90,15 10,15" fill={color} stroke="#000" strokeWidth="6" />
        )}
      </svg>
    );
  };

  return (
    <div className="w-full h-[400px] border border-slate-800/80 bg-[#090d1f]/45 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-2xl relative">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Equity & Performance Analysis</h3>
          <p className="text-xs text-slate-500">Overlaying portfolio growth, drawdown, and underlying spot price</p>
        </div>
        
        {/* Signpost indicator legends */}
        <div className="flex items-center gap-3 text-[10px] font-bold tracking-wider">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" style={{ clipPath: 'polygon(50% 15%, 90% 85%, 10% 85%)' }} />
            <span className="text-emerald-400">BUY</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-sm inline-block" style={{ clipPath: 'polygon(50% 85%, 90% 15%, 10% 15%)' }} />
            <span className="text-rose-400">SELL</span>
          </div>
        </div>
      </div>

      <div className="w-full h-[320px] font-mono text-[10px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Premium Area Gradients */}
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01}/>
              </linearGradient>
              <linearGradient id="drawdownGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1e293b/30" strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              tickLine={false} 
              axisLine={false}
              dy={10} 
            />
            {/* Left Y-Axis: Balance */}
            <YAxis 
              yAxisId="left"
              domain={['dataMin - 500', 'dataMax + 500']}
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
            />
            {/* Right Y-Axis: Drawdown */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              reversed={true}
              stroke="#64748b"
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}%`}
              hide={true} // Hide but keep for calculation
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#1e293b', strokeWidth: 1 }} />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }}
            />
            
            {/* Portfolio Balance Area */}
            <Area
              yAxisId="left"
              name="Portfolio Equity"
              type="monotone"
              dataKey="balance"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#equityGradient)"
            />

            {/* Asset Price Underlying Line */}
            <Line
              yAxisId="left"
              name="Asset Base Price"
              type="monotone"
              dataKey="price"
              stroke="#4f46e5"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
            />

            {/* Drawdown Area */}
            <Area
              yAxisId="right"
              name="Max Drawdown"
              type="monotone"
              dataKey="drawdown"
              stroke="#ef4444"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#drawdownGradient)"
              dot={false}
            />

            {/* Overlay line for trade dots */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="balance"
              stroke="transparent"
              dot={renderSpecialDot}
              activeDot={false}
              legendType="none"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
