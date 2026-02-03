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

    console.log("auth>>");

    const { userId, role } = auth.user;
    console.log("userId>>", role);

    // Role-based access
    if (role !== "admin" && role !== "organizer") {
      return NextResponse.json(
        { message: "You are not allowed to create tournament" },
        { status: 403 }
      );
    }

    console.log("req>>",req)

    const body = await req.json();

    console.log("body>>",body)
    const {
      name,
      date,
      budget,
      minPlayers,
      maxPlayers,
      roles,
      rules
    } = body;
console.log("roles>>",roles);
    const tournament = await Tournament.create({
      name,
      date,
      budget,
      minPlayers,
      maxPlayers,
      roles,
      rules,
      createdBy: userId, // from token
    });

    return NextResponse.json(
      { message: "Tournament created", data: tournament , status:201},
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

    return NextResponse.json({ message: error.message}, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();

    // 🔐 VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json(
        { message: auth.error },
        { status: 401 }
      );
    }

    const { userId } = auth.user;
    const { searchParams } = new URL(req.url);

    // 📄 PAGINATION
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    // 🎯 FILTER (USER-BASED)
    const filter = {
      createdBy: userId
    };

    // 📦 FETCH DATA
    const [tournaments, total] = await Promise.all([
      Tournament.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Tournament.countDocuments(filter),
    ]);

    return NextResponse.json(
      {
        data: tournaments,
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
    console.log("Tournament pagination error:", error);

    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}   
