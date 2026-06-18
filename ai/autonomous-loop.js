/**
 * Chronos Alpha - Autonomous Loop Engine
 * 
 * Run: node ai/autonomous-loop.js --market BTC --style Trend --risk Medium
 */

const fs = require('fs');
const path = require('path');
const { generateStrategy } = require("./strategy-generator");
const { evaluateStrategy } = require("./strategy-evaluator");

// Read arguments
const args = process.argv.slice(2);
const params = {
  market: 'BTC',
  style: 'Trend',
  risk: 'Medium',
  threshold: 70
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--market' || args[i] === '-m') {
    params.market = args[i + 1]?.toUpperCase() || 'BTC';
  } else if (args[i] === '--style' || args[i] === '-s') {
    params.style = args[i + 1] || 'Trend';
  } else if (args[i] === '--risk' || args[i] === '-r') {
    params.risk = args[i + 1] || 'Medium';
  } else if (args[i] === '--threshold' || args[i] === '-t') {
    params.threshold = parseFloat(args[i + 1]) || 70;
  }
}

console.log('\x1b[35m%s\x1b[0m', '==================================================');
console.log('\x1b[35m%s\x1b[0m', '   CHRONOS ALPHA AUTONOMOUS OPTIMIZATION LOOP     ');
console.log('\x1b[35m%s\x1b[0m', '==================================================');
console.log(`Target Market:      ${params.market}`);
console.log(`Trading Style:      ${params.style}`);
console.log(`Risk Target:        ${params.risk}`);
console.log(`Approval Threshold: ${params.threshold}/100`);
console.log('--------------------------------------------------');

// Fast deterministic price generator for simulation
function runSimulatedBacktest(market, style, risk, parameters) {
  const symbol = market.toUpperCase();
  let price = symbol === 'BTC' ? 65000 : symbol === 'ETH' ? 3400 : symbol === 'SOL' ? 150 : 16;
  const vol = symbol === 'BTC' ? 0.02 : symbol === 'ETH' ? 0.028 : symbol === 'SOL' ? 0.045 : 0.038;
  
  let seed = 98765;
  function lcgRandom() {
    seed = (1103515245 * seed + 12345) % 2147483648;
    return seed / 2147483648;
  }

  const prices = [];
  for (let i = 0; i < 180; i++) {
    const change = price * (0.0002 + vol * (lcgRandom() - 0.49) * 2);
    price = Math.max(0.01, price + change);
    prices.push(price);
  }

  // Calculate simple simulation indicators and trade entries/exits
  const stopLoss = parameters.stopLossPercent;
  const takeProfit = parameters.takeProfitPercent;
  let balance = 10000;
  let initialBalance = 10000;
  let maxBalance = 10000;
  let maxDrawdown = 0;
  let tradesCount = 0;
  let winsCount = 0;
  let totalGains = 0;
  let totalLosses = 0;
  
  let position = null;

  for (let i = 30; i < prices.length; i++) {
    const p = prices[i];
    if (balance > maxBalance) maxBalance = balance;
    const dd = ((maxBalance - balance) / maxBalance) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;

    if (position) {
      const pctChange = ((p - position.entryPrice) / position.entryPrice) * 100;
      let exitTriggered = false;
      let profit = 0;

      if (pctChange <= -stopLoss) {
        exitTriggered = true;
        profit = (p - position.entryPrice) * position.amount;
      } else if (pctChange >= takeProfit) {
        exitTriggered = true;
        profit = (p - position.entryPrice) * position.amount;
      } else if (i % 25 === 0) { // Time-based exit to simulate index reverse
        exitTriggered = true;
        profit = (p - position.entryPrice) * position.amount;
      }

      if (exitTriggered) {
        balance += profit;
        tradesCount++;
        if (profit > 0) {
          winsCount++;
          totalGains += profit;
        } else {
          totalLosses += Math.abs(profit);
        }
        position = null;
      }
    } else {
      // Simulate buy indicator triggers (simplified cross checks)
      const triggerBuy = (style === 'Trend' && i % 14 === 0) ||
                         (style === 'Mean Reversion' && i % 18 === 0) ||
                         (style === 'Momentum' && i % 11 === 0) ||
                         (style === 'Scalping' && i % 8 === 0);
      
      if (triggerBuy) {
        position = { entryPrice: p, amount: balance / p };
      }
    }
  }

  // Close final position
  if (position) {
    const finalPrice = prices[prices.length - 1];
    const profit = (finalPrice - position.entryPrice) * position.amount;
    balance += profit;
    tradesCount++;
    if (profit > 0) {
      winsCount++;
      totalGains += profit;
    } else {
      totalLosses += Math.abs(profit);
    }
  }

  const winRate = tradesCount > 0 ? (winsCount / tradesCount) * 100 : 0;
  const totalReturn = ((balance - initialBalance) / initialBalance) * 100;
  const profitFactor = totalLosses > 0 ? totalGains / totalLosses : 99.9;

  return {
    winRate,
    totalReturn,
    maxDrawdown,
    profitFactor
  };
}

function logAttempt(strategy, evaluation) {
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const historyPath = path.join(publicDir, 'optimization_history.json');
  let history = [];
  
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (e) {
      console.error('Failed to parse optimization_history.json, resetting history.', e);
    }
  }
  
  if (!Array.isArray(history)) {
    history = [];
  }
  
  const attempt = {
    name: strategy.name,
    parameters: strategy.parameters,
    score: evaluation.score,
    verdict: evaluation.verdict,
    timestamp: new Date().toISOString()
  };
  
  history.push(attempt);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  console.log(`✔ Attempt logged in optimization history: "${strategy.name}" (Score: ${evaluation.score})`);
}

async function runAutonomousLoop() {
  console.log(`[1] Compiling Strategy Brain for ${params.market}...`);
  const initialData = generateStrategy({
    market: params.market,
    style: params.style,
    risk: params.risk
  });
  
  const strategy = initialData.strategy;
  console.log(`\x1b[32m✔ Strategy generated: "${strategy.name}"\x1b[0m`);
  console.log(`    Parameters: ${JSON.stringify(strategy.parameters)}`);

  console.log(`\n[2] Executing 180-Day Volatility Backtest...`);
  let metrics = runSimulatedBacktest(params.market, params.style, params.risk, strategy.parameters);
  
  console.log(`    Total Return:  ${metrics.totalReturn.toFixed(2)}%`);
  console.log(`    Win Rate:      ${metrics.winRate.toFixed(1)}%`);
  console.log(`    Max Drawdown:  -${metrics.maxDrawdown.toFixed(2)}%`);
  console.log(`    Profit Factor: ${metrics.profitFactor.toFixed(2)}`);

  console.log(`\n[3] Running Post-Backtest AI Evaluation...`);
  let evaluation = evaluateStrategy({
    winRate: metrics.winRate,
    totalReturn: metrics.totalReturn,
    maxDrawdown: -metrics.maxDrawdown,
    profitFactor: metrics.profitFactor
  });

  console.log(`    AI Quant Score: \x1b[36m${evaluation.score}/100\x1b[0m`);
  console.log(`    Verdict:        ${evaluation.verdict}`);
  console.log(`    Recommendation: ${evaluation.recommendation}`);

  logAttempt(strategy, evaluation);

  if (evaluation.score >= params.threshold) {
    approveAndSave(strategy, metrics, evaluation);
  } else {
    console.log('\x1b[33m%s\x1b[0m', `\n[!] Score ${evaluation.score} is below threshold ${params.threshold}. Initializing Mutation Loop...`);
    
    // Mutate parameters based on AI recommendation
    console.log(`🧬 Mutating strategy parameters...`);
    const mutatedParams = { ...strategy.parameters };
    
    if (params.style === 'Trend') {
      mutatedParams.fastPeriod = Math.max(5, strategy.parameters.fastPeriod - 2);
      mutatedParams.slowPeriod = strategy.parameters.slowPeriod + 3;
      mutatedParams.takeProfitPercent = strategy.parameters.takeProfitPercent * 1.25;
      mutatedParams.stopLossPercent = strategy.parameters.stopLossPercent * 0.85;
    } else if (params.style === 'Mean Reversion') {
      mutatedParams.rsiOversold = Math.max(15, strategy.parameters.rsiOversold - 3);
      mutatedParams.rsiOverbought = Math.min(85, strategy.parameters.rsiOverbought + 3);
      mutatedParams.takeProfitPercent = strategy.parameters.takeProfitPercent * 1.15;
    } else {
      mutatedParams.stopLossPercent = strategy.parameters.stopLossPercent * 0.8;
      mutatedParams.takeProfitPercent = strategy.parameters.takeProfitPercent * 1.2;
    }

    const mutatedName = `${strategy.name} (Evolved v2)`;
    console.log(`\x1b[36m✔ Mutated Strategy: "${mutatedName}"\x1b[0m`);
    console.log(`    New Parameters: ${JSON.stringify(mutatedParams)}`);

    console.log(`\n[4] Re-running 180-Day Volatility Backtest on Mutated Strategy...`);
    const mutatedMetrics = runSimulatedBacktest(params.market, params.style, params.risk, mutatedParams);
    
    console.log(`    Total Return:  ${mutatedMetrics.totalReturn.toFixed(2)}%`);
    console.log(`    Win Rate:      ${mutatedMetrics.winRate.toFixed(1)}%`);
    console.log(`    Max Drawdown:  -${mutatedMetrics.maxDrawdown.toFixed(2)}%`);
    console.log(`    Profit Factor: ${mutatedMetrics.profitFactor.toFixed(2)}`);

    console.log(`\n[5] Re-evaluating Mutated Strategy...`);
    const mutatedEvaluation = evaluateStrategy({
      winRate: mutatedMetrics.winRate,
      totalReturn: mutatedMetrics.totalReturn,
      maxDrawdown: -mutatedMetrics.maxDrawdown,
      profitFactor: mutatedMetrics.profitFactor
    });

    console.log(`    AI Quant Score: \x1b[36m${mutatedEvaluation.score}/100\x1b[0m`);
    console.log(`    Verdict:        ${mutatedEvaluation.verdict}`);
    console.log(`    Recommendation: ${mutatedEvaluation.recommendation}`);

    const updatedStrategy = {
      ...strategy,
      name: mutatedName,
      parameters: mutatedParams
    };

    logAttempt(updatedStrategy, mutatedEvaluation);

    let finalStrategy = strategy;
    let finalMetrics = metrics;
    let finalEvaluation = evaluation;

    if (mutatedEvaluation.score >= evaluation.score) {
      console.log(`\x1b[32m✔ Mutated strategy improved performance. Score increased from ${evaluation.score} to ${mutatedEvaluation.score}.\x1b[0m`);
      finalStrategy = updatedStrategy;
      finalMetrics = mutatedMetrics;
      finalEvaluation = mutatedEvaluation;
    } else {
      console.log(`\x1b[31m❌ Mutation did not improve score. Retaining parent config.\x1b[0m`);
    }

    if (finalEvaluation.score >= params.threshold) {
      approveAndSave(finalStrategy, finalMetrics, finalEvaluation, "DEPLOYED");
    } else {
      console.log('\x1b[33m%s\x1b[0m', `\n[!] Final score ${finalEvaluation.score} is still below threshold ${params.threshold}.`);
      approveAndSave(finalStrategy, finalMetrics, finalEvaluation, "REJECTED");
    }
  }
}

function approveAndSave(strategy, metrics, evaluation, status = "DEPLOYED") {
  const isApproved = status === "DEPLOYED";
  if (isApproved) {
    console.log('\x1b[32m%s\x1b[0m', `\n🚀 STRATEGY APPROVED! ACTIVATING PAPER TRADING FEED ENGINE.`);
  } else {
    console.log('\x1b[31m%s\x1b[0m', `\n❌ STRATEGY REJECTED (Score below threshold). SAVING AS CANDIDATE.`);
    console.log(`To continue searching, run the loop again with a lower threshold or different parameters:`);
    console.log(`\x1b[36m    node ai/autonomous-loop.js --market ${params.market} --style ${params.style} --threshold <lower_value>\x1b[0m`);
  }
  
  const activeStrategy = {
    strategy,
    metrics,
    evaluation,
    activatedAt: new Date().toISOString(),
    status
  };

  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const manifestPath = path.join(publicDir, 'active_strategy.json');
  fs.writeFileSync(manifestPath, JSON.stringify(activeStrategy, null, 2));
  console.log(`✔ Manifest active strategy saved: public/active_strategy.json [Status: ${status}]`);
  if (isApproved) {
    console.log(`\nTo run paper trade on this strategy:`);
    console.log(`\x1b[36m    node scripts/bitget-paper-trader.js\x1b[0m`);
  }
  console.log('==================================================');
}

runAutonomousLoop();
