# Agentic Hub 🌿

**A high-capability Agentic Remittance & FX Application built for the Celo Agentic Payments & DeFAI Hackathon.**

Agentic Hub is a mobile-first, MiniPay-optimized decentralized application that leverages autonomous AI agents to find and execute the best FX routes across Celo's Mento stablecoins.

## 🚀 Hackathon Tracks Addressed

### Track 1: Agentic Payments ($2.5k Prize Pool)
- **Attribution SDK**: Fully integrated with `@celo/attribution-tags`. Every autonomous transaction executed by the agent attaches the `celo-agentic-hub-2026` identifier to the on-chain payload, ensuring all volume is tracked for the hackathon criteria.
- **Para Wallet**: Utilizes Para Wallet MPC technology to give the AI agent an autonomous smart account capable of signing Celo transactions independently.
- **Mento FX Routing**: The agent autonomously calculates the best swap routes between `USDm`, `KESm`, `BRLm`, `EURm`, and `cCOP` using Ubeswap.

### Track 2: Micropayments ($2.5k Prize Pool)
- **x402 Implementation**: The Agentic API is strictly gated by the Celo x402 Micropayment standard. Users must pay a `0.05 USDm` fee to the agent's smart contract before the agent will execute the cross-border remittance.

### ERC-8004 Agent Identity
- The application implements the ERC-8004 Registry standard to formulate on-chain payloads for registering the agent's identity and metadata for transparent judging.

## 📱 Mobile-First MiniPay Design

The frontend is strictly built as a **MiniApp** (constrained to a 400px maximum width on desktop, 100% on mobile). It uses a stunning **Green & Dark Forest Green Ticket Card** aesthetic, specifically tailored for seamless integration into the Opera Mini / MiniPay ecosystem. 

Features include:
- Glassmorphic animated swipe-to-execute buttons.
- Real-time Agent Terminal Logs showing x402 validation and Para signing.
- P2P direct send functionality with contact avatars.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion (Animations)
- **Web3**: Wagmi + Viem (Celo Mainnet & Alfajores)
- **Agent Infra**: Para Wallet SDK (Mocked Execution Logic)
- **Micropayments**: Celo x402 Facilitator
- **Tracking**: `@celo/attribution-tags`

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

*Note: For the purpose of hackathon judging, the Para MPC signing is mocked in `src/utils/paraWallet.ts` but fully demonstrates the required architectural flow and payload construction.*
