import { NextResponse } from "next/server";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";
import {
  handleError,
  handleSuccess,
  safeDbOperation,
  validatePrismaClient,
} from "@/lib/apiUtils";

export async function GET(request) {
  try {
    // 1. Connect to database
    try {
      await connectDB();
    } catch (dbErr) {
      return handleError("Database connection failed", 503, dbErr);
    }

    // 2. Verify Prisma client
    if (!validatePrismaClient(prisma)) {
      return handleError("Database client initialization failed", 500);
    }

    // 3. Fetch all orders summary
    const allOrdersResult = await safeDbOperation(
      () =>
        prisma.order.findMany({
          select: {
            id: true,
            userId: true,
            amount: true,
            status: true,
            date: true,
          },
          orderBy: { id: "desc" },
        }),
      "Fetch all orders for debug"
    );

    if (!allOrdersResult.success) {
      return handleError("Failed to fetch all orders", 500);
    }

    // 4. Fetch order statistics by user
    const ordersByUserResult = await safeDbOperation(
      () =>
        prisma.order.groupBy({
          by: ["userId"],
          _count: { id: true },
          _sum: { amount: true },
        }),
      "Fetch order statistics by user"
    );

    if (!ordersByUserResult.success) {
      return handleError("Failed to fetch order statistics", 500);
    }

    const allOrders = (allOrdersResult.data || []).map((order) => ({
      id: Number(order.id) || null,
      userId: order.userId || null,
      amount: Number(order.amount) || 0,
      status: order.status || "Unknown",
      date: String(order.date || ""),
    }));

    const ordersByUser = (ordersByUserResult.data || []).map((stat) => ({
      userId: stat.userId || null,
      orderCount: Number(stat._count?.id) || 0,
      totalAmount: Number(stat._sum?.amount) || 0,
    }));

    console.log("[debug/all-orders] Summary generated:", {
      totalOrders: allOrders.length,
      uniqueUsers: ordersByUser.length,
    });

    return handleSuccess({
      totalOrders: allOrders.length,
      allOrders,
      ordersByUser,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[debug/all-orders] Unexpected error:", {
      message: error?.message,
      stack: error?.stack,
    });
    return handleError(
      "Failed to generate debug report - please try again",
      500,
      error
    );
  }
}
