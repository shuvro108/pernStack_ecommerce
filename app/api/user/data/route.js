import connectDB from "@/config/db.js";
import { clerkClient, getAuth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    let { userId } = getAuth(request);
    const hasAuthHeader = !!request.headers.get("authorization");
    const hasCookie = !!request.headers.get("cookie");
    // Temporary auth diagnostics (no secrets logged)
    console.log("[api/user/data] auth debug:", {
      userIdPresent: !!userId,
      hasAuthHeader,
      hasCookie,
      method: request.method,
      url: request.url,
    });

    if (!userId) {
      const cu = await currentUser();
      if (cu?.id) {
        userId = cu.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          hint: "No Clerk userId found for this request.",
        },
        { status: 401 }
      );
    }

    // ============================================
    // CHECK SELLER STATUS EARLY (no DB needed)
    // ============================================
    let isSeller = false;
    try {
      console.log(
        "[SELLER_CHECK] Starting seller status check for userId:",
        userId
      );
      console.log(
        "[SELLER_CHECK] SELLER_EMAILS env:",
        process.env.SELLER_EMAILS
      );

      const clerk = await clerkClient();
      console.log("[SELLER_CHECK] Clerk client initialized");

      const clerkUser = await clerk.users.getUser(userId);
      console.log("[SELLER_CHECK] Clerk user fetched:", {
        id: clerkUser?.id,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress,
        publicMetadata: clerkUser?.publicMetadata,
      });

      const role = clerkUser?.publicMetadata?.role;
      console.log("[SELLER_CHECK] Role from metadata:", role);

      const rawEmailList = process.env.SELLER_EMAILS || "";
      console.log("[SELLER_CHECK] Raw SELLER_EMAILS:", rawEmailList);

      const allowlist = rawEmailList
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
      console.log("[SELLER_CHECK] Parsed allowlist:", allowlist);

      const email = clerkUser?.emailAddresses?.[0]?.emailAddress?.toLowerCase();
      console.log("[SELLER_CHECK] User email (lowercase):", email);

      const isAllowlisted = email ? allowlist.includes(email) : false;
      console.log("[SELLER_CHECK] Is allowlisted?:", isAllowlisted);

      isSeller = role === "seller" || isAllowlisted;
      console.log("[SELLER_CHECK] Final isSeller decision:", isSeller, {
        roleMatch: role === "seller",
        allowlistMatch: isAllowlisted,
      });

      if (isSeller) {
        console.log("[SELLER_CHECK] ✓ User IS seller");
      } else {
        console.log("[SELLER_CHECK] ✗ User is NOT seller");
      }
    } catch (e) {
      console.log("[SELLER_CHECK] ERROR:", e.message);
    }

    // ============================================
    // CONTINUE WITH DB (even if it fails, we have seller status)
    // ============================================
    let user = null;
    try {
      await connectDB();
    } catch (dbConnectError) {
      console.log(
        "[api/user/data] DB connection failed, continuing without DB:",
        dbConnectError.message
      );
    }

    if (!user) {
      // Try to fetch from DB
      try {
        user = await prisma.user.findUnique({ where: { id: userId } });
      } catch (dbError) {
        console.log("[api/user/data] DB query failed:", dbError.message);
      }
    }

    if (!user) {
      // User not in DB; build from session
      const cu = await currentUser();
      if (cu) {
        const { id, firstName, lastName, emailAddresses, imageUrl, username } =
          cu;
        const primaryEmail = emailAddresses?.[0]?.emailAddress;

        if (!primaryEmail) {
          return NextResponse.json(
            { success: false, message: "User missing primary email" },
            { status: 400 }
          );
        }

        const fullName = `${firstName || ""} ${lastName || ""}`.trim();
        const name = fullName || username || primaryEmail || "User";
        const safeImageUrl =
          imageUrl || "https://www.gravatar.com/avatar/?d=mp";

        // Try to create in DB, but don't fail if DB is down
        try {
          const created = await prisma.user.create({
            data: {
              id,
              name,
              email: primaryEmail,
              imageUrl: safeImageUrl,
              cartItems: {},
            },
          });
          user = created;
        } catch (dbCreateError) {
          console.log(
            "[api/user/data] Could not create user in DB:",
            dbCreateError.message
          );
          // Create a minimal user object without saving to DB
          user = {
            id,
            name,
            email: primaryEmail,
            imageUrl: safeImageUrl,
          };
        }
      } else {
        // Last resort: try to fetch from Clerk and create
        try {
          const clerk = await clerkClient();
          const clerkUser = await clerk.users.getUser(userId);
          if (clerkUser) {
            const {
              id,
              firstName,
              lastName,
              emailAddresses,
              imageUrl,
              username,
            } = clerkUser;
            const primaryEmail = emailAddresses?.[0]?.emailAddress;
            if (!primaryEmail) {
              return NextResponse.json(
                { success: false, message: "User missing primary email" },
                { status: 400 }
              );
            }
            const fullName = `${firstName || ""} ${lastName || ""}`.trim();
            const name = fullName || username || primaryEmail || "User";
            const safeImageUrl =
              imageUrl || "https://www.gravatar.com/avatar/?d=mp";
            user = { id, name, email: primaryEmail, imageUrl: safeImageUrl };
          }
        } catch (clerkError) {
          console.log(
            "[api/user/data] Could not fetch from Clerk:",
            clerkError.message
          );
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    console.log("Final user data being returned:", {
      userId: user.id,
      isSeller: isSeller,
    });

    return NextResponse.json(
      {
        success: true,
        user,
        isSeller: isSeller,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("[api/user/data] Final error:", error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
