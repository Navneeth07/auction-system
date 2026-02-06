"use client";
import { useState } from "react";

/* ---------------- TYPES ---------------- */
type Player = { id: string; name: string; role: string; category: string; basePrice: number; };
type Team = { id: string; shortName: string; purseLeft: number; bidIncrement: number; };
type SoldPlayer = { player: Player; team: Team; amount: number; };

/* ---------------- DATA ---------------- */
const CATEGORIES = ["Marquee", "Batsmen", "Bowlers", "All-Rounders", "Wicket Keepers"];
const PLAYERS: Player[] = [
  { id: "2", name: "Virat Kohli", role: "Batsman", category: "Marquee", basePrice: 20000000 },
  { id: "3", name: "Jasprit Bumrah", role: "Bowler", category: "Marquee", basePrice: 20000000 },
  { id: "4", name: "Travis Head", role: "Batsman", category: "Batsmen", basePrice: 20000000 },
];

const TEAMS: Team[] = [
  { id: "rcb", shortName: "RCB", purseLeft: 45000000, bidIncrement: 2000000 },
  { id: "csk", shortName: "CSK", purseLeft: 32000000, bidIncrement: 2000000 },
  { id: "mi", shortName: "MI", purseLeft: 51000000, bidIncrement: 5000000 },
  { id: "kkr", shortName: "KKR", purseLeft: 28000000, bidIncrement: 2000000 },
  { id: "lsg", shortName: "LSG", purseLeft: 35000000, bidIncrement: 2000000 },
];

export default function AuctionRoomPage() {
  const [activeCategory, setActiveCategory] = useState("Marquee");
  const [queue, setQueue] = useState(PLAYERS);
  const [currentPlayer, setCurrentPlayer] = useState(queue[0]);
  const [currentBid, setCurrentBid] = useState(currentPlayer?.basePrice ?? 0);
  const [leadingTeam, setLeadingTeam] = useState<Team | null>(null);
  const [soldPlayers, setSoldPlayers] = useState<SoldPlayer[]>([]);

  const handleBid = (team: Team) => {
    const next = leadingTeam ? currentBid + team.bidIncrement : (currentPlayer?.basePrice ?? 0);
    if (team.purseLeft < next) return;
    setCurrentBid(next);
    setLeadingTeam(team);
  };

  const handleSell = () => {
    if (!leadingTeam || !currentPlayer) return;
    setSoldPlayers(s => [{ player: currentPlayer, team: leadingTeam, amount: currentBid }, ...s]);
    const rest = queue.slice(1);
    setQueue(rest);
    setCurrentPlayer(rest[0]);
    setCurrentBid(rest[0]?.basePrice ?? 0);
    setLeadingTeam(null);
  };

  return (
    <div className="h-screen overflow-hidden bg-[#020408] text-white p-8 font-sans flex flex-col relative">
      {/* DIMMED AMBER GLOWS */}
      <div className="fixed -top-24 -left-24 w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed -bottom-24 -right-24 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* GLASS HEADER */}
      <div className="flex justify-between items-center mb-8 bg-white/[0.03] border border-white/10 p-5 rounded-3xl backdrop-blur-2xl shrink-0 z-50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="px-4 py-1.5 bg-red-600/80 backdrop-blur-md animate-pulse rounded text-[10px] font-black tracking-[0.3em]">LIVE</div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            Cric<span className="text-amber-500">Auction</span> <span className="text-gray-400 font-light italic">2026</span>
          </h1>
        </div>
        <button className="bg-white/5 hover:bg-red-600 border border-white/10 px-8 py-3 rounded-2xl font-black transition-all text-xs uppercase tracking-widest">
            End Session
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-grow min-h-0 relative z-10">
        
        {/* LEFT PANEL */}
        <div className="col-span-2 flex flex-col gap-6 min-h-0">
          <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 shrink-0">
             <p className="text-xs font-black text-amber-500/80 uppercase tracking-widest mb-4">Categories</p>
             <div className="space-y-2">
                {CATEGORIES.slice(0, 4).map(c => (
                  <button key={c} onClick={() => setActiveCategory(c)} className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black transition-all ${activeCategory === c ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20" : "hover:bg-white/5 text-gray-400"}`}>{c}</button>
                ))}
             </div>
          </div>
          
          <div className="bg-white/[0.03] backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 flex flex-col min-h-0 flex-grow">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Upcoming</p>
            <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
              {queue.map((p, i) => (
                <div key={p.id} className={`p-5 rounded-2xl border transition-all ${i === 0 ? "bg-amber-600/20 border-amber-500/50" : "bg-white/5 border-transparent opacity-30"}`}>
                  <p className="font-black text-lg leading-none text-white">{p.name}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider mt-2 text-amber-500/60">{p.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER STAGE */}
        <div className="col-span-7 flex flex-col gap-6 min-h-0">
          {/* PLAYER INFO CARD - INTENSE GLASS */}
          <div className="bg-gradient-to-br from-white/[0.07] to-transparent backdrop-blur-3xl rounded-[3.5rem] p-12 flex gap-12 border border-white/10 items-center shrink-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
            <div className="w-60 h-72 bg-black/40 rounded-[2rem] border border-white/10 shrink-0 flex items-center justify-center shadow-inner">
                <span className="text-white/10 font-black text-[10rem] italic">?</span>
            </div>
            <div className="flex-1 relative z-10">
              <span className="px-5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em]">
                {currentPlayer?.category}
              </span>
              <h1 className="text-8xl font-black tracking-tighter mt-6 leading-[0.85] uppercase italic text-white drop-shadow-2xl">
                {currentPlayer?.name.split(' ')[0]} <br/>
                <span className="bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent">
                    {currentPlayer?.name.split(' ').slice(1).join(' ')}
                </span>
              </h1>
              <p className="text-2xl text-gray-400 font-medium uppercase tracking-[0.4em] mt-6 border-l-4 border-amber-500 pl-6">{currentPlayer?.role}</p>
            </div>
          </div>

          {/* LEADING BID TOTEM - GLASS EFFECT */}
          <div className={`transition-all duration-500 rounded-[2.5rem] p-8 flex items-center justify-between border backdrop-blur-3xl ${leadingTeam ? "bg-amber-600/10 border-amber-500/40 shadow-2xl shadow-amber-900/20" : "bg-white/[0.02] border-white/5 opacity-50"}`}>
             <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center font-black text-3xl text-amber-500 border border-white/10 shadow-xl">
                    {leadingTeam ? leadingTeam.shortName[0] : "!"}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60 mb-1">Current Highest Bid</p>
                    <p className="text-4xl font-black uppercase tracking-tighter text-white italic">{leadingTeam ? leadingTeam.shortName : "Waiting..."}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/60 mb-1">Live Valuation</p>
                <p className="text-6xl font-black tabular-nums italic text-white">₹{currentBid.toLocaleString("en-IN")}</p>
             </div>
          </div>

          {/* TEAM CARDS - CLEANER GLASS */}
          <div className="grid grid-cols-5 gap-4 relative z-50">
            {TEAMS.map(team => {
              const isActive = leadingTeam?.id === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() => handleBid(team)}
                  type="button"
                  className={`relative overflow-hidden p-7 rounded-[2.5rem] border-2 transition-all duration-300 transform active:scale-95 text-left group backdrop-blur-md ${
                    isActive
                      ? "bg-white text-black border-white shadow-[0_20px_40px_rgba(255,255,255,0.1)] -translate-y-2"
                      : "bg-white/[0.03] border-white/5 hover:border-amber-500/40 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="relative z-20">
                    <p className="text-3xl font-black italic tracking-tighter mb-1 uppercase">{team.shortName}</p>
                    <div className={`w-10 h-1 mb-5 transition-all ${isActive ? "bg-amber-600" : "bg-white/10 group-hover:w-full group-hover:bg-amber-500/30"}`} />
                    <p className={`text-[10px] font-black uppercase tracking-[0.1em] opacity-50 mb-1`}>Available Purse</p>
                    <p className={`text-2xl font-black tabular-nums`}>
                        ₹{(team.purseLeft / 10000000).toFixed(2)}<span className="text-xs ml-1 opacity-40 font-bold uppercase tracking-tighter">Cr</span>
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* BROADCAST ACTION BUTTONS */}
          <div className="flex gap-6 mt-auto pb-4 shrink-0 relative z-10">
            <button className="flex-1 flex items-center justify-center gap-4 bg-white/[0.03] border-2 border-white/5 hover:border-red-500/50 py-6 rounded-[2.5rem] font-black uppercase tracking-widest transition-all text-gray-500 hover:text-red-500 backdrop-blur-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
              Unsold
            </button>
            <button
              onClick={handleSell}
              disabled={!leadingTeam}
              className="flex-[2.5] flex items-center justify-center gap-5 bg-gradient-to-r from-amber-600 to-amber-500 py-6 rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.3em] shadow-[0_20px_50px_rgba(217,119,6,0.2)] disabled:opacity-10 transition-all hover:brightness-110 active:scale-95 text-white"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M7 21h10v-2H7v2zM17.85 5.2c.21-.21.21-.55 0-.76l-1.29-1.29a.54.54 0 0 0-.76 0L5.2 13.75l-1.11 4.15 4.15-1.11L17.85 5.2z"/></svg>
              Hammer Down
            </button>
          </div>
        </div>

        {/* RIGHT PANEL - LEDGER */}
        <div className="col-span-3 flex flex-col gap-6 min-h-0 relative z-10">
           <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] p-10 border border-white/10 flex flex-col min-h-0 flex-grow shadow-2xl">
            <p className="text-xs font-black text-amber-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3 italic">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                Live Ledger
            </p>
            <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
              {soldPlayers.map((s, i) => (
                <div key={i} className="bg-white/[0.03] p-6 rounded-3xl border border-white/5 flex justify-between items-center group hover:bg-white/[0.05] transition-all">
                  <div>
                    <p className="font-black text-xl leading-none text-white">{s.player.name}</p>
                    <p className="text-[10px] font-black text-amber-500 uppercase mt-2 tracking-[0.2em]">{s.team.shortName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white italic">₹{(s.amount / 10000000).toFixed(2)}<span className="text-xs ml-0.5 opacity-50">Cr</span></p>
                  </div>
                </div>
              ))}
              {soldPlayers.length === 0 && (
                <div className="h-full flex items-center justify-center opacity-10 font-black uppercase tracking-widest text-sm">Ledger Empty</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.2); }
      `}</style>
    </div>
  );
}