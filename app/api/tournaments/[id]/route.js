import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Tournament from "@/models/Tournament";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const tournament = await Tournament.findById(params.id);

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
    const body = await req.json();

    const tournament = await Tournament.findByIdAndUpdate(
      params.id,
      body,
      {
        new: true,
        runValidators: true, // 🔥 VERY IMPORTANT
      }
    );

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

      return NextResponse.json(
        { message, field },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Failed to update tournament" },
      { status: 500 }
    );
  }
}



export async function DELETE(req, { params }) {
  try {
    await connectDB();

    await Tournament.findByIdAndDelete(params.id);

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
