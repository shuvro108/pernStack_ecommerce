import { currentUser } from "@clerk/nextjs/server";

/**
 * Verify if user has seller permissions
 * Checks against both Clerk metadata and environment-based allowlist
 * @param {string} userId - User ID from auth context
 * @returns {Promise<boolean>} True if user is authorized seller
 */
const authSeller = async (userId) => {
  try {
    // 1. Validate userId parameter
    if (!userId || typeof userId !== "string") {
      console.warn("[authSeller] Invalid userId provided:", { userId });
      return false;
    }

    // 2. Get current user from Clerk session
    const user = await currentUser();
    console.log("[authSeller] User session check:", {
      id: user?.id,
      email: user?.emailAddresses?.[0]?.emailAddress,
      publicMetadata: user?.publicMetadata,
    });

    if (!user) {
      console.warn("[authSeller] No user found in Clerk session");
      return false;
    }

    // 3. Verify userId matches Clerk session user
    if (user.id !== userId) {
      console.warn("[authSeller] User ID mismatch:", {
        sessionUserId: user.id,
        providedUserId: userId,
      });
      return false;
    }

    // 4. Check Clerk metadata role
    const roleMatch = user?.publicMetadata?.role === "seller";
    console.log("[authSeller] Clerk role check:", {
      role: user?.publicMetadata?.role,
      isSeller: roleMatch,
    });

    if (roleMatch) {
      console.log("[authSeller] User authorized via Clerk metadata");
      return true;
    }

    // 5. Check environment-based seller allowlist
    const rawEmailList = process.env.SELLER_EMAILS || "";

    if (!rawEmailList.trim()) {
      console.warn("[authSeller] No SELLER_EMAILS configured in environment");
      return false;
    }

    const allowlist = rawEmailList
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    console.log("[authSeller] Parsed seller allowlist:", {
      count: allowlist.length,
    });

    // 6. Check if user email is in allowlist
    const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase();

    if (!email) {
      console.warn("[authSeller] User has no email address");
      return false;
    }

    const isAllowlisted = allowlist.includes(email);
    console.log("[authSeller] Email allowlist check:", {
      email: email,
      isAllowlisted: isAllowlisted,
    });

    if (isAllowlisted) {
      console.log("[authSeller] User authorized via email allowlist");
      return true;
    }

    console.warn("[authSeller] User not authorized as seller", {
      userId,
      email,
    });
    return false;
  } catch (error) {
    console.error("[authSeller] Unexpected error:", {
      message: error?.message,
      stack: error?.stack,
    });
    return false;
  }
};

export default authSeller;
