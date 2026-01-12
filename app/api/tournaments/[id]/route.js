import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tournament from "@/models/Tournament";
import { verifyAuth } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    await connectDB();
    // VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    // IMPORTANT: await params
    const { id } = await params;

    console.log("params.id >>", id);
    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: tournament }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid tournament id" },
      { status: 400 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    // VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }
    // IMPORTANT: await params
    const { id } = await params;
    const body = await req.json();

    const tournament = await Tournament.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true, // 🔥 VERY IMPORTANT
    });

    if (!tournament) {
      return NextResponse.json(
        { message: "Tournament not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Tournament updated", data: tournament },
      { status: 200 }
    );
  } catch (error) {
    console.log("error>>", error);

    if (error.name === "ValidationError") {
      const field = Object.keys(error.errors)[0];
      const message = error.errors[field].message;

      return NextResponse.json({ message, field }, { status: 400 });
    }

    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    // VERIFY TOKEN
    const auth = verifyAuth(req);
    if (auth.error) {
      return NextResponse.json({ message: auth.error }, { status: 401 });
    }

     // IMPORTANT: await params
    const { id } = await params;
    await Tournament.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Tournament deleted" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete tournament" },
      { status: 500 }
    );
  }
}
