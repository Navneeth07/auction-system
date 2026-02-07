"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getTournamentDashboard } from "../lib/api/api";
import { TournamentDashboardResponse } from "../lib/api/types";
import { useRouter } from "next/navigation"; // 1. Added Import


export default function TournamentDashboard() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournamentId") || "69868c84b7780be41d4838d4";

  const [data, setData] = useState<TournamentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
    const router = useRouter();


  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await getTournamentDashboard(tournamentId);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentId) {
      fetchDashboardData();
    }
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="h-screen bg-[#020408] flex items-center justify-center">
        <div className="text-amber-500 font-black italic animate-pulse text-xl uppercase tracking-widest">
          Loading Dashboard...
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-white p-10">No data found.</div>;

  const { tournament, overallStats, teams } = data;

  const SUMMARY_CARDS = [
    { label: "Total Spent", value: formatCurrency(overallStats.totalSpendAmount), trend: "Budget Used", icon: "💰" },
    { label: "Players Sold", value: overallStats.totalPlayersSoldDisplay, trend: "Auction Progress", icon: "👤" },
    { label: "Highest Bid", value: formatCurrency(overallStats.highestBid.soldAmount), trend: overallStats.highestBid.playerName, icon: "🏆" },
    { label: "Avg Price", value: formatCurrency(Math.round(overallStats.totalSpendAmount / (overallStats.totalPlayersSold || 1))), trend: "Per Player", icon: "📈" },
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-white p-4 md:p-8 font-sans selection:bg-amber-500/30 overflow-x-hidden">
      
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/5 rounded-full blur-[120px]" />
      </div>

      {/* HEADER - Slimmer height */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white/[0.03] border border-white/10 px-6 py-4 rounded-2xl backdrop-blur-xl gap-4 sticky top-0 z-[100]">
        <div>
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none">
            {tournament.name} <span className="text-amber-500 italic">STATS</span>
          </h1>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1">Live Auction ID: {tournament.id.slice(-6)}</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl font-bold transition-all text-[10px] uppercase tracking-widest">Settings</button>
          <button onClick={() => router.push("/auction-room")} className="bg-amber-600 hover:bg-amber-500 px-5 py-2 rounded-xl font-black transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-amber-900/20">
            <span>⚡</span> Auction Room
          </button>
        </div>
      </header>

      {/* STATS GRID - Reduced padding */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {SUMMARY_CARDS.map((stat, i) => (
          <div key={i} className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{stat.label}</p>
              <span className="text-lg opacity-60">{stat.icon}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase">{stat.value}</h3>
            <p className="text-[9px] font-bold text-amber-500/60 uppercase truncate">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* TOP PICKS - Tighter list */}
        <div className="col-span-12 lg:col-span-4 bg-white/[0.02] p-6 rounded-3xl border border-white/10">
          <h2 className="text-xs font-black uppercase italic tracking-widest mb-4 border-l-2 border-amber-500 pl-3">Expensive Picks</h2>
          <div className="space-y-2">
            {teams.flatMap(t => t.players.map(p => ({...p, team: t.shortCode})))
              .sort((a, b) => b.soldAmount - a.soldAmount).slice(0, 4).map((buy, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-amber-500">0{i + 1}</span>
                  <div>
                    <p className="font-black text-xs uppercase italic leading-none">{buy.playerName}</p>
                    <p className="text-[9px] font-bold text-white/20 uppercase mt-1">{buy.team}</p>
                  </div>
                </div>
                <p className="text-sm font-black italic text-white">{formatCurrency(buy.soldAmount)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* PURSE PROGRESS */}
        <div className="col-span-12 lg:col-span-8 bg-white/[0.02] p-6 rounded-3xl border border-white/10">
          <h2 className="text-xs font-black uppercase italic tracking-widest mb-6 border-l-2 border-amber-500 pl-3">Purse Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            {teams.map((team) => (
              <div key={team.teamId} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                  <span className="text-white/80">{team.teamName}</span>
                  <span className="text-amber-500">{formatCurrency(team.remainingPurse)}</span>
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-1000"
                    style={{ width: `${(team.totalFundSpent / (tournament.budget || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SQUAD BREAKDOWN - FIXED HEIGHT CARDS */}
      <div className="pb-10">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-6">
          Squad <span className="text-amber-500">Breakdown</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div key={team.teamId} className="bg-white/[0.02] rounded-3xl border border-white/10 flex flex-col h-[450px] overflow-hidden group hover:border-amber-500/40 transition-all">
              
              {/* Card Header */}
              <div className="p-5 bg-white/[0.02] border-b border-white/5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black italic uppercase tracking-tighter truncate leading-tight">{team.teamName}</h3>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{team.shortCode} Franchise</p>
                  </div>
                  <div className="bg-amber-500 text-black px-2 py-0.5 rounded text-[10px] font-black uppercase">
                    {team.playerCountDisplay}
                  </div>
                </div>
              </div>

              {/* Player List - This is the specific fix for your stretching UI */}
              <div className="flex-grow overflow-y-auto p-4 custom-card-scrollbar space-y-2">
                {team.players.length > 0 ? (
                  team.players.map((player, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px]">👤</div>
                        <span className="text-[10px] font-bold uppercase italic">{player.playerName}</span>
                      </div>
                      <span className="text-[10px] font-black text-amber-500">{formatCurrency(player.soldAmount)}</span>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
                    <span className="text-2xl mb-2">📋</span>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">No Signings Yet</p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="bg-black/40 p-4 border-t border-white/5 flex justify-between items-center">
                <div>
                    <p className="text-[8px] font-black text-white/30 uppercase">Total Spent</p>
                    <p className="text-sm font-black italic">{formatCurrency(team.totalFundSpent)}</p>
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black text-white/30 uppercase">Remaining</p>
                    <p className="text-sm font-black text-amber-500 italic">{formatCurrency(team.remainingPurse)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        /* The Card Scrollbar */
        .custom-card-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-card-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-card-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.2);
          border-radius: 10px;
        }
        .custom-card-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.5);
        }
        
        /* The Main Page Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #020408; }
        ::-webkit-scrollbar-thumb {
          background: #1a1c20;
          border-radius: 4px;
          border: 2px solid #020408;
        }
        ::-webkit-scrollbar-thumb:hover { background: #2a2c30; }
      `}</style>
    </div>
  );
}