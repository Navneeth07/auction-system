"use client";

import { useState, useEffect, useRef } from "react";
import { Team } from "../lib/api/types";
import { useRouter } from "next/navigation";
import { useApi } from "../hooks/useApi";
import { registerteams, getTeams, deleteTeam } from "../lib/api/api"; // Added deleteTeam
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { useTournamentStore } from "../store/tournamentStore";

export default function RegisterTeamsPage() {
  const router = useRouter();
  const { request, loading, error } = useApi(registerteams);
  const { request: deleteRequest, loading: deleting } = useApi(deleteTeam); // Added delete hook
  const { tournament } = useTournamentStore();
  const [teams, setTeams] = useState<Team[]>([]);

  const [form, setForm] = useState<Team>({
    name: "",
    owner: "",
    shortCode: "",
  });

  const { request: fetchTeamsRequest, loading: fetchingTeams } = useApi(getTeams);
  const teamsFetchedRef = useRef(false);

  useEffect(() => {
    if (!tournament) {
      toast.error("Tournament context missing. Redirecting...");
      router.push("/setup-tournament");
      return;
    }

    if (teamsFetchedRef.current) return;
    teamsFetchedRef.current = true;

    fetchTeamsRequest(tournament._id)
      .then((res) => setTeams(res?.data ? res.data : []))
      .catch((e) => console.warn("Failed to load teams", e));
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
      const res = await request({ name, owner, shortCode, tournamentId: tournament._id });
      setTeams((prev) => [...prev, res?.data]);
      setForm({ name: "", owner: "", shortCode: "" });
      toast.success(`${shortCode} registered successfully!`);
    } catch (err) {
      toast.error("Failed to register team");
    }
  };

  // UPDATED HANDLE DELETE LOGIC
  const handleDelete = async (teamId: string | undefined, index: number) => {
    if (!teamId) {
      // Fallback for UI-only removal if ID isn't present
      setTeams(teams.filter((_, i) => i !== index));
      return;
    }

    try {
      await deleteRequest(teamId);
      setTeams(teams.filter((t) => t.id !== teamId));
      toast.success("Team removed from roster");
    } catch (err) {
      toast.error("Failed to delete team from server");
    }
  };

  return (
    <main className="h-screen bg-[#020408] text-white flex flex-col overflow-hidden font-sans relative">
      {(loading || deleting || fetchingTeams) && <Loading />}
      
      {/* ATMOSPHERIC BROADCAST GLOWS */}
      <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <header className="h-16 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-8 shrink-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="bg-amber-600/20 border border-amber-600/40 text-amber-500 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-2xl">
            Franchise Registry
          </div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
            Cric<span className="text-amber-500">Auction</span> <span className="text-white/20 font-light ml-1 italic text-base">2026</span>
          </h1>
        </div>
      </header>

      <div className="flex flex-grow min-h-0 relative z-10">
        
        {/* LEFT 60%: PARTICIPATING FRANCHISES */}
        <section className="flex-[0.6] overflow-y-auto p-10 custom-scroll border-r border-white/5 bg-white/[0.01]">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10">
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-1 leading-none">
                Participating <span className="text-amber-500">Teams</span>
              </h2>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">
                Registered Franchises: {teams.length}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {teams.map((team, index) => (
                <div
                  key={team.id || index}
                  className="group flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-[2rem] p-5 hover:border-amber-500/30 transition-all duration-500 animate-in slide-in-from-left-4"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black flex items-center justify-center font-black text-xl italic shadow-lg">
                      {team.shortCode}
                    </div>
                    <div>
                      <p className="text-lg font-black uppercase italic tracking-tight text-white group-hover:text-amber-400 transition-colors">{team.name}</p>
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">
                        Owner: <span className="text-white/60 ml-1">{team.owner}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(team.id, index)}
                    className="p-3 rounded-2xl bg-red-500/10 text-red-500 opacity-40 hover:opacity-100 transition-all cursor-pointer mr-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              ))}
              {teams.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
                   <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Awaiting first team registration</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* RIGHT 40%: ADD NEW TEAM DESK */}
        <aside className="flex-[0.4] p-12 backdrop-blur-3xl overflow-y-auto custom-scroll flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-12 italic flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                Add New Franchise
            </h3>

            <div className="space-y-8">
              <div className="group">
                <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-2 italic">Team Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-white/[0.04] px-6 py-4 rounded-2xl border border-white/10 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all cursor-pointer shadow-inner"
                  placeholder="e.g. Super Kings"
                />
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-2 italic">Owner Name</label>
                <input
                  value={form.owner}
                  onChange={(e) => setForm({ ...form, owner: e.target.value })}
                  className="w-full bg-white/[0.04] px-6 py-4 rounded-2xl border border-white/10 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all cursor-pointer shadow-inner"
                  placeholder="e.g. Corporate Inc."
                />
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-2 italic">Short Code (3 Characters)</label>
                <input
                  value={form.shortCode}
                  maxLength={3}
                  onChange={(e) => setForm({ ...form, shortCode: e.target.value.toUpperCase() })}
                  className="w-full bg-white/[0.04] px-6 py-4 rounded-2xl border border-white/10 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all cursor-pointer shadow-inner uppercase"
                  placeholder="e.g. CSK"
                />
              </div>

              <button
                type="button"
                onClick={handleAddTeam}
                disabled={!form.name || !form.owner || !form.shortCode || loading}
                className={`w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-3
                  ${!form.name || !form.owner || !form.shortCode || loading
                    ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed shadow-none"
                    : "bg-white text-black hover:bg-amber-500 transition-all shadow-xl"
                  }`}
              >
                Register Franchise 🛡
              </button>
            </div>
          </div>

          <div className="pt-12 flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-all cursor-pointer active:scale-95"
            >
              Go Back
            </button>

            <button
              type="button"
              onClick={() => {
                if (teams.length === 0) {
                  toast.error("Please register teams before proceeding.");
                  return;
                }
                router.push("/player-pools");
              }}
              disabled={teams.length === 0}
              className={`flex-[2] py-4 rounded-2xl font-black uppercase text-[12px] tracking-[0.3em] transition-all cursor-pointer shadow-2xl active:scale-95
                ${teams.length === 0
                  ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed shadow-none"
                  : "bg-gradient-to-r from-amber-600 to-amber-400 text-white shadow-amber-900/40 hover:brightness-110"
                }`}
            >
              Next: Player Pools 🏏
            </button>
          </div>
        </aside>
      </div>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.15); border-radius: 10px; }
      `}</style>
    </main>
  );
}