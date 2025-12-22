import { NextResponse } from "next/server";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";
import authSeller from "@/lib/authSeller.js";

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
        { success: false, message: "Unauthorized: No user session" },
        { status: 401 }
      );
    }

    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Seller access required" },
        { status: 401 }
      );
    }

    await connectDB();
    const products = await prisma.product.findMany({ where: { userId } });
    const mapped = products.map((p) => ({
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
      ratingAverage: p.ratingAverage,
      ratingCount: p.ratingCount,
    }));
    return NextResponse.json({ success: true, products: mapped });
  } catch (error) {
    console.error("Error fetching seller products:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching products" },
      { status: 500 }
    );
  }
}
