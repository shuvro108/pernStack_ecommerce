/**
 * Centralized API utilities for error handling, validation, and response formatting
 * Ensures consistent error handling across all routes
 */

import { NextResponse } from "next/server";

/**
 * Standard error response handler
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {Error} error - Optional error object for logging
 * @returns {NextResponse}
 */
export const handleError = (message, status = 500, error = null) => {
  if (error) {
    console.error(`[API Error ${status}]`, {
      message,
      errorMessage: error?.message,
      errorStack: error?.stack,
      timestamp: new Date().toISOString(),
    });
  }
  return NextResponse.json(
    { success: false, message: message || "Internal Server Error" },
    { status }
  );
};

/**
 * Standard success response handler
 * @param {object} data - Response data
 * @param {number} status - HTTP status code
 * @returns {NextResponse}
 */
export const handleSuccess = (data, status = 200) => {
  return NextResponse.json({ success: true, ...data }, { status });
};

/**
 * Validate user authentication
 * @param {string} userId - User ID from auth
 * @returns {boolean}
 */
export const validateUserId = (userId) => {
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    return false;
  }
  return true;
};

/**
 * Validate numeric ID (for products, orders, addresses)
 * @param {any} id - ID to validate
 * @returns {boolean|number} - Returns the number if valid, false otherwise
 */
export const validateNumericId = (id) => {
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return false;
  }
  return numId;
};

/**
 * Validate quantity for cart/order items
 * @param {any} quantity - Quantity value
 * @param {number} min - Minimum allowed (default 0)
 * @param {number} max - Maximum allowed (default 10000)
 * @returns {boolean|number} - Returns the quantity if valid, false otherwise
 */
export const validateQuantity = (quantity, min = 0, max = 10000) => {
  const qty = Number(quantity);
  // Allow 0 for removal, so use < instead of <=
  if (!Number.isInteger(qty) || qty < min || qty > max) {
    return false;
  }
  return qty;
};

/**
 * Validate price/amount value
 * @param {any} price - Price value
 * @returns {boolean|number} - Returns the number if valid, false otherwise
 */
export const validatePrice = (price) => {
  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum < 0) {
    return false;
  }
  return parseFloat(priceNum.toFixed(2));
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate non-empty string
 * @param {any} str - String to validate
 * @param {number} minLength - Minimum length (default 1)
 * @param {number} maxLength - Maximum length (default 1000)
 * @returns {boolean}
 */
export const validateString = (str, minLength = 1, maxLength = 1000) => {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  return trimmed.length >= minLength && trimmed.length <= maxLength;
};

/**
 * Validate array
 * @param {any} arr - Array to validate
 * @param {number} minLength - Minimum length (default 1)
 * @returns {boolean}
 */
export const validateArray = (arr, minLength = 1) => {
  return Array.isArray(arr) && arr.length >= minLength;
};

/**
 * Validate order items structure
 * @param {any} items - Items array
 * @returns {boolean|array} - Returns sanitized items if valid, false otherwise
 */
export const validateOrderItems = (items) => {
  if (!validateArray(items, 1)) {
    return false;
  }

  const sanitized = items.map((item) => {
    const productId = validateNumericId(item?.product);
    const quantity = validateQuantity(item?.quantity);

    if (productId === false || quantity === false) {
      return null;
    }

    return {
      product: productId,
      quantity: quantity,
    };
  });

  // Check if any items are invalid
  if (sanitized.some((item) => item === null)) {
    return false;
  }

  return sanitized;
};

/**
 * Convert BigInt fields to strings for JSON serialization
 * @param {object} obj - Object to sanitize
 * @param {array} bigIntFields - Fields that contain BigInt
 * @returns {object} - Sanitized object
 */
export const sanitizeBigInt = (obj, bigIntFields = []) => {
  if (!obj) return obj;

  const sanitized = { ...obj };
  bigIntFields.forEach((field) => {
    if (sanitized[field] !== undefined && sanitized[field] !== null) {
      sanitized[field] = String(sanitized[field]);
    }
  });

  return sanitized;
};

/**
 * Convert an array of objects, sanitizing BigInt fields
 * @param {array} items - Array of objects
 * @param {array} bigIntFields - Fields that contain BigInt
 * @returns {array} - Sanitized array
 */
export const sanitizeArray = (items, bigIntFields = []) => {
  if (!Array.isArray(items)) return [];

  return items.map((item) => sanitizeBigInt(item, bigIntFields));
};

/**
 * Safe database operation wrapper
 * Handles common database errors with meaningful messages
 * @param {function} operation - Async function to execute
 * @param {string} operationName - Name of operation for logging
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const safeDbOperation = async (
  operation,
  operationName = "Database Operation"
) => {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorMessage = error?.message || "Unknown database error";
    const errorCode = error?.code || "DB_ERROR";

    console.error(`[${operationName}] Failed:`, {
      code: errorCode,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    // Handle specific Prisma errors
    if (errorCode === "P2002") {
      return {
        success: false,
        error: "Unique constraint violation - this record already exists",
      };
    } else if (errorCode === "P2025") {
      return {
        success: false,
        error: "Record not found",
      };
    } else if (errorCode === "P2003") {
      return {
        success: false,
        error: "Foreign key constraint violation - referenced record not found",
      };
    } else if (error?.name === "PrismaClientInitializationError") {
      return {
        success: false,
        error: "Database connection failed - please try again",
      };
    }

    return {
      success: false,
      error: "Database operation failed",
    };
  }
};

/**
 * Verify request method
 * @param {string} request - Request object
 * @param {array} allowedMethods - Allowed HTTP methods
 * @returns {boolean}
 */
export const validateRequestMethod = (request, allowedMethods = []) => {
  if (!allowedMethods.includes(request.method)) {
    return false;
  }
  return true;
};

/**
 * Safe JSON parsing
 * @param {string} jsonString - JSON string to parse
 * @returns {object|false} - Parsed object or false if invalid
 */
export const safeJsonParse = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return false;
  }
};

/**
 * Status enum constants
 */
export const ORDER_STATUSES = {
  ORDER_PLACED: "ORDER_PLACED",
  PROCESSING: "PROCESSING",
  SHIPPED: "SHIPPED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

/**
 * Display status mapping
 */
export const STATUS_DISPLAY_MAP = {
  ORDER_PLACED: "Order Placed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

/**
 * Reverse mapping for status validation
 */
export const DISPLAY_TO_STATUS_MAP = {
  "Order Placed": ORDER_STATUSES.ORDER_PLACED,
  Processing: ORDER_STATUSES.PROCESSING,
  Shipped: ORDER_STATUSES.SHIPPED,
  "Out for Delivery": ORDER_STATUSES.OUT_FOR_DELIVERY,
  Delivered: ORDER_STATUSES.DELIVERED,
  Cancelled: ORDER_STATUSES.CANCELLED,
};

/**
 * Validate order status
 * @param {string} status - Status to validate
 * @param {boolean} isDisplayFormat - If true, validates display format; otherwise validates enum format
 * @returns {string|false} - Valid status in enum format, or false
 */
export const validateOrderStatus = (status, isDisplayFormat = true) => {
  if (!status || typeof status !== "string") return false;

  if (isDisplayFormat) {
    return DISPLAY_TO_STATUS_MAP[status] || false;
  }

  return Object.values(ORDER_STATUSES).includes(status) ? status : false;
};

/**
 * Ensure Prisma client is properly initialized
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {boolean}
 */
export const validatePrismaClient = (prisma) => {
  if (!prisma) {
    console.error("[Prisma] Client is null or undefined");
    return false;
  }
  return true;
};
