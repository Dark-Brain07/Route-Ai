import { NextResponse } from "next/server";
import { ParaAgentWallet } from "@/utils/paraWallet";
import { x402Facilitator as X402 } from "@/utils/x402";

// Next.js API Route for Agentic Execution (x402 Gated)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { txHash, amount, targetCurrency, isLimitOrder, limitPrice } = body;

    if (!txHash) {
      // 402 Payment Required - Strictly gating the AI Agent
      const x402 = new X402();
      return NextResponse.json(x402.generateChallenge("/api/agent/execute"), { status: 402 });
    }

    console.log(`[Agent API] Received request with x402 tx: ${txHash}`);
    
    // 1. Verify the x402 Micropayment
    const x402 = new X402();
    const isValidPayment = await x402.verifyPayment(txHash);
    
    if (!isValidPayment) {
      return NextResponse.json({ error: "Invalid or insufficient x402 payment." }, { status: 403 });
    }

    // 2. Initialize the Autonomous Para Wallet (Agent)
    const agentWallet = new ParaAgentWallet();
    await agentWallet.initialize();

    // 3. Execute logic based on the user's request
    if (isLimitOrder) {
      console.log(`[Agent API] Registered Smart Limit Order: ${amount} to ${targetCurrency} at ${limitPrice}`);
      // In production, the Para Agent saves this to a database and runs a cron-job to monitor the blockchain
      return NextResponse.json({ 
        status: "monitoring", 
        message: "Agent is now monitoring on-chain prices.",
        attributionContext: "celo-agentic-hub-2026"
      }, { status: 200 });
    }

    // 4. Instant Execution / Routing using Mento Broker
    // The Agent autonomously signs and broadcasts the transaction
    const agentTx = await agentWallet.signAndExecuteTransaction(
      "0xMentoBrokerAddress", 
      amount, 
      "0xSwapPayload" // Abstracted viem payload
    );

    return NextResponse.json({ 
      status: "success", 
      message: "Swap routed successfully.",
      agentHash: agentTx.hash,
      taggedPayload: agentTx.taggedPayload
    }, { status: 200 });

  } catch (error: any) {
    console.error("[Agent API] Execution failed:", error);
    return NextResponse.json({ error: error.message || "Internal Agent Error" }, { status: 500 });
  }
}
