import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    await connectDB();
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

    const reviews = await prisma.review.findMany({
      where: { productId: pidNum },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    return NextResponse.json(
      {
        success: true,
        reviews,
        averageRating: Number(averageRating).toFixed(1),
        totalReviews: reviews.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
