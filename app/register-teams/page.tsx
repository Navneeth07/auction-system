"use client";

import { useState, useEffect, useRef } from "react";
import { Team } from "../lib/api/types";
import { useRouter } from "next/navigation";
import { useApi } from "../hooks/useApi";
import { registerteams, getTeams, deleteTeam } from "../lib/api/api";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { useTournamentStore } from "../store/tournamentStore";
import { Trash2 } from "lucide-react";

// Interface for API response to satisfy ESLint
interface RawTeamResponse {
  id?: string;
  _id?: string;
  name?: string;
  owner?: string;
  shortCode?: string;
  remainingPurse?: number;
  totalPurse?: number;
}

export default function RegisterTeamsPage() {
  const router = useRouter();
  const { request, loading } = useApi(registerteams);
  const { request: deleteRequest, loading: deleting } = useApi(deleteTeam);
  const { tournament } = useTournamentStore();
  const [teams, setTeams] = useState<Team[]>([]);

  const [form, setForm] = useState({
    name: "",
    owner: "",
    shortCode: "",
  });

  const { request: fetchTeamsRequest, loading: fetchingTeams } = useApi(getTeams);
  const teamsFetchedRef = useRef(false);

  useEffect(() => {
    if (!tournament?._id) return;
    
    if (teamsFetchedRef.current) return;
    teamsFetchedRef.current = true;
    
    fetchTeamsRequest(tournament._id)
      .then((res) => {
        // Safe mapping to replace 'any'
        const data: Team[] = (res?.data || []).map((t: RawTeamResponse) => ({
          id: String(t.id || t._id || ""),
          name: t.name || "Unknown Team",
          owner: t.owner || "No Owner",
          shortCode: t.shortCode || "???",
          tournamentId: tournament._id,
          remainingPurse: t.remainingPurse ?? t.totalPurse ?? 0
        }));
        setTeams(data);
      })
      .catch((e) => {
        console.warn("Failed to load teams", e);
        teamsFetchedRef.current = false;
      });
  }, [tournament, router, fetchTeamsRequest]);

  const handleAddTeam = async () => {
    if (!form.name || !form.owner || !form.shortCode) return;
    if (!tournament?._id) {
      toast.error("Session ID missing.");
      router.push("/setup-tournament");
      return;
    }

    const { name, owner, shortCode } = form;
    try {
      // Cast as Team to satisfy strict argument requirements
      const res = await request({
        name,
        owner,
        shortCode,
        tournamentId: tournament._id
      } as Team);

      const newTeam: Team = {
        id: String(res?.data?.id || res?.data?._id || ""),
        name: res?.data?.name || name,
        owner: res?.data?.owner || owner,
        shortCode: res?.data?.shortCode || shortCode,
        tournamentId: tournament._id,
        remainingPurse: res?.data?.remainingPurse ?? res?.data?.totalPurse ?? 0
      };

      setTeams((prev) => [...prev, newTeam]);
      setForm({ name: "", owner: "", shortCode: "" });
      toast.success(`${shortCode} registered successfully!`);
    } catch (err) {
      toast.error("Failed to register team");
    }
  };

  const handleDelete = async (teamId: string, index: number) => {
    if (!teamId) {
      setTeams(teams.filter((_, i) => i !== index));
      return;
    }
    try {
      await deleteRequest(teamId);
      setTeams(teams.filter((t) => t.id !== teamId));
      toast.success("Team removed from roster");
    } catch (err) {
      toast.error("Failed to delete team");
    }
  };

  return (
    <main className="h-screen bg-[#020408] text-white flex flex-col overflow-hidden font-sans relative">
      {(loading || deleting || fetchingTeams) && <Loading />}
      <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
      <header className="h-16 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-8 shrink-0 z-50 backdrop-blur-xl">
        <h1 className="text-xl font-black uppercase italic">Cric<span className="text-amber-500">Auction</span></h1>
      </header>
      <div className="flex flex-grow min-h-0 relative z-10">
        <section className="flex-[0.6] overflow-y-auto p-10 border-r border-white/5 bg-white/[0.01]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-black uppercase italic mb-10">Participating <span className="text-amber-500">Teams</span></h2>
            <div className="grid grid-cols-1 gap-4">
              {teams.map((team, index) => (
                <div key={team.id || index} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-[2rem] p-5">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black">{team.shortCode}</div>
                    <div>
                      <p className="text-lg font-black uppercase italic">{team.name}</p>
                      <p className="text-[10px] text-white/30 uppercase">Owner: {team.owner}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(team.id, index)} className="p-3 text-red-500 bg-red-500/10 rounded-2xl"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>
        </section>
        <aside className="flex-[0.4] p-12 backdrop-blur-3xl flex flex-col justify-between">
          <div className="space-y-8">
            <h3 className="text-[10px] font-black text-amber-500 uppercase italic">Add New Franchise</h3>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Team Name" className="w-full bg-white/5 p-4 rounded-2xl" />
            <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="Owner Name" className="w-full bg-white/5 p-4 rounded-2xl" />
            <input value={form.shortCode} maxLength={3} onChange={(e) => setForm({ ...form, shortCode: e.target.value.toUpperCase() })} placeholder="Short Code" className="w-full bg-white/5 p-4 rounded-2xl" />
            <button onClick={handleAddTeam} className="w-full py-4 bg-white text-black font-black rounded-2xl">Register Franchise</button>
          </div>
          <button onClick={() => router.push("/player-pools")} className="w-full py-4 bg-amber-600 text-white font-black rounded-2xl">Next: Player Pools</button>
        </aside>
      </div>
    </main>
  );
}