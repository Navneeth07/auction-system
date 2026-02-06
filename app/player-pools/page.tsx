"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Upload,
  Users,
  Plus,
  ChevronDown,
  X,
  Loader2,
  CheckCircle2
} from "lucide-react";

// API, Types, and Store
import { getRolesDropdown, getPlayers, createPlayer } from "../lib/api/api";
import { RolePricing } from "../lib/api/types";
import { useTournamentStore } from "../store/tournamentStore";

export default function PlayerPoolPage() {
  const router = useRouter();
  const { tournament } = useTournamentStore();
  const tournamentId = tournament?._id || "";

  // --- State ---
  const [players, setPlayers] = useState<any[]>([]);
  const [roles, setRoles] = useState<RolePricing[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    role: "",
    basePrice: 0,
    biddingPrice: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const initPage = async () => {
      if (!tournamentId) {
        setIsInitialLoading(false);
        return;
      }
      try {
        setIsInitialLoading(true);
        const [rolesRes, playersRes] = await Promise.allSettled([
          getRolesDropdown(tournamentId),
          getPlayers(tournamentId)
        ]);

        if (rolesRes.status === "fulfilled" && rolesRes.value.data?.roles) {
          setRoles(rolesRes.value.data.roles);
        }

        if (playersRes.status === "fulfilled") {
          const fetchedPlayers = playersRes.value.data?.data?.data || [];
          setPlayers(fetchedPlayers);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    initPage();
  }, [tournamentId]);

  // --- Handlers ---

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
    if (!formData.fullName || !formData.phoneNumber || !formData.role || !tournamentId) {
      alert("Please fill all fields.");
      return;
    }

    // Prepare local object for immediate UI update
    const newLocalPlayer = {
      _id: Date.now().toString(),
      fullName: formData.fullName,
      role: formData.role,
      basePrice: formData.basePrice,
      image: previewUrl,
    };

    try {
      setIsSubmitting(true);

      // Update UI state immediately (Optimistic update)
      setPlayers((prev) => [newLocalPlayer, ...prev]);

      const payload = new FormData();
      payload.append("fullName", formData.fullName);
      payload.append("phoneNumber", formData.phoneNumber);
      payload.append("role", formData.role);
      payload.append("basePrice", formData.basePrice.toString());
      payload.append("biddingPrice", formData.biddingPrice.toString());
      payload.append("tournamentId", tournamentId);

      if (selectedFile) {
        payload.append("image", selectedFile);
      }

      const response = await createPlayer(payload);

      // Replace temporary local player with the actual response from DB
      if (response.data?.data) {
        setPlayers((prev) =>
          prev.map(p => p._id === newLocalPlayer._id ? response.data.data : p)
        );
      }

      // Reset form
      setFormData({ fullName: "", phoneNumber: "", role: "", basePrice: 0, biddingPrice: 0 });
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error("Submission error:", err);
      // Rollback on failure
      setPlayers((prev) => prev.filter(p => p._id !== newLocalPlayer._id));
      alert("Failed to save player.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Navigation Handler ---
  const handleFinalize = () => {
    // Just redirect to the auction room page
    router.push("/auction-room");
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen bg-[#050810] flex items-center justify-center text-white">
        <Loader2 className="w-10 h-10 animate-spin text-yellow-500" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-[#050810] text-white font-sans flex flex-col">
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-12">
        <div className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">Player Pool</h1>
            <p className="text-gray-400 text-sm">Manage the players available for auction</p>
          </div>
          <button className="flex items-center gap-2 bg-[#1a202c] border border-gray-700 hover:bg-gray-800 px-4 py-2 rounded-lg text-sm text-gray-200">
            <Upload size={16} /> Bulk Upload (CSV)
          </button>
        </div>

        <div className="flex gap-12 text-sm border-b border-gray-800 pb-6 mb-8 text-gray-400 font-medium">
          <p>Total Players: <span className="text-white font-bold ml-1">{players.length}</span></p>
          <p>Batsmen: <span className="text-white font-bold ml-1">{players.filter(p => p.role === 'Batsman').length}</span></p>
          <p>Bowlers: <span className="text-white font-bold ml-1">{players.filter(p => p.role === 'Bowler').length}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* LEFT SIDE: Added Players List */}
          <div className="lg:col-span-7 space-y-4">
            {players.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-[#0d111c] border border-dashed border-gray-800 rounded-2xl text-gray-600">
                <Users size={40} className="mb-3 opacity-20" />
                <p className="text-sm">No players added to the pool yet.</p>
              </div>
            ) : (
              players.map((player) => (
                <div
                  key={player._id}
                  className="flex items-center justify-between bg-[#0d111c] border border-gray-800/60 p-5 rounded-2xl group hover:border-blue-500/40 transition-all duration-300"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-full bg-[#161b2c] border border-gray-700 overflow-hidden flex items-center justify-center shrink-0">
                      {player.image ? (
                        <img src={player.image} alt={player.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <Users size={24} className="text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-blue-400 transition-colors">
                        {player.fullName}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded uppercase font-bold tracking-wider border border-blue-500/20">
                          {player.role}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          Base: <span className="text-gray-300 font-bold ml-0.5">₹{player.basePrice?.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* RIGHT SIDE: Add Player Form */}
          <aside className="lg:col-span-5">
            <form onSubmit={handleAddPlayer} className="bg-[#0d111c] border border-gray-800/60 rounded-3xl p-8 sticky top-8">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3 text-white">
                <Plus size={20} className="text-yellow-500" /> Add Player
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                  <input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Player Name" className="w-full bg-[#161b2c] border border-gray-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition text-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="e.g. 9876543210" className="w-full bg-[#161b2c] border border-gray-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition text-white" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Role</label>
                  <div className="relative">
                    <select value={formData.role} onChange={handleRoleChange} className="w-full appearance-none bg-[#161b2c] border border-gray-700/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition text-gray-300">
                      <option value="">Select Role</option>
                      {roles.map((r) => <option key={r._id} value={r.role}>{r.role}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Base Price (₹)</label>
                    <input readOnly value={formData.basePrice} className="w-full bg-[#050810] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Bidding Price (₹)</label>
                    <input readOnly value={formData.biddingPrice} className="w-full bg-[#050810] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Image</label>
                  <div className="relative border border-dashed border-gray-700 rounded-xl p-4 bg-[#161b2c]/30 hover:bg-[#161b2c] transition cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="bg-gray-800 px-3 py-1.5 rounded text-gray-300">Choose file</span>
                      <span className="truncate">{selectedFile ? selectedFile.name : "No file chosen"}</span>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg mt-4">
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Plus size={18} /> Add Player</>}
                </button>
              </div>
            </form>
          </aside>
        </div>

        <div className="flex justify-between items-center mt-20 border-t border-gray-800/50 pt-8 mb-12">
          <button onClick={() => router.back()} className="px-10 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition">Back</button>
          <button
            onClick={handleFinalize}
            className="px-10 py-2.5 bg-[#00a65a] hover:bg-[#008e4d] text-white font-bold rounded-lg transition shadow-lg flex items-center gap-2"
          >
            Finalize & Launch Auction <CheckCircle2 size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}