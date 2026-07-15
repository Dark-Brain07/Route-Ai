"use client";

import { Zap, CheckCircle2, Clock } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="flex flex-col h-full bg-[#2EE56B]">
      
      {/* Header */}
      <div className="px-6 pt-12 pb-6 flex items-center justify-between text-[#0A1C12]">
        <h1 className="text-xl font-black tracking-tight">
          Agent History
        </h1>
      </div>

      <div className="flex-1 bg-[#0E291A] rounded-t-[40px] rounded-b-[40px] mb-28 mx-2 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col relative overflow-hidden p-6">
        
        {/* Ticket Cutout Effects */}
        <div className="absolute top-20 -left-4 w-8 h-8 bg-[#2EE56B] rounded-full shadow-inner"></div>
        <div className="absolute top-20 -right-4 w-8 h-8 bg-[#2EE56B] rounded-full shadow-inner"></div>
        <div className="absolute top-24 left-4 right-4 border-t-2 border-dashed border-white/10 pointer-events-none"></div>

        {/* Toggle */}
        <div className="bg-white/10 rounded-full p-1 flex mb-8 mt-2 relative z-10">
          <button className="flex-1 bg-[#2EE56B] text-[#0A1C12] font-bold rounded-full py-2 text-xs shadow-sm">
            Remittances
          </button>
          <button className="flex-1 text-white/60 font-medium rounded-full py-2 text-xs flex justify-center items-center gap-1 hover:text-white transition-colors">
            <Zap className="w-3 h-3" /> x402 Logs
          </button>
        </div>

        {/* Date Header */}
        <div className="flex items-center gap-2 mb-4 mt-6">
          <Clock className="w-3 h-3 text-white/50" />
          <h3 className="font-bold text-white/50 text-[10px] uppercase tracking-widest">Today (July 10)</h3>
        </div>
        
        {/* List */}
        <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar flex-1 relative z-10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col p-4 bg-white/5 rounded-2xl relative overflow-hidden border border-transparent hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="bg-black/30 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">🇺🇸 USDm</span>
                  <span className="text-white/40 text-[10px]">→</span>
                  <span className="bg-black/30 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">🇰🇪 KESm</span>
                </div>
                <div className="flex items-center gap-1 text-[#2EE56B]">
                  <CheckCircle2 className="w-3 h-3" strokeWidth={3} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Success</span>
                </div>
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="font-black text-white text-sm tracking-tight">50.00 <span className="text-white/60 font-bold text-xs">🇺🇸 USDm</span></p>
                  <p className="text-[9px] text-white/40 font-mono mt-1 border border-white/10 w-fit px-1.5 py-0.5 rounded bg-black/20">Tx: 0x8f4...9c2</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#2EE56B]">~6,450 🇰🇪 KESm</p>
                  <p className="text-[9px] text-white/40 mt-1 font-medium">Ubeswap • 0.05 fee</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
