/**
 * Chronos Alpha AI Strategy Generator (Node.js CommonJS)
 * 
 * Translates style, asset, and risk levels into complete backtestable strategy configs.
 */

function generateStrategy(params) {
  const market = (params.market || 'BTC').toUpperCase();
  const riskLevel = params.risk || 'Medium';
  const tradingStyle = params.style || 'Trend';
  const id = Math.random().toString(36).substring(2, 9);

  let name = '';
  let description = '';
  let strategyParams = {};
  let confidenceScore = 80;
  let riskExplanation = '';
  let riskWarnings = [];

  const stopLoss = riskLevel === 'Low' ? 1.5 : riskLevel === 'Medium' ? 3.0 : 6.0;
  const takeProfit = riskLevel === 'Low' ? 3.0 : riskLevel === 'Medium' ? 7.0 : 15.0;

  if (tradingStyle === 'Trend') {
    const fast = riskLevel === 'Low' ? 20 : riskLevel === 'Medium' ? 12 : 9;
    const slow = riskLevel === 'Low' ? 50 : riskLevel === 'Medium' ? 26 : 21;
    name = `${market} Alpha-Trend Crossover`;
    description = `Dual moving average crossover strategy optimized for tracking medium-term momentum changes on ${market}.`;
    strategyParams = {
      fastPeriod: fast,
      slowPeriod: slow,
      stopLossPercent: stopLoss,
      takeProfitPercent: takeProfit
    };
    confidenceScore = riskLevel === 'Low' ? 88 : riskLevel === 'Medium' ? 82 : 74;
    riskExplanation = `Trend following strategies perform well in sustained trending markets, but suffer from consecutive drawdown periods (whipsaws) in sideways markets.`;
    riskWarnings = [
      "Vulnerability to range-bound sideways markets",
      "Slight lag in entry signals due to moving average smoothing"
    ];
  } else if (tradingStyle === 'Mean Reversion') {
    const period = 14;
    const oversold = riskLevel === 'Low' ? 35 : riskLevel === 'Medium' ? 30 : 25;
    const overbought = riskLevel === 'Low' ? 65 : riskLevel === 'Medium' ? 70 : 75;
    name = `${market} Mean-Reversion Oscillator`;
    description = `Mean reversion model designed to trade market extremes on ${market} using the Relative Strength Index (RSI).`;
    strategyParams = {
      rsiPeriod: period,
      rsiOversold: oversold,
      rsiOverbought: overbought,
      stopLossPercent: stopLoss,
      takeProfitPercent: takeProfit
    };
    confidenceScore = riskLevel === 'Low' ? 85 : riskLevel === 'Medium' ? 79 : 68;
    riskExplanation = `Mean reversion assumes prices return to historical averages. If a heavy breakout occurs, this strategy risks significant losses.`;
    riskWarnings = [
      "Danger of catching falling knives in heavy capitulation events",
      "Risk of premature exits before trend exhaustion completes"
    ];
  } else if (tradingStyle === 'Momentum') {
    const period = 20;
    const dev = riskLevel === 'Low' ? 2.2 : riskLevel === 'Medium' ? 2.0 : 1.8;
    name = `${market} Volatility Breakout System`;
    description = `A breakout system leveraging Bollinger Bands to capture high-momentum expansion phases on ${market}.`;
    strategyParams = {
      bbPeriod: period,
      bbStdDev: dev,
      stopLossPercent: stopLoss,
      takeProfitPercent: takeProfit
    };
    confidenceScore = riskLevel === 'Low' ? 83 : riskLevel === 'Medium' ? 80 : 72;
    riskExplanation = `Momentum strategies buy high and sell higher. In cases of failed breakouts, position is exited quickly.`;
    riskWarnings = [
      "High rate of fakeouts (false breakouts)",
      "High drawdown periods during multi-month consolidation markets"
    ];
  } else {
    name = `${market} Ultra-Scalp Engine`;
    description = `High-frequency algorithmic scalper using micro moving averages and short RSI (7) to capture small percentage gains.`;
    strategyParams = {
      rsiPeriod: 7,
      fastPeriod: 5,
      slowPeriod: 10,
      stopLossPercent: stopLoss,
      takeProfitPercent: takeProfit
    };
    confidenceScore = riskLevel === 'Low' ? 78 : riskLevel === 'Medium' ? 70 : 58;
    riskExplanation = `Scalping trades frequently. Primary risks are transaction costs and latency slippage.`;
    riskWarnings = [
      "High sensitivity to fee drag",
      "API execution speed dependency"
    ];
  }

  return {
    strategy: {
      id,
      name,
      description,
      market,
      tradingStyle,
      riskLevel,
      parameters: strategyParams,
      confidenceScore,
      riskExplanation,
      riskWarnings,
      createdAt: new Date().toISOString()
    }
  };
}

module.exports = { generateStrategy };
