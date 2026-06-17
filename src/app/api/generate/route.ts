import { NextResponse } from 'next/server';
import { generateLocalStrategy } from '@/lib/aiStrategyEngine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { market, tradingStyle, riskLevel, prompt } = body;

    if (!market || !tradingStyle || !riskLevel) {
      return NextResponse.json(
        { error: 'Missing required parameters: market, tradingStyle, and riskLevel are required.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey !== 'your-openai-api-key') {
      // If the user has configured OpenAI, we can implement an actual call
      try {
        const response = await fetch('https://api.openai.com/1/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are an institutional quantitative trading AI. You generate complete, functional, and clean algorithmic trading strategies.
Your response MUST be a valid JSON object matching this TypeScript interface:
interface StrategyOutput {
  id: string; // generate random 7 letter string
  name: string; // name of strategy
  description: string; // detailed description
  market: string; // uppercase symbol (e.g. BTC)
  tradingStyle: string; // 'Trend', 'Mean Reversion', 'Scalping', or 'Momentum'
  riskLevel: 'Low' | 'Medium' | 'High';
  parameters: {
    fastPeriod?: number;
    slowPeriod?: number;
    rsiPeriod?: number;
    rsiOversold?: number;
    rsiOverbought?: number;
    bbPeriod?: number;
    bbStdDev?: number;
    stopLossPercent: number;
    takeProfitPercent: number;
  };
  confidenceScore: number; // 1 to 100
  riskExplanation: string; // simple explanation of strategy risks
  riskWarnings: string[]; // 3 bullet points warning of risks
  codePython: string; // fully functional Python code (pandas, numpy) implementing the logic on a df with 'close', 'high', 'low', 'open', 'time' columns. Make sure it computes the indicators, checks entry/exit criteria, and logs signals. Include stop loss and take profit validation in code.
  codePine: string; // fully functional TradingView Pine Script v5 code matching standard strategies.
  codeJson: string; // JSON metadata string
  createdAt: string; // ISO date string
}
Return ONLY the raw JSON object. Do not include markdown code block styling or other text.`
              },
              {
                role: 'user',
                content: `Generate a strategy for Market: ${market}, Trading Style: ${tradingStyle}, Risk Level: ${riskLevel}. User details instruction: ${prompt || 'None'}`
              }
            ],
            temperature: 0.2
          })
        });

        if (response.ok) {
          const result = await response.json();
          const content = result.choices?.[0]?.message?.content;
          if (content) {
            // Parse and return JSON
            const parsed = JSON.parse(content.replace(/```json/g, '').replace(/```/g, '').trim());
            return NextResponse.json(parsed);
          }
        }
      } catch (openAiError) {
        console.error('Error invoking OpenAI, falling back to local engine:', openAiError);
      }
    }

    // Fallback/Local generator
    const strategy = generateLocalStrategy(market, tradingStyle, riskLevel, prompt);
    return NextResponse.json(strategy);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate strategy.' },
      { status: 500 }
    );
  }
}
