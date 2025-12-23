import connectDB from "@/config/db.js";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  handleError,
  handleSuccess,
  validateUserId,
  validateNumericId,
  validateQuantity,
  safeDbOperation,
  validatePrismaClient,
} from "@/lib/apiUtils";

export async function POST(request) {
  try {
    // 1. Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return handleError("Invalid request body - JSON parse failed", 400);
    }

    const { productId, cartItemId, quantity = 1 } = requestBody;

    console.log("[cart/update] Request received:", {
      productId,
      cartItemId,
      quantity,
    });

    // 2. Authenticate user
    let { userId } = getAuth(request);

    if (!validateUserId(userId)) {
      const cu = await currentUser();
      if (cu?.id) {
        userId = cu.id;
      }
    }

    console.log("[cart/update] Authentication check:", { userId });

    if (!validateUserId(userId)) {
      return handleError("Authentication required", 401);
    }

    // 3. Validate request has required operation
    if (!productId && !cartItemId) {
      return handleError("Either productId or cartItemId is required", 400);
    }

    // 4. Validate quantity
    const quantityNum = validateQuantity(quantity, 0, 10000);
    if (quantityNum === false) {
      return handleError("Quantity must be a positive number", 400);
    }

    // 5. Connect to database
    try {
      await connectDB();
    } catch (dbErr) {
      return handleError("Database connection failed", 503, dbErr);
    }

    // 6. Verify Prisma client
    if (!validatePrismaClient(prisma)) {
      return handleError("Database client initialization failed", 500);
    }

    // 7. Fetch user
    const userResult = await safeDbOperation(
      () => prisma.user.findUnique({ where: { id: userId } }),
      "Fetch user for cart update"
    );

    if (!userResult.success || !userResult.data) {
      return handleError("User not found", 404);
    }

    const user = userResult.data;
    const cart = user.cartItems || {};

    console.log("[cart/update] Current cart before update:", {
      itemCount: Object.keys(cart).length,
    });

    // 8. Update cart based on operation
    if (cartItemId) {
      // Absolute update (quantity input / remove)
      const itemId = validateNumericId(cartItemId);
      if (itemId === false) {
        return handleError("Invalid cart item ID", 400);
      }

      const cleanId = String(itemId);
      if (quantityNum <= 0) {
        delete cart[cleanId];
        console.log("[cart/update] Removed item:", { itemId });
      } else {
        cart[cleanId] = quantityNum;
        console.log("[cart/update] Updated item quantity:", {
          itemId,
          quantity: quantityNum,
        });
      }
    }

    if (productId) {
      // Absolute set (quantity input / remove) - same as cartItemId mode
      const prodId = validateNumericId(productId);
      if (prodId === false) {
        return handleError("Invalid product ID", 400);
      }

      const cleanId = String(prodId);
      if (quantityNum <= 0) {
        delete cart[cleanId];
        console.log("[cart/update] Removed product:", { prodId });
      } else {
        cart[cleanId] = quantityNum;
        console.log("[cart/update] Set product quantity:", {
          prodId,
          quantity: quantityNum,
        });
      }
    }

    // 9. Save updated cart to database
    const updateResult = await safeDbOperation(
      () =>
        prisma.user.update({
          where: { id: userId },
          data: { cartItems: cart },
        }),
      "Update user cart"
    );

    if (!updateResult.success) {
      return handleError("Failed to update cart", 500);
    }

    // 10. Fetch product details if cart is not empty
    const productIds = Object.keys(cart);
    const validProductIds = productIds
      .map((x) => {
        const num = Number(x);
        return Number.isInteger(num) && num > 0 ? num : null;
      })
      .filter((n) => n !== null);

    let items = [];

    if (validProductIds.length > 0) {
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
        "Fetch products for updated cart"
      );

      if (!productsResult.success) {
        console.warn(
          "[cart/update] Failed to fetch products for response, returning cart only"
        );
      } else {
        // Build product map
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

        // Build items array
        items = productIds
          .map((pid) => {
            const quantity = cart[pid];

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
              product: productMap.get(pid) || null,
            };
          })
          .filter((item) => item !== null);
      }
    }

    console.log("[cart/update] Cart update completed:", {
      itemCount: items.length,
    });

    return handleSuccess({
      message: "Cart updated successfully",
      items,
      cart,
    });
  } catch (error) {
    console.error("[cart/update] Unexpected error:", {
      message: error?.message,
      stack: error?.stack,
    });
    return handleError("Failed to update cart - please try again", 500, error);
  }
}
