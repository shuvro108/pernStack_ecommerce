import connectDB from "@/config/db.js";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    let { userId } = getAuth(request);

    if (!userId) {
      const cu = await currentUser();
      if (cu?.id) {
        userId = cu.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();
    const addresses = await prisma.address.findMany({ where: { userId } });

    return NextResponse.json({ success: true, addresses }, { status: 200 });
  } catch (error) {
    console.error("[user/get-address] Error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
