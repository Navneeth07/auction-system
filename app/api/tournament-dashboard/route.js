import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tournament from "@/models/Tournament";
import TournamentPlayer from "@/models/TournamentPlayer";
import Team from "@/models/Team";
import { verifyAuth } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();

    // AUTH CHECK
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId } = auth.user;

    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get("tournamentId");

    if (!tournamentId) {
      return NextResponse.json(
        { message: "tournamentId is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Get Tournament
    const tournament = await Tournament.findOne({
      _id: tournamentId,
      createdBy: userId,
    });

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Get All Sold Players
    const soldPlayers = await TournamentPlayer.find({
      tournamentId,
      createdBy: userId,
      status: "sold",
    })
      .populate("playerId", "fullName")
      .populate("soldTo", "name shortCode");

    // 3️⃣ Overall Stats

    const totalPlayersSold = soldPlayers.length;

    const totalSpendAmount = soldPlayers.reduce(
      (sum, p) => sum + (p.soldAmount || 0),
      0
    );

    // Highest Bid
    let highestBid = null;

    if (soldPlayers.length > 0) {
      const highest = soldPlayers.reduce((prev, current) =>
        prev.soldAmount > current.soldAmount ? prev : current
      );

      highestBid = {
        playerName: highest.playerId.fullName,
        soldAmount: highest.soldAmount,
        teamName: highest.soldTo?.name || null,
        teamShortCode: highest.soldTo?.shortCode || null,
      };
    }

    // 4️⃣ Team Wise Stats

    const teams = await Team.find({
      tournamentId,
      createdBy: userId,
    });

    const teamDashboard = [];

    for (const team of teams) {
      const teamPlayers = soldPlayers.filter(
        (p) => String(p.soldTo?._id) === String(team._id)
      );

      const totalSpent = teamPlayers.reduce(
        (sum, p) => sum + (p.soldAmount || 0),
        0
      );

      teamDashboard.push({
        teamId: team._id,
        teamName: team.name,
        shortCode: team.shortCode,

        maxPlayersAllowed: tournament.maxPlayers,

        playersBought: teamPlayers.length,

        playerCountDisplay: `${tournament.maxPlayers}/${teamPlayers.length}`,

        totalFundSpent: totalSpent,

        remainingPurse: team.remainingPurse,

        players: teamPlayers.map((p) => ({
          playerId: p.playerId._id,
          playerName: p.playerId.fullName,
          role: p.role,
          soldAmount: p.soldAmount,
        })),
      });
    }

    // 5️⃣ Final Response

    return NextResponse.json({
      tournament: {
        id: tournament._id,
        name: tournament.name,
        budget: tournament.budget,
        maxPlayers: tournament.maxPlayers,
      },

      overallStats: {
        totalPlayersSoldDisplay: `${tournament.maxPlayers}/${totalPlayersSold}`,
        totalPlayersSold,
        totalSpendAmount,
        highestBid,
      },

      teams: teamDashboard,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
