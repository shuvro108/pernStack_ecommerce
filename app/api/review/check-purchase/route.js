import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req) {
  try {
    await connectDB();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    const pidNum = Number(productId);
    if (!Number.isInteger(pidNum) || pidNum <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid Product ID" },
        { status: 400 }
      );
    }

    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId: user.id,
        items: { some: { productId: pidNum } },
      },
    });

    return NextResponse.json(
      { success: true, hasPurchased: !!hasPurchased },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking purchase:", error);
    return NextResponse.json(
      { success: false, message: "Failed to check purchase" },
      { status: 500 }
    );
  }
}
