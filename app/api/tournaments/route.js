import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tournament from "@/models/Tournament";
import { verifyAuth } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    // VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    console.log(auth);

    const { userId, role } = auth.user;
    console.log("userId>>", role);

    // Role-based access
    if (role !== "admin" && role !== "organizer") {
      return NextResponse.json(
        { message: "You are not allowed to create tournament" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      date,
      budget,
      basePrice,
      biddingPrice,
      minPlayers,
      maxPlayers,
      rules,
    } = body;

    const tournament = await Tournament.create({
      name,
      date,
      budget,
      basePrice,
      biddingPrice,
      minPlayers,
      maxPlayers,
      rules,
      createdBy: userId, // from token
    });

    return NextResponse.json(
      { message: "Tournament created", data: tournament },
      { status: 201 }
    );
  } catch (error) {
    console.log("error>>", error);

    if (error.name === "ValidationError") {
      const field = Object.keys(error.errors)[0];
      return NextResponse.json(
        { message: error.errors[field].message, field },
        { status: 400 }
      );
    }

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return NextResponse.json(
        { message: `${field} already exists`, field },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    // 🔐 VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    const tournaments = await Tournament.find().sort({ createdAt: -1 });

    return NextResponse.json({ data: tournaments }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
