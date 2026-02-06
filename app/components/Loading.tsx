"use client";

import { Hammer, Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#020408] overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex flex-col items-center relative z-10">
        
        <div className="flex items-center gap-4 mb-12 animate-in fade-in zoom-in duration-700">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.4)] animate-bounce">
             <Hammer className="text-black" size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter uppercase text-white">
            Cric<span className="text-amber-500">Auction</span>
          </h1>
        </div>

        <div className="relative w-64 h-1.5 bg-white/5 rounded-full overflow-hidden mb-6 border border-white/5">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full animate-progress-glow shadow-[0_0_15px_rgba(245,158,11,0.8)]" 
               style={{ width: '40%' }} />
        </div>

        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-amber-500/50" size={14} />
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic animate-pulse">
            Establishing Live Link...
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress-glow {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(250%); }
        }
        .animate-progress-glow {
          animation: progress-glow 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}