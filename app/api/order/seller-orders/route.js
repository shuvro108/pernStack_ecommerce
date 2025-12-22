import authSeller from "@/lib/authSeller";
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";
import {
  handleError,
  handleSuccess,
  validateUserId,
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

    console.log("[seller-orders] User authentication check:", { userId });

    if (!validateUserId(userId)) {
      return handleError("Unauthorized - authentication required", 401);
    }

    // 2. Verify seller permissions
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      console.warn("[seller-orders] Unauthorized seller access attempt", {
        userId,
      });
      return handleError("Seller access required", 403);
    }

    // 3. Connect to database
    try {
      await connectDB();
    } catch (dbErr) {
      return handleError("Database connection failed", 503, dbErr);
    }

    // 4. Verify Prisma client
    if (!validatePrismaClient(prisma)) {
      return handleError("Database client initialization failed", 500);
    }

    // 5. Fetch all orders with details
    const ordersResult = await safeDbOperation(
      () =>
        prisma.order.findMany({
          include: {
            address: true,
            items: {
              include: { product: true },
            },
          },
          orderBy: { id: "desc" },
        }),
      "Fetch all orders for seller"
    );

    if (!ordersResult.success) {
      return handleError("Failed to fetch orders", 500);
    }

    const orders = ordersResult.data || [];
    console.log("[seller-orders] Fetched all orders for seller:", {
      userId,
      count: orders.length,
    });

    // 6. Sanitize and format response
    const sanitizedOrders = orders
      .map((order) => {
        try {
          return {
            id: Number(order.id) || null,
            userId: order.userId || null,
            amount: Number(order.amount) || 0,
            addressId: Number(order.addressId) || null,
            status:
              STATUS_TO_DISPLAY[order.status] || order.status || "Unknown",
            date: String(order.date || ""),
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
                ? order.items
                    .map((item) => {
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
                                offerPrice:
                                  Number(item.product.offerPrice) || 0,
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
                          "[seller-orders] Error sanitizing order item:",
                          itemErr
                        );
                        return null;
                      }
                    })
                    .filter((item) => item !== null)
                : [],
          };
        } catch (orderErr) {
          console.error("[seller-orders] Error sanitizing order:", orderErr);
          return null;
        }
      })
      .filter((order) => order !== null);

    return handleSuccess({
      orders: sanitizedOrders,
      count: sanitizedOrders.length,
    });
  } catch (error) {
    console.error("[seller-orders] Unexpected error:", {
      message: error?.message,
      stack: error?.stack,
    });
    return handleError(
      "Failed to fetch seller orders - please try again",
      500,
      error
    );
  }
}
