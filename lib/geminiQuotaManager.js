/**
 * Gemini API Quota Manager
 * Handles rate limiting, caching, and fallback strategies
 */

const cache = new Map();
const requestLogs = new Map();

const CACHE_TTL = 3600000; // 1 hour
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 2; // Conservative limit for free tier

export const QuotaManager = {
  /**
   * Check if request is allowed based on rate limits
   */
  checkRateLimit(key = "global") {
    const now = Date.now();
    const logKey = `rate-limit:${key}`;

    if (!requestLogs.has(logKey)) {
      requestLogs.set(logKey, [now]);
      return { allowed: true, remaining: MAX_REQUESTS_PER_MINUTE - 1 };
    }

    const timestamps = requestLogs.get(logKey);
    const recentTimestamps = timestamps.filter(
      (t) => now - t < RATE_LIMIT_WINDOW,
    );

    if (recentTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.ceil(
          (recentTimestamps[0] + RATE_LIMIT_WINDOW - now) / 1000,
        ),
      };
    }

    recentTimestamps.push(now);
    requestLogs.set(logKey, recentTimestamps);
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_MINUTE - recentTimestamps.length,
    };
  },

  /**
   * Get cached data if available
   */
  getCache(key) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    if (cached) {
      cache.delete(key);
    }
    return null;
  },

  /**
   * Set cache data
   */
  setCache(key, data) {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  },

  /**
   * Clear cache for a specific key
   */
  clearCache(key) {
    cache.delete(key);
  },

  /**
   * Clear all cache
   */
  clearAllCache() {
    cache.clear();
  },

  /**
   * Handle Gemini API errors gracefully
   */
  handleGeminiError(error) {
    const status = error.status || error.statusCode || error.code || 500;
    const message = error.message || JSON.stringify(error);

    console.log("Error details:", { status, message, errorObj: error });

    // Check for quota exceeded in error message or status
    const isQuotaError =
      status === 429 ||
      message.includes("Quota") ||
      message.includes("quota") ||
      message.includes("limit") ||
      message.includes("429") ||
      (error.errorDetails &&
        error.errorDetails.some((d) => d["@type"]?.includes("QuotaFailure")));

    if (isQuotaError) {
      return {
        isQuotaExceeded: true,
        message: "API quota exceeded. Using fallback method.",
        retryAfter: 60,
      };
    }

    if (status === 503 || status === 500 || message.includes("unavailable")) {
      return {
        isServiceUnavailable: true,
        message: "API service temporarily unavailable. Using fallback method.",
        retryAfter: 30,
      };
    }

    if (status === 401 || message.includes("authentication")) {
      return {
        isAuthError: true,
        message: "Authentication failed. Please check your API key.",
        retryAfter: 60,
      };
    }

    return {
      isError: true,
      message: `Error: ${message}`,
      retryAfter: 10,
    };
  },

  /**
   * Generate fallback response when API quota is exceeded
   */
  generateFallbackSearch(query, products) {
    // Simple keyword-based fallback search
    const keywords = query.toLowerCase().split(" ");
    const scored = products.map((p) => {
      let score = 0;
      const searchText =
        `${p.name} ${p.description} ${p.category}`.toLowerCase();

      keywords.forEach((keyword) => {
        if (keyword.length > 2) {
          const matches = (searchText.match(new RegExp(keyword, "g")) || [])
            .length;
          score += matches * 10;
        }
      });

      return { ...p, score };
    });

    const results = scored
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(({ score, ...p }) => p);

    return {
      products: results,
      explanation: `Keyword-based search results for "${query}". (AI service temporarily unavailable)`,
      isAI: false,
      totalResults: results.length,
    };
  },

  /**
   * Generate fallback recommendations based on browsing pattern
   */
  generateFallbackRecommendations(userContext, allProducts) {
    if (
      !userContext ||
      !userContext.recentViews ||
      userContext.recentViews.length === 0
    ) {
      // Return popular products as fallback
      return allProducts.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        reason: "Popular item",
      }));
    }

    // Recommend products from similar categories
    const viewedCategories = new Set();
    userContext.recentViews.forEach((v) => {
      if (v.product && v.product.category) {
        viewedCategories.add(v.product.category);
      }
    });

    const recommendations = allProducts
      .filter(
        (p) =>
          viewedCategories.has(p.category) &&
          !userContext.recentViews.some((v) => v.product.id === p.id),
      )
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        reason: `Similar to items you've viewed`,
      }));

    return recommendations;
  },

  /**
   * Generate fallback demand forecast when API is unavailable
   */
  generateFallbackForecast(topProducts, topCategories, recentOrders) {
    const totalRevenue = recentOrders.reduce((sum, order) => {
      return (
        sum +
        order.items.reduce(
          (s, item) => s + parseFloat(item.product.price) * item.quantity,
          0,
        )
      );
    }, 0);

    return {
      insights: [
        {
          title: "Top Performing Products",
          description: `Your best sellers are: ${topProducts.map((p) => p.name).join(", ")}`,
          type: "success",
          priority: "high",
        },
        {
          title: "Strong Categories",
          description: `Focus on: ${topCategories.map((c) => c.name).join(", ")}`,
          type: "info",
          priority: "high",
        },
      ],
      trends: {
        growing: topProducts.slice(0, 3).map((p) => p.name),
        declining: [],
        seasonal: [],
      },
      recommendations: [
        {
          title: "Increase Stock",
          action: "Stock up on your top-performing items",
          impact: "Higher availability = more sales",
          priority: "high",
        },
        {
          title: "Expand Categories",
          action: `Focus marketing on your top categories: ${topCategories.map((c) => c.name).join(", ")}`,
          impact: "Leverage existing demand",
          priority: "medium",
        },
      ],
      forecast: {
        nextWeek: {
          estimatedOrders: Math.ceil((recentOrders.length / 90) * 7),
          estimatedRevenue: Math.ceil((totalRevenue / 90) * 7),
          confidence: "medium",
        },
        nextMonth: {
          estimatedOrders: Math.ceil((recentOrders.length / 90) * 30),
          estimatedRevenue: Math.ceil((totalRevenue / 90) * 30),
          confidence: "low",
        },
      },
      isAI: false,
      message:
        "This forecast was generated using statistical analysis. AI analysis is temporarily unavailable.",
    };
  },
};

export default QuotaManager;
