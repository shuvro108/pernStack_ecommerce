import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    await connectDB();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, rating, comment } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "Rating must be between 1 and 5" },
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

    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: { productId: pidNum, userId: user.id },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    // Check if user has purchased this product
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId: user.id,
        items: { some: { productId: pidNum } },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        {
          success: false,
          message: "You must purchase this product before reviewing",
        },
        { status: 403 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId: pidNum,
        userId: user.id,
        userName: user.firstName
          ? `${user.firstName} ${user.lastName || ""}`.trim()
          : user.emailAddresses[0].emailAddress.split("@")[0],
        rating,
        comment,
        verifiedPurchase: true,
      },
    });

    // Recalculate and update product rating summary so cards stay in sync
    const agg = await prisma.review.groupBy({
      by: ["productId"],
      where: { productId: pidNum },
      _avg: { rating: true },
      _count: { rating: true },
    });
    if (agg.length > 0) {
      const summary = agg[0];
      await prisma.product.update({
        where: { id: pidNum },
        data: {
          ratingAverage:
            Math.round(((summary._avg.rating || 0) + Number.EPSILON) * 10) / 10,
          ratingCount: summary._count.rating || 0,
        },
      });
    }

    return NextResponse.json(
      { success: true, message: "Review added successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding review:", error);
    return NextResponse.json(
      { success: false, message: "Failed to add review" },
      { status: 500 }
    );
  }
}
