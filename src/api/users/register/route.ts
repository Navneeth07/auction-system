import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db";
import User from "@/models/user";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { full_name, email, password } = await req.json();

    // 1. Validation
    if (!full_name || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = await User.create({
      full_name,
      email,
      password: hashedPassword,
    });

    // 5. Remove password from response
    const userResponse = {
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    };

    return NextResponse.json(
      { message: "User registered successfully", user: userResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
