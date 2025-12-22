import connectDB from "@/config/db.js";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  handleError,
  handleSuccess,
  validateUserId,
  safeDbOperation,
  sanitizeBigInt,
  validatePrismaClient,
} from "@/lib/apiUtils";

export async function GET(request) {
  try {
    // 1. Authenticate user with fallback
    let { userId } = getAuth(request);

    if (!validateUserId(userId)) {
      const cu = await currentUser();
      if (cu?.id) {
        userId = cu.id;
      }
    }

    console.log("[cart/get] Authentication check:", { userId });

    if (!validateUserId(userId)) {
      return handleError("Authentication required", 401);
    }

    // 2. Connect to database
    try {
      await connectDB();
    } catch (dbErr) {
      return handleError("Database connection failed", 503, dbErr);
    }

    // 3. Verify Prisma client
    if (!validatePrismaClient(prisma)) {
      return handleError("Database client initialization failed", 500);
    }

    // 4. Fetch user and cart items
    const userResult = await safeDbOperation(
      () => prisma.user.findUnique({ where: { id: userId } }),
      "Fetch user for cart"
    );

    if (!userResult.success || !userResult.data) {
      return handleError("User not found", 404);
    }

    const user = userResult.data;
    const cart = user?.cartItems || {};

    console.log("[cart/get] User cart retrieved:", {
      userId,
      itemCount: Object.keys(cart).length,
    });

    // 5. Extract and validate product IDs from cart
    const productIds = Object.keys(cart);
    const validProductIds = productIds
      .map((x) => {
        const num = Number(x);
        return Number.isInteger(num) && num > 0 ? num : null;
      })
      .filter((n) => n !== null);

    console.log("[cart/get] Cart items:", {
      total: productIds.length,
      valid: validProductIds.length,
    });

    // 6. If no items, return early
    if (validProductIds.length === 0) {
      return handleSuccess({
        items: [],
        cart: {},
      });
    }

    // 7. Fetch product details
    const productsResult = await safeDbOperation(
      () =>
        prisma.product.findMany({
          where: { id: { in: validProductIds } },
          select: {
            id: true,
            userId: true,
            name: true,
            description: true,
            price: true,
            category: true,
            offerPrice: true,
            images: true,
            date: true,
            ratingAverage: true,
            ratingCount: true,
          },
        }),
      "Fetch products for cart"
    );

    if (!productsResult.success) {
      return handleError("Failed to fetch cart products", 500);
    }

    // 8. Build product map
    const productMap = new Map();
    (productsResult.data || []).forEach((p) => {
      const sanitized = {
        _id: String(p.id),
        id: Number(p.id),
        userId: p.userId || "",
        name: p.name || "Unknown Product",
        description: p.description || "",
        price: Number(p.price) || 0,
        category: p.category || "",
        offerPrice: Number(p.offerPrice) || 0,
        images: Array.isArray(p.images) ? p.images : [],
        image: Array.isArray(p.images) ? p.images : [],
        date: String(p.date || ""),
        ratingAverage: Number(p.ratingAverage) || 0,
        ratingCount: Number(p.ratingCount) || 0,
      };
      productMap.set(String(p.id), sanitized);
    });

    // 9. Build items array
    const items = productIds
      .map((pid) => {
        const quantity = cart[pid];

        // Validate quantity
        if (
          typeof quantity !== "number" ||
          !Number.isInteger(quantity) ||
          quantity <= 0
        ) {
          return null;
        }

        return {
          _id: pid,
          quantity: quantity,
          product: productMap.get(String(pid)) || null,
        };
      })
      .filter((item) => item !== null);

    console.log("[cart/get] Cart items prepared:", {
      total: items.length,
      withValidProducts: items.filter((i) => i.product !== null).length,
    });

    return handleSuccess({
      items,
      cart,
    });
  } catch (error) {
    console.error("[cart/get] Unexpected error:", {
      message: error?.message,
      stack: error?.stack,
    });
    return handleError("Failed to fetch cart - please try again", 500, error);
  }
}
