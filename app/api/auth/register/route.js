import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../../../lib/token";

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { fullName, email, password } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: "organizer"
    });
    console.log("Res>>", user);

    //Generate token
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });
    const refreshToken = generateRefreshToken({
      userId: user._id,
    });

    await User.updateOne({ _id: user._id }, { refreshToken });

    // 🍪 Set refresh token as httpOnly cookie
    const response = NextResponse.json(
      {
        message: "User registered successfully",
        accessToken,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      },
      { status: 201 }
    );

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.log("error>>", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];

      return NextResponse.json(
        { message: `${field} already exists`, field },
        { status: 409 }
      );
    }

    if (error.name === "ValidationError") {
      const field = Object.keys(error.errors)[0];
      const message = error.errors[field].message;

      return NextResponse.json(
        { message, field },
        { status: 400 } // Bad Request
      );
    }

    return NextResponse.json(
      { message: "Someting went wrong" },
      { status: 500 }
    );
  }
}
