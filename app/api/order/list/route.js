import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import {
  handleError,
  handleSuccess,
  validateUserId,
  sanitizeArray,
  safeDbOperation,
  STATUS_DISPLAY_MAP,
  validatePrismaClient,
} from "@/lib/apiUtils";

const STATUS_TO_DISPLAY = STATUS_DISPLAY_MAP;

export async function GET(request) {
  try {
    // 1. Get userId with fallback
    let { userId } = getAuth(request);

    if (!validateUserId(userId)) {
      const cu = await currentUser();
      if (cu?.id) {
        userId = cu.id;
      }
    }

    console.log("[order/list] User authentication check:", { userId });

    if (!validateUserId(userId)) {
      return handleError("Unauthorized - authentication required", 401);
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

    // 4. Fetch user's orders with all details
    const ordersResult = await safeDbOperation(
      () =>
        prisma.order.findMany({
          where: { userId },
          include: {
            address: true,
            items: {
              include: { product: true },
            },
          },
          orderBy: { id: "desc" },
        }),
      "Fetch user orders"
    );

    if (!ordersResult.success) {
      return handleError("Failed to fetch orders", 500);
    }

    const orders = ordersResult.data || [];
    console.log("[order/list] Fetched orders for user:", {
      userId,
      count: orders.length,
    });

    // 5. Sanitize and format response
    const sanitizedOrders = orders
      .map((order) => {
        try {
          // Recompute subtotal from items to derive display totals with promo
          const recomputedSubtotal = Array.isArray(order.items)
            ? order.items.reduce((sum, it) => {
                const p = it.product;
                const price = p ? Number(p.offerPrice || p.price || 0) : 0;
                const qty = Number(it.quantity || 0);
                return sum + price * qty;
              }, 0)
            : 0;
          const roundedSubtotal = Math.round(recomputedSubtotal);
          const discount = Math.min(
            roundedSubtotal,
            Math.round(Number(order.discountAmount) || 0)
          );
          const taxable = Math.max(roundedSubtotal - discount, 0);
          const tax = Math.round(taxable * 0.02);
          const displayTotal = taxable + tax;
          return {
            id: Number(order.id) || null,
            userId: order.userId || null,
            amount: Number(order.amount) || 0,
            displayAmount: displayTotal,
            addressId: Number(order.addressId) || null,
            status:
              STATUS_TO_DISPLAY[order.status] || order.status || "Unknown",
            date: String(order.date || ""),
            promoCode: order.promoCode || null,
            discountAmount: Number(order.discountAmount) || 0,
            address: order.address
              ? {
                  id: Number(order.address.id) || null,
                  fullName: order.address.fullName || "",
                  phoneNumber: order.address.phoneNumber || "",
                  city: order.address.city || "",
                  state: order.address.state || "",
                  pincode: order.address.pincode || "",
                  area: order.address.area || "",
                }
              : null,
            items:
              order.items && Array.isArray(order.items)
                ? order.items.map((item) => {
                    try {
                      return {
                        id: Number(item.id) || null,
                        orderId: Number(item.orderId) || null,
                        productId: Number(item.productId) || null,
                        quantity: Number(item.quantity) || 0,
                        product: item.product
                          ? {
                              id: Number(item.product.id) || null,
                              _id: String(item.product.id || ""),
                              userId: item.product.userId || "",
                              name: item.product.name || "Unknown Product",
                              description: item.product.description || "",
                              price: Number(item.product.price) || 0,
                              category: item.product.category || "",
                              offerPrice: Number(item.product.offerPrice) || 0,
                              images: Array.isArray(item.product.images)
                                ? item.product.images
                                : [],
                              image: Array.isArray(item.product.images)
                                ? item.product.images
                                : [],
                              date: String(item.product.date || ""),
                              ratingAverage:
                                Number(item.product.ratingAverage) || 0,
                              ratingCount:
                                Number(item.product.ratingCount) || 0,
                            }
                          : null,
                      };
                    } catch (itemErr) {
                      console.error(
                        "[order/list] Error sanitizing order item:",
                        itemErr
                      );
                      return null;
                    }
                  })
                : [],
          };
        } catch (orderErr) {
          console.error("[order/list] Error sanitizing order:", orderErr);
          return null;
        }
      })
      .filter((order) => order !== null);

    return handleSuccess({
      orders: sanitizedOrders,
      count: sanitizedOrders.length,
    });
  } catch (error) {
    console.error("[order/list] Unexpected error:", {
      message: error?.message,
      stack: error?.stack,
    });
    return handleError("Failed to fetch orders - please try again", 500, error);
  }
}
