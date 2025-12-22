import { NextResponse } from "next/server";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller.js";
import {
  handleError,
  handleSuccess,
  validateUserId,
  validateNumericId,
  validateOrderStatus,
  safeDbOperation,
  STATUS_DISPLAY_MAP,
  DISPLAY_TO_STATUS_MAP,
  validatePrismaClient,
} from "@/lib/apiUtils";

export async function PUT(request) {
  try {
    // 1. Authenticate and verify seller permissions
    const { userId } = getAuth(request);
    console.log("[order/update-status] Authentication check:", { userId });

    if (!validateUserId(userId)) {
      return handleError("Authentication required", 401);
    }

    // 2. Verify seller access
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      console.warn("[order/update-status] Unauthorized seller access attempt", {
        userId,
      });
      return handleError("Seller access required", 403);
    }

    // 3. Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return handleError("Invalid request body - JSON parse failed", 400);
    }

    const { orderId, status } = requestBody;

    // 4. Validate orderId
    const orderIdNum = validateNumericId(orderId);
    if (orderIdNum === false) {
      return handleError("Valid order ID is required", 400);
    }

    // 5. Validate status
    if (!status || typeof status !== "string") {
      return handleError("Status is required and must be a string", 400);
    }

    // Check if status is in display format and convert to enum format
    const enumStatus = validateOrderStatus(status, true);
    if (!enumStatus) {
      const validStatuses = Object.keys(DISPLAY_TO_STATUS_MAP).join(", ");
      return handleError(
        `Invalid status. Valid options: ${validStatuses}`,
        400
      );
    }

    console.log("[order/update-status] Request validated:", {
      orderId: orderIdNum,
      status: enumStatus,
      userId,
    });

    // 6. Connect to database
    try {
      await connectDB();
    } catch (dbErr) {
      return handleError("Database connection failed", 503, dbErr);
    }

    // 7. Verify Prisma client
    if (!validatePrismaClient(prisma)) {
      return handleError("Database client initialization failed", 500);
    }

    // 8. Verify order exists
    const orderCheck = await safeDbOperation(
      () =>
        prisma.order.findUnique({
          where: { id: orderIdNum },
          select: { id: true, status: true, userId: true },
        }),
      "Fetch order for status update"
    );

    if (!orderCheck.success || !orderCheck.data) {
      return handleError("Order not found", 404);
    }

    const order = orderCheck.data;
    console.log("[order/update-status] Order found:", {
      orderId: order.id,
      currentStatus: order.status,
    });

    // 9. Update order status
    const updateResult = await safeDbOperation(
      () =>
        prisma.order.update({
          where: { id: orderIdNum },
          data: { status: enumStatus },
          select: {
            id: true,
            userId: true,
            amount: true,
            addressId: true,
            status: true,
            date: true,
          },
        }),
      "Update order status"
    );

    if (!updateResult.success) {
      return handleError("Failed to update order status", 500);
    }

    const updatedOrder = updateResult.data;

    // 10. Sanitize response (convert BigInt to string)
    const responseOrder = {
      id: Number(updatedOrder.id) || null,
      userId: updatedOrder.userId || null,
      amount: Number(updatedOrder.amount) || 0,
      addressId: Number(updatedOrder.addressId) || null,
      status: STATUS_DISPLAY_MAP[updatedOrder.status] || updatedOrder.status,
      date: String(updatedOrder.date || ""),
    };

    console.log("[order/update-status] Order status updated successfully", {
      orderId: responseOrder.id,
      newStatus: responseOrder.status,
    });

    return handleSuccess({
      message: "Order status updated successfully",
      order: responseOrder,
    });
  } catch (error) {
    console.error("[order/update-status] Unexpected error:", {
      message: error?.message,
      stack: error?.stack,
    });
    return handleError(
      "Failed to update order status - please try again",
      500,
      error
    );
  }
}
