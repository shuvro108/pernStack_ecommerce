import { getAuth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    let { userId } = getAuth(request);

    const { address } = await request.json();

    if (!userId) {
      const cu = await currentUser();
      if (cu?.id) {
        userId = cu.id;
      }
    }

    if (!userId) {
      console.log("[cart/update] No userId found");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const newAddress = await prisma.address.create({
      data: { userId, ...address },
    });
    return NextResponse.json(
      { success: true, message: "Address added", address: newAddress },
      { status: 200 }
    );
  } catch (error) {
    console.error("[cart/update] Error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
