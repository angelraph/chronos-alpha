import { Candle, generateHistoricalData } from './historicalData';

export interface BacktestParams {
  market: string;
  tradingStyle: string; // 'Trend', 'Mean Reversion', 'Scalping', 'Momentum'
  riskLevel: 'Low' | 'Medium' | 'High';
  indicators: {
    fastPeriod?: number;
    slowPeriod?: number;
    rsiPeriod?: number;
    rsiOversold?: number;
    rsiOverbought?: number;
    bbPeriod?: number;
    bbStdDev?: number;
  };
  stopLossPercent?: number;
  takeProfitPercent?: number;
}

export interface Trade {
  id: string;
  type: 'BUY' | 'SELL';
  price: number;
  time: string;
  profit?: number;
  profitPercent?: number;
  balanceAfter: number;
}

export interface BacktestResults {
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalReturn: number;
  initialBalance: number;
  finalBalance: number;
  totalTrades: number;
  equityCurve: { time: string; balance: number; drawdown: number; price: number }[];
  trades: Trade[];
}

// Helper calculations
function getSMA(candles: Candle[], index: number, period: number): number | null {
  if (index < period - 1) return null;
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[index - i].close;
  }
  return sum / period;
}

function getRSI(candles: Candle[], index: number, period: number): number | null {
  if (index < period) return null;
  
  let gains = 0;
  let losses = 0;
  
  // First RSI calculation
  for (let i = 1; i <= period; i++) {
    const diff = candles[index - period + i].close - candles[index - period + i - 1].close;
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  if (avgLoss === 0) return 100;
  let rs = avgGain / avgLoss;
  let rsi = 100 - 100 / (1 + rs);
  
  // We can approximate smoothing for simplicity, or just use this direct SMA-RSI
  return rsi;
}

function getBollingerBands(candles: Candle[], index: number, period: number, stdDevMultiplier: number) {
  if (index < period - 1) return { basis: null, upper: null, lower: null };
  
  // Calculate SMA (basis)
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[index - i].close;
  }
  const basis = sum / period;
  
  // Calculate Variance
  let varianceSum = 0;
  for (let i = 0; i < period; i++) {
    varianceSum += Math.pow(candles[index - i].close - basis, 2);
  }
  const standardDeviation = Math.sqrt(varianceSum / period);
  
  const upper = basis + stdDevMultiplier * standardDeviation;
  const lower = basis - stdDevMultiplier * standardDeviation;
  
  return { basis, upper, lower };
}

export function runBacktest(params: BacktestParams): BacktestResults {
  const candles = generateHistoricalData(params.market, 180); // Simulate on last 180 days
  const initialBalance = 10000;
  let balance = initialBalance;
  let position: { entryPrice: number; entryTime: string; amount: number } | null = null;
  
  const trades: Trade[] = [];
  const equityCurve: { time: string; balance: number; drawdown: number; price: number }[] = [];
  
  let maxBalance = initialBalance;
  let maxDrawdown = 0;
  
  // Risk-based settings
  const stopLoss = params.stopLossPercent || (params.riskLevel === 'Low' ? 1.5 : params.riskLevel === 'Medium' ? 3.0 : 6.0);
  const takeProfit = params.takeProfitPercent || (params.riskLevel === 'Low' ? 3.0 : params.riskLevel === 'Medium' ? 7.0 : 15.0);

  // Set default parameters for indicators if not provided
  const fastPeriod = params.indicators.fastPeriod || 12;
  const slowPeriod = params.indicators.slowPeriod || 26;
  const rsiPeriod = params.indicators.rsiPeriod || 14;
  const rsiOversold = params.indicators.rsiOversold || 30;
  const rsiOverbought = params.indicators.rsiOverbought || 70;
  const bbPeriod = params.indicators.bbPeriod || 20;
  const bbStdDev = params.indicators.bbStdDev || 2.0;

  // We start loop after a buffer to let indicators calculate
  const startIdx = Math.max(slowPeriod, rsiPeriod, bbPeriod) + 1;

  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i];
    const price = candle.close;
    
    // Drawdown calculation
    if (balance > maxBalance) {
      maxBalance = balance;
    }
    const currentDrawdown = maxBalance > 0 ? ((maxBalance - balance) / maxBalance) * 100 : 0;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }

    // Evaluate current open position for stop loss / take profit
    if (position !== null) {
      const priceChangePct = ((price - position.entryPrice) / position.entryPrice) * 100;
      
      let triggerExit = false;
      let exitReason = '';

      if (priceChangePct <= -stopLoss) {
        triggerExit = true;
        exitReason = 'Stop Loss';
      } else if (priceChangePct >= takeProfit) {
        triggerExit = true;
        exitReason = 'Take Profit';
      }

      if (triggerExit) {
        const exitPrice = price;
        const profit = (exitPrice - position.entryPrice) * position.amount;
        balance += profit;
        
        trades.push({
          id: Math.random().toString(36).substring(2, 9),
          type: 'SELL',
          price: exitPrice,
          time: candle.time,
          profit,
          profitPercent: priceChangePct,
          balanceAfter: balance
        });
        position = null;
      }
    }

    // If we have indicators available, evaluate strategy conditions
    if (i >= startIdx) {
      // 1. Trend (SMA Crossover) Strategy
      if (params.tradingStyle === 'Trend') {
        const prevFastSma = getSMA(candles, i - 1, fastPeriod);
        const prevSlowSma = getSMA(candles, i - 1, slowPeriod);
        const currFastSma = getSMA(candles, i, fastPeriod);
        const currSlowSma = getSMA(candles, i, slowPeriod);

        if (prevFastSma && prevSlowSma && currFastSma && currSlowSma) {
          // BUY Signal: Fast SMA crosses above Slow SMA
          if (prevFastSma <= prevSlowSma && currFastSma > currSlowSma && position === null) {
            position = {
              entryPrice: price,
              entryTime: candle.time,
              amount: balance / price
            };
            trades.push({
              id: Math.random().toString(36).substring(2, 9),
              type: 'BUY',
              price,
              time: candle.time,
              balanceAfter: balance
            });
          }
          // SELL Signal: Fast SMA crosses below Slow SMA
          else if (prevFastSma >= prevSlowSma && currFastSma < currSlowSma && position !== null) {
            const profit = (price - position.entryPrice) * position.amount;
            balance += profit;
            trades.push({
              id: Math.random().toString(36).substring(2, 9),
              type: 'SELL',
              price,
              time: candle.time,
              profit,
              profitPercent: ((price - position.entryPrice) / position.entryPrice) * 100,
              balanceAfter: balance
            });
            position = null;
          }
        }
      }
      
      // 2. Mean Reversion (RSI Oscillator) Strategy
      else if (params.tradingStyle === 'Mean Reversion') {
        const prevRsi = getRSI(candles, i - 1, rsiPeriod);
        const currRsi = getRSI(candles, i, rsiPeriod);

        if (prevRsi !== null && currRsi !== null) {
          // BUY Signal: RSI enters oversold area (< 30) or crosses back above it
          if (prevRsi >= rsiOversold && currRsi < rsiOversold && position === null) {
            position = {
              entryPrice: price,
              entryTime: candle.time,
              amount: balance / price
            };
            trades.push({
              id: Math.random().toString(36).substring(2, 9),
              type: 'BUY',
              price,
              time: candle.time,
              balanceAfter: balance
            });
          }
          // SELL Signal: RSI enters overbought area (> 70)
          else if (prevRsi <= rsiOverbought && currRsi > rsiOverbought && position !== null) {
            const profit = (price - position.entryPrice) * position.amount;
            balance += profit;
            trades.push({
              id: Math.random().toString(36).substring(2, 9),
              type: 'SELL',
              price,
              time: candle.time,
              profit,
              profitPercent: ((price - position.entryPrice) / position.entryPrice) * 100,
              balanceAfter: balance
            });
            position = null;
          }
        }
      }
      
      // 3. Momentum (Bollinger Bands Breakout) Strategy
      else if (params.tradingStyle === 'Momentum') {
        const prevBB = getBollingerBands(candles, i - 1, bbPeriod, bbStdDev);
        const currBB = getBollingerBands(candles, i, bbPeriod, bbStdDev);

        if (prevBB.upper && currBB.upper && prevBB.lower && currBB.lower) {
          // BUY Signal: Close price crosses ABOVE the upper Bollinger Band (breakout momentum)
          if (candles[i - 1].close <= prevBB.upper && price > currBB.upper && position === null) {
            position = {
              entryPrice: price,
              entryTime: candle.time,
              amount: balance / price
            };
            trades.push({
              id: Math.random().toString(36).substring(2, 9),
              type: 'BUY',
              price,
              time: candle.time,
              balanceAfter: balance
            });
          }
          // SELL Signal: Close price falls below the middle SMA (basis)
          else if (candles[i - 1].close >= prevBB.basis && price < currBB.basis && position !== null) {
            const profit = (price - position.entryPrice) * position.amount;
            balance += profit;
            trades.push({
              id: Math.random().toString(36).substring(2, 9),
              type: 'SELL',
              price,
              time: candle.time,
              profit,
              profitPercent: ((price - position.entryPrice) / position.entryPrice) * 100,
              balanceAfter: balance
            });
            position = null;
          }
        }
      }
      
      // 4. Scalping (Quick short-term RSI & SMA trades)
      else if (params.tradingStyle === 'Scalping') {
        const rsi = getRSI(candles, i, 7); // Shorter RSI period for scalping
        const fastSma = getSMA(candles, i, 5);
        const slowSma = getSMA(candles, i, 10);
        
        if (rsi !== null && fastSma !== null && slowSma !== null) {
          // Buy signal: RSI < 35 AND Fast SMA > Slow SMA
          if (rsi < 35 && fastSma > slowSma && position === null) {
            position = {
              entryPrice: price,
              entryTime: candle.time,
              amount: balance / price
            };
            trades.push({
              id: Math.random().toString(36).substring(2, 9),
              type: 'BUY',
              price,
              time: candle.time,
              balanceAfter: balance
            });
          }
          // Sell signal: RSI > 65 OR Fast SMA < Slow SMA
          else if ((rsi > 65 || fastSma < slowSma) && position !== null) {
            const profit = (price - position.entryPrice) * position.amount;
            balance += profit;
            trades.push({
              id: Math.random().toString(36).substring(2, 9),
              type: 'SELL',
              price,
              time: candle.time,
              profit,
              profitPercent: ((price - position.entryPrice) / position.entryPrice) * 100,
              balanceAfter: balance
            });
            position = null;
          }
        }
      }
    }
    
    // Track daily equity balance
    // Include current position valuation if active
    const currentValuation = position !== null 
      ? balance + (price - position.entryPrice) * position.amount 
      : balance;

    equityCurve.push({
      time: candle.time,
      balance: parseFloat(currentValuation.toFixed(2)),
      drawdown: parseFloat(currentDrawdown.toFixed(2)),
      price: price
    });
  }
  
  // Clean up remaining open position at the end of backtest period
  if (position !== null) {
    const finalPrice = candles[candles.length - 1].close;
    const profit = (finalPrice - position.entryPrice) * position.amount;
    balance += profit;
    trades.push({
      id: Math.random().toString(36).substring(2, 9),
      type: 'SELL',
      price: finalPrice,
      time: candles[candles.length - 1].time,
      profit,
      profitPercent: ((finalPrice - position.entryPrice) / position.entryPrice) * 100,
      balanceAfter: balance
    });
    
    // Update last entry in equity curve
    equityCurve[equityCurve.length - 1].balance = parseFloat(balance.toFixed(2));
  }

  // Calculate stats
  const totalReturn = ((balance - initialBalance) / initialBalance) * 100;
  const sellTrades = trades.filter(t => t.type === 'SELL');
  const totalTrades = sellTrades.length;
  const winningTrades = sellTrades.filter(t => (t.profit || 0) > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  
  const totalGains = sellTrades.filter(t => (t.profit || 0) > 0).reduce((sum, t) => sum + (t.profit || 0), 0);
  const totalLosses = Math.abs(sellTrades.filter(t => (t.profit || 0) <= 0).reduce((sum, t) => sum + (t.profit || 0), 0));
  const profitFactor = totalLosses > 0 ? totalGains / totalLosses : totalGains > 0 ? 99.9 : 0;

  // Simple Sharpe ratio calculation (annualized return / annualized volatility of daily returns)
  // Daily risk free rate assumed to be 0
  const dailyReturns: number[] = [];
  for (let idx = 1; idx < equityCurve.length; idx++) {
    const prev = equityCurve[idx - 1].balance;
    const curr = equityCurve[idx].balance;
    dailyReturns.push(prev > 0 ? (curr - prev) / prev : 0);
  }
  
  const avgDailyReturn = dailyReturns.reduce((sum, val) => sum + val, 0) / dailyReturns.length;
  const dailyVariance = dailyReturns.reduce((sum, val) => sum + Math.pow(val - avgDailyReturn, 2), 0) / dailyReturns.length;
  const dailyStdDev = Math.sqrt(dailyVariance);
  
  // Sharpe ratio = (average return / standard deviation) * sqrt(252 trading days)
  const sharpeRatio = dailyStdDev > 0 ? (avgDailyReturn / dailyStdDev) * Math.sqrt(252) : 0;

  return {
    winRate: parseFloat(winRate.toFixed(1)),
    profitFactor: parseFloat(profitFactor.toFixed(2)),
    sharpeRatio: parseFloat(sharpeRatio.toFixed(2)),
    maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
    totalReturn: parseFloat(totalReturn.toFixed(2)),
    initialBalance,
    finalBalance: parseFloat(balance.toFixed(2)),
    totalTrades,
    equityCurve,
    trades
  };
}
