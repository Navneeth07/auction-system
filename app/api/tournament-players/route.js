import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TournamentPlayer from "@/models/TournamentPlayer";
import { verifyAuth } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    // 1. VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId } = auth.user;
    const body = await req.json();

    const { tournamentId, playerId } = body;

    // 2. VALIDATE INPUT
    if (!tournamentId || !playerId) {
      return NextResponse.json(
        { message: "Tournament ID and Player ID are required" },
        { status: 400 }
      );
    }

    // 3. CREATE ASSOCIATION
    // We include createdBy to satisfy your BRD requirement (organizer isolation)
    const participation = await TournamentPlayer.create({
      tournamentId,
      playerId,
      createdBy: userId, 
    });

    return NextResponse.json(
      { 
        message: "Player added to tournament successfully", 
        data: participation 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error adding player:", error);

    // Handle Duplicate Entry (Player already in this tournament)
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "This player is already registered for this tournament." },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

/**
 * GET History for a specific player
 * Useful for your BRD: "Only Players past history available"
 */
export async function GET(req) {
  try {
    await connectDB();
    const auth = verifyAuth(req);
    if (auth.error) return NextResponse.json({ message: auth.error }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("playerId");

    if (!playerId) {
      return NextResponse.json({ message: "Player ID is required" }, { status: 400 });
    }

    // Fetch history only for this organizer's player
    const history = await TournamentPlayer.find({ 
      playerId, 
      createdBy: auth.user.userId 
    })
    .populate("tournamentId") // Joins tournament details
    .sort({ createdAt: -1 });

    return NextResponse.json({ data: history }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}