"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTournamentStore } from "../store/tournamentStore";
import { Player, Team } from "../lib/api/types";
import { getPlayers, getTeams } from "../lib/api/api";
import { useApi } from "../hooks/useApi";
import Loading from "../components/Loading";

type AuctionStatus = "WAITING" | "LIVE" | "SOLD" | "UNSOLD";

export default function AuctionRoomPage() {
  const router = useRouter();
  const { tournament } = useTournamentStore();

  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [status, setStatus] = useState<AuctionStatus>("WAITING");

  // API Hooks
  const { request: loadPlayers, loading: loadingPlayers } = useApi(getPlayers);
  const { request: loadTeams, loading: loadingTeams } = useApi(getTeams);

  // Load players and teams when tournament is selected
  useEffect(() => {
    if (!tournament?._id) {
      toast.error("Tournament not found");
      router.push("/");
      return;
    }

    loadPlayers(tournament._id)
      .then((res) => {
        const playerList = res.data || [];
        setPlayers(playerList);
        if (playerList.length > 0) {
          setActivePlayer(playerList[0]);
          setCurrentBid(playerList[0].basePrice);
          setStatus("WAITING");
        }
      })
      .catch((e) => {
        console.warn("Failed to load players", e);
        toast.error("Failed to load players");
      });

    loadTeams(tournament._id)
      .then((res) => setTeams(res.data || []))
      .catch((e) => console.warn("Failed to load teams", e));
  }, [tournament?._id, router]);

  const incrementBid = (amount: number) => {
    setCurrentBid((prev) => prev + amount);
    setStatus("LIVE");
  };

  // Show loading state
  if (loadingPlayers || loadingTeams) {
    return (
      <main className="h-screen bg-[#070d19] flex items-center justify-center">
        <Loading />
      </main>
    );
  }

  // No tournament selected
  if (!tournament?._id) {
    return (
      <main className="h-screen bg-[#070d19] text-white flex items-center justify-center">
        <p className="text-gray-400">Tournament not selected</p>
      </main>
    );
  }

  // No players available
  if (players.length === 0) {
    return (
      <main className="h-screen bg-[#070d19] text-white flex items-center justify-center">
        <p className="text-gray-400">No players available for auction</p>
      </main>
    );
  }

  return (
    <main className="h-screen bg-[#070d19] text-white flex flex-col">
      {/* HEADER */}
      <header className="h-16 flex items-center justify-between px-6 bg-black/40 backdrop-blur border-b border-gray-800">
        <div className="flex items-center gap-4">
          <span className="text-yellow-400 font-bold text-lg">🏏 CricAuction</span>
          <span className="text-red-500 animate-pulse text-sm">● LIVE</span>
          <span className="text-sm text-gray-400">{tournament?.name}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/setup-tournament")}
            className="px-4 py-1 rounded bg-gray-700 hover:bg-gray-600 transition"
          >
            Exit
          </button>
          <button className="px-4 py-1 rounded bg-red-600 hover:bg-red-500 transition">
            End Session
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT – PLAYER POOL */}
        <aside className="w-72 border-r border-gray-800 p-4 flex flex-col">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">
            Players ({players.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2">
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePlayer(p);
                  setCurrentBid(p.basePrice);
                  setStatus("WAITING");
                }}
                className={`w-full text-left p-3 rounded border transition ${
                  activePlayer?.id === p.id
                    ? "border-yellow-500 bg-yellow-500/10"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-gray-400">
                  {p.role} • ₹{p.basePrice.toLocaleString("en-IN")}
                </p>
              </button>
            ))}
          </div>
        </aside>

        {/* CENTER – AUCTION */}
        <section className="flex-1 p-6 flex flex-col gap-6">
          {activePlayer && (
            <>
              <div className="flex gap-6 bg-[#0e1729] p-6 rounded-xl">
              <div className="w-40 h-40 rounded-lg bg-[#111b2e] flex items-center justify-center text-6xl font-bold">
                  {activePlayer.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{activePlayer.name}</h1>
                  <p className="text-yellow-400 font-semibold">{activePlayer.role}</p>

                  <div className="flex gap-6 mt-4">
                    <Stat label="Role" value={activePlayer.role} />
                    <Stat
                      label="Base Price"
                      value={`₹${activePlayer.basePrice.toLocaleString("en-IN")}`}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#0e1729] p-6 rounded-xl">
                <p className="text-gray-400 mb-2">CURRENT BID</p>
                <p className="text-5xl font-bold text-yellow-400">
                  ₹{currentBid.toLocaleString()}
                </p>

                <div className="flex gap-3 mt-4">
                  <BidBtn onClick={() => incrementBid(2000000)}>+20L</BidBtn>
                  <BidBtn onClick={() => incrementBid(5000000)}>+50L</BidBtn>
                  <BidBtn onClick={() => incrementBid(10000000)}>+1Cr</BidBtn>
                </div>

                <div className="flex gap-4 mt-6">
                  <button className="flex-1 bg-red-600 py-3 rounded">
                    UNSOLD
                  </button>
                  <button className="flex-1 bg-green-600 py-3 rounded">
                    SELL PLAYER
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* RIGHT – STATUS */}
        <aside className="w-72 border-l border-gray-800 p-4 flex flex-col gap-4">
          <div className="bg-[#0e1729] p-4 rounded-xl">
            <p className="text-sm text-gray-400">AUCTION STATUS</p>
            <p className="mt-2 font-semibold">{status}</p>
          </div>

          <div className="bg-[#0e1729] p-4 rounded-xl">
            <p className="text-sm text-gray-400 mb-2">TEAMS</p>
            <div className="grid grid-cols-2 gap-2">
              {teams.map((t) => (
                <div key={t.id || t.name} className="bg-[#111b2e] p-2 rounded text-sm">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-gray-400">
                    ₹{(t.purse || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* ---- helpers ---- */
function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-sm">{value}</p>
    </div>
  );
}

function BidBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500"
    >
      {children}
    </button>
  );
}
