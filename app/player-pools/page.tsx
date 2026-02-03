"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useTournamentStore } from "../store/tournamentStore";
import { RolePricing, Player } from "../lib/api/types";
import { getRolesDropdown, getPlayers, createPlayer } from "../lib/api/api";
import { useApi } from "../hooks/useApi";
import Loading from "../components/Loading";

export default function PlayerPoolPage() {
  const router = useRouter();
  const { tournament } = useTournamentStore();

  // State
  const [rolePricing, setRolePricing] = useState<RolePricing[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [form, setForm] = useState({
    name: "",
    role: "",
    basePrice: "",
    biddingPrice: "",
  });

  // API Hooks
  const { request: addPlayerReq, loading: creatingPlayer } = useApi(createPlayer);

  const [loading, setLoading] = useState<boolean>(true);

  // Load roles and players when tournament changes
  useEffect(() => {
    if (!tournament?._id) return;

    setLoading(true);
    Promise.allSettled([
      getRolesDropdown(tournament._id),
      getPlayers(tournament._id),
    ])
      .then(([rolesRes, playersRes]) => {
        if (rolesRes.status === "fulfilled") setRolePricing(rolesRes.value.data.roles || []);
        if (playersRes.status === "fulfilled") setPlayers(playersRes.value.data.data || []);
      })
      .catch((e) => console.warn("Failed to load initial data", e))
      .finally(() => setLoading(false));
  }, [tournament?._id]);

  // Validation
  const isFormValid =
    form.name.trim() &&
    form.role &&
    Number(form.basePrice) > 0 &&
    Number(form.biddingPrice) > 0;

  // Handlers
  const handleRoleChange = (role: string) => {
    const pricing = rolePricing.find((r) => r.role === role);
    setForm({
      ...form,
      role,
      basePrice: pricing ? String(pricing.basePrice) : "",
      biddingPrice: pricing ? String(pricing.biddingPrice) : "",
    });
  };

  const addPlayer = async () => {
    if (!isFormValid || !tournament?._id) {
      toast.error("Please fill all fields");
      return;
    }

    const payload = {
      name: form.name,
      role: form.role,
      basePrice: Number(form.basePrice),
      biddingPrice: Number(form.biddingPrice),
      tournamentId: tournament._id,
    };

    try {
      const player = await addPlayerReq(payload);
      if (player) {
        setPlayers((prev) => [...prev, player as Player]);
      } else {
        // Fallback: create client-side
        const newPlayer = { id: crypto.randomUUID(), ...payload };
        setPlayers((prev) => [...prev, newPlayer]);
      }
      setForm({ name: "", role: "", basePrice: "", biddingPrice: "" });
      toast.success("Player added");
    } catch (e) {
      console.warn("Failed to add player", e);
      toast.error("Failed to add player");
    }
  };

  const removePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    toast.success("Player removed");
  };

  // Dynamic stats from loaded roles
  const roleCount = (role: string) =>
    players.filter((p) => p.role === role).length;

  // Launch state
  const [launching, setLaunching] = useState(false);

  const finalizeAndLaunch = async () => {
    if (!tournament?._id) {
      toast.error("Tournament missing");
      return;
    }
    if (players.length === 0) {
      toast.error("Add at least one player before launching the auction");
      return;
    }

    try {
      setLaunching(true);
      // Optionally: call backend to mark tournament as 'started' here
      toast.success("Launching auction...");
      router.push(`/auction-room`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to launch auction");
    } finally {
      setLaunching(false);
    }
  };

  // UI Render
  if (!tournament?._id) {
    return (
      <main className="min-h-screen bg-[#070d19] text-white px-6 py-10 flex items-center justify-center">
        <p className="text-gray-400">Tournament not selected. Please go back.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#070d19] flex items-center justify-center">
        <Loading />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#070d19] text-white px-6 py-10">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold">Player Pool</h1>
        <p className="text-gray-400">
          Manage the players available for auction ({rolePricing.length} roles)
        </p>
      </div>

      {/* STATS - Dynamic from loaded roles */}
      <div className="max-w-7xl mx-auto bg-[#0e1729] border border-gray-700 rounded-lg p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <Stat label="Total Players" value={players.length} />
        {rolePricing.map((role) => (
          <Stat key={role.role} label={role.role} value={roleCount(role.role)} />
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PLAYER LIST */}
        <section className="lg:col-span-2 bg-[#0e1729] border border-gray-700 rounded-xl p-6 max-h-96 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Players</h2>

          {players.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No players added yet. Add players using the form.
            </p>
          ) : (
            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex justify-between items-center bg-[#111b2e] p-4 rounded-lg hover:bg-[#151f32] transition"
                >
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-gray-400">
                      <span className="text-yellow-400">{player.role}</span> · Base
                      ₹{formatNumber(player.basePrice)}
                    </p>
                  </div>

                  <button
                    onClick={() => removePlayer(player.id)}
                    className="text-red-400 hover:text-red-500 transition text-lg"
                    title="Remove player"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ADD PLAYER FORM */}
        <section className="bg-[#0e1729] border border-gray-700 rounded-xl p-6 sticky top-10">
          <h2 className="text-lg font-semibold mb-4">Add Player</h2>

          <div className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter player name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <div>
              <label className="text-sm text-gray-400 block mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="w-full bg-[#111b2e] border border-gray-600 px-3 py-2 rounded text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition"
              >
                <option value="">Select role</option>
                {rolePricing.map((r) => (
                  <option key={r.role} value={r.role}>
                    {r.role} (₹{formatNumber(r.basePrice)} - ₹{formatNumber(r.biddingPrice)})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Base Price (₹)"
              type="number"
              placeholder="Auto-populated"
              readOnly
              value={form.basePrice}
            />

            <Input
              label="Bidding Increment (₹)"
              type="number"
              placeholder="Auto-populated"
              readOnly
              value={form.biddingPrice}
            />

            <button
              disabled={!isFormValid || creatingPlayer}
              onClick={addPlayer}
              className={`w-full py-2 rounded font-semibold transition ${
                !isFormValid || creatingPlayer
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-400 text-black"
              }`}
            >
              {creatingPlayer ? "Adding..." : "+ Add Player"}
            </button>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <div className="max-w-7xl mx-auto flex justify-between mt-10">
        <button
          onClick={() => router.back()}
          className="px-5 py-2 rounded bg-gray-600 hover:bg-gray-500 transition font-semibold"
        >
          ← Back
        </button>

        <button
          disabled={players.length === 0 || launching}
          onClick={finalizeAndLaunch}
          className={`px-6 py-2 rounded font-semibold transition ${
            players.length === 0 || launching
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {launching ? "Launching..." : "Finalize & Launch Auction"}
        </button>
      </div>
    </main>
  );
}

// Components
function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }
) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="text-sm text-gray-400 block mb-1">{label}</label>
      <input
        {...rest}
        className="w-full bg-[#111b2e] border border-gray-600 px-3 py-2 rounded text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-semibold text-lg">{value}</p>
    </div>
  );
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
