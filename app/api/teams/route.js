import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { verifyAuth } from "../../../lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    console.log("Hello");
    // VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

    const { userId, role } = auth.user;
    const body = await req.json();

    const { name, owner, shortCode } = body;

    if (!name || !owner || !shortCode) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const team = await Team.create({
      name,
      owner,
      shortCode,
      createdBy: userId,
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
    const teams = await Team.find().sort({ createdAt: -1 });

    return NextResponse.json({ data: teams }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
