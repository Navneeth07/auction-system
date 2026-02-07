import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TournamentPlayer from "@/models/TournamentPlayer";
import Player from "@/models/Player";
import Tournament from "@/models/Tournament";
import { verifyAuth } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    // VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }

    const { userId } = auth.user;
    const body = await req.json();
    const { tournamentId, playerId } = body;

    if (!tournamentId || !playerId) {
      return NextResponse.json(
        { message: "tournamentId and playerId are required" },
        { status: 400 }
      );
    }

    // Optional but recommended: Validate ownership
    const player = await Player.findOne({
      _id: playerId,
      createdBy: userId,
    });

    if (!player) {
      return NextResponse.json(
        { message: "Player not found or unauthorized" },
        { status: 404 }
      );
    }

    const tournament = await Tournament.findOne({
      _id: tournamentId,
      createdBy: userId,
    });

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found or unauthorized" },
        { status: 404 }
      );
    }

    const tournamentPlayer = await TournamentPlayer.create({
      tournamentId,
      playerId,
      createdBy: userId,
      status: "registered",
    });

    return NextResponse.json(
      {
        message: "Player registered to tournament successfully",
        data: tournamentPlayer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("TournamentPlayer POST error:", error);

    // Duplicate player registration
    if (error.code === 11000) {
      return NextResponse.json(
        {
          message: "Player already registered for this tournament",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    // VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }

    const { userId } = auth.user;
    const body = await req.json();
    const { tournamentPlayerId, biddingPrice } = body;

    if (!tournamentPlayerId || biddingPrice === undefined) {
      return NextResponse.json(
        { message: "tournamentPlayerId and biddingPrice are required" },
        { status: 400 }
      );
    }

    if (biddingPrice <= 0) {
      return NextResponse.json(
        { message: "Bidding price must be greater than 0" },
        { status: 400 }
      );
    }

    const tournamentPlayer = await TournamentPlayer.findOne({
      _id: tournamentPlayerId,
      createdBy: userId,
    });

    if (!tournamentPlayer) {
      return NextResponse.json(
        { message: "Tournament player not found or unauthorized" },
        { status: 404 }
      );
    }

    if (tournamentPlayer.status === "sold") {
      return NextResponse.json(
        { message: "Cannot update bidding price for a sold player" },
        { status: 400 }
      );
    }

    tournamentPlayer.biddingPrice = biddingPrice;
    await tournamentPlayer.save();

    return NextResponse.json(
      {
        message: "Bidding price updated successfully",
        data: tournamentPlayer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("TournamentPlayer PUT error:", error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectDB();

    // VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }

    const { userId } = auth.user;
    const { searchParams } = new URL(req.url);

    const tournamentId = searchParams.get("tournamentId");
    const playerId = searchParams.get("playerId");

    const filter = { createdBy: userId };

    if (tournamentId) filter.tournamentId = tournamentId;
    if (playerId) filter.playerId = playerId;

    const mappings = await TournamentPlayer.find(filter)
      .populate("playerId", "fullName phoneNumber emailId")
      .populate("tournamentId", "name startDate endDate")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { data: mappings },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
