import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Player from "@/models/Player";
import TournamentPlayer from "@/models/TournamentPlayer";
import Tournament from "@/models/Tournament";
import { verifyAuth } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

export async function POST(req) {
  try {
    await connectDB();

    // 🔐 AUTH
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId } = auth.user;

    // ✅ Read multipart/form-data
    const formData = await req.formData();

    const fullName = formData.get("fullName");
    const phoneNumber = formData.get("phoneNumber");
    const emailId = formData.get("emailId");
    const tournamentId = formData.get("tournamentId");
    const imageFile = formData.get("image"); // 🖼️ file

    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { message: "fullName and phoneNumber are required" },
        { status: 400 },
      );
    }

    let imageUrl = null;
    console.log("imageFile>>", imageFile);
    // 🖼️ Upload image if provided
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "players",
            },
            (error, result) => {
              if (error) reject(error);
              resolve(result);
            },
          )
          .end(buffer);
      });
      console.log("uploadResult>>>", uploadResult);
      imageUrl = uploadResult.secure_url;
    }

    /**
     * STEP 1: Create Player
     */
    const player = await Player.create({
      fullName,
      phoneNumber,
      emailId,
      image: imageUrl,
      createdBy: userId,
    });

    let tournamentMapping = null;

    /**
     * STEP 2: If tournamentId → map player
     */
    if (tournamentId) {
      const tournament = await Tournament.findOne({
        _id: tournamentId,
        createdBy: userId,
      });

      if (!tournament) {
        return NextResponse.json(
          { message: "Tournament not found or unauthorized" },
          { status: 404 },
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
        data: player,
      },
      { status: 201 },
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
        { status: 409 },
      );
    }

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();

    // VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId } = auth.user;

    // Read query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    // Total players count
    const totalPlayers = await Player.countDocuments({
      createdBy: userId,
    });

    // Fetch paginated players
    const players = await Player.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        data: players,
        pagination: {
          total: totalPlayers,
          page,
          limit,
          totalPages: Math.ceil(totalPlayers / limit),
          roles: {
            batsman: 10,
            bowlers: 10,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
