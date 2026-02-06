"use client";
import { useState } from "react";

/* ---------------- TYPES ---------------- */
type TeamStats = {
  id: string;
  name: string;
  totalPurse: number;
  spent: number;
  playersCount: number;
  maxPlayers: number;
};

/* ---------------- DATA ---------------- */
const TOURNAMENT_SUMMARY = [
  { label: "Total Spent", value: "₹ 245.5 Cr", trend: "+12% from last season", icon: "💰" },
  { label: "Players Sold", value: "64 / 200", trend: "32% of pool cleared", icon: "👤" },
  { label: "Highest Bid", value: "₹ 18.50 Cr", trend: "Sam Curran (PBKS)", icon: "🏆" },
  { label: "Avg Bid Price", value: "₹ 3.8 Cr", trend: "For capped players", icon: "📈" },
];

const TEAM_STATS: TeamStats[] = [
  { id: "rcb", name: "RCB", totalPurse: 100, spent: 32, playersCount: 12, maxPlayers: 25 },
  { id: "csk", name: "CSK", totalPurse: 100, spent: 45, playersCount: 15, maxPlayers: 25 },
  { id: "mi", name: "MI", totalPurse: 100, spent: 78, playersCount: 18, maxPlayers: 25 },
  { id: "kkr", name: "KKR", totalPurse: 100, spent: 55, playersCount: 13, maxPlayers: 25 },
  { id: "lsg", name: "LSG", totalPurse: 100, spent: 22, playersCount: 10, maxPlayers: 25 },
];

export default function TournamentDashboard() {
  return (
    /* CHANGED: h-screen to min-h-screen AND overflow-hidden to overflow-y-auto */
    <div className="min-h-screen overflow-y-auto bg-[#020408] text-white p-8 font-sans relative selection:bg-amber-500/30 custom-page-scrollbar">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/5 rounded-full blur-[180px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/5 rounded-full blur-[180px] pointer-events-none" />

      {/* HEADER */}
      <header className="flex justify-between items-center mb-10 bg-white/[0.02] border border-white/10 p-6 rounded-[2.5rem] backdrop-blur-3xl z-50 relative shadow-2xl">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            Tournament <span className="text-amber-500">Dashboard</span>
          </h1>
          <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mt-1">Overview of the ongoing IPL 2026 Auction</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-2xl font-black transition-all text-xs uppercase tracking-widest">Manage Teams</button>
          <button className="bg-amber-600 hover:bg-amber-500 px-6 py-3 rounded-2xl font-black transition-all text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-900/40">
            <span>⚡</span> Enter Auction Room
          </button>
        </div>
      </header>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 relative z-10">
        {TOURNAMENT_SUMMARY.map((stat, i) => (
          <div key={i} className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 group hover:border-amber-500/30 transition-all shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-black text-white/40 uppercase tracking-widest">{stat.label}</p>
              <span className="text-2xl group-hover:scale-125 transition-transform duration-500">{stat.icon}</span>
            </div>
            <h3 className="text-4xl font-black italic tracking-tighter text-white mb-2 uppercase">{stat.value}</h3>
            <p className="text-[10px] font-bold text-amber-500/60 uppercase tracking-wider">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-8 relative z-10">
        {/* PURSE UTILIZATION CHART */}
        <div className="col-span-12 lg:col-span-8 bg-white/[0.02] backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-2 italic">Analytics</p>
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Purse Utilization</h2>
              <p className="text-xs font-bold text-white/20 uppercase tracking-widest mt-1">Funds spent vs remaining per team</p>
            </div>
            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-500 rounded-sm" /> Spent</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-white/10 rounded-sm" /> Remaining</div>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-64 px-4 gap-2">
            {TEAM_STATS.map(team => (
              <div key={team.id} className="flex flex-col items-center gap-4 w-full group">
                <div className="w-full max-w-[60px] bg-white/5 rounded-2xl relative overflow-hidden h-48 border border-white/5 flex flex-col justify-end">
                   <div 
                    className="bg-gradient-to-t from-amber-600 to-amber-400 w-full transition-all duration-1000 group-hover:brightness-125" 
                    style={{ height: `${team.spent}%` }} 
                   />
                </div>
                <p className="font-black text-[10px] md:text-sm text-white/40 group-hover:text-amber-500 transition-colors uppercase italic">{team.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TOP BUYS LIST */}
        <div className="col-span-12 lg:col-span-4 bg-white/[0.02] backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 shadow-2xl">
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-6 italic">Broadcast Highlights</p>
          <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Top Expensive Buys</h2>
          
          <div className="space-y-6">
            {[
                { name: "Ben Stokes", team: "CSK", price: "16.25 Cr", rank: 1 },
                { name: "Sam Curran", team: "PBKS", price: "18.50 Cr", rank: 2 },
                { name: "Cameron Green", team: "MI", price: "17.50 Cr", rank: 3 }
            ].map((buy, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all group">
                    <div className="flex items-center gap-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-amber-500 text-black font-black italic rounded-lg text-sm">{buy.rank}</span>
                        <div>
                            <p className="font-black text-sm uppercase italic leading-none mb-1 group-hover:text-amber-400 transition-colors">{buy.name}</p>
                            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Sold to {buy.team}</p>
                        </div>
                    </div>
                    <p className="text-lg font-black italic text-white">₹{buy.price}</p>
                </div>
            ))}
          </div>
        </div>
      </div>

      {/* SQUAD LIST (Example of content that usually gets cut off) */}
      <div className="mt-10 mb-10 relative z-10">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6">Squad Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM_STATS.map(team => (
              <div key={team.id} className="bg-white/[0.01] backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/[0.03] transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">{team.name}</h3>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-white/40 uppercase tracking-widest">
                        {team.playersCount} / {team.maxPlayers}
                    </span>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Funds Spent</p>
                        <p className="text-xl font-black italic">₹{team.spent} <span className="text-xs opacity-40">Cr</span></p>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500/50" style={{ width: `${team.spent}%` }} />
                    </div>
                </div>
             </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        /* CUSTOM SCROLLBAR FOR THE FULL PAGE */
        .custom-page-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-page-scrollbar::-webkit-scrollbar-track {
          background: #020408;
        }
        .custom-page-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.2);
          border-radius: 20px;
          border: 2px solid #020408;
        }
        .custom-page-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.4);
        }
      `}</style>
    </div>
  );
}