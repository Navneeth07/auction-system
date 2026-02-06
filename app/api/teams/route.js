import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import Tournament from "@/models/Tournament";
import { verifyAuth } from "../../../lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    // VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId, role } = auth.user;
    const body = await req.json();

    const { name, owner, shortCode, tournamentId} = body;

    if (!name || !owner || !shortCode || !tournamentId) {
      return NextResponse.json(
        { message: "All fields are required (including tournamentId)" },
        { status: 400 }
      );
    }

    // Verify tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return NextResponse.json({ message: "Tournament not found" }, { status: 404 });
    }

    // Authorization: only admins or the tournament owner can add teams
    if (role !== "admin" && String(tournament.createdBy) !== String(userId)) {
      return NextResponse.json({ message: "You are not allowed to add teams to this tournament" }, { status: 403 });
    }

    const team = await Team.create({
      name,
      owner,
      shortCode,
      createdBy: userId,
      tournamentId,
      totalPurse:tournament.budget,
      remainingPurse:tournament.budget
    });

    return NextResponse.json(
      { message: "Team created successfully", data: team, status:201 },
      { status: 201 }
    );
  } catch (error) {
    console.log("error>>", error);

    // Duplicate shortcode
    if (error.code === 11000) {
      return NextResponse.json(
        { message: "shortCode already exists", field: "shortCode" },
        { status: 409 }
      );
    }

    // Validation error
    if (error.name === "ValidationError") {
      const field = Object.keys(error.errors)[0];
      const message = error.errors[field].message;

      return NextResponse.json({ message, field }, { status: 400 });
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

    const { searchParams } = new URL(req.url);
    const tournamentId = searchParams.get("tournamentId");

    const query = tournamentId ? { tournamentId } : {};

    const teams = await Team.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ data: teams }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
