#!/usr/bin/env node

/**
 * Chronos Alpha CLI Strategy Backtester
 * 
 * Run: node scripts/backtest-cli.js --market BTC --style Trend --risk Medium
 */

const fs = require('fs');
const path = require('path');

// Read command line arguments
const args = process.argv.slice(2);
const params = {
  market: 'BTC',
  style: 'Trend',
  risk: 'Medium'
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--market' || args[i] === '-m') {
    params.market = args[i + 1]?.toUpperCase() || 'BTC';
  } else if (args[i] === '--style' || args[i] === '-s') {
    params.style = args[i + 1] || 'Trend';
  } else if (args[i] === '--risk' || args[i] === '-r') {
    params.risk = args[i + 1] || 'Medium';
  }
}

console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log('\x1b[36m%s\x1b[0m', '   CHRONOS ALPHA CLI QUANT BACKTESTER ENGINE      ');
console.log('\x1b[36m%s\x1b[0m', '==================================================');
console.log(`Target Market: ${params.market}`);
console.log(`Trading Style: ${params.style}`);
console.log(`Risk Level:   ${params.risk}`);
console.log('--------------------------------------------------');

// Mirroring math engines for simple Node operations
function getSMA(prices, index, period) {
  if (index < period - 1) return null;
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[index - i];
  }
  return sum / period;
}

function getRSI(prices, index, period) {
  if (index < period) return null;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[index - period + i] - prices[index - period + i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  if (avgLoss === 0) return 100;
  return 100 - 100 / (1 + avgGain / avgLoss);
}

function getBollingerBands(prices, index, period, stdDevMultiplier) {
  if (index < period - 1) return { basis: null, upper: null, lower: null };
  const basis = getSMA(prices, index, period);
  let varianceSum = 0;
  for (let i = 0; i < period; i++) {
    varianceSum += Math.pow(prices[index - i] - basis, 2);
  }
  const standardDeviation = Math.sqrt(varianceSum / period);
  return {
    basis,
    upper: basis + stdDevMultiplier * standardDeviation,
    lower: basis - stdDevMultiplier * standardDeviation
  };
}

// Generate deterministic historical prices (180 candles)
function generateHistoricalPrices(market) {
  const symbol = market.toUpperCase();
  let price = symbol === 'BTC' ? 65000 : symbol === 'ETH' ? 3400 : symbol === 'SOL' ? 150 : 16;
  const vol = symbol === 'BTC' ? 0.02 : symbol === 'ETH' ? 0.028 : symbol === 'SOL' ? 0.045 : 0.038;
  
  // Custom seed LCG
  let seed = 45678;
  function lcgRandom() {
    seed = (1103515245 * seed + 12345) % 2147483648;
    return seed / 2147483648;
  }

  const prices = [];
  const times = [];
  const now = new Date();
  
  for (let i = 180; i >= 0; i--) {
    const change = price * (0.0002 + vol * (lcgRandom() - 0.49) * 2);
    price = Math.max(0.01, price + change);
    prices.push(price);
    
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    times.push(date.toISOString().split('T')[0]);
  }
  return { prices, times };
}

const { prices, times } = generateHistoricalPrices(params.market);

// Set backtest params
const initialBalance = 10000;
let balance = initialBalance;
let position = null;
const trades = [];
const equityCurve = [];
let maxBalance = initialBalance;
let maxDrawdown = 0;

const stopLoss = params.risk === 'Low' ? 1.5 : params.risk === 'Medium' ? 3.0 : 6.0;
const takeProfit = params.risk === 'Low' ? 3.0 : params.risk === 'Medium' ? 7.0 : 15.0;

// Execute simulation loop
for (let i = 0; i < prices.length; i++) {
  const price = prices[i];
  const time = times[i];

  if (balance > maxBalance) maxBalance = balance;
  const drawdown = ((maxBalance - balance) / maxBalance) * 100;
  if (drawdown > maxDrawdown) maxDrawdown = drawdown;

  // Position exits
  if (position) {
    const pctChange = ((price - position.entryPrice) / position.entryPrice) * 100;
    let triggerExit = false;
    let note = '';

    if (pctChange <= -stopLoss) {
      triggerExit = true;
      note = 'Stop Loss';
    } else if (pctChange >= takeProfit) {
      triggerExit = true;
      note = 'Take Profit';
    }

    if (triggerExit) {
      const profit = (price - position.entryPrice) * position.amount;
      balance += profit;
      trades.push({
        type: 'SELL',
        price,
        time,
        profit,
        profitPercent: pctChange,
        note
      });
      position = null;
    }
  }

  // Position entries
  if (i >= 30) {
    if (params.style === 'Trend') {
      const fastPrev = getSMA(prices, i - 1, 12);
      const slowPrev = getSMA(prices, i - 1, 26);
      const fastCurr = getSMA(prices, i, 12);
      const slowCurr = getSMA(prices, i, 26);

      if (fastPrev <= slowPrev && fastCurr > slowCurr && !position) {
        position = { entryPrice: price, amount: balance / price };
        trades.push({ type: 'BUY', price, time });
      } else if (fastPrev >= slowPrev && fastCurr < slowCurr && position) {
        const profit = (price - position.entryPrice) * position.amount;
        balance += profit;
        trades.push({
          type: 'SELL',
          price,
          time,
          profit,
          profitPercent: ((price - position.entryPrice) / position.entryPrice) * 100,
          note: 'Indicator Exit'
        });
        position = null;
      }
    } else if (params.style === 'Mean Reversion') {
      const rsiPrev = getRSI(prices, i - 1, 14);
      const rsiCurr = getRSI(prices, i, 14);

      if (rsiPrev >= 30 && rsiCurr < 30 && !position) {
        position = { entryPrice: price, amount: balance / price };
        trades.push({ type: 'BUY', price, time });
      } else if (rsiPrev <= 70 && rsiCurr > 70 && position) {
        const profit = (price - position.entryPrice) * position.amount;
        balance += profit;
        trades.push({
          type: 'SELL',
          price,
          time,
          profit,
          profitPercent: ((price - position.entryPrice) / position.entryPrice) * 100,
          note: 'Indicator Exit'
        });
        position = null;
      }
    } else if (params.style === 'Momentum') {
      const bbPrev = getBollingerBands(prices, i - 1, 20, 2.0);
      const bbCurr = getBollingerBands(prices, i, 20, 2.0);

      if (prices[i - 1] <= bbPrev.upper && price > bbCurr.upper && !position) {
        position = { entryPrice: price, amount: balance / price };
        trades.push({ type: 'BUY', price, time });
      } else if (prices[i - 1] >= bbPrev.basis && price < bbCurr.basis && position) {
        const profit = (price - position.entryPrice) * position.amount;
        balance += profit;
        trades.push({
          type: 'SELL',
          price,
          time,
          profit,
          profitPercent: ((price - position.entryPrice) / position.entryPrice) * 100,
          note: 'Indicator Exit'
        });
        position = null;
      }
    } else {
      // Scalping
      const rsi = getRSI(prices, i, 7);
      const fast = getSMA(prices, i, 5);
      const slow = getSMA(prices, i, 10);

      if (rsi < 35 && fast > slow && !position) {
        position = { entryPrice: price, amount: balance / price };
        trades.push({ type: 'BUY', price, time });
      } else if ((rsi > 65 || fast < slow) && position) {
        const profit = (price - position.entryPrice) * position.amount;
        balance += profit;
        trades.push({
          type: 'SELL',
          price,
          time,
          profit,
          profitPercent: ((price - position.entryPrice) / position.entryPrice) * 100,
          note: 'Indicator Exit'
        });
        position = null;
      }
    }
  }

  const currentValuation = position ? balance + (price - position.entryPrice) * position.amount : balance;
  equityCurve.push(currentValuation);
}

// Clean up remaining open position
if (position) {
  const finalPrice = prices[prices.length - 1];
  const profit = (finalPrice - position.entryPrice) * position.amount;
  balance += profit;
  trades.push({
    type: 'SELL',
    price: finalPrice,
    time: times[times.length - 1],
    profit,
    profitPercent: ((finalPrice - position.entryPrice) / position.entryPrice) * 100,
    note: 'End of Session'
  });
  equityCurve[equityCurve.length - 1] = balance;
}

// Stats calculations
const totalReturn = ((balance - initialBalance) / initialBalance) * 100;
const sellTrades = trades.filter(t => t.type === 'SELL');
const winTrades = sellTrades.filter(t => t.profit > 0);
const winRate = sellTrades.length > 0 ? (winTrades.length / sellTrades.length) * 100 : 0;
const totalGains = winTrades.reduce((sum, t) => sum + t.profit, 0);
const totalLosses = Math.abs(sellTrades.filter(t => t.profit <= 0).reduce((sum, t) => sum + t.profit, 0));
const profitFactor = totalLosses > 0 ? totalGains / totalLosses : 99.9;

console.log('\x1b[32m%s\x1b[0m', '✔ Simulation completed successfully!');
console.log('--------------------------------------------------');
console.log(`Initial Balance:  $${initialBalance.toLocaleString()}`);
console.log(`Final Balance:    $${balance.toFixed(2).toLocaleString()}`);
console.log(`Total Return:     ${totalReturn.toFixed(2)}%`);
console.log(`Win Rate:         ${winRate.toFixed(1)}% (${winTrades.length}/${sellTrades.length} trades)`);
console.log(`Profit Factor:    ${profitFactor.toFixed(2)}`);
console.log(`Max Drawdown:     -${maxDrawdown.toFixed(2)}%`);
console.log('--------------------------------------------------');

// Print simple terminal ASCII chart of equity curve (15 rows, 40 columns)
console.log('\x1b[35m%s\x1b[0m', '  [ASCII PERFORMANCE CHART - PORTFOLIO BALANCE]');
const rows = 10;
const cols = 50;
const chartGrid = Array(rows).fill(null).map(() => Array(cols).fill(' '));

const minEq = Math.min(...equityCurve);
const maxEq = Math.max(...equityCurve);
const eqRange = maxEq - minEq || 1;

for (let c = 0; c < cols; c++) {
  const curveIdx = Math.floor((c / cols) * equityCurve.length);
  const eqVal = equityCurve[curveIdx];
  const rowIdx = rows - 1 - Math.floor(((eqVal - minEq) / eqRange) * (rows - 1));
  
  if (rowIdx >= 0 && rowIdx < rows) {
    chartGrid[rowIdx][c] = '*';
  }
}

chartGrid.forEach((row, idx) => {
  const priceVal = maxEq - (idx / (rows - 1)) * eqRange;
  const label = `$${Math.round(priceVal).toLocaleString()}`.padEnd(8);
  console.log(` ${label} | ${row.join('')}`);
});
console.log(' '.repeat(10) + '+' + '-'.repeat(cols));
console.log(' '.repeat(10) + ` Day 0${' '.repeat(cols - 10)}Day 180`);
console.log('--------------------------------------------------');

// List recent trades
console.log('\x1b[33m%s\x1b[0m', '  [RECENT EXECUTIONS]');
const recentTrades = trades.slice(-6);
recentTrades.forEach((t) => {
  const dirColor = t.type === 'BUY' ? '\x1b[32m' : '\x1b[31m';
  const tradeDetails = t.type === 'BUY' 
    ? `BUY  @ $${t.price.toLocaleString()}`
    : `SELL @ $${t.price.toLocaleString()} (Profit: ${t.profit >= 0 ? '+' : ''}$${t.profit.toFixed(2)} / ${t.profitPercent.toFixed(2)}%) [${t.note}]`;
  console.log(` ${t.time} | ${dirColor}${t.type}\x1b[0m | ${tradeDetails}`);
});
console.log('\x1b[36m%s\x1b[0m', '==================================================');
