import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifyAuth } from "@/lib/auth";
import Player from "@/models/Player";
import TournamentPlayer from "@/models/TournamentPlayer";

/**
 * GET /api/tournament-player/unmapped
 * Query:
 *  - tournamentId (required)
 *  - page
 *  - limit
 *  - search
 */
export async function GET(req) {
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
    const { searchParams } = new URL(req.url);

    const tournamentId = searchParams.get("tournamentId");
    if (!tournamentId) {
      return NextResponse.json(
        { message: "tournamentId is required" },
        { status: 400 }
      );
    }

    // PAGINATION
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // SEARCH
    const search = searchParams.get("search")?.trim();
    const searchQuery = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } },
            { emailId: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    /**
     * STEP 1: Get mapped player IDs
     */
    const mappedPlayers = await TournamentPlayer.find({
      tournamentId,
      createdBy: userId,
    }).select("playerId");

    const mappedPlayerIds = mappedPlayers.map(
      (p) => p.playerId
    );

    /**
     * STEP 2: Fetch unmapped players with pagination + search
     */
    const filter = {
      createdBy: userId,
      _id: { $nin: mappedPlayerIds },
      ...searchQuery,
    };

    const [players, total] = await Promise.all([
      Player.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Player.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        data: players,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("Unmapped pagination error:", error);

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}