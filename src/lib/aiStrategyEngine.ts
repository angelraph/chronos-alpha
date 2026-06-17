import { BacktestParams } from './backtestEngine';

export interface StrategyOutput {
  id: string;
  name: string;
  description: string;
  market: string;
  tradingStyle: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  parameters: any;
  confidenceScore: number;
  riskExplanation: string;
  riskWarnings: string[];
  codePython: string;
  codePine: string;
  codeJson: string;
  createdAt: string;
}

export function generateLocalStrategy(
  market: string,
  tradingStyle: string,
  riskLevel: 'Low' | 'Medium' | 'High',
  descriptionPrompt?: string
): StrategyOutput {
  const symbol = market.toUpperCase();
  const id = Math.random().toString(36).substring(2, 9);
  
  // Set default parameters and names based on styles
  let name = '';
  let description = '';
  let parameters: any = {};
  let confidenceScore = 80;
  let riskExplanation = '';
  let riskWarnings: string[] = [];
  
  const stopLoss = riskLevel === 'Low' ? 1.5 : riskLevel === 'Medium' ? 3.0 : 6.0;
  const takeProfit = riskLevel === 'Low' ? 3.0 : riskLevel === 'Medium' ? 7.0 : 15.0;

  if (tradingStyle === 'Trend') {
    const fast = riskLevel === 'Low' ? 20 : riskLevel === 'Medium' ? 12 : 9;
    const slow = riskLevel === 'Low' ? 50 : riskLevel === 'Medium' ? 26 : 21;
    name = `${symbol} Alpha-Trend Crossover`;
    description = `An institutional-grade dual moving average crossover strategy optimized for tracking medium-term momentum changes on ${symbol}. Enter longs when the fast moving average crosses above the slow moving average, signaling an uptrend.`;
    parameters = {
      fastPeriod: fast,
      slowPeriod: slow,
      stopLossPercent: stopLoss,
      takeProfitPercent: takeProfit
    };
    confidenceScore = riskLevel === 'Low' ? 88 : riskLevel === 'Medium' ? 82 : 74;
    riskExplanation = `Trend following strategies perform exceptionally well in sustained trending markets, but suffer from consecutive drawdown periods (whipsaws) in sideways or range-bound markets. The risk is managed here via strict trailing stops.`;
    riskWarnings = [
      "High vulnerability to range-bound sideways markets",
      "Slight lag in entry signals due to moving average smoothing",
      "Potential for slippage on breakout execution in volatile assets"
    ];
  } else if (tradingStyle === 'Mean Reversion') {
    const period = 14;
    const oversold = riskLevel === 'Low' ? 35 : riskLevel === 'Medium' ? 30 : 25;
    const overbought = riskLevel === 'Low' ? 65 : riskLevel === 'Medium' ? 70 : 75;
    name = `${symbol} Mean-Reversion Oscillator`;
    description = `A mean reversion model designed to trade market extremes on ${symbol} using the Relative Strength Index (RSI). Captures oversold capitulation points for quick retracements while limiting risk through adaptive stops.`;
    parameters = {
      rsiPeriod: period,
      rsiOversold: oversold,
      rsiOverbought: overbought,
      stopLossPercent: stopLoss,
      takeProfitPercent: takeProfit
    };
    confidenceScore = riskLevel === 'Low' ? 85 : riskLevel === 'Medium' ? 79 : 68;
    riskExplanation = `Mean reversion assumes prices return to historical averages. In cases of structural market shifts, black swan events, or highly trending impulses, this strategy faces the risk of 'catching a falling knife'. Risk is mitigated by setting tight stop losses below the swing low.`;
    riskWarnings = [
      "Danger of catching falling knives in heavy capitulation events",
      "Risk of premature exits before trend exhaustion completes",
      "Susceptible to leverage-flush squeeze cycles common in crypto"
    ];
  } else if (tradingStyle === 'Momentum') {
    const period = 20;
    const dev = riskLevel === 'Low' ? 2.2 : riskLevel === 'Medium' ? 2.0 : 1.8;
    name = `${symbol} Volatility Breakout System`;
    description = `A breakout system leveraging Bollinger Bands to capture high-momentum expansion phases on ${symbol}. Generates long alerts on a candle close above the upper band, capitalizing on market squeezes and volatility shifts.`;
    parameters = {
      bbPeriod: period,
      bbStdDev: dev,
      stopLossPercent: stopLoss,
      takeProfitPercent: takeProfit
    };
    confidenceScore = riskLevel === 'Low' ? 83 : riskLevel === 'Medium' ? 80 : 72;
    riskExplanation = `Momentum and breakout strategies buy high and sell higher. They rely on volatility expansion to sustain. In cases of fakeouts (failed breakouts), the position is liquidated quickly. Volatility standard deviation thresholds are adjusted here to reflect ${symbol}'s variance.`;
    riskWarnings = [
      "High rate of fakeouts (false breakouts)",
      "High drawdown periods during multi-month consolidation markets",
      "Increased capital demand during highly active market impulses"
    ];
  } else {
    // Scalping
    name = `${symbol} Ultra-Scalp Engine`;
    description = `A high-frequency algorithmic scalper on ${symbol} using micro-moving averages (5/10) and a short-period RSI (7) to execute rapid, low-duration trades. Targets small percentage gains and strictly controls drawdown.`;
    parameters = {
      rsiPeriod: 7,
      fastPeriod: 5,
      slowPeriod: 10,
      stopLossPercent: stopLoss,
      takeProfitPercent: takeProfit
    };
    confidenceScore = riskLevel === 'Low' ? 78 : riskLevel === 'Medium' ? 70 : 58;
    riskExplanation = `Scalping strategies trade very frequently with tight targets. The primary risks are transaction costs, exchange latency, and slippage. In highly volatile conditions, stop-losses might trigger late, resulting in larger-than-planned losses.`;
    riskWarnings = [
      "High sensitivity to maker/taker fee drag on profitability",
      "API execution speed dependency",
      "Slippage risk during high-impact news releases or network congestion"
    ];
  }

  if (descriptionPrompt) {
    description += ` Custom focus: "${descriptionPrompt}"`;
  }

  // Code Generators
  const codePython = generatePythonCode(name, tradingStyle, parameters, symbol);
  const codePine = generatePineScript(name, tradingStyle, parameters, symbol);
  
  const metadata = {
    strategyId: id,
    strategyName: name,
    assetClass: "Cryptocurrency",
    targetMarket: symbol,
    tradingStyle,
    riskLevel,
    backtestParameters: parameters,
    generationModel: "Chronos AI-Engine v2.0",
    compiledAt: new Date().toISOString()
  };
  const codeJson = JSON.stringify(metadata, null, 2);

  return {
    id,
    name,
    description,
    market,
    tradingStyle,
    riskLevel,
    parameters,
    confidenceScore,
    riskExplanation,
    riskWarnings,
    codePython,
    codePine,
    codeJson,
    createdAt: new Date().toISOString()
  };
}

export function proposeEvolution(original: StrategyOutput): StrategyOutput {
  const evolvedParams = { ...original.parameters };
  let reason = '';
  
  // Evolve parameters to improve performance based on risk profile
  if (original.tradingStyle === 'Trend') {
    // Modify SMA parameters
    evolvedParams.fastPeriod = Math.max(5, (original.parameters.fastPeriod || 12) - 3);
    evolvedParams.slowPeriod = (original.parameters.slowPeriod || 26) + 4;
    evolvedParams.takeProfitPercent = (original.parameters.takeProfitPercent || 7.0) * 1.3;
    evolvedParams.stopLossPercent = (original.parameters.stopLossPercent || 3.0) * 0.9; // Tighten SL
    reason = "Tightened fast SMA window for quicker entry responses, expanded slow SMA to filter noise, and increased Take Profit margin to ride trends longer.";
  } else if (original.tradingStyle === 'Mean Reversion') {
    // Modify RSI boundaries
    evolvedParams.rsiOversold = Math.max(15, (original.parameters.rsiOversold || 30) - 5); // Catch deeper drops
    evolvedParams.rsiOverbought = Math.min(85, (original.parameters.rsiOverbought || 70) + 5); // Allow deeper pumps
    evolvedParams.takeProfitPercent = (original.parameters.takeProfitPercent || 7.0) * 1.1;
    reason = "Adjusted RSI oversold/overbought thresholds outward to filter out minor pullbacks and focus exclusively on high-probability historical extremes.";
  } else if (original.tradingStyle === 'Momentum') {
    // Bollinger Bands deviation modification
    evolvedParams.bbStdDev = parseFloat(((original.parameters.bbStdDev || 2.0) + 0.2).toFixed(1));
    evolvedParams.bbPeriod = (original.parameters.bbPeriod || 20) + 2;
    evolvedParams.stopLossPercent = (original.parameters.stopLossPercent || 3.0) * 0.8;
    reason = "Expanded BB standard deviation to reduce false breakout signals during low-volatility compression stages and compressed trailing stop loss.";
  } else {
    // Scalping
    evolvedParams.rsiPeriod = 6;
    evolvedParams.fastPeriod = 4;
    evolvedParams.slowPeriod = 9;
    evolvedParams.takeProfitPercent = (original.parameters.takeProfitPercent || 2.0) * 0.8; // Faster exits
    evolvedParams.stopLossPercent = (original.parameters.stopLossPercent || 1.5) * 0.8;
    reason = "Accelerated micro-oscillations parsing and tightened take profit/stop loss for maximum speed and drawdown mitigation.";
  }

  const evolvedOutput = generateLocalStrategy(
    original.market,
    original.tradingStyle,
    original.riskLevel,
    `Evolved version of ${original.name}. Optimizations: ${reason}`
  );

  evolvedOutput.name = `${original.name} (Evolved v2)`;
  evolvedOutput.parameters = evolvedParams;
  evolvedOutput.confidenceScore = Math.min(98, original.confidenceScore + 6);
  evolvedOutput.codePython = generatePythonCode(evolvedOutput.name, evolvedOutput.tradingStyle, evolvedParams, original.market);
  evolvedOutput.codePine = generatePineScript(evolvedOutput.name, evolvedOutput.tradingStyle, evolvedParams, original.market);
  
  const metadata = {
    strategyId: evolvedOutput.id,
    strategyName: evolvedOutput.name,
    parentStrategyId: original.id,
    assetClass: "Cryptocurrency",
    targetMarket: original.market.toUpperCase(),
    tradingStyle: evolvedOutput.tradingStyle,
    riskLevel: evolvedOutput.riskLevel,
    backtestParameters: evolvedParams,
    evolutionLogic: reason,
    generationModel: "Chronos Evolution-Engine v2.0",
    compiledAt: new Date().toISOString()
  };
  evolvedOutput.codeJson = JSON.stringify(metadata, null, 2);

  return evolvedOutput;
}

// Private Code Snippet Generators
function generatePythonCode(name: string, style: string, params: any, market: string): string {
  const m = market.toUpperCase();
  let indicatorCalcs = '';
  let signalLogic = '';

  if (style === 'Trend') {
    indicatorCalcs = `
    # Calculate Fast and Slow Simple Moving Averages
    df['sma_fast'] = df['close'].rolling(window=${params.fastPeriod}).mean()
    df['sma_slow'] = df['close'].rolling(window=${params.slowPeriod}).mean()
    `;
    signalLogic = `
        # Buy condition (Golden Cross): Fast SMA crosses above Slow SMA
        if df['sma_fast'].iloc[i] > df['sma_slow'].iloc[i] and df['sma_fast'].iloc[i-1] <= df['sma_slow'].iloc[i-1]:
            signals.append({'type': 'BUY', 'price': price, 'time': df['time'].iloc[i]})
        
        # Sell condition (Death Cross): Fast SMA crosses below Slow SMA
        elif df['sma_fast'].iloc[i] < df['sma_slow'].iloc[i] and df['sma_fast'].iloc[i-1] >= df['sma_slow'].iloc[i-1]:
            signals.append({'type': 'SELL', 'price': price, 'time': df['time'].iloc[i]})
    `;
  } else if (style === 'Mean Reversion') {
    indicatorCalcs = `
    # Calculate Relative Strength Index (RSI)
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=${params.rsiPeriod}).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=${params.rsiPeriod}).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    `;
    signalLogic = `
        # Buy condition: RSI drops below Oversold boundary (contrarian buy)
        if df['rsi'].iloc[i] < ${params.rsiOversold} and df['rsi'].iloc[i-1] >= ${params.rsiOversold}:
            signals.append({'type': 'BUY', 'price': price, 'time': df['time'].iloc[i]})
            
        # Sell condition: RSI climbs above Overbought boundary
        elif df['rsi'].iloc[i] > ${params.rsiOverbought} and df['rsi'].iloc[i-1] <= ${params.rsiOverbought}:
            signals.append({'type': 'SELL', 'price': price, 'time': df['time'].iloc[i]})
    `;
  } else if (style === 'Momentum') {
    indicatorCalcs = `
    # Calculate Bollinger Bands
    df['bb_basis'] = df['close'].rolling(window=${params.bbPeriod}).mean()
    df['bb_std'] = df['close'].rolling(window=${params.bbPeriod}).std()
    df['bb_upper'] = df['bb_basis'] + (${params.bbStdDev} * df['bb_std'])
    df['bb_lower'] = df['bb_basis'] - (${params.bbStdDev} * df['bb_std'])
    `;
    signalLogic = `
        # Buy condition: Price closes above upper Bollinger Band (momentum expansion)
        if df['close'].iloc[i] > df['bb_upper'].iloc[i] and df['close'].iloc[i-1] <= df['bb_upper'].iloc[i-1]:
            signals.append({'type': 'BUY', 'price': price, 'time': df['time'].iloc[i]})
            
        # Sell condition: Price falls back below Bollinger basis (moving average)
        elif df['close'].iloc[i] < df['bb_basis'].iloc[i] and df['close'].iloc[i-1] >= df['bb_basis'].iloc[i-1]:
            signals.append({'type': 'SELL', 'price': price, 'time': df['time'].iloc[i]})
    `;
  } else {
    // Scalping
    indicatorCalcs = `
    # High frequency scalping indicators (short RSI & Moving Averages)
    delta = df['close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=${params.rsiPeriod}).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=${params.rsiPeriod}).mean()
    rs = gain / loss
    df['rsi'] = 100 - (100 / (1 + rs))
    df['sma_fast'] = df['close'].rolling(window=${params.fastPeriod}).mean()
    df['sma_slow'] = df['close'].rolling(window=${params.slowPeriod}).mean()
    `;
    signalLogic = `
        # Buy condition: RSI is oversold and short SMA trend points up
        if df['rsi'].iloc[i] < 35 and df['sma_fast'].iloc[i] > df['sma_slow'].iloc[i]:
            signals.append({'type': 'BUY', 'price': price, 'time': df['time'].iloc[i]})
            
        # Sell condition: RSI is overbought or short SMA trend reverses
        elif (df['rsi'].iloc[i] > 65 or df['sma_fast'].iloc[i] < df['sma_slow'].iloc[i]):
            signals.append({'type': 'SELL', 'price': price, 'time': df['time'].iloc[i]})
    `;
  }

  return `import pandas as pd
import numpy as np

"""
Strategy: ${name}
Target Market: ${m}
Execution Mode: Backtest / Live Mock
Generated by: Chronos Alpha AI
"""

def initialize_strategy(df: pd.DataFrame):
    # Ensure correct data types
    df['close'] = df['close'].astype(float)
    df['high'] = df['high'].astype(float)
    df['low'] = df['low'].astype(float)
    df['open'] = df['open'].astype(float)
    ${indicatorCalcs}
    return df

def run_backtest_simulation(df: pd.DataFrame, initial_balance=10000.0, stop_loss_pct=${params.stopLossPercent}, take_profit_pct=${params.takeProfitPercent}):
    df = initialize_strategy(df)
    balance = initial_balance
    position = None
    signals = []
    
    for i in range(1, len(df)):
        price = df['close'].iloc[i]
        
        # Risk Management: Exit active long position if SL/TP threshold crossed
        if position is not None:
            pct_change = ((price - position['entry_price']) / position['entry_price']) * 100
            if pct_change <= -stop_loss_pct:
                # Stop Loss Triggered
                balance += (price - position['entry_price']) * position['amount']
                signals.append({'type': 'SELL', 'price': price, 'time': df['time'].iloc[i], 'note': 'Stop Loss'})
                position = None
                continue
            elif pct_change >= take_profit_pct:
                # Take Profit Triggered
                balance += (price - position['entry_price']) * position['amount']
                signals.append({'type': 'SELL', 'price': price, 'time': df['time'].iloc[i], 'note': 'Take Profit'})
                position = None
                continue
        
        # Strategy Entry/Exit Signal Logic
        ${signalLogic}
        
        # Execute Buy Orders inside simulation
        if len(signals) > 0 and signals[-1]['type'] == 'BUY' and position is None:
            position = {
                'entry_price': price,
                'amount': balance / price,
                'time': df['time'].iloc[i]
            }

    print(f"--- ${name} Simulation Results ---")
    print(f"Initial Capital: \${initial_balance:,.2f}")
    print(f"Final Balance: \${balance:,.2f}")
    print(f"Total Return: {((balance - initial_balance)/initial_balance)*100:.2f}%")
    return signals
`;
}

function generatePineScript(name: string, style: string, params: any, market: string): string {
  const m = market.toUpperCase();
  let indicators = '';
  let strategyLogic = '';

  if (style === 'Trend') {
    indicators = `
// Indicator inputs
fastPeriod = input.int(${params.fastPeriod}, title="Fast SMA Period")
slowPeriod = input.int(${params.slowPeriod}, title="Slow SMA Period")

// Calculate values
fastSma = ta.sma(close, fastPeriod)
slowSma = ta.sma(close, slowPeriod)

// Plot lines
plot(fastSma, color=color.blue, title="Fast SMA")
plot(slowSma, color=color.orange, title="Slow SMA")
`;
    strategyLogic = `
// Signals
buySignal = ta.crossover(fastSma, slowSma)
sellSignal = ta.crossunder(fastSma, slowSma)
`;
  } else if (style === 'Mean Reversion') {
    indicators = `
// Indicator inputs
rsiPeriod = input.int(${params.rsiPeriod}, title="RSI Period")
rsiOversold = input.int(${params.rsiOversold}, title="RSI Oversold Threshold")
rsiOverbought = input.int(${params.rsiOverbought}, title="RSI Overbought Threshold")

// Calculate values
rsiVal = ta.rsi(close, rsiPeriod)

// Plot values
hline(rsiOverbought, "Overbought", color=color.red)
hline(rsiOversold, "Oversold", color=color.green)
plot(rsiVal, color=color.purple, title="RSI")
`;
    strategyLogic = `
// Signals
buySignal = ta.crossunder(rsiVal, rsiOversold)
sellSignal = ta.crossover(rsiVal, rsiOverbought)
`;
  } else if (style === 'Momentum') {
    indicators = `
// Indicator inputs
bbPeriod = input.int(${params.bbPeriod}, title="Bollinger Bands Period")
bbStdDev = input.float(${params.bbStdDev}, title="Bollinger Bands StdDev")

// Calculate values
[basis, upper, lower] = ta.bb(close, bbPeriod, bbStdDev)

// Plot bands
plot(basis, color=color.blue, title="BB Basis")
p1 = plot(upper, color=color.gray, title="BB Upper")
p2 = plot(lower, color=color.gray, title="BB Lower")
fill(p1, p2, color=color.rgb(33, 150, 243, 95), title="Background")
`;
    strategyLogic = `
// Signals
buySignal = ta.crossover(close, upper)
sellSignal = ta.crossunder(close, basis)
`;
  } else {
    // Scalping
    indicators = `
// Indicator inputs
rsiPeriod = input.int(7, title="RSI Period")
fastPeriod = input.int(${params.fastPeriod}, title="Fast SMA Period")
slowPeriod = input.int(${params.slowPeriod}, title="Slow SMA Period")

// Calculate values
rsiVal = ta.rsi(close, rsiPeriod)
fastSma = ta.sma(close, fastPeriod)
slowSma = ta.sma(close, slowPeriod)
`;
    strategyLogic = `
// Signals
buySignal = rsiVal < 35 and fastSma > slowSma
sellSignal = rsiVal > 65 or fastSma < slowSma
`;
  }

  return `//@version=5
strategy("${name}", overlay=true, initial_capital=10000, default_qty_type=strategy.percent_of_equity, default_qty_value=100)

// Strategy Parameters
stopLoss = input.float(${params.stopLossPercent}, title="Stop Loss %") / 100
takeProfit = input.float(${params.takeProfitPercent}, title="Take Profit %") / 100

${indicators}
${strategyLogic}

// Order Execution logic
if (buySignal)
    strategy.entry("LongEntry", strategy.long)

if (strategy.position_size > 0)
    // Dynamic stop-loss and take profit thresholds
    stopPrice = strategy.position_avg_price * (1 - stopLoss)
    limitPrice = strategy.position_avg_price * (1 + takeProfit)
    
    // Check standard exit signal as well as SL/TP limit exits
    strategy.exit("LongExit", from_entry="LongEntry", stop=stopPrice, limit=limitPrice)
    
    if (sellSignal)
        strategy.close("LongEntry", comment="Indicator Exit")
`;
}
