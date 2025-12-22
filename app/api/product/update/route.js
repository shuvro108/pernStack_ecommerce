import authSeller from "@/lib/authSeller";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(request) {
  try {
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Seller access required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const productId = formData.get("productId");
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const category = formData.get("category");
    const offerPrice = formData.get("offerPrice");
    const files = formData.getAll("images");

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const idNum = Number(productId);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid Product ID" },
        { status: 400 }
      );
    }

    // Check if product exists and belongs to seller
    const product = await prisma.product.findUnique({ where: { id: idNum } });
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    if (product.userId !== userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Not your product" },
        { status: 403 }
      );
    }

    // Update fields
    const updateData = {
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
    };

    // Upload new images if provided
    if (files && files.length > 0 && files[0].size > 0) {
      const result = await Promise.all(
        files.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: "auto" },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            );
            stream.end(buffer);
          });
        })
      );
      updateData.image = result.map((res) => res.secure_url);
    }

    const updated = await prisma.product.update({
      where: { id: idNum },
      data: updateData.image
        ? {
            name: updateData.name,
            description: updateData.description,
            category: updateData.category,
            price: updateData.price,
            offerPrice: updateData.offerPrice,
            images: updateData.image,
          }
        : {
            name: updateData.name,
            description: updateData.description,
            category: updateData.category,
            price: updateData.price,
            offerPrice: updateData.offerPrice,
          },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: {
        _id: String(updated.id),
        id: Number(updated.id),
        userId: updated.userId,
        name: updated.name,
        description: updated.description,
        price: updated.price,
        category: updated.category,
        offerPrice: updated.offerPrice,
        images: updated.images,
        image: updated.images,
        date: String(updated.date), // Convert BigInt to string
        ratingAverage: updated.ratingAverage,
        ratingCount: updated.ratingCount,
      },
    });
  } catch (err) {
    console.error("[API] Error in /api/product/update:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error: " + err.message },
      { status: 500 }
    );
  }
}
