"use client";

import { useEffect, useRef, useState } from "react";
import { useTournamentStore } from "../store/tournamentStore";
import { getAuctionRoom, postAuctionBid } from "../lib/api/api";

/* ================= TYPES ================= */

type Player = {
  id: string;
  fullName: string;
  tournamentPlayerId: string;
  image?: string;
  role: string;
  basePrice: number;
  biddingPrice: number;
};

type Team = {
  id: string;
  name: string;
  shortCode: string;
  remainingPurse: number;
};

type BidHistoryItem = {
  teamCode: string;
  amount: number;
  timestamp: number;
};

/* ================= HELPERS ================= */

const formatRupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const getHistoryKey = (tournamentId: string, playerId: string) =>
  `auction-history-${tournamentId}-${playerId}`;

/* ================= COMPONENT ================= */

export default function AuctionRoomPage() {
  const { tournament } = useTournamentStore();
  const tournamentId = tournament?._id;

  const [categories, setCategories] = useState<string[]>([]);
  const [playersByCategory, setPlayersByCategory] = useState<
    Record<string, Player[]>
  >({});
  const [teams, setTeams] = useState<Team[]>([]);

  const [activeCategory, setActiveCategory] = useState("");
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

  const [currentBid, setCurrentBid] = useState(0);
  const [leadingTeam, setLeadingTeam] = useState<Team | null>(null);

  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const bidSoundRef = useRef<HTMLAudioElement | null>(null);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    if (!tournamentId) return;

    getAuctionRoom(tournamentId).then(res => {
      const data = res.data;

      const roles = Object.keys(data.roles);
      const mapped: Record<string, Player[]> = {};

      roles.forEach(role => {
        mapped[role] = data.roles[role].players;
      });

      setCategories(roles);
      setPlayersByCategory(mapped);
      setTeams(data.teams);

      setActiveCategory(roles[0]);

      if (data.activePlayer) {
        setActivePlayer(data.activePlayer);
        setCurrentBid(data.activePlayer.basePrice);
      }
    });

    bidSoundRef.current = new Audio("/sounds/bid.mp3");
  }, [tournamentId]);

  /* ================= CATEGORY / PLAYER ================= */

  useEffect(() => {
    if (!activeCategory) return;

    const first = playersByCategory[activeCategory]?.[0] ?? null;
    setActivePlayer(first);
    setCurrentBid(first?.basePrice ?? 0);
    setLeadingTeam(null);
    setBidHistory([]);
    stopCountdown();
  }, [activeCategory]);

  useEffect(() => {
    if (!activePlayer || !tournamentId) return;

    const saved = sessionStorage.getItem(
      getHistoryKey(tournamentId, activePlayer.id)
    );
    setBidHistory(saved ? JSON.parse(saved) : []);
    setCurrentBid(activePlayer.basePrice);
    setLeadingTeam(null);
    stopCountdown();
  }, [activePlayer?.id]);

  /* ================= BID ================= */

  const handleBid = async (team: Team) => {
    if (!activePlayer) return;

    const inc = activePlayer.biddingPrice;
    const next =
      currentBid === activePlayer.basePrice
        ? activePlayer.basePrice + inc
        : currentBid + inc;

    if (team.remainingPurse < next) return;

    await postAuctionBid({
      tournamentPlayerId: activePlayer.tournamentPlayerId,
      teamId: team.id,
      bidAmount: inc
    });

    setCurrentBid(next);
    setLeadingTeam(team);

    const entry = {
      teamCode: team.shortCode,
      amount: next,
      timestamp: Date.now()
    };

    setBidHistory(prev => {
      const updated = [entry, ...prev];
      sessionStorage.setItem(
        getHistoryKey(tournamentId!, activePlayer.id),
        JSON.stringify(updated)
      );
      return updated;
    });

    bidSoundRef.current?.play();
    startCountdown();
  };

  /* ================= COUNTDOWN ================= */

  const startCountdown = () => {
    stopCountdown();
    setCountdown(10);
    timerRef.current = setInterval(() => {
      setCountdown(p => {
        if (!p || p <= 1) {
          stopCountdown();
          return null;
        }
        return p - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  /* ================= HAMMER ================= */

const handleHammerDown = () => {
  if (!activePlayer) return;

  setPlayersByCategory(prev => {
    // 1️⃣ remove sold player
    const remainingPlayers = prev[activeCategory].filter(
      p => p.id !== activePlayer.id
    );

    // 2️⃣ pick next player in same category
    const nextPlayer = remainingPlayers[0] ?? null;

    // 3️⃣ auto-select next player (THIS IS THE FIX)
    setActivePlayer(nextPlayer);
    setCurrentBid(nextPlayer?.basePrice ?? 0);

    // 4️⃣ reset auction state
    setLeadingTeam(null);
    setCountdown(null);
    setBidHistory([]);
    stopCountdown();

    return {
      ...prev,
      [activeCategory]: remainingPlayers
    };
  });
};

  /* ================= UI ================= */

  return (
    <div className="h-screen bg-[#020408] text-white p-6 flex flex-col relative overflow-hidden font-sans">
      {/* BACKGROUND ATMOSPHERE */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER: BROADCAST STYLE */}
      <header className="flex justify-between items-center mb-6 bg-white/[0.03] border border-white/10 p-5 rounded-[2rem] backdrop-blur-2xl z-50 shadow-2xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-red-600/20 border border-red-600/40 rounded-lg text-[10px] font-black tracking-widest text-red-500 uppercase">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Live Auction
          </div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            Cric<span className="text-amber-500">Auction</span> <span className="text-white/20 font-light ml-1 italic">2026</span>
          </h1>
        </div>
        <button className="bg-white/5 hover:bg-red-600/90 border border-white/10 px-8 py-2.5 rounded-2xl font-black transition-all text-xs uppercase tracking-widest text-red-500 hover:text-white">
          End Session
        </button>
      </header>

      <div className="grid grid-cols-12 gap-6 flex-grow min-h-0 relative z-10">
        
        {/* LEFT PANEL: CATEGORIES & QUEUE */}
        <div className="col-span-2 flex flex-col gap-6 min-h-0">
          <div className="bg-white/[0.03] backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/10 shrink-0 shadow-lg">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4 italic">Categories</p>
            <div className="space-y-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? "bg-amber-600 text-white shadow-lg shadow-amber-900/40 translate-x-1"
                      : "text-white/40 hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/10 flex flex-col min-h-0 flex-grow shadow-inner">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4 italic">Next in Queue</p>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {(playersByCategory[activeCategory] ?? []).map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePlayer(p)}
                  className={`w-full p-4 rounded-2xl text-left border transition-all duration-300 ${
                    activePlayer?.id === p.id
                      ? "bg-amber-600/20 border-amber-500/50 shadow-lg"
                      : "bg-white/5 border-transparent opacity-40 hover:opacity-100"
                  }`}
                >
                  <p className="font-black text-xs uppercase italic truncate">{p.fullName}</p>
                  <span className="inline-block mt-2 text-[8px] font-black tracking-tighter text-amber-500/80 uppercase">
                    #{p.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CENTER PANEL: THE STAGE */}
        <div className="col-span-7 flex flex-col gap-6 min-h-0">
          {/* PLAYER FEATURE CARD */}
          <div className="bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-3xl rounded-[3rem] p-10 flex gap-10 border border-white/10 items-center shrink-0 shadow-2xl relative overflow-hidden group">
            <img
              src="/images/hammer.png"
              className="absolute top-8 right-8 w-12 opacity-10 pointer-events-none group-hover:opacity-30 transition-opacity"
              alt=""
            />
            
            <div className="w-56 h-72 bg-black/40 rounded-[2.5rem] border border-white/5 shrink-0 flex items-center justify-center relative overflow-hidden shadow-2xl">
              {activePlayer?.image ? (
                <img src={activePlayer.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
              ) : (
                <span className="text-white/[0.03] font-black text-[12rem] italic absolute -bottom-8">?</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="flex-1 relative z-10">
              <span className="inline-block px-4 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                {activeCategory} Pool
              </span>
              <h1 className="text-6xl font-black tracking-tighter leading-[0.85] uppercase italic text-white mb-6 drop-shadow-xl">
                {activePlayer?.fullName.split(' ')[0]} <br/>
                <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-100 bg-clip-text text-transparent">
                  {activePlayer?.fullName.split(' ').slice(1).join(' ')}
                </span>
              </h1>
              <div className="flex items-center gap-6">
                <div className="h-[1px] w-12 bg-amber-500/40" />
                <p className="text-xl text-white/40 font-medium uppercase tracking-[0.5em]">{activePlayer?.role ?? "Select Player"}</p>
              </div>
              <p className="mt-8 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                Base Price: <span className="text-white ml-2">{activePlayer ? formatRupees(activePlayer.basePrice) : "-"}</span>
              </p>
            </div>
          </div>

          {/* CURRENT BID TOTEM */}
          <div className={`transition-all duration-500 rounded-[2.5rem] p-8 flex items-center justify-between border backdrop-blur-3xl shadow-2xl ${
            leadingTeam ? "bg-amber-600/10 border-amber-500/40 scale-[1.01]" : "bg-white/[0.02] border-white/5 opacity-50"
          }`}>
            <div className="flex items-center gap-8">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center font-black text-3xl text-amber-400 border border-white/10 shadow-xl">
                {leadingTeam ? leadingTeam.shortCode[0] : "!"}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60 mb-2">Leading Bidder</p>
                <p className="text-4xl font-black uppercase tracking-tighter text-white italic">{leadingTeam ? leadingTeam.shortCode : "Awaiting First Bid"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60 mb-2">Live Valuation</p>
              <p className="text-6xl font-black tabular-nums italic text-white drop-shadow-md animate-pulse">
                {formatRupees(currentBid)}
              </p>
            </div>
          </div>

          {/* TEAM SELECTION GRID */}
          <div className="grid grid-cols-5 gap-4 relative z-50">
            {teams.map(team => {
              const isActive = leadingTeam?.id === team.id;
              return (
                <button
                  key={team.id}
                  onClick={() => handleBid(team)}
                  className={`relative overflow-hidden p-6 rounded-[2rem] border-2 transition-all duration-300 transform active:scale-95 text-left group backdrop-blur-md ${
                    isActive
                      ? "bg-white text-black border-white shadow-2xl -translate-y-2 scale-105"
                      : "bg-white/[0.03] border-white/5 hover:border-amber-500/40"
                  }`}
                >
                  <div className="relative z-20">
                    <p className="text-3xl font-black italic tracking-tighter mb-1 uppercase leading-none">{team.shortCode}</p>
                    <div className={`w-8 h-[3px] mb-4 transition-all duration-500 ${isActive ? "bg-amber-600 w-full" : "bg-white/10 group-hover:bg-amber-500/30 group-hover:w-full"}`} />
                    <p className={`text-[9px] font-black uppercase tracking-widest opacity-40 mb-1`}>Purse</p>
                    <p className="text-sm font-black tabular-nums">{formatRupees(team.remainingPurse)}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-6 mt-auto pb-4 shrink-0 relative z-10">
            <button 
              onClick={() => setActivePlayer(null)} 
              className="flex-1 flex items-center justify-center gap-4 bg-white/[0.03] border-2 border-white/5 hover:border-red-500/40 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] transition-all text-white/30 hover:text-red-500 backdrop-blur-2xl"
            >
              Skip / Unsold
            </button>
            <button
              onClick={handleHammerDown}
              disabled={!leadingTeam}
              className="flex-[2.5] flex items-center justify-center gap-5 bg-gradient-to-r from-amber-600 to-amber-400 py-6 rounded-[2.5rem] font-black text-2xl uppercase tracking-[0.4em] shadow-2xl shadow-amber-900/20 disabled:opacity-10 transition-all hover:brightness-110 active:scale-95 text-white"
            >
              🔨 HAMMER DOWN {countdown !== null && <span className="text-black/40 ml-4">({countdown}s)</span>}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE LEDGER */}
        <div className="col-span-3 flex flex-col min-h-0 relative z-10">
          <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] p-8 border border-white/10 flex flex-col min-h-0 flex-grow shadow-2xl">
            <header className="flex items-center justify-between mb-8">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] flex items-center gap-3 italic">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                Live History
              </p>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">{bidHistory.length} Bids</p>
            </header>
            
            <div className="space-y-4 overflow-y-auto pr-3 custom-scrollbar">
              {bidHistory.map((b, i) => (
                <div 
                  key={b.timestamp} 
                  className={`p-5 rounded-[2rem] border flex justify-between items-center transition-all animate-in slide-in-from-right duration-500 ${
                    i === 0 ? "bg-white/5 border-white/10" : "bg-transparent border-white/5 opacity-50"
                  }`}
                >
                  <div>
                    <p className="text-xl font-black italic text-white uppercase">{b.teamCode}</p>
                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Timestamp: {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-black italic ${i === 0 ? "text-amber-400" : "text-white"}`}>{formatRupees(b.amount)}</p>
                  </div>
                </div>
              ))}
              {bidHistory.length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center opacity-10 border-2 border-dashed border-white/10 rounded-[2.5rem]">
                  <p className="font-black uppercase tracking-widest text-xs">Awaiting bids</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.3); }
      `}</style>
    </div>
  );
}