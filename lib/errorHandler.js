/**
 * Global error handling utilities for the application
 * Provides consistent error responses and logging across the app
 */

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: "LOW", // Non-critical, can be ignored
  MEDIUM: "MEDIUM", // Should be fixed but doesn't break functionality
  HIGH: "HIGH", // Breaks functionality
  CRITICAL: "CRITICAL", // Breaks entire feature or system
};

/**
 * Error categories for better error handling
 */
export const ERROR_CATEGORIES = {
  AUTH: "AUTHENTICATION",
  VALIDATION: "VALIDATION",
  DATABASE: "DATABASE",
  NETWORK: "NETWORK",
  FILE_UPLOAD: "FILE_UPLOAD",
  EXTERNAL_SERVICE: "EXTERNAL_SERVICE",
  INTERNAL: "INTERNAL_ERROR",
};

/**
 * Structured error class for consistent error handling
 */
export class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    category = ERROR_CATEGORIES.INTERNAL,
    severity = ERROR_SEVERITY.HIGH,
    details = null
  ) {
    super(message);
    this.statusCode = statusCode;
    this.category = category;
    this.severity = severity;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON response format
   */
  toJSON() {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.category,
        severity: this.severity,
        timestamp: this.timestamp,
        details: this.details,
      },
    };
  }
}

/**
 * Log error with appropriate context
 */
export const logError = (error, context = {}) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: error?.message,
    category: error?.category || ERROR_CATEGORIES.INTERNAL,
    severity: error?.severity || ERROR_SEVERITY.HIGH,
    statusCode: error?.statusCode || 500,
    context,
    stack: error?.stack,
  };

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[Error]", JSON.stringify(errorLog, null, 2));
  }

  // In production, you might want to send to an external logging service
  // e.g., Sentry, LogRocket, DataDog, etc.
  if (process.env.NODE_ENV === "production") {
    // Send to your logging service
    // sendToLoggingService(errorLog);
  }

  return errorLog;
};

/**
 * Safe error extractor - ensures we always have proper error info
 */
export const extractErrorInfo = (error) => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      category: error.category,
      severity: error.severity,
      details: error.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
      category: ERROR_CATEGORIES.INTERNAL,
      severity: ERROR_SEVERITY.HIGH,
      details: null,
    };
  }

  return {
    message: "An unexpected error occurred",
    statusCode: 500,
    category: ERROR_CATEGORIES.INTERNAL,
    severity: ERROR_SEVERITY.CRITICAL,
    details: null,
  };
};

/**
 * Retry mechanism for failed operations
 */
export const retryOperation = async (
  operation,
  maxRetries = 3,
  delayMs = 1000
) => {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(
        `[Retry] Attempt ${attempt}/${maxRetries} failed:`,
        error.message
      );

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
  }

  throw lastError;
};
