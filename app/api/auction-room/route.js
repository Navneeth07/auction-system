import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tournament from "@/models/Tournament";
import TournamentPlayer from "@/models/TournamentPlayer";
import Team from "@/models/Team";
import { verifyAuth } from "@/lib/auth";
import BidHistory from "@/models/BidHistory";
import "@/models/Player";
import mongoose from "mongoose";


export async function POST(req) {
  try {
    await connectDB();

    const session = await mongoose.startSession();
    session.startTransaction();

    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId } = auth.user;

    // 🔥 Now we only need tournamentPlayerId and teamId
    const { tournamentPlayerId, teamId } = await req.json();

    const player = await TournamentPlayer.findOne({
      _id: tournamentPlayerId,
      createdBy: userId,
    }).session(session);

    if (!player) {
      throw new Error("Player not found");
    }

    if (player.status === "sold") {
      throw new Error("This player is already sold. Bidding is not allowed.");
    }

    const team = await Team.findOne({
      _id: teamId,
      createdBy: userId,
    }).session(session);

    if (!team) {
      throw new Error("Team not found");
    }

    // 🔥 FIXED BID INCREMENT LOGIC
    const increment = player.biddingPrice;

    if (team.remainingPurse < increment) {
      throw new Error("Team does not have enough purse for this bid");
    }

    // 🔥 New price after bid
    const newPrice = player.basePrice + increment;

    // Update player's current price
    await TournamentPlayer.updateOne(
      { _id: tournamentPlayerId },
      { $set: { basePrice: newPrice } },
      { session }
    );

    // Deduct from team purse
    await Team.updateOne(
      { _id: teamId },
      { $inc: { remainingPurse: -increment } },
      { session }
    );

    // Save bid history
    const history = await BidHistory.create(
      [
        {
          tournamentId: player.tournamentId,
          tournamentPlayerId,
          teamId,
          bidAmount: newPrice,
          createdBy: userId,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // 🔥 SEND USEFUL RESPONSE DATA
    return NextResponse.json({
      message: "Bid placed successfully",

      data: {
        tournamentPlayerId,
        teamId,
        previousPrice: player.basePrice,
        increment,
        currentPrice: newPrice,
        remainingPurse: team.remainingPurse - increment,
        bidHistoryId: history[0]._id,
      },
    });
  } catch (error) {
    console.log("Error>>", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}



export async function GET(req) {
  console.log("I am here");
  try {
    await connectDB();

    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId } = auth.user;

    const { searchParams } = new URL(req.url);

    const tournamentId = searchParams.get("tournamentId");

    // 🔥 NEW FILTERS
    const selectedRole = searchParams.get("role");
    const tournamentPlayerId = searchParams.get("tournamentPlayerId");

    if (!tournamentId) {
      return NextResponse.json(
        { message: "tournamentId is required" },
        { status: 400 },
      );
    }

    // 1️⃣ Tournament Details
    const tournament = await Tournament.findOne({
      _id: tournamentId,
      createdBy: userId,
    });

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 },
      );
    }

    // 2️⃣ Fetch Players
    const tournamentPlayers = await TournamentPlayer.find({
      tournamentId,
      createdBy: userId,
    }).populate("playerId");

    // 3️⃣ Build Roles Structure
    const roles = {};

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
        tournamentPlayerId: tp._id,
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

    // 🔥 ROLE FILTER LOGIC

    let filteredRoles = roles;

    if (selectedRole) {
      filteredRoles = {};

      if (roles[selectedRole]) {
        filteredRoles[selectedRole] = roles[selectedRole];
      }
    }

    // 4️⃣ Team List
    const teams = await Team.find({
      tournamentId,
      createdBy: userId,
    }).select("-createdBy -__v");

    const teamList = teams.map((team) => ({
      id: team._id,
      name: team.name,
      owner: team.owner,
      shortCode: team.shortCode,
      totalPurse: team.totalPurse,
      remainingPurse: team.remainingPurse,
    }));

    // 5️⃣ Active Player Logic
    let activePlayer = null;

    const roleKeys = selectedRole ? [selectedRole] : Object.keys(filteredRoles);

    for (let roleName of roleKeys) {
      const pending = filteredRoles[roleName]?.players.find(
        (p) => p.status === "registered",
      );

      if (pending) {
        activePlayer = pending;
        break;
      }
    }

    // 6️⃣ Bidding History
    let biddingHistory = [];

    const historyPlayerId = tournamentPlayerId || activePlayer?.id;

    if (historyPlayerId) {
      biddingHistory = await BidHistory.find({
        tournamentId,
        tournamentPlayerId: historyPlayerId,
        createdBy: userId,
      })
        .populate("teamId", "name shortCode")
        .sort({ createdAt: -1 });
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

      roles: filteredRoles, // 🔥 NOW FILTERED
      teams: teamList,
      activePlayer,
      biddingHistory,
    });
  } catch (error) {
    console.log("error>>", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
