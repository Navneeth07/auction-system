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
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    const session = await mongoose.startSession();
    
    try {
      await connectDB();
      session.startTransaction();

      const auth = verifyAuth(req);
      if (auth.error) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json({ message: auth.error }, { status: 401 });
      }

      const { userId } = auth.user;

      // 🔥 Now we only need tournamentPlayerId and teamId
      const { tournamentPlayerId, teamId } = await req.json();

      // Find player with session for transaction
      const player = await TournamentPlayer.findOne({
        _id: tournamentPlayerId,
        createdBy: userId,
        status: { $ne: "sold" }, // Ensure player is not sold
      }).session(session);

      if (!player) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: "Player not found or already sold" },
          { status: 404 }
        );
      }

      const team = await Team.findOne({
        _id: teamId,
        createdBy: userId,
      }).session(session);

      if (!team) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: "Team not found" },
          { status: 404 }
        );
      }

      // 🔥 FIXED BID INCREMENT LOGIC
      const increment = player.biddingPrice;

      // 🔥 New price after bid (Base Price + all increments)
      const newPrice = player.basePrice + increment;

      // Check if team has enough purse for the FULL new price (not just increment)
      if (team.remainingPurse < newPrice) {
        await session.abortTransaction();
        session.endSession();
        return NextResponse.json(
          { message: "Team does not have enough purse for this bid" },
          { status: 400 }
        );
      }

      // Update player's current price using findOneAndUpdate for atomic operation
      const updatedPlayer = await TournamentPlayer.findOneAndUpdate(
        { _id: tournamentPlayerId },
        { $set: { basePrice: newPrice } },
        { 
          session,
          new: true // Return updated document
        }
      );

      if (!updatedPlayer) {
        throw new Error("Failed to update player price");
      }

      // 🔥 Deduct FULL new price from team purse (Base Price + all increments)
      const updatedTeam = await Team.findOneAndUpdate(
        { _id: teamId },
        { $inc: { remainingPurse: -newPrice } },
        { 
          session,
          new: true
        }
      );

      if (!updatedTeam) {
        throw new Error("Failed to update team purse");
      }

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
      session.endSession();

      // 🔥 SEND USEFUL RESPONSE DATA
      return NextResponse.json({
        message: "Bid placed successfully",
        data: {
          tournamentPlayerId,
          teamId,
          previousPrice: player.basePrice,
          increment,
          currentPrice: newPrice,
          remainingPurse: updatedTeam.remainingPurse,
          bidHistoryId: history[0]._id,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      // Check if it's a write conflict error
      const isWriteConflict = error.message?.includes("Write conflict") || 
                              error.message?.includes("writeConflict") ||
                              error.code === 112;

      if (isWriteConflict && retryCount < maxRetries - 1) {
        retryCount++;
        // Exponential backoff: wait 50ms, 100ms, 200ms
        await new Promise(resolve => setTimeout(resolve, 50 * Math.pow(2, retryCount - 1)));
        continue; // Retry the transaction
      }

      console.log("Error>>", error);
      return NextResponse.json(
        { 
          message: error.message || "Failed to place bid. Please try again.",
          retryable: isWriteConflict && retryCount < maxRetries
        },
        { status: 500 }
      );
    }
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
    }).populate("playerId").populate("soldTo", "name shortCode");;

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
        soldTo: tp.status === "sold" && tp.soldTo
          ? {
            id: tp.soldTo._id,
            name: tp.soldTo.name,
            shortCode: tp.soldTo.shortCode,
          }
          : null,

        soldAmount: tp.status === "sold" ? tp.soldAmount : null,
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

    const historyPlayerId = tournamentPlayerId || activePlayer?.tournamentPlayerId;

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
