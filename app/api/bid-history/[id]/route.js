import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import BidHistory from "@/models/BidHistory";
import TournamentPlayer from "@/models/TournamentPlayer";
import Team from "@/models/Team";
import { verifyAuth } from "@/lib/auth";
import mongoose from "mongoose";

export async function DELETE(req, { params }) {
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
    const { id: bidHistoryId } = await params;

    // Find the bid history entry
    const bid = await BidHistory.findOne({
      _id: bidHistoryId,
      createdBy: userId,
    }).session(session);

    if (!bid) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Bid not found" },
        { status: 404 }
      );
    }

    // Get the player to check current price
    const player = await TournamentPlayer.findOne({
      _id: bid.tournamentPlayerId,
      createdBy: userId,
    }).session(session);

    if (!player) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Player not found" },
        { status: 404 }
      );
    }

    // Check if player is already sold
    if (player.status === "sold") {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Cannot revert bid for a sold player" },
        { status: 400 }
      );
    }

    // Get all bids for this player, sorted by creation time
    const allBids = await BidHistory.find({
      tournamentPlayerId: bid.tournamentPlayerId,
      createdBy: userId,
    })
      .sort({ createdAt: 1 })
      .session(session);

    // Find the index of the bid to revert
    const bidIndex = allBids.findIndex(b => b._id.toString() === bidHistoryId);

    if (bidIndex === -1) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Bid not found in history" },
        { status: 404 }
      );
    }

    // Can only revert the last bid
    if (bidIndex !== allBids.length - 1) {
      await session.abortTransaction();
      session.endSession();
      return NextResponse.json(
        { message: "Can only revert the latest bid" },
        { status: 400 }
      );
    }

    // Refund the team's bid amount
    await Team.findOneAndUpdate(
      { _id: bid.teamId, createdBy: userId },
      { $inc: { remainingPurse: bid.bidAmount } },
      { session }
    );

    // Revert player's base price
    const previousPrice = bid.bidAmount - player.biddingPrice;
    await TournamentPlayer.findOneAndUpdate(
      { _id: bid.tournamentPlayerId },
      { $set: { basePrice: previousPrice } },
      { session }
    );

    // Delete the bid history entry
    await BidHistory.deleteOne({ _id: bidHistoryId }).session(session);

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({
      message: "Bid reverted successfully",
      data: {
        bidHistoryId,
        previousPrice,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.log("Error>>", error);
    return NextResponse.json(
      { message: error.message || "Failed to revert bid" },
      { status: 500 }
    );
  }
}
