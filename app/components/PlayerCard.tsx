import { Player } from "../lib/api/types";

const roleColor: Record<string, string> = {
    Batsman: "bg-blue-500/20 text-blue-400",
    Bowler: "bg-green-500/20 text-green-400",
    "All Rounder": "bg-purple-500/20 text-purple-400",
};

export default function PlayerCard({ player }: { player: Player }) {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[#020617] border border-white/10">
            <div className="h-12 w-12 rounded-full bg-white/10 overflow-hidden">
                {player.image && (
                    <img src={player.image} className="h-full w-full object-cover" />
                )}
            </div>

            <div className="flex-1">
                <p className="font-medium">{player.name}</p>
                <span
                    className={`text-xs px-2 py-1 rounded ${roleColor[player.role]}`}
                >
                    {player.role}
                </span>
            </div>

            <p className="text-sm text-white/60">
                ₹{player.basePrice.toLocaleString()}
            </p>
        </div>
    );
}
