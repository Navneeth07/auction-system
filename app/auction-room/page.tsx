"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTournamentStore } from "../store/tournamentStore";
import { getAuctionRoom } from "../lib/api/api";

/* ================= TYPES ================= */

type Player = {
  id: string;
  fullName: string;
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

type BidEntry = {
  team: string;
  amount: number;
  timestamp: number;
};

/* ================= HELPERS ================= */

const formatRupees = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

/* ================= COMPONENT ================= */

export default function AuctionRoomPage() {
  const { tournament } = useTournamentStore();
  const tournamentId = tournament?._id;

  /* ---------- STATE ---------- */

  const [categories, setCategories] = useState<string[]>([]);
  const [playersByCategory, setPlayersByCategory] = useState<
    Record<string, Player[]>
  >({});
  const [teams, setTeams] = useState<Team[]>([]);

  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);

  const [currentBid, setCurrentBid] = useState(0);
  const [leadingTeam, setLeadingTeam] = useState<Team | null>(null);

  const [bidHistory, setBidHistory] = useState<BidEntry[]>([]);
  const [soldPlayers, setSoldPlayers] = useState<Player[]>([]);

  /* ---------- COUNTDOWN ---------- */

  const BID_TIME = 10; // seconds
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /* ---------- SOUND ---------- */

  const bidSound = useRef<HTMLAudioElement | null>(null);

  /* ================= INITIAL LOAD ================= */

  useEffect(() => {
    if (!tournamentId) return;

    getAuctionRoom(tournamentId).then((res) => {
      const data = res.data;

      const roleKeys = Object.keys(data.roles);

      const mappedPlayers: Record<string, Player[]> = {};
      roleKeys.forEach((role) => {
        mappedPlayers[role] = data.roles[role].players;
      });

      setCategories(roleKeys);
      setPlayersByCategory(mappedPlayers);
      setTeams(data.teams);

      setActiveCategory(roleKeys[0] ?? "");

      if (data.activePlayer) {
        setActivePlayer(data.activePlayer);
        setCurrentBid(data.activePlayer.basePrice);
      }
    });

    bidSound.current = new Audio("/sounds/bid.mp3");
  }, [tournamentId]);

  /* ================= CATEGORY SWITCH ================= */

  useEffect(() => {
    if (!activeCategory) return;

    const list = playersByCategory[activeCategory] ?? [];
    if (list.length > 0) {
      setActivePlayer(list[0]);
      setCurrentBid(list[0].basePrice);
    } else {
      setActivePlayer(null);
      setCurrentBid(0);
    }

    setLeadingTeam(null);
    setBidHistory([]);
    stopCountdown();
  }, [activeCategory]);

  /* ================= BID LOGIC ================= */

  const handleBid = (team: Team) => {
    if (!activePlayer) return;

    const increment = activePlayer.biddingPrice;

    const nextBid =
      leadingTeam === null
        ? activePlayer.basePrice + increment
        : currentBid + increment;

    if (team.remainingPurse < nextBid) return;

    setCurrentBid(nextBid);
    setLeadingTeam(team);

    setBidHistory((prev) => [
      {
        team: team.shortCode,
        amount: nextBid,
        timestamp: Date.now(),
      },
      ...prev,
    ]);

    bidSound.current?.play();

    startCountdown();
  };

  /* ================= COUNTDOWN ================= */

  const startCountdown = () => {
    stopCountdown();
    setCountdown(BID_TIME);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          stopCountdown();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopCountdown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  /* ================= HAMMER DOWN ================= */

  const handleHammerDown = () => {
    if (!activePlayer || !leadingTeam) return;

    setSoldPlayers((prev) => [activePlayer, ...prev]);

    setPlayersByCategory((prev) => ({
      ...prev,
      [activeCategory]: prev[activeCategory].filter(
        (p) => p.id !== activePlayer.id
      ),
    }));

    setActivePlayer(null);
    setLeadingTeam(null);
    setCurrentBid(0);
    setBidHistory([]);
    setCountdown(null);
  };

  /* ================= RENDER ================= */

  return (
    <div className="h-screen bg-[#020408] text-white p-8 font-sans flex flex-col">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-8 bg-white/[0.03] border border-white/10 p-5 rounded-3xl backdrop-blur-2xl">
        <div className="flex items-center gap-6">
          <div className="px-4 py-1.5 bg-red-600/80 rounded text-[10px] font-black tracking-[0.3em] animate-pulse">
            LIVE
          </div>
          <h1 className="text-3xl font-black italic uppercase">
            Cric<span className="text-amber-500">Auction</span> 2026
          </h1>
        </div>
        <button className="bg-white/5 border border-white/10 px-8 py-3 rounded-2xl text-xs font-black">
          End Session
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8 flex-grow min-h-0">
        {/* ================= LEFT ================= */}
        <div className="col-span-2 space-y-6">
          <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/10">
            <p className="text-xs font-black text-amber-500 mb-4">CATEGORIES</p>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black ${
                  activeCategory === c
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                    : "text-gray-400 hover:bg-white/5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/10">
            <p className="text-xs font-black text-gray-400 mb-4">UPCOMING</p>
            <div className="space-y-3">
              {(playersByCategory[activeCategory] ?? []).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePlayer(p);
                    setCurrentBid(p.basePrice);
                    setLeadingTeam(null);
                    setBidHistory([]);
                    stopCountdown();
                  }}
                  className={`w-full text-left p-4 rounded-xl ${
                    activePlayer?.id === p.id
                      ? "bg-amber-500/20 border border-amber-500/50"
                      : "bg-white/5"
                  }`}
                >
                  <p className="font-bold">{p.fullName}</p>
                  <p className="text-xs text-amber-400">{p.role}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= CENTER ================= */}
        <div className="col-span-7 space-y-6">
          <div className="bg-white/[0.04] p-12 rounded-[3rem] flex gap-10 items-center border border-white/10">
            <div className="w-60 h-72 bg-black/40 rounded-3xl flex items-center justify-center">
              {activePlayer?.image ? (
                <img
                  src={activePlayer.image}
                  className="w-full h-full object-cover rounded-3xl"
                />
              ) : (
                <span className="text-7xl text-white/10">?</span>
              )}
            </div>

            <div>
              <h1 className="text-7xl font-black italic">
                {activePlayer?.fullName ?? "Waiting for Player"}
              </h1>
              <p className="mt-4 text-gray-400">
                Base:{" "}
                {activePlayer ? formatRupees(activePlayer.basePrice) : "-"}
              </p>
            </div>
          </div>

          {/* CURRENT BID */}
          <div className="bg-white/[0.03] p-8 rounded-3xl flex justify-between border border-white/10">
            <div>
              <p className="text-xs text-amber-500">CURRENT HIGHEST BID</p>
              <p className="text-4xl font-black">
                {leadingTeam?.shortCode ?? "WAITING"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-amber-500">LIVE VALUATION</p>
              <p className="text-6xl font-black">
                {formatRupees(currentBid)}
              </p>
            </div>
          </div>

          {/* TEAMS */}
          <div className="grid grid-cols-5 gap-4">
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => handleBid(t)}
                className={`p-6 rounded-3xl border ${
                  leadingTeam?.id === t.id
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                    : "bg-white/[0.03] border-white/10"
                }`}
              >
                <p className="text-3xl font-black">{t.shortCode}</p>
                <p className="text-xs mt-2">
                  {formatRupees(t.remainingPurse)}
                </p>
              </button>
            ))}
          </div>

          {/* ACTIONS */}
          <button
            onClick={handleHammerDown}
            disabled={!leadingTeam}
            className="w-full py-6 rounded-3xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-black text-xl disabled:opacity-20"
          >
            HAMMER DOWN {countdown !== null && `(${countdown})`}
          </button>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="col-span-3 bg-white/[0.03] rounded-3xl p-8 border border-white/10">
          <p className="text-xs text-amber-500 mb-4">LIVE BID HISTORY</p>
          <div className="space-y-3">
            {bidHistory.map((b) => (
              <div
                key={b.timestamp}
                className="flex justify-between bg-white/[0.05] p-4 rounded-xl"
              >
                <span className="font-black">{b.team}</span>
                <span className="text-amber-400">
                  {formatRupees(b.amount)}
                </span>
              </div>
            ))}
            {bidHistory.length === 0 && (
              <p className="text-xs text-gray-500">Waiting for first bid…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
