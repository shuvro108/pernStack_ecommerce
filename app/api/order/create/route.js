import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";
import { inngest } from "@/config/inngest";
import {
  handleError,
  handleSuccess,
  validateUserId,
  validateNumericId,
  validateQuantity,
  validateArray,
  validateOrderItems,
  sanitizeBigInt,
  safeDbOperation,
  validatePrismaClient,
} from "@/lib/apiUtils";

export async function POST(request) {
  try {
    // 1. Validate authentication
    const { userId } = getAuth(request);
    console.log("[order/create] Authentication check:", { userId });

    if (!validateUserId(userId)) {
      return handleError("Authentication required", 401);
    }

    // 2. Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      return handleError("Invalid request body - JSON parse failed", 400);
    }

    const { items, address } = requestBody;

    // 3. Validate address
    const addressIdNum = validateNumericId(address);
    if (addressIdNum === false) {
      return handleError("Valid address ID is required", 400);
    }

    // 4. Validate items array structure
    const validatedItems = validateOrderItems(items);
    if (validatedItems === false) {
      return handleError(
        "Items array is required with valid product IDs and quantities",
        400
      );
    }

    console.log("[order/create] Request validated:", {
      userId,
      itemCount: validatedItems.length,
      addressId: addressIdNum,
    });

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

    // 7. Verify user exists
    const userCheck = await safeDbOperation(
      () => prisma.user.findUnique({ where: { id: userId } }),
      "Fetch user for order creation"
    );

    if (!userCheck.success || !userCheck.data) {
      return handleError("User not found", 404);
    }

    // 8. Verify address belongs to user
    const addressCheck = await safeDbOperation(
      () =>
        prisma.address.findFirst({
          where: { id: addressIdNum, userId },
        }),
      "Validate address ownership"
    );

    if (!addressCheck.success || !addressCheck.data) {
      return handleError("Address not found or does not belong to user", 404);
    }

    // 9. Verify all products exist and calculate amount
    let amount = 0;
    const productIds = validatedItems.map((item) => item.product);

    const productsCheck = await safeDbOperation(
      () =>
        prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, offerPrice: true, price: true },
        }),
      "Fetch products for order"
    );

    if (!productsCheck.success) {
      return handleError("Failed to verify products", 500);
    }

    const productMap = new Map(productsCheck.data.map((p) => [p.id, p]));

    // Verify all products exist
    for (const item of validatedItems) {
      if (!productMap.has(item.product)) {
        return handleError(`Product ${item.product} not found`, 404);
      }
      const product = productMap.get(item.product);
      amount +=
        Number(product.offerPrice || product.price || 0) * item.quantity;
    }

    // 10. Calculate total amount with tax
    let queued = true;
    const taxAmount = Math.floor(amount * 0.02);
    const totalAmount = amount + taxAmount;

    // 11. Attempt to queue order in Inngest
    let createdOrder = null;

    try {
      console.log("[order/create] Sending to Inngest queue");
      await inngest.send({
        name: "order/created",
        data: {
          userId,
          items: validatedItems,
          amount: totalAmount,
          addressId: addressIdNum,
          date: Date.now(),
        },
      });

      console.log("[order/create] Successfully queued in Inngest");
    } catch (inngestErr) {
      queued = false;
      console.warn(
        "[order/create] Inngest queue failed, using direct DB save",
        {
          error: inngestErr.message,
        }
      );

      // 12. Fallback: Create order directly in database
      const dbCreate = await safeDbOperation(
        () =>
          prisma.order.create({
            data: {
              userId,
              amount: totalAmount,
              addressId: addressIdNum,
              date: BigInt(Date.now()),
              status: "ORDER_PLACED",
              items: {
                create: validatedItems.map((it) => ({
                  productId: it.product,
                  quantity: it.quantity,
                })),
              },
            },
            include: { items: true },
          }),
        "Create order (direct DB fallback)"
      );

      if (!dbCreate.success) {
        return handleError("Failed to create order", 500);
      }

      createdOrder = dbCreate.data;
    }

    // 13. If Inngest succeeded, try to create order in DB as well
    // (Inngest event should handle this, but we can also create synchronously for safety)
    if (queued && !createdOrder) {
      const dbCreate = await safeDbOperation(
        () =>
          prisma.order.create({
            data: {
              userId,
              amount: totalAmount,
              addressId: addressIdNum,
              date: BigInt(Date.now()),
              status: "ORDER_PLACED",
              items: {
                create: validatedItems.map((it) => ({
                  productId: it.product,
                  quantity: it.quantity,
                })),
              },
            },
            include: { items: true },
          }),
        "Create order"
      );

      if (!dbCreate.success) {
        console.error(
          "[order/create] Order creation in DB failed despite Inngest queue"
        );
        return handleError("Order queued but database save failed", 500);
      }

      createdOrder = dbCreate.data;
    }

    // 14. Clear user's cart
    const cartUpdate = await safeDbOperation(
      () =>
        prisma.user.update({
          where: { id: userId },
          data: { cartItems: {} },
        }),
      "Clear user cart after order creation"
    );

    if (!cartUpdate.success) {
      console.warn(
        "[order/create] Failed to clear cart, but order was created"
      );
      // Don't fail here - order was successfully created
    }

    // 15. Return success response
    return handleSuccess(
      {
        message: queued
          ? "Order created successfully and queued for processing"
          : "Order created successfully (processed directly)",
        orderId: createdOrder?.id || null,
        queued,
      },
      queued ? 200 : 201
    );
  } catch (error) {
    console.error("[order/create] Unexpected error:", {
      message: error?.message,
      stack: error?.stack,
    });
    return handleError("Failed to create order - please try again", 500, error);
  }
}
