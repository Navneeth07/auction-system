import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Team from "@/models/Team";
import { verifyAuth } from "../../../../lib/auth";

export async function GET(req, { params }) {
  try {
    await connectDB();
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    // IMPORTANT: await params
    const { id } = await params;
    const team = await Team.findById(id);

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json({ data: team }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    // IMPORTANT: await params
    const { id } = await params;

    const body = await req.json();

    const team = await Team.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true, // 🔥 important
    });

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Team updated successfully", data: team },
      { status: 200 }
    );
  } catch (error) {
    console.log("error>>", error);

    if (error.code === 11000) {
      return NextResponse.json(
        { message: "shortCode already exists", field: "shortCode" },
        { status: 409 }
      );
    }

    if (error.name === "ValidationError") {
      const field = Object.keys(error.errors)[0];
      const message = error.errors[field].message;

      return NextResponse.json({ message, field }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    // IMPORTANT: await params
    const { id } = await params;
    const team = await Team.findByIdAndDelete(id);

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Team deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
