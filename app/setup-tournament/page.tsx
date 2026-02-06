"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { createTournament, getTournaments, getTournamentById } from "../lib/api/api";
import { useApi } from "../hooks/useApi";
import { useTournamentStore } from "../store/tournamentStore";
import { useRoleStore } from "../store/roleStore";
import Loading from "../components/Loading";

export default function SetupTournamentPage() {
  const router = useRouter();
  const { request, loading, error } = useApi(createTournament);
  const { data: listData, request: fetchTournaments } = useApi(getTournaments);
  const { setTournament } = useTournamentStore();
  const { roles, addRole, updateRole, removeRole, setRoles } = useRoleStore();
  const { request: fetchTournamentById } = useApi(getTournamentById);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    date: "",
    budget: "",
    minPlayers: "",
    maxPlayers: "",
    rules: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        await fetchTournaments();
        const savedId = localStorage.getItem("selectedTournamentId");
        if (savedId) handleSelectTournament(savedId);
      } catch (e) { /* silent */ }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectTournament = async (id: string) => {
    try {
      const res = await fetchTournamentById(id);
      const t = (res as any).data;
      if (t) {
        setTournament(t);
        setRoles(t.roles || []);
        setForm({
          name: t.name || "",
          date: t.date ? new Date(t.date).toISOString().slice(0, 10) : "",
          budget: String(t.budget || ""),
          minPlayers: String(t.minPlayers || ""),
          maxPlayers: String(t.maxPlayers || ""),
          rules: t.rules || "",
        });
        setSelectedId(t._id);
        localStorage.setItem("selectedTournamentId", t._id);
        toast.success("Tournament Config Loaded");
      }
    } catch (e) {
      toast.error("Failed to load tournament");
    }
  };

  const startNewTournament = () => {
    setSelectedId(null);
    setForm({ name: "", date: "", budget: "", minPlayers: "", maxPlayers: "", rules: "" });
    setRoles([]);
    localStorage.removeItem("selectedTournamentId");
    toast("Fresh Stage Prepared", { icon: '✨' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormValid =
    form.name && form.date && Number(form.budget) > 0 &&
    Number(form.minPlayers) > 0 && Number(form.maxPlayers) > 0 &&
    form.rules && roles.every(r => r.role && r.basePrice > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedId) {
      router.push("/register-teams");
      return;
    }
    const payload = { ...form, budget: Number(form.budget), minPlayers: Number(form.minPlayers), maxPlayers: Number(form.maxPlayers), roles };
    try {
      const res = await request(payload);
      setTournament(res.data);
      if (res?.data?._id) localStorage.setItem("selectedTournamentId", res.data._id);
      toast.success("Tournament staged successfully! 🏏");
      router.push('/register-teams');
    } catch { toast.error(error || "Submission failed"); }
  };

  return (
    <main className="h-screen bg-[#020408] text-white flex flex-col overflow-hidden font-sans relative">
      {loading && <Loading />}

      {/* ATMOSPHERIC BROADCAST GLOWS */}
      <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* CONTENT AREA */}
      <div className="flex flex-grow min-h-0 relative z-10">
        <section className="flex-[0.7] overflow-y-auto p-10 custom-scroll border-r border-white/5 bg-white/[0.01]">
          <form id="tournament-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12 pb-20">
            <div>
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-1">
                {selectedId ? "Viewing" : "Season"} <span className="text-amber-500">{selectedId ? "Selection" : "Staging"}</span>
              </h2>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">
                {selectedId ? "Reviewing saved parameters" : "Configure league parameters & financial benchmarks"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <Input label="League Title" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Indian Premier League" />
              <Input label="Broadcast Date" type="date" name="date" value={form.date} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-3 gap-8">
              <Input label="Team Budget" name="budget" value={form.budget} onChange={handleChange} placeholder="₹70,000" />
              <Input label="Min Roster" name="minPlayers" value={form.minPlayers} onChange={handleChange} placeholder="9" />
              <Input label="Max Roster" name="maxPlayers" value={form.maxPlayers} onChange={handleChange} placeholder="10" />
            </div>

            <Textarea label="Auction Rules" name="rules" value={form.rules} onChange={handleChange} placeholder="Detail specific behaviors..." />

            <div className="pt-4">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tight underline underline-offset-8 decoration-amber-500/20">Role Valuation</h3>
                <button type="button" onClick={addRole} className="text-[10px] font-black text-amber-500 hover:text-amber-300 uppercase tracking-widest cursor-pointer transition-all flex items-center gap-2 group">
                  <span className="w-6 h-6 rounded-lg border border-amber-500 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-all">+</span> Add Tier
                </button>
              </div>

              <div className="space-y-4">
                {roles.map((r, i) => (
                  <div key={i} className="flex gap-4 bg-white/[0.03] p-6 rounded-[2.5rem] border border-white/5 hover:border-amber-500/30 transition-all duration-500 group animate-in slide-in-from-bottom-2">
                    <div className="flex-grow grid grid-cols-3 gap-6">
                      <Input label="Role" value={r.role} onChange={(e) => updateRole(i, { role: e.target.value })} noMargin />
                      <Input label="Base Price" value={r.basePrice} onChange={(e) => updateRole(i, { basePrice: Number(e.target.value) })} noMargin />
                      <Input label="Increment" value={r.biddingPrice} onChange={(e) => updateRole(i, { biddingPrice: Number(e.target.value) })} noMargin />
                    </div>
                    <button type="button" onClick={() => removeRole(i)} className="self-end mb-2 p-3.5 rounded-2xl bg-red-500/10 text-red-500 opacity-60 hover:opacity-100 transition-all cursor-pointer">
                      <TrashIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-12 flex items-center gap-6">
              <button
                type="button"
                onClick={startNewTournament}
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[11px] font-black uppercase tracking-[0.2em] hover:text-white hover:bg-white/10 transition-all cursor-pointer active:scale-95"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`flex-grow py-4 rounded-2xl font-black uppercase text-[13px] tracking-[0.3em] transition-all cursor-pointer shadow-2xl active:scale-95
                    ${!isFormValid || loading
                    ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                    : "bg-gradient-to-r from-amber-600 to-amber-400 text-white shadow-amber-900/40 hover:brightness-110"
                  }
                  `}
              >
                {selectedId ? "Proceed with Selection 🔨" : "Stage New Season 🏏"}
              </button>
            </div>
          </form>
        </section>

        <aside className="flex-[0.3] flex flex-col p-8 backdrop-blur-3xl overflow-y-auto custom-scroll bg-white/[0.01]">
          {/* ENHANCED ADD NEW BUTTON */}
          <div className="mb-10">
            <button
              onClick={startNewTournament}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-amber-500 font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-white/[0.08] hover:border-amber-500/50 transition-all shadow-xl active:scale-[0.98] cursor-pointer group"
            >
              <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
              Create New Tournament
            </button>
          </div>

          <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-6 italic flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
            Previous Tournaments
          </h3>

          <div className="space-y-4">
            {listData && (listData as any).data?.map((t: any) => (
              <button
                key={t._id}
                onClick={() => handleSelectTournament(t._id)}
                className={`w-full text-left p-6 rounded-[2rem] border transition-all cursor-pointer relative group overflow-hidden ${selectedId === t._id ? "bg-amber-600 border-amber-400 shadow-2xl shadow-amber-900/50 -translate-y-1" : "bg-white/[0.02] border-white/5 hover:border-white/20"}`}
              >
                <div className="relative z-10">
                  <p className={`text-sm font-black uppercase italic tracking-tighter truncate ${selectedId === t._id ? "text-white" : "text-white group-hover:text-amber-400"}`}>{t.name}</p>
                  <p className={`text-[9px] font-bold uppercase mt-2 tracking-widest ${selectedId === t._id ? "text-white/60" : "text-white/30"}`}>
                    {t.date ? new Date(t.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Date TBA'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.15); border-radius: 10px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1) hue-rotate(180deg) brightness(1.5); cursor: pointer; }
      `}</style>
    </main>
  );
}

function Input({ label, noMargin = false, ...rest }: any) {
  return (
    <div className={noMargin ? "" : "mb-0"}>
      <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-2 italic">
        {label}
      </label>
      <input
        {...rest}
        className="w-full bg-white/[0.04] px-6 py-4 rounded-2xl border border-white/10 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all cursor-pointer shadow-inner"
      />
    </div>
  );
}

function Textarea({ label, ...rest }: any) {
  return (
    <div>
      <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-2 italic">
        {label}
      </label>
      <textarea
        {...rest}
        rows={4}
        className="w-full bg-white/[0.04] px-6 py-5 rounded-[2.5rem] border border-white/10 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all resize-none cursor-pointer shadow-inner"
      />
    </div>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
  );
}