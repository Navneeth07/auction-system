import { Player } from "../lib/api/types";
import PlayerCard from "./PlayerCard";

export default function PlayerList({ players }: { players: Player[] }) {
  return (
    <div className="space-y-4">
      {players.map(player => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
}
