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
  const { data: listData, request: fetchTournaments, loading: listLoading } = useApi(getTournaments);
  const { setTournament } = useTournamentStore();
  const { roles, addRole, updateRole, removeRole, setRoles } = useRoleStore();

  const { request: fetchTournamentById, loading: fetchingTournament } = useApi(getTournamentById);

  // Fetch tournaments and restore selected tournament (if exists) or fallback to list
  useEffect(() => {
    const load = async () => {
      try {
        // Always fetch list for UI
        await fetchTournaments();

        const savedId = localStorage.getItem("selectedTournamentId");
        if (savedId) {
          try {
            const res = await fetchTournamentById(savedId);
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
              setSelectedId(t._id || null);
            }
          } catch (e) {
            // cleared invalid selection
            localStorage.removeItem("selectedTournamentId");
          }
        } else {
          // do not auto select when none saved
        }
      } catch (e) {
        // ignore
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);

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
        setSelectedId(t._id || null);
        localStorage.setItem("selectedTournamentId", t._id || "");
        toast.success("Tournament loaded into form");
      }
    } catch (e) {
      toast.error("Failed to load tournament");
    }
  };

  const [form, setForm] = useState({
    name: "",
    date: "",
    budget: "",
    minPlayers: "",
    maxPlayers: "",
    rules: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormValid =
    form.name &&
    form.date &&
    Number(form.budget) > 0 &&
    Number(form.minPlayers) > 0 &&
    Number(form.maxPlayers) > 0 &&
    form.rules &&
    roles.every((r) => r.role && r.basePrice > 0 && r.biddingPrice > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      date: form.date,
      budget: Number(form.budget),
      minPlayers: Number(form.minPlayers),
      maxPlayers: Number(form.maxPlayers),
      rules: form.rules,
      roles,
    };

    try {
      const res = await request(payload);
      setTournament(res.data);
      // persist selection immediately so user can continue to add teams
      if (res?.data?._id) {
        localStorage.setItem("selectedTournamentId", res.data._id);
        setSelectedId(res.data._id);
      }
      toast.success("Tournament created 🏏");
      router.push('/register-teams')
    } catch {
      toast.error(error || "Failed to create tournament");
    }
  };

  return (
    <main className="min-h-screen bg-[#070d19] text-white px-6 py-12">
      {loading && <Loading />}

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">
          Setup Your Tournament
        </h1>

        {listData && (listData as any).data && (listData as any).data.length > 0 && (
          <div className="max-w-7xl mx-auto mb-6">
            <h3 className="text-lg font-semibold">Tournaments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {(listData as any).data.map((t: any) => (
                <div
                  key={t._id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleSelectTournament(t._id);
                  }}
                  onClick={() => handleSelectTournament(t._id)}
                  className={`cursor-pointer bg-[#071022] p-3 rounded border truncate focus:outline-none transition-colors
                    ${selectedId === t._id ? "border-yellow-400 ring-2 ring-yellow-400" : "border-gray-700 hover:border-gray-500 hover:bg-[#0b1630]"}`}
                >
                  <p className="text-sm font-medium text-white">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tournament */}
          <section className="bg-[#0e1729] p-8 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-6">Tournament Details</h2>

            <Input
              label="Tournament Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Indian Premier League"
            />
            <Input
              label="Auction Date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              placeholder="select the date"
            />
            <Input
              label="Per Team Budget"
              name="budget"
              value={form.budget}
              onChange={handleChange}
              placeholder="₹50000"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Min Players"
                name="minPlayers"
                value={form.minPlayers}
                onChange={handleChange}
                placeholder="9"
              />
              <Input
                label="Max Players"
                name="maxPlayers"
                value={form.maxPlayers}
                onChange={handleChange}
                placeholder="10"
              />
            </div>
            <Textarea label="Rules" name="rules" value={form.rules} onChange={handleChange} />
          </section>

          {/* Roles */}
          <section className="bg-[#0e1729] p-8 rounded-xl border border-gray-700">
            <h2 className="text-xl font-semibold mb-6">Role Pricing</h2>

            {roles.map((r, i) => (
              <div key={i} className="grid grid-cols-4 gap-3 mb-4">
                <Input
                  label="Role"
                  value={r.role}
                  onChange={(e) => updateRole(i, { role: e.target.value })}
                />
                <Input
                  label="Base Price"
                  value={r.basePrice}
                  onChange={(e) =>
                    updateRole(i, { basePrice: Number(e.target.value) })
                  }
                  placeholder="₹2000"
                />
                <Input
                  label="Bid Price"
                  value={r.biddingPrice}
                  onChange={(e) =>
                    updateRole(i, { biddingPrice: Number(e.target.value) })
                  }
                  placeholder="₹500"
                />
                <button
                  type="button"
                  onClick={() => removeRole(i)}
                  className="mt-6 text-red-400 hover:text-red-500"
                >
                  🗑 Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addRole}
              className="w-full border border-dashed border-yellow-500 text-yellow-400 py-2 rounded"
            >
              + Add Another Role
            </button>
          </section>
        </div>

        <div className="flex justify-between mt-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-600 px-6 py-2 rounded"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="bg-yellow-500 px-6 py-2 rounded font-semibold disabled:opacity-40"
          >
            Next: Add Teams
          </button>
        </div>
      </form>
    </main>
  );
}

/* ---------------- UI helpers ---------------- */

function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string },
) {
  const { label, ...rest } = props;
  return (
    <div className="mb-4">
      <label className="text-sm text-gray-400">{label}</label>
      <input
        {...rest}
        className="w-full mt-1 bg-[#111b2e] px-4 py-2 rounded border border-gray-600"
      />
    </div>
  );
}

function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string },
) {
  const { label, ...rest } = props;
  return (
    <div className="mb-4">
      <label className="text-sm text-gray-400">{label}</label>
      <textarea
        {...rest}
        className="w-full mt-1 bg-[#111b2e] px-4 py-2 rounded border border-gray-600"
      />
    </div>
  );
}
