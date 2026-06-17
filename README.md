# Chronos Alpha: Self-Improving Autonomous AI Crypto Strategy Lab

Chronos Alpha is a premium, self-improving AI-powered quant strategy laboratory designed for crypto traders. It automates the entire quant research loop: Strategy Compilation → High-Fidelity Simulation → AI Performance Evaluation → Genetic Mutation (Strategy Evolution) → Live Paper Trading Execution.

---

## 🟦 Hackathon Submission Thesis (Four-Part Structure)

### 1. Problem Statement
Algorithmic trading has long been gated behind advanced coding frameworks and math modeling, shutting out everyday crypto traders. Furthermore, existing AI trading agents are static—they run fixed strategies that cannot learn from live market performance or adapt to changing volatility regimes. Judges are looking for **explainable reasoning** and **verifiable executions** rather than black-box bots.

### 2. Solution: Self-Improving Quant Loop
Chronos Alpha closes the loop by connecting trade execution, backtesting, and performance evaluations:
* **AI Quant Research Loop**: 
  ```
  [Conversation Guide] ➔ [Neural Strategy Generation] ➔ [180-Day Volatility Backtest] 
                                                                     │
  [Self-Optimization] 🧠 [AI Quantitative Evaluation & Verdict] 🎪──────┘
  ```
* **AI Trade Reason Engine**: Explains the exact indicators (RSI, SMAs, volume spikes) that triggered every simulated or live execution, scoring confidence levels.
* **AI Strategy Evaluator (Phase 4)**: Automatically runs post-backtest multi-variable grading to score the strategy's quality (0-100), issue a deployment verdict, and prescribe specific mathematical improvements (e.g., shifting take-profits, adding confirmations).
* **Genetic Strategy Evolution**: Feeds the Evaluator's mutations back into the generator parameters side-by-side to continuously breed higher-performing variants.
* **Verifiable Agent Feed**: Logs execution histories directly to a public ledger, satisfying the strict hackathon live-trading verification guidelines.

### 3. Architecture & Technical Design
The platform uses a modular, deployment-ready stack:
* **Next.js & TypeScript**: Core frontend workspace and API routes.
* **TailwindCSS**: Premium dark-mode glassmorphic interface.
* **Recharts**: Advanced dual-axis charting displaying balances, spot prices, and buy/sell execution markers.
* **Supabase / Local Fallback**: Seamless database/auth state. If credentials are missing, the system automatically falls back to browser-based LocalStorage caches, remaining fully functional out-of-the-box.
* **OpenAI API / Local AI Fallback**: Translates natural prompts into structured trade indicators.

### 4. Verifiable Execution & Results
This submission includes **two reproducible Node.js terminal scripts** to prove execution integrity:
1. **Interactive CLI Backtester (`scripts/backtest-cli.js`)**: Evaluates parameters directly in the terminal, printing an ASCII performance chart and the **AI strategy health verdict** (powered by `ai/strategy-evaluator.js`).
2. **Bitget API Paper Trader (`scripts/bitget-paper-trader.js`)**: Fetches spot tickers (querying the public Bitget Spot Market API) and logs trades directly to `public/paper_trading_log.json` containing the AI Reason Engine output.

---

## 🚀 Getting Started

### 📋 Prerequisites
Ensure you have **Node.js (v18+)** installed. Add the node binary path if running in a sandboxed shell.

### 🔧 Installation
1. Clone the repository and navigate to the project directory:
   ```bash
   git clone https://github.com/angelraph/chronos-alpha.git
   cd chronos-alpha
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

### 💻 Running the Web Application
1. Run the local development server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.
3. Access immediately using **"ENTER PUBLIC GUEST DEMO MODE"** to inspect the live agent trading feed and run strategy compilations!

---

## 🛠 Verifying CLI Tools & Paper Trading Logs

### 1. Run CLI Backtests in Terminal
Inspect strategy logic directly from the command line using our ASCII quant engine:
```bash
node scripts/backtest-cli.js --market BTC --style Trend --risk Medium
```
Options:
* `--market` or `-m`: `BTC`, `ETH`, `SOL`, `LINK`
* `--style` or `-s`: `Trend` (MA crosses), `Mean Reversion` (RSI bounds), `Momentum` (BB break), `Scalping` (high-freq)
* `--risk` or `-r`: `Low`, `Medium`, `High`

### 2. Execute Live Bitget Spot Feed Paper Trades
Connect to the Bitget API spot tickers and append verified executions to the public ledger:
```bash
node scripts/bitget-paper-trader.js
```
This script updates the `public/paper_trading_log.json` log which is visualised in the web dashboard under the **Live Agent Feed** tab.
