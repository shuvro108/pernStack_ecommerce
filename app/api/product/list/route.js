import { NextResponse } from "next/server";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";

export async function GET(request) {
  try {
    await connectDB();
    const products = await prisma.product.findMany({});

    // Group reviews by productId
    const grouped = await prisma.review.groupBy({
      by: ["productId"],
      _avg: { rating: true },
      _count: { rating: true },
    });

    const reviewStatsMap = new Map();
    grouped.forEach((g) => {
      reviewStatsMap.set(String(g.productId), {
        ratingAverage:
          Math.round(((g._avg.rating || 0) + Number.EPSILON) * 10) / 10,
        ratingCount: g._count.rating || 0,
      });
    });

    const productsWithReviews = products.map((p) => {
      const stats = reviewStatsMap.get(String(p.id));
      return {
        _id: String(p.id),
        id: Number(p.id),
        userId: p.userId,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        offerPrice: p.offerPrice,
        images: p.images,
        image: p.images,
        date: String(p.date), // Convert BigInt to string
        ratingAverage: stats?.ratingAverage || p.ratingAverage || 0,
        ratingCount: stats?.ratingCount || p.ratingCount || 0,
      };
    });

    return NextResponse.json({ success: true, products: productsWithReviews });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching products" },
      { status: 500 }
    );
  }
}
