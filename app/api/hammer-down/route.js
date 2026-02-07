import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TournamentPlayer from "@/models/TournamentPlayer";
import BidHistory from "@/models/BidHistory";
import { verifyAuth } from "@/lib/auth";


export async function POST(req) {
  const session = await mongoose.startSession();

  try {
    await connectDB();
    session.startTransaction();

    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId } = auth.user;

    const { tournamentPlayerId, teamId } = await req.json();

    const player = await TournamentPlayer.findOne({
      _id: tournamentPlayerId,
      createdBy: userId,
    }).session(session);

    if (!player) {
      throw new Error("Player not found");
    }

    if (player.status === "sold") {
      throw new Error("Player already finalized as sold");
    }

    // Get last bid history (to know who won)
    const lastBid = await BidHistory.findOne({
      tournamentPlayerId,
      createdBy: userId,
    })
      .sort({ createdAt: -1 })
      .session(session);

    // CASE 1: No bids but teamId provided → sell at base price to selected team
    if (!lastBid && teamId) {
      // Import Team model
      const Team = (await import("@/models/Team")).default;
      
      const team = await Team.findOne({
        _id: teamId,
        createdBy: userId,
      }).session(session);

      if (!team) {
        throw new Error("Team not found");
      }

      // Check if team has enough purse for base price
      if (team.remainingPurse < player.basePrice) {
        throw new Error("Team does not have enough purse for base price");
      }

      // Create a bid history entry at base price
      const basePriceBid = await BidHistory.create(
        [
          {
            tournamentId: player.tournamentId,
            tournamentPlayerId,
            teamId: teamId,
            bidAmount: player.basePrice,
            createdBy: userId,
          },
        ],
        { session }
      );

      // Deduct base price from team purse
      team.remainingPurse -= player.basePrice;
      await team.save({ session });

      // Mark player as sold
      player.status = "sold";
      player.soldTo = teamId;
      player.soldAmount = player.basePrice;
      await player.save({ session });

      await session.commitTransaction();

      return NextResponse.json({
        message: "Player sold successfully at base price",
        data: {
          tournamentPlayerId,
          soldTo: teamId,
          soldAmount: player.basePrice,
          status: "sold",
        },
      });
    }

    // CASE 2: No bids and no teamId → mark as UNSOLD
    if (!lastBid && !teamId) {
      player.status = "unsold";

      await player.save({ session });

      await session.commitTransaction();

      return NextResponse.json({
        message: "Player marked as UNSOLD",
        data: {
          tournamentPlayerId,
          status: "unsold",
        },
      });
    }

    // CASE 3: Player SOLD (has bids)

    // Import Team model
    const Team = (await import("@/models/Team")).default;

    // Get all bid histories for this player to refund all teams except winner's last bid
    const allBids = await BidHistory.find({
      tournamentPlayerId,
      createdBy: userId,
    })
      .sort({ createdAt: 1 }) // Sort by creation time to process in order
      .session(session);

    const winningTeamId = lastBid.teamId;
    const lastBidId = lastBid._id.toString();

    // Refund all bids except the winning team's last bid
    for (const bid of allBids) {
      // Skip the last bid (winning bid) - don't refund it
      if (bid._id.toString() === lastBidId) {
        continue;
      }
      
      // Refund all other bids (including previous bids from the winning team)
      await Team.findOneAndUpdate(
        { _id: bid.teamId, createdBy: userId },
        { $inc: { remainingPurse: bid.bidAmount } },
        { session }
      );
    }

    // Mark player as sold
    player.status = "sold";
    player.soldTo = winningTeamId;

    // 🔥 FINAL PRICE COMES FROM CURRENT basePrice
    player.soldAmount = player.basePrice;

    await player.save({ session });

    await session.commitTransaction();

    return NextResponse.json({
      message: "Player sold successfully",
      data: {
        tournamentPlayerId,
        soldTo: winningTeamId,
        soldAmount: player.basePrice,
        status: "sold",
      },
    });

  } catch (error) {
    await session.abortTransaction();

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );

  } finally {
    session.endSession();
  }
}
