# Route AI 🌿

**An Autonomous Agentic FX & Payment Routing Application built for the Celo Agentic Payments & DeFAI Hackathon.**

Route AI is a mobile-first, MiniPay-optimized decentralized application. It leverages autonomous AI agents to monitor off-chain market data and execute optimal on-chain FX swaps across Celo's Mento stablecoin ecosystem using limit orders and instant routing.

## 🚀 Hackathon Tracks Addressed

### Track 1: Agentic Payments ($2.5k Prize Pool)
- **Real On-Chain Mento Routing**: The AI Agent dynamically constructs valid `viem` payloads targeting the Mento Protocol Broker (`swapIn`), calculating optimal slippage protection.
- **Attribution SDK**: Fully integrated with `@celo/attribution-tags`. The Agent automatically injects the `celo-agentic-hub-2026` identifier into the `data` payload of every smart contract execution.
- **Para Wallet Integration**: The Agent operates a true autonomous smart account powered by the `@getpara/server-sdk` MPC technology, allowing it to sign execution transactions in the background while the user is offline.
- **Smart Limit Orders**: Users can specify exact FX target prices (e.g., exactly 135 KESm per USDm). The agent monitors the blockchain via an automated backend framework and executes only when the target is hit.

### Track 2: Micropayments ($2.5k Prize Pool)
- **x402 Micropayment Implementation**: The Route AI Backend API is strictly gated by the Celo x402 Micropayment standard. Users must transmit a `0.05 USDm` verification fee (on-chain) before the Agent enters the "Monitoring" state or calculates optimal routes.

### AI Identity & Ecosystem
- **ERC-8004 Registry**: We have implemented a deployment script (`src/utils/erc8004.ts`) that formally registers the "Route AI" agent profile and its Para Wallet address onto the Celo ERC-8004 Agent Identity contract for full transparency.

## 📱 Mobile-First MiniPay Design

The frontend is strictly built as a **MiniApp** (constrained to a 400px maximum width). It utilizes a custom **Green & Dark Forest Green Ticket Card** aesthetic, specifically tailored for seamless integration into the Opera MiniPay ecosystem. 

**Key UX Features:**
- **Code-Based SVG Logo**: Features a fully custom SVG rendering of the Route AI "Spinning Node" logo.
- **Wagmi Auto-Connect**: Utilizes injected connectors to instantly and seamlessly connect to the user's MiniPay wallet upon loading.
- **Swipe-to-Execute**: A frictionless glassmorphic slider button to confirm x402 payments and delegate tasks to the AI.
- **Real-Time Agent Terminal**: An embedded terminal UI that provides the user with transparency into the AI's internal logic, x402 verification steps, and transaction broadcasting.

## 🛠 Tech Stack

- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS v4, Framer Motion
- **Web3 Integrations**: Wagmi, Viem (Celo Mainnet & Alfajores)
- **Agent Infrastructure**: Para Server SDK (Autonomous MPC Wallet Signing)
- **DeFi Protocol**: Mento Broker Smart Contracts
- **Micropayments**: Celo HTTP 402 Protocol

## ⚙️ Running Locally

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

*Note: In local development, the Para SDK execution is mocked inside the API route to prevent deployment failures without real production API keys, but the architectural flow, x402 verification, and payload byte construction perfectly mirrors the production deployment.*
