export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Simple seedable random number generator for reproducible historical data
function createRandom(seedString: string) {
  let h = 0;
  for (let i = 0; i < seedString.length; i++) {
    h = Math.imul(31, h) + seedString.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function generateHistoricalData(market: string, days: number = 180): Candle[] {
  const symbol = market.toUpperCase();
  
  // Set base characteristics based on the asset
  let basePrice = 65000;
  let volatility = 0.02; // Daily standard deviation
  let drift = 0.0002; // Small daily positive drift

  if (symbol === 'ETH') {
    basePrice = 3400;
    volatility = 0.028;
    drift = 0.0001;
  } else if (symbol === 'SOL') {
    basePrice = 150;
    volatility = 0.045;
    drift = 0.0005;
  } else if (symbol === 'LINK') {
    basePrice = 16;
    volatility = 0.038;
    drift = 0.0001;
  } else if (symbol === 'DOT') {
    basePrice = 6.2;
    volatility = 0.04;
    drift = -0.0001;
  }

  const rand = createRandom(symbol + "_seed_v1");
  const data: Candle[] = [];
  
  // Generate historical data backwards from yesterday
  const now = new Date();
  let currentPrice = basePrice;

  // Let's generate starting price 180 days ago by running the simulation first
  // to ensure the final price ends up near our base price.
  for (let i = 0; i < days; i++) {
    const change = currentPrice * (drift + volatility * (rand() - 0.5) * 2);
    currentPrice = Math.max(0.01, currentPrice + change);
  }

  // Set initial price to the wound back price
  let price = basePrice * (1.5 - rand() * 0.7); // Randomized starting point
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split('T')[0];

    const open = price;
    const dailyDrift = drift + (symbol === 'BTC' && i < 30 ? 0.002 : 0); // Add a small recent uptrend for BTC
    
    // Calculate high, low, close
    const changePercent = dailyDrift + volatility * (rand() - 0.48) * 2;
    const close = Math.max(0.01, open * (1 + changePercent));
    
    const noiseHigh = open * volatility * rand() * 1.5;
    const noiseLow = open * volatility * rand() * 1.5;
    
    const high = Math.max(open, close) + noiseHigh;
    const low = Math.max(0.005, Math.min(open, close) - noiseLow);
    
    // Volume base and variance
    let baseVolume = 100000000; // In USD
    if (symbol === 'BTC') baseVolume = 1500000000;
    if (symbol === 'ETH') baseVolume = 800000000;
    if (symbol === 'SOL') baseVolume = 300000000;

    const volume = baseVolume * (0.5 + rand() * 1.5) / close; // Volume in asset units

    data.push({
      time: dateString,
      open: parseFloat(open.toFixed(symbol === 'BTC' || symbol === 'ETH' ? 2 : 4)),
      high: parseFloat(high.toFixed(symbol === 'BTC' || symbol === 'ETH' ? 2 : 4)),
      low: parseFloat(low.toFixed(symbol === 'BTC' || symbol === 'ETH' ? 2 : 4)),
      close: parseFloat(close.toFixed(symbol === 'BTC' || symbol === 'ETH' ? 2 : 4)),
      volume: Math.round(volume),
    });

    price = close; // Set open for next day to this close
  }

  return data;
}
