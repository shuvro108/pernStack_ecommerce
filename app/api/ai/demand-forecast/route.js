import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import GroqAIManager from "@/lib/groqAiManager";

function getCacheKey(userId) {
  return `forecast:${userId}`;
}

export async function GET(req) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is seller via Clerk metadata
    const isSeller = user.publicMetadata?.role === "seller";
    console.log("[Demand Forecast] Seller check:", { userId, isSeller });

    if (!isSeller) {
      return NextResponse.json(
        { error: "Unauthorized - Sellers only" },
        { status: 403 },
      );
    }

    // Check cache first
    const cacheKey = getCacheKey(userId);
    const cachedForecast = GroqAIManager.getCache(cacheKey);
    if (cachedForecast) {
      return NextResponse.json({
        ...cachedForecast,
        cached: true,
        note: "Results from cache (updated within last hour)",
      });
    }

    // Check rate limit
    const rateLimit = GroqAIManager.checkRateLimit(`forecast:${userId}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          message: "Forecast generation rate limited. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 200,
          headers: { "Retry-After": rateLimit.retryAfter.toString() },
        },
      );
    }

    // Get all orders from the last 90 days
    // Note: Order.date is stored as BigInt (milliseconds timestamp)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoMs = BigInt(ninetyDaysAgo.getTime());

    // First, get all products for this seller
    const sellerProducts = await prisma.product.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
      },
    });

    const sellerProductIds = sellerProducts.map((p) => p.id);

    if (sellerProductIds.length === 0) {
      return NextResponse.json({
        insights: [],
        trends: {
          growing: [],
          declining: [],
          seasonal: [],
        },
        recommendations: [],
        message: "No products found. Create products first to see analytics.",
      });
    }

    // Get orders for this seller's products only
    const recentOrders = await prisma.order.findMany({
      where: {
        date: {
          gte: ninetyDaysAgoMs,
        },
        items: {
          some: {
            productId: {
              in: sellerProductIds,
            },
          },
        },
      },
      include: {
        items: {
          where: {
            productId: {
              in: sellerProductIds,
            },
          },
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    if (recentOrders.length === 0) {
      return NextResponse.json({
        insights: [],
        trends: {
          growing: [],
          declining: [],
          seasonal: [],
        },
        recommendations: [],
        message:
          "Not enough order data yet. Check back once you have more orders.",
      });
    }

    // Analyze order data
    const productSales = {};
    const categorySales = {};
    const dailySales = {};
    let totalRevenue = 0;

    recentOrders.forEach((order) => {
      const orderDate = new Date(Number(order.date))
        .toISOString()
        .split("T")[0];

      order.items.forEach((item) => {
        const productId = item.product.id;
        const category = item.product.category;
        const quantity = item.quantity;
        const revenue = parseFloat(item.product.price) * quantity;

        // Track product sales
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.product.name,
            category: category,
            totalQuantity: 0,
            totalRevenue: 0,
            orders: 0,
          };
        }
        productSales[productId].totalQuantity += quantity;
        productSales[productId].totalRevenue += revenue;
        productSales[productId].orders++;

        // Track category sales
        if (!categorySales[category]) {
          categorySales[category] = {
            totalQuantity: 0,
            totalRevenue: 0,
            orders: 0,
          };
        }
        categorySales[category].totalQuantity += quantity;
        categorySales[category].totalRevenue += revenue;
        categorySales[category].orders++;

        // Track daily sales
        if (!dailySales[orderDate]) {
          dailySales[orderDate] = {
            orders: 0,
            revenue: 0,
            items: 0,
          };
        }
        dailySales[orderDate].orders++;
        dailySales[orderDate].revenue += revenue;
        dailySales[orderDate].items += quantity;

        totalRevenue += revenue;
      });
    });

    // Get top performing products
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);

    // Get top categories
    const topCategories = Object.entries(categorySales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    // Prepare data for AI
    const orderData = {
      totalRevenue,
      totalOrders: recentOrders.length,
      topProducts,
      categoryBreakdown: topCategories.reduce((acc, cat) => {
        acc[cat.name] = { count: cat.orders, revenue: cat.totalRevenue };
        return acc;
      }, {}),
    };

    console.log("[Demand Forecast] Seller-specific data for userId:", userId, {
      totalOrders: recentOrders.length,
      totalRevenue: totalRevenue.toFixed(2),
      topProducts: topProducts.slice(0, 3).map((p) => ({
        name: p.name,
        revenue: p.totalRevenue,
        quantity: p.totalQuantity,
      })),
      categories: Object.keys(orderData.categoryBreakdown),
    });

    let forecast_result;

    try {
      let aiResult;

      // Try Groq AI first
      try {
        aiResult = await GroqAIManager.generateForecastWithGroq(orderData);
        console.log(
          "✅ Using Groq AI for forecast. Recommendations:",
          aiResult.recommendations,
        );
      } catch (groqError) {
        console.log("⚠️ Groq failed, trying Gemini:", groqError.message);

        // Try Gemini AI
        try {
          aiResult = await GroqAIManager.generateForecastWithGemini(orderData);
          console.log(
            "✅ Using Gemini AI for forecast. Recommendations:",
            aiResult.recommendations,
          );
        } catch (geminiError) {
          console.log("⚠️ Gemini failed, using local:", geminiError.message);
          throw new Error("All AI services unavailable");
        }
      }

      forecast_result = {
        insights: (aiResult.insights || []).map((insight, i) => ({
          type: "info",
          title: `Insight ${i + 1}`,
          description: insight,
          priority: i === 0 ? "High" : "Medium",
        })),
        recommendations: (aiResult.recommendations || []).map((rec, i) => ({
          title: `Action ${i + 1}`,
          action: rec,
          impact: "Potential revenue increase",
          priority: i === 0 ? "High" : "Medium",
        })),
        source: aiResult.source,
        model: aiResult.model,
        salesSummary: {
          totalOrders: recentOrders.length,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          averageOrderValue: parseFloat(
            (totalRevenue / recentOrders.length).toFixed(2),
          ),
          period: "90 days",
        },
        topProducts: topProducts.slice(0, 5),
        topCategories: topCategories.slice(0, 3),

        // New advanced features
        anomalies: GroqAIManager.detectAnomalies(
          recentOrders,
          await prisma.product.findMany(),
        ).map((a) => ({
          date: a.date,
          revenue: parseFloat(a.revenue.toFixed(2)),
          type: a.type,
          severity: a.severity,
        })),
        revenueOpportunities: GroqAIManager.findRevenueOpportunities(
          await prisma.product.findMany(),
          recentOrders,
        ),
        priceOptimizations: GroqAIManager.optimizePricing(
          await prisma.product.findMany(),
          recentOrders,
        ),
        topCustomers: GroqAIManager.calculateCLV(
          await prisma.user.findMany({
            select: { id: true, name: true, email: true },
          }),
          recentOrders,
        ),

        isAI: true,
      };
    } catch (aiError) {
      console.log("Using local forecast:", aiError.message);

      // Local fallback
      const forecast = GroqAIManager.generateForecast({
        orders: recentOrders,
        totalRevenue,
        totalOrders: recentOrders.length,
        topProducts,
        topCategories,
      });

      forecast_result = {
        insights: (forecast.insights || []).map((insight, i) => ({
          type: "info",
          title: `Insight ${i + 1}`,
          description: insight,
          priority: i === 0 ? "High" : "Medium",
        })),
        trends: forecast.trends,
        recommendations: (forecast.recommendations || []).map((rec, i) => ({
          title: `Action ${i + 1}`,
          action: rec,
          impact: "Potential revenue increase",
          priority: i === 0 ? "High" : "Medium",
        })),
        forecast: forecast.forecast,
        source: "local-fallback",
        salesSummary: {
          totalOrders: recentOrders.length,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          averageOrderValue: parseFloat(
            (totalRevenue / recentOrders.length).toFixed(2),
          ),
          period: "90 days",
        },
        topProducts: topProducts.slice(0, 5),
        topCategories: topCategories.slice(0, 3),
        isAI: true,
      };
    }

    // Cache the results (1 hour TTL)
    GroqAIManager.setCache(cacheKey, forecast_result);

    return NextResponse.json(forecast_result);
  } catch (error) {
    console.error("Demand Forecasting Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate demand forecast",
        details: error.message,
        insights: [],
        recommendations: [],
      },
      { status: 500 },
    );
  }
}
