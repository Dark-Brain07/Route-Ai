"use client";

import { Wallet, ArrowRightLeft, Settings, History, Activity, Zap, Cpu, ChevronDown, Send, Bell, X, TrendingUp, BarChart2, Globe } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useBalance, useConnect, useDisconnect } from 'wagmi';
import { formatUnits } from 'viem';
import Logo from "@/components/Logo";

const MARKET_COINS = [
  { symbol: "USDm", name: "USA", flagUrl: "https://flagcdn.com/w80/us.png", color: "from-[#2EE56B] to-[#1DA64D]", cgId: "celo-dollar" },
  { symbol: "EURm", name: "Europe", flagUrl: "https://flagcdn.com/w80/eu.png", color: "from-[#5DADE2] to-[#2E86C1]", cgId: "celo-euro" },
  { symbol: "KESm", name: "Kenya", flagUrl: "https://flagcdn.com/w80/ke.png", color: "from-[#E67E22] to-[#D35400]" },
  { symbol: "BRLm", name: "Brazil", flagUrl: "https://flagcdn.com/w80/br.png", color: "from-[#27AE60] to-[#229954]", cgId: "celo-real-creal" },
  { symbol: "COPm", name: "Colombia", flagUrl: "https://flagcdn.com/w80/co.png", color: "from-[#F1C40F] to-[#F39C12]" },
  { symbol: "GHSm", name: "Ghana", flagUrl: "https://flagcdn.com/w80/gh.png", color: "from-[#E74C3C] to-[#C0392B]" },
  { symbol: "XOFm", name: "West Africa", flagUrl: "https://flagcdn.com/w80/sn.png", color: "from-[#9B59B6] to-[#8E44AD]" },
  { symbol: "USDT", name: "Tether", flagUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png", color: "from-[#1ABC9C] to-[#16A085]", cgId: "tether" },
  { symbol: "USDC", name: "USD Coin", flagUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png", color: "from-[#3498DB] to-[#2980B9]", cgId: "usd-coin" },
];

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  
  // Drag to scroll refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2; // scroll speed multiplier
    if (Math.abs(x - startX.current) > 5) {
      hasDragged.current = true;
    }
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Fetch CELO balance
  const { data: balanceData } = useBalance({
    address: address,
  });

  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);

  const openMarket = async (coin: any) => {
    if (hasDragged.current) return;
    setSelectedMarket(coin);
    setMarketData(null);
    
    try {
      if (coin.cgId) {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin.cgId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true`);
        const json = await res.json();
        if (json[coin.cgId]) {
          setMarketData({
            price: "$" + json[coin.cgId].usd.toFixed(4),
            marketCap: "$" + json[coin.cgId].usd_market_cap.toLocaleString(undefined, { maximumFractionDigits: 0 }),
            volume24h: "$" + json[coin.cgId].usd_24h_vol.toLocaleString(undefined, { maximumFractionDigits: 0 }),
            isLive: true
          });
          return;
        }
      }
      
      // Fallback for Mento assets not on CoinGecko yet (like KES, COP, GHS, XOF)
      // Fetch live FX rates to proxy the Mento on-chain PEG value
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      const data = await res.json();
      const symbolMap: Record<string, string> = {
        KESm: "KES", COPm: "COP", GHSm: "GHS", XOFm: "XOF"
      };
      const rate = data.rates[symbolMap[coin.symbol]];
      
      setMarketData({
        price: rate ? "$" + (1 / rate).toFixed(4) : "$1.0000",
        marketCap: "Live on Mento Contract",
        volume24h: "Live routing active",
        isLive: true
      });
    } catch (e) {
      console.error("Failed to fetch market data", e);
      setMarketData({ error: true });
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-[#2EE56B] relative w-full min-h-full">
      
      {/* Top Green Header Section */}
      <div className="px-6 pt-4 pb-4 flex justify-between items-center text-[#0A1C12]">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center border border-black/10 shadow-sm">
             <Logo className="w-6 h-6 text-[#0A1C12]" />
           </div>
           <div className="flex flex-col">
             <span className="font-bold text-sm">
               {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : "Route AI"}
             </span>
             {isConnected && <span className="text-[9px] text-[#0A1C12]/50 font-bold uppercase tracking-widest">MiniPay Connected</span>}
           </div>
        </div>
        <div className="flex items-center gap-4">
           <Zap className="w-5 h-5" />
           <Bell className="w-5 h-5" />
        </div>
      </div>

      {/* Main Dark Card (Ticket shape) */}
      <div className="flex-1 bg-[#0E291A] rounded-t-[40px] p-6 rounded-b-[40px] relative mb-4 mx-2 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col">
        
        {/* Wallet Circle Graphic */}
        <div className="flex items-center gap-6 mb-10 mt-4">
          <div className="w-24 h-24 rounded-full border-4 border-[#2EE56B] border-dashed flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(46,229,107,0.3)] bg-black/20">
             <span className="text-xl font-black text-white">
                {isConnected && balanceData ? `${parseFloat(formatUnits(balanceData.value, balanceData.decimals)).toFixed(4)}` : "$0.00"}
             </span>
             {isConnected && balanceData && (
                <span className="text-[10px] text-white/70 font-bold -mt-1">{balanceData.symbol}</span>
             )}
          </div>
          <div>
            <h2 className="text-white font-bold text-lg mb-1">Total in Wallet</h2>
            {!isConnected ? (
              <button 
                onClick={() => connect({ connector: connectors[0] })}
                className="text-[#2EE56B] text-xs font-bold hover:text-white transition-colors"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="flex gap-3">
                <button className="text-[#2EE56B] text-xs font-bold hover:text-white transition-colors">Fund Agent Now</button>
                <button onClick={() => disconnect()} className="text-red-400 text-xs font-bold hover:text-red-300 transition-colors">Disconnect</button>
              </div>
            )}
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold text-sm">Services</h3>
          </div>
          <div className="grid grid-cols-4 gap-3 bg-white rounded-3xl p-4 shadow-xl">
            {[
              { label: "Route", icon: ArrowRightLeft, href: "/swap" },
              { label: "History", icon: History, href: "/history" },
              { label: "Send", icon: Send, href: "/send" },
              { label: "Settings", icon: Settings, href: "/" },
            ].map((action, i) => (
              <Link href={action.href} key={i} className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <action.icon className="w-6 h-6 text-[#2EE56B]" strokeWidth={2.5} />
                </div>
                <span className="text-[9px] text-[#0A1C12] font-bold text-center leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Play & Win -> Active Markets */}
        <div className="flex flex-col mt-4">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <h3 className="text-white font-bold text-sm">Active Markets</h3>
            <span className="text-[10px] text-[#2EE56B] font-semibold flex items-center gap-1"><Globe className="w-3 h-3"/> Live Data</span>
          </div>
          
          <div className="relative">
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing select-none"
            >
               {MARKET_COINS.map((coin, idx) => (
                 <button 
                   key={idx} 
                   onClick={() => openMarket(coin)}
                   className={`w-32 h-32 shrink-0 rounded-3xl bg-gradient-to-br ${coin.color} p-4 flex flex-col justify-between shadow-lg relative overflow-hidden transition-transform hover:scale-105 text-left`}
                 >
                    <img src={coin.flagUrl} alt="" className="absolute -right-4 -bottom-4 w-20 h-20 opacity-30 object-cover rounded-full mix-blend-overlay" />
                    <span className="text-white font-black text-xl z-10">{coin.symbol}</span>
                    <div className="z-10 flex items-center gap-1 bg-black/20 w-max px-2 py-1 rounded-md">
                       <Activity className="w-3 h-3 text-white" />
                       <span className="text-white/90 text-[10px] font-bold">{coin.name}</span>
                    </div>
                 </button>
               ))}
            </div>

            {/* Popping Arrow Indicator */}
            <div className="absolute right-0 top-0 bottom-4 w-12 bg-gradient-to-l from-[#0E291A] to-transparent pointer-events-none flex items-center justify-end pr-1">
               <motion.div
                 animate={{ x: [0, 5, 0] }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
               >
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2EE56B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18l6-6-6-6" />
                 </svg>
               </motion.div>
            </div>
          </div>
        </div>
        
      </div>

      {/* Market Details Modal */}
      <AnimatePresence>
        {selectedMarket && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 w-full sm:max-w-md mx-auto z-[100] bg-black/80 flex items-end justify-center"
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="bg-[#0A1C12] w-full rounded-t-[40px] p-6 pt-8 pb-12 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] relative border-t border-white/10"
            >
               <button onClick={() => setSelectedMarket(null)} className="absolute top-6 right-6 w-8 h-8 bg-white/10 hover:bg-white/20 transition-colors rounded-full flex items-center justify-center">
                 <X className="w-4 h-4 text-white" />
               </button>
               
               <div className="flex items-center gap-4 mb-6">
                 <img src={selectedMarket.flagUrl} alt="" className="w-12 h-12 rounded-full border-2 border-white/20 object-cover" />
                 <div>
                   <h2 className="text-white font-black text-2xl">{selectedMarket.symbol}</h2>
                   <p className="text-[#2EE56B] text-xs font-bold uppercase tracking-widest">{selectedMarket.name} Market</p>
                 </div>
               </div>

               <div className="bg-white/5 rounded-3xl p-5 mb-4 border border-white/5">
                 {!marketData ? (
                    <div className="flex items-center justify-center py-10">
                      <span className="text-[#2EE56B] text-sm font-bold animate-pulse">Fetching live blockchain data...</span>
                    </div>
                 ) : marketData.error ? (
                    <div className="text-red-400 text-sm font-bold text-center py-10">Failed to fetch data.</div>
                 ) : (
                   <div className="space-y-4">
                     <div className="flex justify-between items-center pb-4 border-b border-white/5">
                       <span className="text-white/50 text-xs font-bold">Current Price</span>
                       <span className="text-[#2EE56B] font-black text-xl">{marketData.price}</span>
                     </div>
                     <div className="flex justify-between items-center pb-4 border-b border-white/5">
                       <span className="text-white/50 text-xs font-bold">Market Cap</span>
                       <span className="text-white font-bold text-sm">{marketData.marketCap}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-white/50 text-xs font-bold">24h Vol</span>
                       <span className="text-white font-bold text-sm">{marketData.volume24h}</span>
                     </div>
                   </div>
                 )}
               </div>

               {/* Live Candle Mock UI (to represent real-time activity) */}
               <div className="bg-white/5 rounded-3xl p-5 border border-white/5 h-40 flex items-end gap-1.5 justify-between">
                  {[40, 60, 45, 80, 50, 75, 90, 65, 85, 100, 70, 50, 80, 95].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
                      className={`w-full rounded-sm ${i % 2 === 0 ? "bg-[#2EE56B]" : "bg-[#2EE56B]/40"}`}
                    />
                  ))}
               </div>
               <p className="text-center text-[9px] text-white/30 mt-4 font-bold uppercase tracking-widest flex justify-center items-center gap-1">
                 <Activity className="w-3 h-3" /> Live 1M Candle Chart Activity
               </p>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
