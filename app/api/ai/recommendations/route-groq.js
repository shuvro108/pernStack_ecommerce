import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import GroqAIManager from "@/lib/groqAiManager";

function getCacheKey(userId, productId, limit) {
  return `recommendations:${userId || "guest"}:${productId || "home"}:${limit}`;
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
          message: "Rate limit reached. Please try again later.",
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

    let currentProduct = null;
    let currentCategory = "Pottery & Ceramics";

    // Get current product details if productId provided
    if (productId) {
      currentProduct = allProducts.find((p) => p.id === parseInt(productId));
      if (currentProduct) {
        currentCategory = currentProduct.category;
      }
    }

    // Get recommendations from Groq AI
    try {
      const result = await GroqAIManager.generateRecommendations(
        currentProduct?.name || "Popular items",
        currentCategory,
        [], // user history - simplified
        allProducts,
      );

      const recommendations = result.recommendations || [];
      const cacheData = {
        recommendations,
        source: result.source,
      };

      GroqAIManager.setCache(cacheKey, cacheData);

      return NextResponse.json(cacheData);
    } catch (error) {
      console.error("[Recommendations AI Error]:", error);

      // Fallback: Return products from same category
      const fallback = GroqAIManager.generateFallbackRecommendations(
        currentCategory,
        allProducts,
      );

      const cacheData = {
        recommendations: fallback.recommendations,
        source: "fallback",
      };

      GroqAIManager.setCache(cacheKey, cacheData);

      return NextResponse.json(cacheData);
    }
  } catch (error) {
    console.error("Recommendations Error:", error);
    return NextResponse.json(
      {
        error: "Failed to get recommendations",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
