/**
 * Chronos Alpha AI Strategy Evaluator
 * 
 * Performs post-backtest analysis to evaluate strategy quality and recommend indicators.
 */

function evaluateStrategy(backtestResult) {
  const { winRate, totalReturn, maxDrawdown, profitFactor } = backtestResult;

  let score = 0;

  // Performance scoring logic
  if (totalReturn > 0) {
    score += Math.min(30, Math.round(totalReturn * 1.5));
  } else {
    score -= Math.min(20, Math.abs(Math.round(totalReturn)));
  }

  if (winRate > 50) {
    score += 25;
  } else if (winRate > 40) {
    score += 15;
  } else if (winRate > 0) {
    score += 5;
  }

  if (maxDrawdown > -5) {
    score += 20;
  } else if (maxDrawdown > -12) {
    score += 12;
  } else if (maxDrawdown > -20) {
    score += 5;
  }

  if (profitFactor > 1.8) {
    score += 25;
  } else if (profitFactor > 1.2) {
    score += 18;
  } else if (profitFactor > 0.8) {
    score += 8;
  }

  // Ensure score is between 5 and 99
  score = Math.max(5, Math.min(99, score));

  let verdict = "WEAK STRATEGY - NEEDS OPTIMIZATION";
  let recommendation = "Increase filtering rules (add RSI + volume confirmation) or tighten stop-losses to contain drawdowns.";

  if (score >= 80) {
    verdict = "STRONG BUY STRATEGY (DEPLOYABLE)";
    recommendation = "Excellent performance metrics. Deployable in live paper trading mode. Suggest trailing stop activation.";
  } else if (score >= 60) {
    verdict = "MODERATE STRATEGY (MONITOR)";
    recommendation = "Balanced return ratio. Recommend adjusting take-profit windows outward by +1.5% to run trends further.";
  }

  return {
    score,
    verdict,
    recommendation
  };
}

module.exports = { evaluateStrategy };
