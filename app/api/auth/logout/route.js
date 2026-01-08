import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";

export async function POST(req) {
  try {
    await connectDB();

    const refreshToken = req.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      // Remove refresh token from DB
      await User.updateOne({ refreshToken }, { $unset: { refreshToken: "" } });
    }

    const response = NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );

    // 🍪 Clear cookie
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.log("Logout error>>", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
