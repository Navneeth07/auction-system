
// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import Tournament from "@/models/Tournament";

// export async function POST(req: Request) {
//   await connectDB();

//   const body = await req.json();
//   const tournament = await Tournament.create(body);

//   return NextResponse.json(tournament, { status: 201 });
// }

// export async function GET() {
//   await connectDB();

//   const tournaments = await Tournament.find().populate("user_id");
//   return NextResponse.json(tournaments);
// }
