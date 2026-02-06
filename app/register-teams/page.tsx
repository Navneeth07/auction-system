"use client";

import { useState, useEffect, useRef } from "react";
import { Team } from "../lib/api/types";
import { useRouter } from "next/navigation";
import { useApi } from "../hooks/useApi";
import { registerteams, getTeams } from "../lib/api/api";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import { useTournamentStore } from "../store/tournamentStore";

export default function RegisterTeamsPage() {
  const router = useRouter();
  const { request, loading, error } = useApi(registerteams);
  const { tournament } = useTournamentStore();
  const [teams, setTeams] = useState<Team[]>([]);


  const [form, setForm] = useState<Team>({
    name: "",
    owner: "",
    shortCode: "",
  });

  const { request: fetchTeamsRequest, loading: fetchingTeams } = useApi(getTeams);

  const teamsFetchedRef = useRef(false); // 🟢 ADDED (prevents loop)


  useEffect(() => {
    if (!tournament) {
      toast.error("No tournament found. Please create a tournament first.");
      router.push("/setup-tournament");
      return;
    }

    if (teamsFetchedRef.current) return; // 🔴 CHANGED (guard)

    teamsFetchedRef.current = true; // 🔴 CHANGED

    fetchTeamsRequest(tournament._id)
      .then((res) => setTeams(res?.data ? res.data : []))
      .catch((e) => console.warn("Failed to load teams", e));
  }, [tournament, router]);


  const handleAddTeam = async () => {
    if (!form.name || !form.owner || !form.shortCode) return;
    if (!tournament?._id) {
      toast.error("Tournament id missing. Go back and create a tournament.");
      router.push("/setup-tournament");
      return;
    }

    const { name, owner, shortCode } = form;
    try {
      const res = await request({ name, owner, shortCode, tournamentId: tournament._id });
      setTeams((prev) => [...prev, res?.data]);
      setForm({ name: "", owner: "", shortCode: "" });
    } catch (err) {
      console.log(err);
      toast.error(error);
    }
  };

  const handleDelete = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index));
  };

  return (
    <form>
      {loading && <Loading />}
      <div className="min-h-screen bg-linear-to-b from-[#050814] to-[#02030a] text-white px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-semibold text-center">Register Teams</h1>
          <p className="text-center text-gray-400 mt-2">
            Add the franchises participating in the auction
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <div>
              <h3 className="text-lg font-medium mb-4">
                Participating Teams ({teams.length})
              </h3>

              <div className="space-y-4">
                {teams.map((team, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-[#0b1020] border border-[#1f2937] rounded-xl px-5 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                        {team.shortCode}
                      </div>
                      <div>
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-gray-400">
                          Owner: {team.owner}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(index)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0b1020] border border-[#1f2937] rounded-xl p-6">
              <h3 className="font-medium mb-5 flex items-center gap-2">
                🛡 Add New Team
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">Team Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full bg-[#020617] border border-[#1f2937] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Super Kings"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400">Owner Name</label>
                  <input
                    value={form.owner}
                    onChange={(e) =>
                      setForm({ ...form, owner: e.target.value })
                    }
                    className="mt-1 w-full bg-[#020617] border border-[#1f2937] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Corporate Inc."
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400">
                    Short Code (3 chars)
                  </label>
                  <input
                    value={form.shortCode}
                    maxLength={3}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        shortCode: e.target.value.toUpperCase(),
                      })
                    }
                    className="mt-1 w-full bg-[#020617] border border-[#1f2937] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="CSK"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddTeam}
                  disabled={!form.name || !form.owner || !form.shortCode}
                  className={`w-full mt-2 py-2 rounded-lg transition flex items-center justify-center gap-2
                    ${!form.name || !form.owner || !form.shortCode
                      ? "bg-gray-600 cursor-not-allowed opacity-60"
                      : "bg-gray-700 hover:bg-gray-600"
                    }`}
                >
                  Add Team
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-12">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg bg-gray-200 text-black"
            >
              Back
            </button>

            <button
              type="button"
              onClick={() => {
                if (teams.length === 0) {
                  toast.error("Please add at least one team before proceeding.");
                  return;
                }
                router.push("/player-pools");
              }}
              disabled={teams.length === 0}
              className={`px-6 py-2 rounded-lg font-medium ${teams.length === 0
                  ? "bg-gray-600 text-black cursor-not-allowed"
                  : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
            >
              Next: Add Players
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
