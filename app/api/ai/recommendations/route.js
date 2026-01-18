import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import GroqAIManager from "@/lib/groqAiManager";

function getCacheKey(userId, productId, limit) {
  return `recommendations:${userId || "guest"}:${productId || "home"}:${limit}`;
}

function getVariedRecommendations(
  currentProduct,
  allProducts,
  userContext,
  limit,
) {
  if (!currentProduct) {
    return allProducts.slice(0, limit);
  }

  // Start with products from the same category, excluding current product
  let recommendations = allProducts.filter(
    (p) => p.category === currentProduct.category && p.id !== currentProduct.id,
  );

  // If user has purchase history, prioritize products they haven't bought
  if (userContext?.purchasedIds?.length > 0) {
    const recommendedFirst = recommendations.filter(
      (p) => !userContext.purchasedIds.includes(p.id),
    );
    const alreadyBought = recommendations.filter((p) =>
      userContext.purchasedIds.includes(p.id),
    );
    recommendations = [...recommendedFirst, ...alreadyBought];
  }

  // If not enough from same category, add from other categories
  if (recommendations.length < limit) {
    const otherCategories = allProducts.filter(
      (p) =>
        p.category !== currentProduct.category && p.id !== currentProduct.id,
    );

    // Exclude already purchased if possible
    if (userContext?.purchasedIds?.length > 0) {
      const notBought = otherCategories.filter(
        (p) => !userContext.purchasedIds.includes(p.id),
      );
      recommendations = [
        ...recommendations,
        ...notBought,
        ...otherCategories.filter((p) =>
          userContext.purchasedIds.includes(p.id),
        ),
      ];
    } else {
      recommendations = [...recommendations, ...otherCategories];
    }
  }

  // Shuffle for variety (Fisher-Yates shuffle)
  const shuffled = recommendations.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, limit);
}

export async function GET(req) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "6");

    // Check cache first
    const cacheKey = getCacheKey(userId, productId, limit);
    const cachedRecs = GroqAIManager.getCache(cacheKey);
    if (cachedRecs) {
      return NextResponse.json({
        ...cachedRecs,
        cached: true,
      });
    }

    // Check rate limit
    const rateLimit = GroqAIManager.checkRateLimit(
      `recommendations:${userId || "guest"}`,
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          message: "Rate limit reached. Using cached recommendations.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 200,
          headers: { "Retry-After": rateLimit.retryAfter.toString() },
        },
      );
    }

    // Fetch all products
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        price: true,
      },
    });

    if (allProducts.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    let userContext = {};

    // If user is logged in, get their purchase history
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          orders: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          recentViews: {
            take: 10,
            include: {
              product: true,
            },
          },
        },
      });

      if (user) {
        if (user.orders.length > 0) {
          const purchasedProducts = user.orders.flatMap((order) =>
            order.items.map((item) => item.product),
          );

          const categories = [
            ...new Set(purchasedProducts.map((p) => p.category)),
          ];
          const avgPrice =
            purchasedProducts.reduce((sum, p) => sum + parseFloat(p.price), 0) /
            purchasedProducts.length;

          userContext.purchaseHistory = `User has purchased ${purchasedProducts.length} items from categories: ${categories.join(", ")}. Average price range: ৳${Math.round(avgPrice)}.`;
          userContext.purchasedIds = purchasedProducts.map((p) => p.id);
        }

        if (user.recentViews && user.recentViews.length > 0) {
          userContext.recentViews = user.recentViews;
          userContext.viewedIds = user.recentViews.map((v) => v.product.id);
        }
      }
    }

    // If viewing a specific product, add context
    let currentProductContext = "";
    if (productId) {
      const currentProduct = allProducts.find((p) => p.id === productId);
      if (currentProduct) {
        currentProductContext = `User is currently viewing: ${currentProduct.name} (${currentProduct.category}, ৳${currentProduct.price})`;
      }
    }

    try {
      // Get current product
      const currentProduct = allProducts.find(
        (p) => p.id === parseInt(productId),
      );
      if (!currentProduct) throw new Error("Product not found");

      let recResult;

      // Try Groq AI first (Primary)
      try {
        recResult = await GroqAIManager.generateRecommendationsWithGroq(
          currentProduct,
          userContext.purchaseHistory || "",
          allProducts,
        );
        console.log("✅ Using Groq AI for recommendations");
      } catch (groqError) {
        console.log("⚠️ Groq failed, trying Gemini:", groqError.message);

        // Try Gemini AI (Backup)
        try {
          recResult = await GroqAIManager.generateRecommendationsWithGemini(
            currentProduct,
            userContext.purchaseHistory || "",
            allProducts,
          );
          console.log("✅ Using Gemini AI for recommendations");
        } catch (geminiError) {
          console.log("⚠️ Gemini failed, using local:", geminiError.message);
          throw new Error("All AI services unavailable");
        }
      }

      const result_data = {
        recommendations: recResult.recommendations.slice(0, limit),
        source: recResult.source,
        model: recResult.model,
      };

      GroqAIManager.setCache(cacheKey, result_data);
      return NextResponse.json(result_data);
    } catch (error) {
      console.error("AI Error, using personalized fallback:", error.message);

      const currentProduct = allProducts.find(
        (p) => p.id === parseInt(productId),
      );

      const variedRecs = getVariedRecommendations(
        currentProduct,
        allProducts,
        userContext,
        limit,
      );

      return NextResponse.json({
        recommendations: variedRecs,
        source: "personalized-local",
        message: "Using smart local recommendations",
      });
    }
  } catch (error) {
    console.error("AI Recommendations Error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate recommendations",
        details: error.message,
        recommendations: [],
      },
      { status: 500 },
    );
  }
}
