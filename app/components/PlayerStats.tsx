import { Player } from "../lib/api/types";

export default function PlayerStats({ players }: { players: Player[] }) {
  const count = (role: string) =>
    players.filter(p => p.role === role).length;

  return (
    <div className="flex gap-4">
      {[
        { label: "Total Players", value: players.length },
        { label: "Batsmen", value: count("Batsman") },
        { label: "Bowlers", value: count("Bowler") },
        { label: "All Rounders", value: count("All Rounder") },
      ].map(stat => (
        <div
          key={stat.label}
          className="px-5 py-3 rounded-xl bg-[#020617] border border-white/10"
        >
          <p className="text-xs text-white/60">{stat.label}</p>
          <p className="text-lg font-semibold">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
