import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

/**
 * Instantiate Prisma Client with proper error handling
 * Ensures single instance across hot-reloads in development
 */
const getPrismaClient = () => {
  // Return cached instance if available
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  // Create new instance with appropriate logging
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });

  // Add error handlers
  client.$on("error", (event) => {
    console.error("[Prisma Error Event]:", {
      target: event.target,
      timestamp: new Date().toISOString(),
    });
  });

  // Cache in global scope for development to prevent multiple instances
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
};

const prisma = getPrismaClient();

// Graceful disconnection on process termination
process.on("SIGINT", async () => {
  console.log("[Prisma] Disconnecting on SIGINT");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("[Prisma] Disconnecting on SIGTERM");
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
