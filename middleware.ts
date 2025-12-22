import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  "/api/order(.*)",
  "/api/cart(.*)",
  "/api/user(.*)",
  "/api/review/add(.*)",
  "/seller(.*)",
  "/my-orders(.*)",
  "/cart(.*)",
  "/order-placed(.*)",
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  "/api/admin(.*)",
  "/admin(.*)",
  "/api/order/seller-orders(.*)",
  "/api/product/seller-list(.*)",
  "/seller(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    // 1. Check if route is protected
    if (isProtectedRoute(req)) {
      // Protect the route - require authentication
      try {
        const { userId } = await auth();

        if (!userId) {
          console.warn(
            "[Middleware] Unauthorized access attempt to protected route:",
            {
              path: req.nextUrl.pathname,
              method: req.method,
            }
          );

          return NextResponse.json(
            {
              success: false,
              message: "Authentication required",
            },
            { status: 401 }
          );
        }
      } catch (authError) {
        console.error("[Middleware] Authentication error:", {
          path: req.nextUrl.pathname,
          error: authError?.message,
        });

        return NextResponse.json(
          {
            success: false,
            message: "Authentication service unavailable",
          },
          { status: 503 }
        );
      }
    }

    // 2. For admin routes, additional verification could be added
    // (This is handled at the route level via authSeller middleware)

    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Unexpected error:", {
      message: error?.message,
      path: req.nextUrl.pathname,
      stack: error?.stack,
    });

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
