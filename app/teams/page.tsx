"use client";

import { useState } from "react";

interface Team {
  id: string;
  name: string;
  owner: string;
  shortCode: string;
}

export default function AddTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [shortCode, setShortCode] = useState("");

  const handleAddTeam = () => {
    if (!teamName || !ownerName || !shortCode) return;

    const newTeam: Team = {
      id: crypto.randomUUID(),
      name: teamName,
      owner: ownerName,
      shortCode: shortCode.toUpperCase(),
    };

    setTeams([...teams, newTeam]);

    setTeamName("");
    setOwnerName("");
    setShortCode("");
  };

  const deleteTeam = (id: string) => {
    setTeams(teams.filter((team) => team.id !== id));
  };

  const nextPage = () => {
    // TODO: API call before navigation
    // await axios.post("/api/teams", teams);
    window.location.href = "/players"; // next page
  };

  return (
    <div className="min-h-screen bg-[#060B24] text-white">
      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center">
          Register Teams
        </h1>
        <p className="text-gray-400 text-center mt-2">
          Add the franchises participating in the auction
        </p>

        <div className="mt-12 grid md:grid-cols-2 gap-10">
          {/* Left: Added Teams */}
          <div>
            <h2 className="font-semibold text-lg mb-4">
              Participating Teams ({teams.length})
            </h2>

            <div className="flex flex-col gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="bg-[#0F1A3A] border border-gray-700 p-4 rounded-lg flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-600 text-white text-lg font-bold rounded-full flex items-center justify-center">
                      {team.shortCode}
                    </div>
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-gray-400 text-sm">
                        Owner: {team.owner}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTeam(team.id)}
                    className="text-gray-400 hover:text-red-400 transition"
                  >
                    🗑
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0F1A3A] p-6 border border-gray-700 rounded-xl">
            <h2 className="font-semibold text-lg mb-6 flex items-center gap-2">
              🛡 Add New Team
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-gray-300 mb-1">Team Name</p>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full bg-[#0B132B] border border-gray-600 rounded-md px-4 py-2 text-white"
                  placeholder="e.g., Super Kings"
                />
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-1">Owner Name</p>
                <input
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-[#0B132B] border border-gray-600 rounded-md px-4 py-2 text-white"
                  placeholder="Corporate Inc."
                />
              </div>

              <div>
                <p className="text-sm text-gray-300 mb-1">
                  Short Code (3 chars)
                </p>
                <input
                  value={shortCode}
                  maxLength={3}
                  onChange={(e) => setShortCode(e.target.value)}
                  className="w-full bg-[#0B132B] border border-gray-600 rounded-md px-4 py-2 text-white uppercase"
                  placeholder="CSK"
                />
              </div>

              <button
                onClick={handleAddTeam}
                className="mt-2 bg-gray-600 hover:bg-gray-500 py-2 rounded-md font-semibold"
              >
                ➕ Add Team
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-between">
          <button className="px-4 py-2 bg-gray-500 hover:bg-gray-400 rounded-md">
            Back
          </button>

          <button
            onClick={nextPage}
            disabled={teams.length === 0}
            className="px-6 py-2 bg-yellow-400 text-black rounded-md font-semibold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next: Add Players
          </button>
        </div>
      </main>
    </div>
  );
}
