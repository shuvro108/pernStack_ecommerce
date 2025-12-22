import authSeller from "@/lib/authSeller";
import { v2 as cloudinary } from "cloudinary";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";
import mockDb from "@/lib/mockDb";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import {
  handleError,
  handleSuccess,
  validateUserId,
  validateString,
  validatePrice,
  validateArray,
  validatePrismaClient,
} from "@/lib/apiUtils";

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Validate required Cloudinary configuration
 */
const validateCloudinaryConfig = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error("Cloudinary configuration is incomplete");
  }
};

/**
 * Upload images to Cloudinary with error handling
 */
const uploadImagesToCloudinary = async (files) => {
  if (!validateArray(files, 1)) {
    throw new Error("At least one image is required");
  }

  console.log("[Product/Add] Uploading", files.length, "images to Cloudinary");

  try {
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        if (!file || !file.arrayBuffer) {
          throw new Error("Invalid file object");
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "image",
              folder: "products",
              timeout: 30000,
            },
            (error, result) => {
              if (error) {
                console.error("[Product/Add] Cloudinary upload error:", error);
                reject(new Error(`Image upload failed: ${error.message}`));
              } else if (!result || !result.secure_url) {
                reject(new Error("Invalid Cloudinary response"));
              } else {
                resolve(result.secure_url);
              }
            }
          );

          uploadStream.on("error", (error) => {
            console.error("[Product/Add] Stream error:", error);
            reject(new Error(`Upload stream error: ${error.message}`));
          });

          uploadStream.end(buffer);
        });
      })
    );

    console.log(
      "[Product/Add] Successfully uploaded",
      uploadResults.length,
      "images"
    );
    return uploadResults;
  } catch (error) {
    console.error("[Product/Add] Image upload batch failed:", error.message);
    throw error;
  }
};

export async function POST(request) {
  try {
    // 1. Validate Cloudinary configuration
    validateCloudinaryConfig();

    // 2. Authenticate user
    const { userId } = getAuth(request);
    console.log("[Product/Add] Authentication check:", { userId });

    if (!validateUserId(userId)) {
      return handleError("Authentication required", 401);
    }

    // 3. Verify seller permissions
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      console.warn("[Product/Add] Unauthorized seller access:", { userId });
      return handleError("Seller access required", 403);
    }

    // 4. Parse form data
    let formData;
    try {
      formData = await request.formData();
    } catch {
      return handleError("Invalid form data", 400);
    }

    // 5. Extract and validate form fields
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const category = formData.get("category");
    const offerPrice = formData.get("offerPrice");
    const files = formData.getAll("images");

    console.log("[Product/Add] Form data received:", {
      name: name?.substring(0, 30),
      price,
      category,
      filesCount: files.length,
    });

    // Validate required fields
    if (!validateString(name, 1, 200)) {
      return handleError("Product name is required (1-200 characters)", 400);
    }

    if (!validateString(description, 1, 5000)) {
      return handleError(
        "Product description is required (1-5000 characters)",
        400
      );
    }

    if (!validateString(category, 1, 100)) {
      return handleError("Category is required (1-100 characters)", 400);
    }

    const priceNum = validatePrice(price);
    if (priceNum === false) {
      return handleError("Valid price is required (non-negative number)", 400);
    }

    const offerPriceNum = validatePrice(offerPrice);
    if (offerPriceNum === false) {
      return handleError(
        "Valid offer price is required (non-negative number)",
        400
      );
    }

    // 6. Upload images to Cloudinary
    let imageUrls;
    try {
      imageUrls = await uploadImagesToCloudinary(files);
    } catch (uploadErr) {
      console.error("[Product/Add] Image upload failed:", uploadErr);
      return handleError(
        `Image upload failed: ${uploadErr.message}`,
        500,
        uploadErr
      );
    }

    // 7. Connect to database
    let dbConnected = false;
    try {
      await connectDB();
      dbConnected = true;
      console.log("[Product/Add] Database connected");
    } catch (dbErr) {
      console.warn(
        "[Product/Add] Database connection failed, will use fallback:",
        dbErr.message
      );
    }

    // 8. Save product to database
    let createdProduct;

    if (dbConnected) {
      try {
        if (!validatePrismaClient(prisma)) {
          throw new Error("Prisma client is not available");
        }

        createdProduct = await prisma.product.create({
          data: {
            userId,
            name: name.trim(),
            description: description.trim(),
            category: category.trim(),
            price: priceNum,
            offerPrice: offerPriceNum,
            images: imageUrls,
            date: BigInt(Date.now()),
          },
        });

        console.log(
          "[Product/Add] Product saved to PostgreSQL:",
          createdProduct.id
        );
      } catch (prismaErr) {
        console.warn(
          "[Product/Add] Prisma save failed, using mock database:",
          prismaErr.message
        );
        dbConnected = false;

        // Fallback to mock database
        createdProduct = mockDb.createProduct({
          userId,
          name: name.trim(),
          description: description.trim(),
          category: category.trim(),
          price: priceNum,
          offerPrice: offerPriceNum,
          images: imageUrls,
        });
      }
    } else {
      // Use mock database directly
      createdProduct = mockDb.createProduct({
        userId,
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: priceNum,
        offerPrice: offerPriceNum,
        images: imageUrls,
      });
    }

    // 9. Sanitize response
    const responseProduct = {
      _id: String(createdProduct.id || ""),
      id: Number(createdProduct.id || 0),
      userId: createdProduct.userId || userId,
      name: createdProduct.name || "",
      description: createdProduct.description || "",
      price: Number(createdProduct.price) || 0,
      category: createdProduct.category || "",
      offerPrice: Number(createdProduct.offerPrice) || 0,
      images: Array.isArray(createdProduct.images)
        ? createdProduct.images
        : createdProduct.image || imageUrls || [],
      date: String(createdProduct.date || Date.now()),
      ratingAverage: Number(createdProduct.ratingAverage) || 0,
      ratingCount: Number(createdProduct.ratingCount) || 0,
    };

    console.log("[Product/Add] Product created successfully:", {
      id: responseProduct.id,
      using: dbConnected ? "PostgreSQL" : "Mock Database",
    });

    return handleSuccess({
      message: `Product added successfully (using ${
        dbConnected ? "PostgreSQL" : "Mock Database"
      })`,
      newProduct: responseProduct,
    });
  } catch (error) {
    console.error("[Product/Add] Unexpected error:", {
      message: error?.message,
      stack: error?.stack,
    });
    return handleError(
      `Product creation failed: ${error?.message || "Unknown error"}`,
      500,
      error
    );
  }
}
