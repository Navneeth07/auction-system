"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";


export default function SetupTournamentPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    date: "",
    budget: "",
    minPlayers: "",
    maxPlayers: "",
    rules: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <main className="min-h-screen bg-[#070d19] text-white py-16 px-6 flex justify-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-center text-3xl font-bold">Setup Your Tournament</h1>
        <p className="text-center text-gray-400 mt-1 mb-10">
          Define the rules and budget for your auction
        </p>

        <div className="bg-[#0e1729] border border-gray-700 rounded-xl p-8 shadow-lg">
          <h2 className="text-lg font-semibold mb-6">Tournament Details</h2>

          <div className="space-y-5">
            <div>
              <label className="text-sm text-gray-400">Tournament Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Premier League 2025"
                className="w-full mt-1 bg-[#111b2e] border border-gray-600 px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-400">Auction Date</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full mt-1 bg-[#111b2e] border border-gray-600 px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Team Budget (Purse)</label>
                <input
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  placeholder="₹ 10000000"
                  className="w-full mt-1 bg-[#111b2e] border border-gray-600 px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-gray-400">Min Players per Team</label>
                <input
                  name="minPlayers"
                  value={form.minPlayers}
                  onChange={handleChange}
                  placeholder="11"
                  className="w-full mt-1 bg-[#111b2e] border border-gray-600 px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400">Max Players per Team</label>
                <input
                  name="maxPlayers"
                  value={form.maxPlayers}
                  onChange={handleChange}
                  placeholder="25"
                  className="w-full mt-1 bg-[#111b2e] border border-gray-600 px-4 py-3 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-400">Description / Rules</label>
              <textarea
                name="rules"
                value={form.rules}
                onChange={handleChange}
                placeholder="Any specific rules for the auction..."
                rows={4}
                className="w-full mt-1 bg-[#111b2e] border border-gray-600 px-4 py-3 rounded resize-none focus:outline-none focus:ring-1 focus:ring-yellow-500"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 rounded bg-gray-600 hover:bg-gray-500 transition"
            >
              Back
            </button>

            <button
              onClick={() => router.push("/teams")}
              className="px-6 py-2 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-400 transition"
            >
              Next: Add Teams
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
