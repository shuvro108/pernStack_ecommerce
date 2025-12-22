import prisma from "@/lib/prisma";

let cached = globalThis.__prisma_cached__;

if (!cached) {
  cached = globalThis.__prisma_cached__ = {
    conn: null,
    promise: null,
    lastConnectTime: null,
    isConnecting: false,
  };
}

/**
 * Connect to database with error handling and caching
 * Ensures single connection instance and proper cleanup
 * @throws {Error} If connection fails
 * @returns {Promise<PrismaClient>} Prisma client instance
 */
async function connectDB() {
  // 1. Return cached connection if available
  if (cached.conn) {
    console.log("[DB] Using cached connection");
    return cached.conn;
  }

  // 2. If connection attempt is already in progress, wait for it
  if (cached.promise) {
    console.log("[DB] Waiting for in-progress connection");
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (err) {
      // Clear the failed promise
      cached.promise = null;
      throw err;
    }
  }

  // 3. Attempt new connection
  console.log("[DB] Initiating new database connection");
  cached.isConnecting = true;
  cached.lastConnectTime = Date.now();

  try {
    cached.promise = prisma
      .$connect()
      .then(() => {
        console.log("[DB] Connection successful");
        cached.isConnecting = false;
        return prisma;
      })
      .catch((err) => {
        console.error("[DB] Connection failed:", {
          message: err?.message,
          code: err?.code,
          timestamp: new Date().toISOString(),
        });
        cached.isConnecting = false;
        cached.promise = null; // Clear failed promise
        throw err;
      });

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.isConnecting = false;
    throw new Error(`Database connection failed: ${error?.message || error}`);
  }
}

/**
 * Disconnect from database (for cleanup)
 * @returns {Promise<void>}
 */
async function disconnectDB() {
  if (cached.conn) {
    console.log("[DB] Disconnecting from database");
    await prisma.$disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}

/**
 * Get connection status
 * @returns {object} Status information
 */
function getConnectionStatus() {
  return {
    isConnected: !!cached.conn,
    isConnecting: cached.isConnecting,
    lastConnectTime: cached.lastConnectTime,
    age: cached.lastConnectTime ? Date.now() - cached.lastConnectTime : null,
  };
}

export default connectDB;
export { disconnectDB, getConnectionStatus };
