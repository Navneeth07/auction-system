"use client";
import { useState } from "react";

/* ---------------- TYPES ---------------- */
type Player = {
  id: string;
  name: string;
  role: string;
  category: string;
  basePrice: number;
};
type Team = {
  id: string;
  shortName: string;
  purseLeft: number;
  bidIncrement: number;
};
type SoldPlayer = {
  player: Player;
  team: Team;
  amount: number;
};

/* ---------------- DATA ---------------- */
const CATEGORIES = ["Marquee", "Batsmen", "Bowlers", "All-Rounders", "Wicket Keepers"];
const PLAYERS: Player[] = [
  { id: "1", name: "Rohit Sharma", role: "Batsman", category: "Marquee", basePrice: 20000000 },
  { id: "2", name: "Virat Kohli", role: "Batsman", category: "Marquee", basePrice: 20000000 },
  { id: "3", name: "Jasprit Bumrah", role: "Bowler", category: "Marquee", basePrice: 20000000 },
];
const TEAMS: Team[] = [
  { id: "rcb", shortName: "RCB", purseLeft: 45000000, bidIncrement: 2000000 },
  { id: "csk", shortName: "CSK", purseLeft: 32000000, bidIncrement: 2000000 },
  { id: "mi", shortName: "MI", purseLeft: 51000000, bidIncrement: 5000000 },
  { id: "kkr", shortName: "KKR", purseLeft: 28000000, bidIncrement: 2000000 },
];

/* ---------------- COMPONENT ---------------- */
export default function AuctionRoomPage() {
  const [activeCategory, setActiveCategory] = useState("Marquee");
  const [queue, setQueue] = useState(PLAYERS);
  const [currentPlayer, setCurrentPlayer] = useState(queue[0]);
  const [currentBid, setCurrentBid] = useState(currentPlayer.basePrice);
  const [leadingTeam, setLeadingTeam] = useState<Team | null>(null);
  const [soldPlayers, setSoldPlayers] = useState<SoldPlayer[]>([]);

  const handleBid = (team: Team) => {
    const next = leadingTeam ? currentBid + team.bidIncrement : currentPlayer.basePrice;
    if (team.purseLeft < next) return;
    setCurrentBid(next);
    setLeadingTeam(team);
  };

  const handleSell = () => {
    if (!leadingTeam) return;
    setSoldPlayers(s => [...s, { player: currentPlayer, team: leadingTeam, amount: currentBid }]);
    const rest = queue.slice(1);
    setQueue(rest);
    setCurrentPlayer(rest[0]);
    setCurrentBid(rest[0]?.basePrice ?? 0);
    setLeadingTeam(null);
  };

  return (
    <div className="min-h-screen bg-[#02040a] text-white p-8 font-sans selection:bg-purple-500/30">
      {/* BACKGROUND ORBS FOR FUTURISTIC FEEL */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER */}
      <div className="relative flex justify-between items-center mb-10 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" />
            <span className="relative block w-4 h-4 bg-red-500 rounded-full" />
          </div>
          <span className="font-black text-2xl tracking-tighter italic">NEON <span className="text-purple-500">AUCTION</span> 2026</span>
        </div>
        <button className="bg-white/10 hover:bg-red-500/20 border border-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all uppercase tracking-widest text-sm">
          End Session
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8 relative">
        {/* LEFT: PLAYER QUEUE */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-bold ml-2">Category</h3>
          <div className="flex flex-col gap-2 mb-6">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-4 py-3 rounded-xl text-left text-sm font-bold transition-all border ${
                  activeCategory === c
                    ? "bg-purple-600 border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                    : "bg-white/5 border-transparent text-gray-400 hover:bg-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          
          <h3 className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-bold ml-2">Queue</h3>
          <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {queue.map((p, i) => (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all ${
                  i === 0
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 border-white/30 shadow-2xl scale-105"
                    : "bg-white/5 border-white/5 grayscale opacity-60"
                }`}
              >
                <p className="font-bold text-lg leading-none mb-1">{p.name}</p>
                <p className="text-[10px] uppercase tracking-widest opacity-70">{p.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER: THE STAGE */}
        <div className="col-span-7 space-y-8">
          {/* LARGE PLAYER DISPLAY */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-[#0e1625] rounded-[2rem] p-8 flex gap-10 border border-white/10 items-center">
              <div className="w-64 h-72 bg-gradient-to-t from-gray-800 to-gray-700 rounded-2xl shadow-inner border border-white/5 flex-shrink-0 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
              </div>
              <div className="flex-1">
                <div className="inline-block px-4 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-4">
                  {currentPlayer.category} Pool
                </div>
                <h1 className="text-7xl font-black tracking-tighter mb-2 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                  {currentPlayer.name.split(' ')[0]}<br/>
                  <span className="text-purple-500">{currentPlayer.name.split(' ')[1]}</span>
                </h1>
                <p className="text-2xl text-gray-400 font-light tracking-widest uppercase">{currentPlayer.role}</p>
              </div>
            </div>
          </div>

          {/* MAIN BID DISPLAY (PROJECTOR FOCUS) */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#1a2133] to-[#0e1625] rounded-[2rem] p-8 border border-white/10 shadow-2xl flex flex-col justify-center">
               <p className="text-purple-400 text-xs font-black uppercase tracking-[0.3em] mb-2 text-center">Current Bid</p>
               <p className="text-7xl font-black text-white text-center tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                <span className="text-3xl text-gray-500 mr-2">₹</span>{currentBid.toLocaleString("en-IN")}
              </p>
              {leadingTeam && (
                <div className="mt-4 flex items-center justify-center gap-3 bg-white/5 py-2 rounded-full border border-white/5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-sm font-bold tracking-widest text-gray-300 uppercase">Leading: {leadingTeam.shortName}</p>
                </div>
              )}
            </div>

            <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 flex flex-col justify-center items-center">
               <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em] mb-2">Base Price</p>
               <p className="text-4xl font-bold text-gray-300">
                ₹{currentPlayer.basePrice.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* TEAM PADS */}
          <div className="grid grid-cols-4 gap-4">
            {TEAMS.map(team => (
              <button
                key={team.id}
                onClick={() => handleBid(team)}
                className={`relative group overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ${
                  leadingTeam?.id === team.id
                    ? "bg-purple-600 ring-4 ring-purple-400/50 -translate-y-2"
                    : "bg-white/5 hover:bg-white/10 border border-white/5"
                }`}
              >
                <p className="text-3xl font-black mb-1">{team.shortName}</p>
                <div className="h-[1px] w-full bg-white/10 my-3" />
                <p className="text-[10px] text-gray-400 uppercase font-bold mb-1 tracking-tighter">Available Purse</p>
                <p className="text-lg font-bold tabular-nums">₹{(team.purseLeft / 10000000).toFixed(2)} Cr</p>
              </button>
            ))}
          </div>

          {/* BIG ACTION BUTTONS */}
          <div className="flex gap-6">
            <button className="flex-1 bg-transparent hover:bg-red-600 border-2 border-red-600/50 hover:border-red-600 py-5 rounded-2xl font-black text-xl transition-all uppercase tracking-widest">
              Unsold
            </button>
            <button
              onClick={handleSell}
              disabled={!leadingTeam}
              className="flex-[2] bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 py-5 rounded-2xl font-black text-xl transition-all uppercase tracking-widest shadow-[0_10px_40px_rgba(16,185,129,0.3)] disabled:opacity-20 disabled:grayscale"
            >
              Hammer Down (Sell)
            </button>
          </div>
        </div>

        {/* RIGHT: HISTORY & LOGS */}
        <div className="col-span-3 space-y-6">
           <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
            <h3 className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-black mb-6">Up Next</h3>
            <div className="space-y-6">
              {queue.slice(1, 4).map(p => (
                <div key={p.id} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 group-hover:border-purple-500/50 transition-colors" />
                  <div>
                    <p className="font-bold text-sm group-hover:text-purple-400 transition-colors">{p.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{p.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md h-[400px] flex flex-col">
            <h3 className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-black mb-6">Auction Ledger</h3>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
              {soldPlayers.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                  <p className="text-sm">Waiting for first sale...</p>
                </div>
              )}
              {soldPlayers.map((s, i) => (
                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{s.player.name}</p>
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">{s.team.shortName}</p>
                  </div>
                  <p className="text-sm font-black text-yellow-500">₹{(s.amount / 10000000).toFixed(2)} Cr</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}