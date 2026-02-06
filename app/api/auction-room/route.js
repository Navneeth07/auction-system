import { NextResponse } from "next/server";
import mongoose from "mongoose";
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

    // 1️⃣ Get Tournament Details
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

    // 2️⃣ Get All Tournament Players
    const tournamentPlayers = await TournamentPlayer.find({
      tournamentId,
      createdBy: userId,
    }).populate("playerId");

    // 3️⃣ Build Role Wise Player Structure
    const roles = {};

    // Initialize roles from tournament config
    tournament.roles.forEach((r) => {
      roles[r.role] = {
        basePrice: r.basePrice,
        biddingPrice: r.biddingPrice,
        players: [],
      };
    });

    tournamentPlayers.forEach((tp) => {
      const player = tp.playerId;

      const playerData = {
        id: player._id,
        fullName: player.fullName,
        image: player.image,
        phoneNumber: player.phoneNumber,
        emailId: player.emailId,
        role: tp.role,
        basePrice: tp.basePrice,
        biddingPrice: tp.biddingPrice,
        status: tp.status,
      };

      if (!roles[tp.role]) {
        roles[tp.role] = {
          players: [],
        };
      }

      roles[tp.role].players.push(playerData);
    });

    // 4️⃣ Get Team List
    const teams = await Team.find({
      tournamentId,
      createdBy: userId,
    }).select("-createdBy -__v");

    // 5️⃣ Build Team Response with Purse
    const teamList = teams.map((team) => ({
      id: team._id,
      name: team.name,
      owner: team.owner,
      shortCode: team.shortCode,
      totalPurse: team.totalPurse,
      remainingPurse: team.remainingPurse,
    }));

    // 6️⃣ Determine First Active Player
    let activePlayer = null;

    for (let roleName of Object.keys(roles)) {
      const pending = roles[roleName].players.find(
        (p) => p.status === "registered"
      );

      if (pending) {
        activePlayer = pending;
        break;
      }
    }

    return NextResponse.json({
      tournament: {
        id: tournament._id,
        name: tournament.name,
        date: tournament.date,
        budget: tournament.budget,
        minPlayers: tournament.minPlayers,
        maxPlayers: tournament.maxPlayers,
      },

      roles,        // 🔥 MAIN: ROLE → PLAYERS
      teams: teamList, // 🔥 TEAM LIST WITH PURSE
      activePlayer, // 🔥 FIRST PLAYER TO AUCTION
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
