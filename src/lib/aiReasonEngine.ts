export interface TradeIndicators {
  rsi?: number;
  smaShort?: number;
  smaLong?: number;
  volumeSpike?: boolean;
  volatility?: number;
}

export interface TradeReason {
  reason: string[];
  confidence: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export function generateTradeReason(
  pair: string,
  action: 'BUY' | 'SELL',
  price: number,
  indicators: TradeIndicators
): TradeReason {
  const reasons: string[] = [];
  let confidence = 50;

  // RSI logic
  if (indicators.rsi !== undefined) {
    if (indicators.rsi < 30) {
      reasons.push("RSI below 30 (oversold condition)");
      confidence += 22;
    } else if (indicators.rsi < 40) {
      reasons.push("RSI below 40 (weak oversold pull)");
      confidence += 8;
    }
    
    if (indicators.rsi > 70) {
      reasons.push("RSI above 70 (overbought condition)");
      confidence -= 15;
    } else if (indicators.rsi > 60) {
      reasons.push("RSI above 60 (weak overbought bounce)");
      confidence -= 5;
    }
  }

  // Trend logic
  if (indicators.smaShort !== undefined && indicators.smaLong !== undefined) {
    if (indicators.smaShort > indicators.smaLong && action === "BUY") {
      reasons.push("Fast moving average crossed above slow moving average (bullish trend crossover)");
      confidence += 18;
    }
    if (indicators.smaShort < indicators.smaLong && action === "SELL") {
      reasons.push("Fast moving average crossed below slow moving average (bearish trend reversal)");
      confidence += 12;
    }
  }

  // Volume logic
  if (indicators.volumeSpike) {
    reasons.push("Significant volume expansion detected (+15% deviation)");
    confidence += 15;
  }

  // Volatility and risk adjustments
  if (indicators.volatility !== undefined) {
    if (indicators.volatility > 0.04) {
      reasons.push("High asset volatility detected (standard deviation elevated)");
      confidence -= 8;
    } else {
      reasons.push("Low asset volatility detected (stable consolidation entry)");
      confidence += 5;
    }
  }

  const risk: 'LOW' | 'MEDIUM' | 'HIGH' =
    confidence > 75 ? "LOW" :
    confidence > 55 ? "MEDIUM" :
    "HIGH";

  return {
    reason: reasons.length ? reasons : ["Indicator crossover confirmation"],
    confidence: Math.max(15, Math.min(95, confidence)),
    risk
  };
}
