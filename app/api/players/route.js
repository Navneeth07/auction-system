import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import TournamentPlayer from "@/models/TournamentPlayer";
import Tournament from "@/models/Tournament";
import { verifyAuth } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    // AUTH
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }

    const { userId } = auth.user;
    const body = await req.json();

    const { fullName, phoneNumber, emailId, tournamentId } = body;

    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { message: "fullName and phoneNumber are required" },
        { status: 400 }
      );
    }

    /**
     * STEP 1: Create Player
     */
    const player = await Player.create({
      fullName,
      phoneNumber,
      emailId,
      createdBy: userId,
    });

    let tournamentMapping = null;

    /**
     * STEP 2: If tournamentId provided → map player
     */
    if (tournamentId) {
      // Optional: Validate tournament ownership
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

      tournamentMapping = await TournamentPlayer.create({
        tournamentId,
        playerId: player._id,
        createdBy: userId,
        status: "registered",
      });
    }

    return NextResponse.json(
      {
        message: tournamentId
          ? "Player created and registered to tournament"
          : "Player created successfully",
        data: {
          player,
          tournamentMapping,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Player POST error:", error);

    // Duplicate phoneNumber per organizer
    if (error.code === 11000) {
      return NextResponse.json(
        {
          message: "Player with this phone number already exists",
          field: "phoneNumber",
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


/**
 * GET PLAYERS
 * GET /api/player
 */
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

    // Fetch only players created by logged-in user
    const players = await Player.find({ createdBy: userId })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { data: players },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}