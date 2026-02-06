"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Upload,
  Users,
  Plus,
  ChevronDown,
  Loader2,
  CheckCircle2
} from "lucide-react";

import {
  getRolesDropdown,
  createPlayer,
  getPaginatedPlayers
} from "../lib/api/api";
import { RolePricing } from "../lib/api/types";
import { useTournamentStore } from "../store/tournamentStore";

export default function PlayerPoolPage() {
  const router = useRouter();
  const { tournament } = useTournamentStore();
  const tournamentId = tournament?._id || "";

  const [players, setPlayers] = useState<any[]>([]);
  const [roles, setRoles] = useState<RolePricing[]>([]);
  const [roleCounts, setRoleCounts] = useState<{ [key: string]: number }>({});
  const [totalPlayers, setTotalPlayers] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const rolesFetchedRef = useRef(false);

  const [page] = useState(1);
  const [limit] = useState(10);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    role: "",
    basePrice: 0,
    biddingPrice: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const calculateRoleCounts = (list: any[]) => {
    return list.reduce((acc, p) => {
      const role = p.role?.toLowerCase();
      if (role) acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const fetchPaginatedPlayers = async () => {
    try {
      const res = await getPaginatedPlayers(tournamentId, page, limit);
      const list = res.data.data || [];
      setPlayers(list);
      setTotalPlayers(res.data.pagination?.total || 0);
      setRoleCounts(calculateRoleCounts(list));
    } catch (err) {
      console.error("Failed to fetch paginated players:", err);
    }
  };

  useEffect(() => {
    if (!tournamentId) return;
    const init = async () => {
      try {
        setIsInitialLoading(true);
        if (!rolesFetchedRef.current) {
          const rolesRes = await getRolesDropdown(tournamentId);
          if (rolesRes.data?.roles) setRoles(rolesRes.data.roles);
          rolesFetchedRef.current = true;
        }
        await fetchPaginatedPlayers();
      } finally {
        setIsInitialLoading(false);
      }
    };
    init();
  }, [tournamentId]);

  const handleRoleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedRoleName = e.target.value;
    const roleData = roles.find((r) => r.role === selectedRoleName);
    setFormData((prev) => ({
      ...prev,
      role: selectedRoleName,
      basePrice: roleData ? roleData.basePrice : 0,
      biddingPrice: roleData ? roleData.biddingPrice : 0,
    }));
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAddPlayer = async (e: FormEvent) => {
    e.preventDefault();
    if (!tournamentId) return;
    if (!formData.fullName || !formData.phoneNumber || !formData.role) {
      alert("Please fill all fields.");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("phoneNumber", formData.phoneNumber);
      payload.append("role", formData.role);
      payload.append("basePrice", formData.basePrice.toString());
      payload.append("biddingPrice", formData.biddingPrice.toString());
      payload.append("tournamentId", tournamentId);
      if (selectedFile) payload.append("image", selectedFile);

      await createPlayer(payload);
      await fetchPaginatedPlayers();
      setFormData({ fullName: "", phoneNumber: "", role: "", basePrice: 0, biddingPrice: 0 });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      alert("Failed to save player.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalize = () => {
    router.push("/auction-room");
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen bg-[#020408] flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <main className="h-screen bg-[#020408] text-white flex flex-col overflow-hidden font-sans relative">
      
      {/* ATMOSPHERIC BROADCAST GLOWS */}
      <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER */}
      <header className="h-16 bg-white/[0.02] border-b border-white/5 flex items-center justify-between px-8 shrink-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-6">
          <div className="bg-amber-600/20 border border-amber-600/40 text-amber-500 px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-2xl">
            Player Pool
          </div>
          <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
            Cric<span className="text-amber-500">Auction</span> <span className="text-white/20 font-light ml-1 italic text-base">2026</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer">
              <Upload size={14} /> Bulk Upload (CSV)
            </button>
        </div>
      </header>

      <div className="flex flex-grow min-h-0 relative z-10">
        
        {/* LEFT 60%: PLAYER LIST */}
        <section className="flex-[0.6] overflow-y-auto p-10 custom-scroll border-r border-white/5 bg-white/[0.01]">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10 flex justify-between items-end border-b border-white/5 pb-6">
              <div>
                <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-1 leading-none">
                  Available <span className="text-amber-500">Talent</span>
                </h2>
                <div className="flex gap-6 mt-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 italic">
                  <p>Total: <span className="text-white ml-1">{totalPlayers}</span></p>
                  <p>Batsmen: <span className="text-amber-500 ml-1">{roleCounts.batsman || 0}</span></p>
                  <p>Bowlers: <span className="text-amber-500 ml-1">{roleCounts.bowlers || 0}</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {players.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[3rem] opacity-20">
                  <Users size={48} className="mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em]">Pool is empty</p>
                </div>
              ) : (
                players.map((player) => (
                  <div key={player._id} className="group flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-[2rem] p-4 hover:border-amber-500/30 transition-all duration-500 animate-in slide-in-from-left-4">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 overflow-hidden shrink-0 shadow-lg relative">
                        {player.image ? (
                          <img src={player.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/10"><Users size={24} /></div>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-black uppercase italic tracking-tight text-white group-hover:text-amber-400 transition-colors">{player.fullName}</p>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">
                          Contact: <span className="text-white/60 ml-1 italic">{player.phoneNumber}</span>
                        </p>
                      </div>
                    </div>
                    <button className="p-3 rounded-2xl bg-red-500/10 text-red-500 opacity-20 group-hover:opacity-100 transition-all cursor-pointer mr-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* RIGHT 40%: ADD PLAYER DESK */}
        <aside className="flex-[0.4] p-12 backdrop-blur-3xl overflow-y-auto custom-scroll flex flex-col justify-between">
          <form onSubmit={handleAddPlayer}>
            <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-12 italic flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                Add New Player
            </h3>

            <div className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-2 italic">Full Name</label>
                <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="e.g. Sunil Narine" className="w-full bg-white/[0.04] px-6 py-4 rounded-2xl border border-white/10 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all cursor-pointer shadow-inner" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-2 italic">Phone Number</label>
                  <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="9876543210" className="w-full bg-white/[0.04] px-6 py-4 rounded-2xl border border-white/10 text-sm font-bold text-white placeholder:text-white/10 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.08] transition-all cursor-pointer shadow-inner" />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-2 italic">Field Role</label>
                  <div className="relative">
                    <select value={formData.role} onChange={handleRoleChange} className="w-full appearance-none bg-white/[0.04] px-6 py-4 rounded-2xl border border-white/10 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 cursor-pointer">
                      <option value="" className="bg-[#0a0c10]">Select Role</option>
                      {roles.map((r) => <option key={r._id} value={r.role} className="bg-[#0a0c10]">{r.role}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3 ml-2 italic">Base Price (₹)</label>
                  <input readOnly value={formData.basePrice} className="w-full bg-white/[0.02] px-6 py-4 rounded-2xl border border-white/5 text-sm font-black text-white/40 cursor-not-allowed" />
                </div>
                <div className="group">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block mb-3 ml-2 italic">Increment (₹)</label>
                  <input readOnly value={formData.biddingPrice} className="w-full bg-white/[0.02] px-6 py-4 rounded-2xl border border-white/5 text-sm font-black text-white/40 cursor-not-allowed" />
                </div>
              </div>

              <div className="group">
                <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] block mb-3 ml-2 italic">Profile Image</label>
                <div className="relative w-full bg-white/[0.04] border border-white/10 border-dashed rounded-2xl p-4 flex items-center justify-center hover:bg-white/[0.08] transition-all cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                  <p className="text-[10px] font-bold text-white/40 uppercase truncate">
                    {selectedFile ? selectedFile.name : "Choose File or Drag Image"}
                  </p>
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] transition-all active:scale-95 flex items-center justify-center gap-3 cursor-pointer shadow-xl ${isSubmitting ? "bg-white/5 text-white/20" : "bg-white text-black hover:bg-amber-500"}`}>
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> Add Player to Pool</>}
              </button>
            </div>
          </form>

          {/* PAGE NAVIGATION PAIR */}
          <div className="pt-12 flex items-center gap-4">
            <button onClick={() => router.back()} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-all cursor-pointer active:scale-95">
              Go Back
            </button>
            <button onClick={handleFinalize} className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-400 text-white font-black uppercase text-[12px] tracking-[0.3em] shadow-2xl shadow-amber-900/40 hover:brightness-110 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2">
              Launch Auction 🔨
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