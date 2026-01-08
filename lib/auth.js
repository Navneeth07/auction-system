import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function verifyAuth(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Unauthorized" };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return { user: decoded }; // { userId, role }
  } catch (error) {
    return { error: "Invalid or expired token" };
  }
}
