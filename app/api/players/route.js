import mongoose from "mongoose";
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

    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId } = auth.user;

    const formData = await req.formData();

    const fullName = formData.get("fullName");
    const phoneNumber = formData.get("phoneNumber");
    const emailId = formData.get("emailId");
    const tournamentId = formData.get("tournamentId");

    // 🔥 NEW FIELDS
    const role = formData.get("role");
    const basePrice = formData.get("basePrice");
    const biddingPrice = formData.get("biddingPrice");

    const imageFile = formData.get("image");

    if (!fullName || !phoneNumber) {
      return NextResponse.json(
        { message: "fullName and phoneNumber are required" },
        { status: 400 },
      );
    }

    let imageUrl = null;

    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "players" }, (error, result) => {
            if (error) reject(error);
            resolve(result);
          })
          .end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    // STEP 1: Create Player
    const player = await Player.create({
      fullName,
      phoneNumber,
      emailId,
      image: imageUrl,
      createdBy: userId,
    });

    // STEP 2: Tournament Mapping With Role
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

      // 🔥 VALIDATE ROLE EXISTS IN TOURNAMENT
      const roleData = tournament.roles.find((r) => r.role === role);

      if (!roleData) {
        return NextResponse.json(
          { message: "Invalid role for this tournament" },
          { status: 400 },
        );
      }

      // Validate pricing
      if (Number(biddingPrice) > Number(basePrice)) {
        return NextResponse.json(
          { message: "Bidding price must be less than or equal to base price" },
          { status: 400 },
        );
      }

      await TournamentPlayer.create({
        tournamentId,
        playerId: player._id,
        createdBy: userId,

        // 🔥 ROLE INFO STORED HERE
        role,
        basePrice,
        biddingPrice,
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
    const tournamentId = searchParams.get("tournamentId");

    if (!tournamentId) {
      return NextResponse.json(
        { message: "tournamentId is required" },
        { status: 400 },
      );
    }

    const skip = (page - 1) * limit;

    // 1️⃣ Count total players in this tournament
    const totalPlayers = await TournamentPlayer.countDocuments({
      tournamentId,
      createdBy: userId,
    });

    // 2️⃣ Fetch paginated players with role info
    const players = await TournamentPlayer.find({
      tournamentId,
      createdBy: userId,
    })
      .populate("playerId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format response - filter out items with null playerId (orphaned references)
    const formattedPlayers = players
      .filter((item) => item.playerId !== null && item.playerId !== undefined)
      .map((item) => {
        // Handle both _doc (older Mongoose) and direct object (newer Mongoose)
        const playerData = item.playerId._doc || item.playerId;
        return {
          ...playerData,
          role: item.role,
          basePrice: item.basePrice,
          biddingPrice: item.biddingPrice,
          status: item.status,
          mappingId: item._id,
        };
      });

    // 3️⃣ Dynamic Role Count Aggregation
    const roleAggregation = await TournamentPlayer.aggregate([
      {
        $match: {
          tournamentId: new mongoose.Types.ObjectId(tournamentId),
          createdBy: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert aggregation result to object format
    const roles = {};

    roleAggregation.forEach((r) => {
      roles[r._id] = r.count;
    });

    return NextResponse.json(
      {
        data: formattedPlayers,
        pagination: {
          total: totalPlayers,
          page,
          limit,
          totalPages: Math.ceil(totalPlayers / limit),
          roles, // 🔥 Fully Dynamic Now
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.log("error>>", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId } = auth.user;

    const { searchParams } = new URL(req.url);
    const tournamentPlayerId = searchParams.get("tournamentPlayerId");

    if (!tournamentPlayerId) {
      return NextResponse.json(
        { message: "tournamentPlayerId is required" },
        { status: 400 },
      );
    }

    // Find the TournamentPlayer mapping
    const tournamentPlayer = await TournamentPlayer.findOne({
      _id: tournamentPlayerId,
      createdBy: userId,
    });

    if (!tournamentPlayer) {
      return NextResponse.json(
        { message: "Player not found or unauthorized" },
        { status: 404 },
      );
    }

    // Check if player is sold - prevent deletion if sold
    if (tournamentPlayer.status === "sold") {
      return NextResponse.json(
        { message: "Cannot delete a sold player" },
        { status: 400 },
      );
    }

    // Delete the TournamentPlayer mapping
    await TournamentPlayer.deleteOne({
      _id: tournamentPlayerId,
      createdBy: userId,
    });

    return NextResponse.json(
      { message: "Player deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.log("Player DELETE error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}