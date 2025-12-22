import { NextResponse } from "next/server";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid email" },
        { status: 400 }
      );
    }

    await connectDB();

    await prisma.newsletter.upsert({
      where: { email: trimmed },
      update: {},
      create: { email: trimmed },
    });

    return NextResponse.json(
      { success: true, message: "Subscribed successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Handle duplicate gracefully: upsert already ensures idempotency
    console.error("[newsletter/subscribe] Error:", error);
    return NextResponse.json(
      { success: false, message: "Subscription failed" },
      { status: 500 }
    );
  }
}
