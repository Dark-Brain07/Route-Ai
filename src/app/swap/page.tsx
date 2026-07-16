"use client";

import React, { useState } from "react";
import SwipeButton from "@/components/SwipeButton";
import { ChevronDown, CheckCircle2, Globe2, Cpu, Zap, Link as LinkIcon, ExternalLink, ArrowRightLeft, XCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSendTransaction, useAccount, useReadContract } from 'wagmi';
import { parseEther, formatUnits, parseAbi, encodeFunctionData } from 'viem';

import { ParaAgentWallet, x402Facilitator } from "@/utils";
import Logo from "@/components/Logo";

const MENTO_STABLES = [
  { symbol: "USDm", name: "USA", rate: 1.0, flagUrl: "https://flagcdn.com/w40/us.png", address: "0x765DE816845861e75A25fCA122bb6898B8B1282a" },
  { symbol: "EURm", name: "Europe", rate: 0.91, flagUrl: "https://flagcdn.com/w40/eu.png" },
  { symbol: "KESm", name: "Kenya", rate: 129.5, flagUrl: "https://flagcdn.com/w40/ke.png" },
  { symbol: "BRLm", name: "Brazil", rate: 4.95, flagUrl: "https://flagcdn.com/w40/br.png" },
  { symbol: "COPm", name: "Colombia", rate: 3950.0, flagUrl: "https://flagcdn.com/w40/co.png" },
  { symbol: "GHSm", name: "Ghana", rate: 14.5, flagUrl: "https://flagcdn.com/w40/gh.png" },
  { symbol: "XOFm", name: "West Africa", rate: 600.0, flagUrl: "https://flagcdn.com/w40/sn.png" },
  { symbol: "USDT", name: "Tether", rate: 1.0, flagUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png", address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" },
  { symbol: "USDC", name: "USD Coin", rate: 1.0, flagUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png", address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" },
];

export default function SwapPage() {
  const { address } = useAccount();
  const [amount, setAmount] = useState("100.00");
  const [sourceCurrency, setSourceCurrency] = useState(MENTO_STABLES[0]);
  const [targetCurrency, setTargetCurrency] = useState(MENTO_STABLES[1]); // default to KESm
  const [showDropdown, setShowDropdown] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const [isAgentCalculating, setIsAgentCalculating] = useState(false);
  const [isLimitOrder, setIsLimitOrder] = useState(false);
  const [limitPrice, setLimitPrice] = useState("");
  const [pendingOrder, setPendingOrder] = useState(false);
  const [recipientWallet, setRecipientWallet] = useState("");
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});
  const [statusModal, setStatusModal] = useState<"success" | "error" | null>(null);

  const tokenAddress = (sourceCurrency as any).address as `0x${string}` | undefined;

  const { data: sourceBalanceRaw } = useReadContract({
    address: tokenAddress,
    abi: parseAbi(["function balanceOf(address) view returns (uint256)"]),
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
    }
  });

  const { sendTransactionAsync } = useSendTransaction();

  React.useEffect(() => {
    if (address && !recipientWallet) {
      setRecipientWallet(address);
    }
  }, [address]);

  React.useEffect(() => {
    // Fetching real-world FX rates to proxy live on-chain Mento pegs
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then(res => res.json())
      .then(data => {
        setLiveRates({
          USDm: 1,
          USDT: 1,
          USDC: 1,
          KESm: data.rates.KES,
          BRLm: data.rates.BRL,
          COPm: data.rates.COP,
          EURm: data.rates.EUR,
          GHSm: data.rates.GHS,
          XOFm: data.rates.XOF
        });
      })
      .catch(err => console.error("Failed to fetch live route rates", err));
  }, []);

  const sourceRate = liveRates[sourceCurrency.symbol] || sourceCurrency.rate;
  const targetRate = liveRates[targetCurrency.symbol] || targetCurrency.rate;
  const currentConversionRate = (targetRate / sourceRate).toFixed(4);

  const handleKeypad = (num: string) => {
    if (num === "<") {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    if (amount === "0") {
      setAmount(num);
    } else {
      setAmount((prev) => prev + num);
    }
  };

  const handleSwipeSuccess = async () => {
    if (!amount || Number(amount) <= 0) return;

    setIsAgentCalculating(true);
    
    try {
      // 1. x402 Micropayment / Delegation
      // For the demo, we send a tiny routing fee to their own recipient wallet.
      const AGENT_WALLET = recipientWallet || address || "0x000000000000000000000000000000000000dEaD";
      const USDM_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
      
      let tx;
      
      // If we know the ERC20 address (like USDm), we send the token!
      if ((sourceCurrency as any).address) {
        const tokenAddr = (sourceCurrency as any).address;
        const data = encodeFunctionData({
          abi: parseAbi(["function transfer(address to, uint256 amount)"]),
          functionName: "transfer",
          args: [AGENT_WALLET as `0x${string}`, parseEther("0.0001")] // tiny 0.0001 token fee
        });
        
        tx = await sendTransactionAsync({
          to: tokenAddr as `0x${string}`,
          data,
          // @ts-ignore - Viem Celo specific parameter for paying gas in stablecoins
          feeCurrency: USDM_ADDRESS
        });
      } else {
        // Fallback to native CELO if token address is unknown
        tx = await sendTransactionAsync({
          to: AGENT_WALLET as `0x${string}`,
          value: parseEther('0.0001'), 
        });
      }
      console.log("x402 Payment TX:", tx);

      // 2. Process Swap via Agent Backend API
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `x402 ${tx}`
        },
        body: JSON.stringify({
          amount,
          targetCurrency: targetCurrency.symbol,
          isLimitOrder,
          limitPrice,
          recipientAddress: recipientWallet
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Agent execution failed");
      }

      console.log("Agent Response:", data);

      if (isLimitOrder) {
        setIsAgentCalculating(false);
        setPendingOrder(true);
      } else {
        setIsAgentCalculating(false);
        setSwapped(true);
        setStatusModal("success");
      }
    } catch (error) {
      console.error("Swap/x402 failed", error);
      setIsAgentCalculating(false);
      setStatusModal("error");
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#2EE56B] w-full h-full">
      
      {/* Status Modal Overlay */}
      <AnimatePresence>
        {statusModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0E291A] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center max-w-xs w-full relative"
            >
              <button 
                onClick={() => setStatusModal(null)}
                className="absolute top-4 right-4 text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {statusModal === "success" ? (
                <>
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="w-20 h-20 bg-[#2EE56B]/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(46,229,107,0.4)]"
                  >
                    <CheckCircle2 className="w-10 h-10 text-[#2EE56B]" />
                  </motion.div>
                  <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-white text-xl font-black mb-2">Success!</motion.h2>
                  <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-white/60 text-sm text-center mb-6">Your transaction has been processed and confirmed.</motion.p>
                  <motion.button 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    onClick={() => setStatusModal(null)}
                    className="w-full bg-[#2EE56B] text-[#0A1C12] font-bold py-3 rounded-2xl hover:bg-[#25C45B] transition-colors"
                  >
                    Done
                  </motion.button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-white text-xl font-black mb-2">Failed</h2>
                  <p className="text-white/60 text-sm text-center mb-6">Something went wrong while processing your request.</p>
                  <button 
                    onClick={() => setStatusModal(null)}
                    className="w-full bg-red-500 text-white font-bold py-3 rounded-2xl hover:bg-red-600 transition-colors"
                  >
                    Try Again
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex justify-between items-center text-[#0A1C12]">
        <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
          Route AI
        </h1>
        <div className="w-8 h-8 rounded-full bg-black/5 border border-black/10 shadow-sm flex items-center justify-center">
           <Logo className="w-5 h-5 text-[#0A1C12]" />
        </div>
      </div>

      <div className="flex-1 bg-[#0E291A] rounded-[40px] mb-4 mx-2 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col relative overflow-hidden">
        
        {/* Ticket Cutout Effects */}
        <div className="absolute top-1/2 -left-4 w-8 h-8 bg-[#2EE56B] rounded-full -translate-y-1/2 shadow-inner"></div>
        <div className="absolute top-1/2 -right-4 w-8 h-8 bg-[#2EE56B] rounded-full -translate-y-1/2 shadow-inner"></div>
        <div className="absolute top-1/2 left-4 right-4 border-t-2 border-dashed border-white/10 -translate-y-1/2 pointer-events-none"></div>

        {/* TOP HALF: Inputs */}
        <div className="p-4 sm:p-5 pb-1 flex-1 overflow-y-auto min-h-0 no-scrollbar">
          {/* Amount */}
          <div className="text-center mt-0">
            <div className="flex items-center justify-center gap-3 mb-2">
              {/* From Token */}
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2.5 rounded-full border border-white/5">
                <img src={sourceCurrency.flagUrl} alt={sourceCurrency.name} className="w-5 h-auto rounded-sm shadow-sm" />
                <span className="text-white font-bold text-sm">{sourceCurrency.symbol}</span>
              </div>
              
              <button 
                onClick={() => {
                  setSourceCurrency(targetCurrency);
                  setTargetCurrency(sourceCurrency);
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-4 h-4 text-[#2EE56B]" />
              </button>

              {/* To Token */}
              <div className="relative z-20">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-[#2EE56B] text-[#0A1C12] hover:bg-[#25C45B] px-4 py-2.5 rounded-full transition-colors font-bold shadow-[0_0_20px_rgba(46,229,107,0.3)]"
                >
                  <img src={targetCurrency.flagUrl} alt={targetCurrency.name} className="w-5 h-auto rounded-sm shadow-sm" />
                  <span className="text-sm">{targetCurrency.symbol}</span>
                  <ChevronDown className="w-4 h-4 ml-1" strokeWidth={3} />
                </button>
                
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-2 w-48 bg-white rounded-2xl p-2 shadow-2xl border border-gray-100"
                    >
                      {MENTO_STABLES.map((c) => (
                        <button
                          key={c.symbol}
                          onClick={() => { setTargetCurrency(c); setShowDropdown(false); }}
                          className="flex justify-between items-center w-full px-3 py-2.5 hover:bg-gray-50 rounded-xl text-left transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <img src={c.flagUrl} alt={c.name} className="w-5 h-auto rounded-sm shadow-sm" />
                            <span className="font-bold text-[#0A1C12] text-sm">{c.symbol}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{c.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <p className="text-[10px] font-bold text-white/50 mb-3">
              Balance: {sourceBalanceRaw !== undefined ? parseFloat(formatUnits(sourceBalanceRaw as bigint, 18)).toFixed(2) : "0.00"} {sourceCurrency.symbol}
            </p>

            <p className="text-[10px] font-bold text-[#2EE56B] uppercase tracking-widest mb-0 mt-2">Swap Amount</p>
            <input 
              type="text"
              value={amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, '');
                setAmount(val);
              }}
              className="text-3xl sm:text-4xl font-black text-white tracking-tight bg-transparent text-center w-full outline-none placeholder:text-white/30"
              placeholder="0"
            />
            {amount && !isNaN(Number(amount)) && (
              <p className="text-sm font-bold text-white/60 mt-0 flex items-center justify-center gap-1.5">
                <span>≈</span>
                <span className="text-[#2EE56B]">
                  {(Number(amount) * Number(isLimitOrder && limitPrice ? limitPrice : currentConversionRate)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span>{targetCurrency.symbol}</span>
              </p>
            )}

            {/* Limit Order Toggle */}
            <div className="mt-2 border-t border-white/5 pt-2">
              <div className="flex items-center justify-between mb-1 px-2">
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Smart Limit Order</span>
                <button 
                  onClick={() => { setIsLimitOrder(!isLimitOrder); setLimitPrice(currentConversionRate); }}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isLimitOrder ? 'bg-[#2EE56B]' : 'bg-white/10'}`}
                >
                  <motion.div 
                    animate={{ x: isLimitOrder ? 20 : 2 }} 
                    className="w-4 h-4 bg-white rounded-full absolute top-0.5" 
                  />
                </button>
              </div>
              
              <AnimatePresence>
                {isLimitOrder && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <div className="bg-black/20 rounded-xl p-3 flex items-center justify-between mt-2 border border-[#2EE56B]/20">
                      <span className="text-xs font-bold text-white/50">Target Price:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-[#2EE56B] font-bold">1 {sourceCurrency.symbol} =</span>
                        <input 
                          type="text" 
                          value={limitPrice} 
                          onChange={(e) => setLimitPrice(e.target.value.replace(/[^0-9.]/g, ''))}
                          className="bg-transparent text-sm font-black text-white outline-none w-20 text-right"
                        />
                        <span className="text-xs text-white/50">{targetCurrency.symbol}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Receive Tokens At */}
            <div className="mt-2 border-t border-white/5 pt-2">
              <div className="flex items-center justify-between mb-1 px-2">
                <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Receive Tokens At</span>
              </div>
              <div className="bg-black/20 rounded-xl p-3 flex items-center mt-1 border border-white/10 focus-within:border-[#2EE56B]/50 transition-colors">
                <input 
                  type="text" 
                  value={recipientWallet} 
                  onChange={(e) => setRecipientWallet(e.target.value)}
                  placeholder="Paste 0x... Wallet Address"
                  className="bg-transparent text-xs font-bold text-white outline-none w-full placeholder:text-white/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM HALF: Terminal/Keypad */}
        <div className="shrink-0 p-4 sm:p-5 pt-2 flex flex-col justify-between">
          {isAgentCalculating ? (
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-black/20 rounded-3xl mt-4 border border-[#2EE56B]/20 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              <div className="relative flex items-center justify-center w-24 h-24">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute w-24 h-24 border-[4px] border-transparent border-t-[#2EE56B] border-r-[#2EE56B] rounded-full shadow-[0_0_15px_rgba(46,229,107,0.4)]"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute w-16 h-16 border-[4px] border-transparent border-b-[#2EE56B] border-l-[#2EE56B] rounded-full opacity-70"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                  className="w-6 h-6 bg-[#2EE56B] rounded-full shadow-[0_0_15px_rgba(46,229,107,0.8)]"
                />
              </div>
              <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="text-[#2EE56B] font-black text-sm mt-8 uppercase tracking-[0.3em]"
              >
                Processing
              </motion.p>
            </div>
          ) : swapped || pendingOrder ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white/5 rounded-3xl mt-4 border border-white/5">
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest">{swapped ? "Swap Completed" : "Order Pending"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-y-0.5 gap-x-6 mt-auto mb-1 px-2">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<"].map(
                (key, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleKeypad(key)}
                    className="h-8 sm:h-10 flex items-center justify-center text-xl sm:text-2xl font-bold text-white bg-transparent hover:bg-white/10 rounded-2xl transition-colors"
                  >
                    {key === "<" ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.5 15.5L10.5 12.5L13.5 9.5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      key
                    )}
                  </button>
                )
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="mt-auto mb-2 h-12 shrink-0 min-h-[48px]">
            {swapped ? (
              <div className="w-full h-full border-2 border-[#2EE56B] bg-[#2EE56B]/20 rounded-[20px] flex items-center justify-between px-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2EE56B]" />
                  <span className="font-bold text-[#2EE56B] text-sm">Executed</span>
                </div>
                <button className="flex items-center gap-1 text-[10px] font-bold bg-[#2EE56B] text-[#0A1C12] px-3 py-1.5 rounded-full hover:bg-white transition-colors">
                  Explorer <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ) : pendingOrder ? (
              <div className="flex gap-2 h-full">
                <div className="flex-1 border-2 border-orange-400 bg-orange-400/20 rounded-[20px] flex items-center justify-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                  <span className="font-bold text-orange-400 text-sm">Monitoring...</span>
                </div>
                <button 
                  onClick={() => {
                    setPendingOrder(false);
                    setIsLimitOrder(false);
                  }}
                  className="px-4 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500 transition-colors rounded-[20px] text-xs font-bold flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            ) : !isAgentCalculating && (
              <div className="relative w-full h-full bg-[#2EE56B] rounded-[20px] overflow-hidden flex items-center justify-center shadow-lg">
                 <SwipeButton
                    text={isLimitOrder ? "Swipe to Set Target" : "Swipe to Auto-Route"}
                    loadingText="Processing..."
                    onSuccess={handleSwipeSuccess}
                  />
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
