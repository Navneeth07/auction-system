import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tournament from "@/models/Tournament";
import { verifyAuth } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    await connectDB();

    // optional auth: only validate token if an Authorization header is present
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const auth = verifyAuth(req);
      if (auth?.error) {
        return NextResponse.json({ message: auth.error }, { status: 401 });
      }
    }

    // IMPORTANT for Next 15+
    const { id } = params;

    const tournament = await Tournament.findById(id).select("roles");

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    // Return in the documented shape
    return NextResponse.json(
      { roles: tournament.roles, status: 200 },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}
