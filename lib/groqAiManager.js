/**
 * AI Manager - Uses FREE Groq + Gemini AI with smart local fallback
 * Primary: Groq (10k/month) - Ultra fast inference
 * Backup: Gemini (1.5k/day) - Most generous free tier
 * Fallback: Local algorithms - Always works
 */

import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize AI clients
const groqClient = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;
const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// In-memory cache with 1-hour TTL
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Rate limiting: 2 requests per minute per endpoint
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 2;

class AIManager {
  /**
   * Check rate limit for an endpoint
   */
  static checkRateLimit(key) {
    const now = Date.now();
    const record = rateLimitMap.get(key) || { timestamps: [] };

    // Remove old timestamps outside the window
    record.timestamps = record.timestamps.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW,
    );

    if (record.timestamps.length >= MAX_REQUESTS_PER_MINUTE) {
      const retryAfter = Math.ceil(
        (record.timestamps[0] + RATE_LIMIT_WINDOW - now) / 1000,
      );
      return { allowed: false, retryAfter };
    }

    // Add current timestamp
    record.timestamps.push(now);
    rateLimitMap.set(key, record);

    return { allowed: true, retryAfter: 0 };
  }

  /**
   * Get item from cache
   */
  static getCache(key) {
    const item = cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > CACHE_TTL) {
      cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set item in cache
   */
  static setCache(key, data) {
    cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Smart search using ONLY local algorithms (NO API needed)
   * Uses intelligent keyword matching + semantic similarity
   */
  static async smartSearch(query, products) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);

    if (queryWords.length === 0) {
      return this.generateFallbackSearch(query, products);
    }

    // Score products based on relevance
    const scored = products.map((product) => {
      let score = 0;
      const nameL = product.name.toLowerCase();
      const descL = product.description.toLowerCase();
      const catL = product.category.toLowerCase();

      // Exact phrase match (highest priority)
      if (nameL.includes(queryLower)) score += 50;
      if (descL.includes(queryLower)) score += 25;
      if (catL.includes(queryLower)) score += 15;

      // Word matches
      queryWords.forEach((word) => {
        if (nameL.includes(word)) score += 10;
        if (catL.includes(word)) score += 5;
        if (descL.includes(word)) score += 2;
      });

      // Category relevance
      const categoryKeywords = {
        pottery: ["ceramic", "bowl", "vase", "pot", "clay"],
        textiles: ["fabric", "cloth", "weave", "thread"],
        jewelry: ["bead", "bracelet", "necklace", "ring"],
        wood: ["wooden", "carved", "timber"],
        basket: ["woven", "wicker", "fiber"],
      };

      Object.entries(categoryKeywords).forEach(([key, words]) => {
        if (queryLower.includes(key)) {
          if (catL.includes(key)) score += 8;
          words.forEach((w) => {
            if (nameL.includes(w)) score += 3;
          });
        }
      });

      return { ...product, relevanceScore: score };
    });

    // Sort by relevance and return top 10
    const results = scored
      .filter((p) => p.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10)
      .map(({ relevanceScore, ...p }) => p);

    return {
      results: results.length > 0 ? results : products.slice(0, 5),
      source: "smart-local", // No API needed!
    };
  }

  /**
   * Keyword-based fallback search
   */
  static generateFallbackSearch(query, products) {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    const scored = products.map((product) => {
      let score = 0;

      if (product.name.toLowerCase().includes(queryLower)) score += 10;
      if (product.category.toLowerCase().includes(queryLower)) score += 5;

      queryWords.forEach((word) => {
        if (product.name.toLowerCase().includes(word)) score += 2;
        if (product.description.toLowerCase().includes(word)) score += 1;
      });

      return { ...product, score };
    });

    return {
      results: scored
        .filter((p) => p.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(({ score, ...p }) => p),
      source: "keyword-search",
    };
  }

  /**
   * Generate personalized recommendations using local algorithms
   */
  static async generateRecommendations(
    productName,
    category,
    userHistory,
    products,
  ) {
    // If no specific product, show category items
    if (!category) {
      return this.generateFallbackRecommendations(
        "Pottery & Ceramics",
        products,
      );
    }

    // Find similar products in same category
    const categoryProducts = products.filter((p) => p.category === category);

    if (categoryProducts.length === 0) {
      // Fall back to all products
      return {
        recommendations: products.slice(0, 6),
        source: "category-fallback",
      };
    }

    // If we have purchase history, prioritize those categories
    let recommendedProducts = [];

    if (userHistory && userHistory.length > 0) {
      // Get products from categories user bought before
      recommendedProducts = products.filter(
        (p) => userHistory.includes(p.category) && p.category !== category,
      );
    }

    // Fill remaining slots with category products
    const needed = 6 - recommendedProducts.length;
    if (needed > 0) {
      recommendedProducts = [
        ...recommendedProducts,
        ...categoryProducts.filter(
          (p) => !recommendedProducts.find((r) => r.id === p.id),
        ),
      ].slice(0, 6);
    }

    return {
      recommendations:
        recommendedProducts.length > 0
          ? recommendedProducts
          : categoryProducts.slice(0, 6),
      source: "local-recommendations",
    };
  }

  /**
   * Fallback: Category-based recommendations
   */
  static generateFallbackRecommendations(category, products) {
    const categoryProducts = products.filter((p) => p.category === category);

    return {
      recommendations:
        categoryProducts.length > 0
          ? categoryProducts.slice(0, 6)
          : products.slice(0, 6),
      source: "category-based",
    };
  }

  /**
   * Generate demand forecast using ONLY statistical analysis
   * (NO API calls needed!)
   */
  static async generateForecast(orderData) {
    const {
      totalRevenue,
      totalOrders,
      topProducts,
      categorySales,
      dailySales,
    } = orderData;

    if (!topProducts || topProducts.length === 0) {
      return {
        insights: [
          "Store is just getting started",
          "No order data available yet",
          "Sales trend will appear after first orders",
        ],
        recommendations: [
          "Optimize product listings for visibility",
          "Engage with customers to build sales",
          "Monitor which products attract interest",
        ],
        forecast:
          "Forecast will become available once order history builds up.",
      };
    }

    const avgOrderValue = totalRevenue / totalOrders;
    const topProduct = topProducts[0];

    // Calculate simple trend
    const dailyArray = Object.values(dailySales || {}).map(
      (d) => d.totalRevenue || 0,
    );
    const trend =
      dailyArray.length > 1
        ? dailyArray[dailyArray.length - 1] > dailyArray[0]
          ? "📈 upward"
          : "📉 declining"
        : "stable";

    return {
      insights: [
        `Average order value: ৳${avgOrderValue.toFixed(2)}`,
        `Best performer: "${topProduct?.name || "N/A"}" with ${topProduct?.units || 0} units sold`,
        `Top category: "${Object.entries(categorySales || {})[0]?.[0] || "N/A"}"`,
      ],
      recommendations: [
        `Focus on best-seller: "${topProduct?.name || "N/A"}"`,
        "Stock up on high-demand categories",
        "Consider bundling complementary products",
      ],
      forecast: `Based on ${totalOrders} orders and ৳${totalRevenue.toFixed(2)} revenue, your store shows ${trend} momentum. Continue marketing your top products.`,
    };
  }

  /**
   * Fallback: Statistical forecast
   */
  static generateFallbackForecast(orderData) {
    const { totalRevenue, totalOrders, topProducts } = orderData;
    const avgOrderValue = totalRevenue / totalOrders;

    return {
      insights: [
        `Average order value is ৳${avgOrderValue.toFixed(2)}`,
        `Your top product is "${topProducts[0]?.name || "N/A"}"`,
        `${topProducts.length} products are driving most sales`,
      ],
      recommendations: [
        `Focus inventory on: ${topProducts[0]?.name || "N/A"}`,
        "Monitor stock levels for best sellers",
        "Engage customers with product recommendations",
      ],
      forecast: `Based on current trends, expect consistent performance. Total revenue shows steady demand.`,
    };
  }

  /**
   * Generate recommendations using Groq AI (Primary)
   */
  static async generateRecommendationsWithGroq(
    currentProduct,
    userHistory,
    allProducts,
  ) {
    if (!groqClient) throw new Error("Groq not configured");

    const productList = allProducts
      .slice(0, 15)
      .map((p) => `${p.name} (${p.category}, ৳${p.price})`)
      .join(", ");

    const prompt = `Product being viewed: "${currentProduct.name}" (${currentProduct.category}, ৳${currentProduct.price}).
${userHistory ? `User purchased: ${userHistory}` : "New customer"}.

Available products: ${productList}

Recommend 5 complementary products. Return ONLY a JSON array of product names: ["Product 1", "Product 2", ...]`;

    const completion = await groqClient.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 200,
    });

    const response = completion.choices[0]?.message?.content || "[]";
    const names = JSON.parse(response.match(/\[.*\]/s)?.[0] || "[]");

    return {
      recommendations: allProducts.filter((p) =>
        names.some((n) => p.name.includes(n) || n.includes(p.name)),
      ),
      source: "groq-ai",
      model: "llama-3.1-8b-instant",
    };
  }

  /**
   * Generate recommendations using Gemini AI (Backup)
   */
  static async generateRecommendationsWithGemini(
    currentProduct,
    userHistory,
    allProducts,
  ) {
    if (!geminiClient) throw new Error("Gemini not configured");

    const model = geminiClient.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    const productList = allProducts
      .slice(0, 15)
      .map((p) => `${p.name} (${p.category}, ৳${p.price})`)
      .join(", ");

    const prompt = `Product: "${currentProduct.name}" (${currentProduct.category}, ৳${currentProduct.price}).
${userHistory ? `Customer history: ${userHistory}` : "New customer"}.

Products: ${productList}

Recommend 5 products. Return JSON array of names only: ["Name1", "Name2", ...]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const names = JSON.parse(response.match(/\[.*\]/s)?.[0] || "[]");

    return {
      recommendations: allProducts.filter((p) =>
        names.some((n) => p.name.includes(n) || n.includes(p.name)),
      ),
      source: "gemini-ai",
      model: "gemini-1.5-flash",
    };
  }

  /**
   * Generate forecast using Groq AI (Primary)
   */
  static async generateForecastWithGroq(orderData) {
    if (!groqClient) throw new Error("Groq not configured");

    const { totalRevenue, totalOrders, topProducts, categoryBreakdown } =
      orderData;

    // Build detailed product data with revenue percentages
    const productDetails = topProducts
      .slice(0, 5)
      .map((p) => {
        const revenuePercent = ((p.totalRevenue / totalRevenue) * 100).toFixed(
          1,
        );
        return `${p.name}: ৳${p.totalRevenue.toFixed(0)} (${revenuePercent}%, ${p.totalQuantity} units, ${p.orders} orders)`;
      })
      .join("\n- ");

    const categoryDetails = Object.entries(categoryBreakdown)
      .map(([cat, data]) => {
        const percent = ((data.revenue / totalRevenue) * 100).toFixed(1);
        return `${cat}: ${data.count} orders, ৳${data.revenue.toFixed(0)} (${percent}%)`;
      })
      .join("\n- ");

    const prompt = `As a retail business analyst, analyze this seller's unique sales performance:

SALES OVERVIEW:
- Total Revenue: ৳${totalRevenue.toFixed(0)} from ${totalOrders} orders
- Average Order Value: ৳${(totalRevenue / totalOrders).toFixed(0)}

TOP PERFORMING PRODUCTS:
- ${productDetails}

CATEGORY BREAKDOWN:
- ${categoryDetails}

Based on THIS seller's specific product mix and performance patterns, provide 3 highly specific, actionable insights and 3 concrete recommendations tailored to their business.

Return ONLY valid JSON: {"insights": ["insight1", "insight2", "insight3"], "recommendations": ["recommendation1", "recommendation2", "recommendation3"]}`;

    const completion = await groqClient.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.8,
      max_tokens: 400,
      top_p: 0.9,
    });

    const response = completion.choices[0]?.message?.content || "{}";
    const data = JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] || "{}");

    return {
      insights: data.insights || [],
      recommendations: data.recommendations || [],
      source: "groq-ai",
      model: "llama-3.1-8b-instant",
    };
  }

  /**
   * Generate forecast using Gemini AI (Backup)
   */
  static async generateForecastWithGemini(orderData) {
    if (!geminiClient) throw new Error("Gemini not configured");

    const model = geminiClient.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    const { totalRevenue, totalOrders, topProducts, categoryBreakdown } =
      orderData;

    // Build detailed product data with revenue percentages
    const productDetails = topProducts
      .slice(0, 5)
      .map((p) => {
        const revenuePercent = ((p.totalRevenue / totalRevenue) * 100).toFixed(
          1,
        );
        return `${p.name}: ৳${p.totalRevenue.toFixed(0)} (${revenuePercent}%, ${p.totalQuantity} units, ${p.orders} orders)`;
      })
      .join("\n- ");

    const categoryDetails = Object.entries(categoryBreakdown)
      .map(([cat, data]) => {
        const percent = ((data.revenue / totalRevenue) * 100).toFixed(1);
        return `${cat}: ${data.count} orders, ৳${data.revenue.toFixed(0)} (${percent}%)`;
      })
      .join("\n- ");

    const prompt = `As a retail business analyst, analyze this seller's unique sales performance:

SALES OVERVIEW:
- Total Revenue: ৳${totalRevenue.toFixed(0)} from ${totalOrders} orders
- Average Order Value: ৳${(totalRevenue / totalOrders).toFixed(0)}

TOP PERFORMING PRODUCTS:
- ${productDetails}

CATEGORY BREAKDOWN:
- ${categoryDetails}

Based on THIS seller's specific product mix and performance patterns, provide 3 highly specific, actionable insights and 3 concrete recommendations tailored to their business.

Return ONLY valid JSON: {"insights": ["insight1", "insight2", "insight3"], "recommendations": ["recommendation1", "recommendation2", "recommendation3"]}`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const data = JSON.parse(response.match(/\{[\s\S]*\}/)?.[0] || "{}");

    return {
      insights: data.insights || [],
      recommendations: data.recommendations || [],
      source: "gemini-ai",
      model: "gemini-1.5-flash",
    };
  }

  /**
   * Detect anomalies in sales data
   */
  static detectAnomalies(orders, products) {
    const dailySales = {};
    let totalRevenue = 0;

    orders.forEach((order) => {
      const date = new Date(Number(order.date)).toISOString().split("T")[0];
      dailySales[date] =
        (dailySales[date] || 0) + parseFloat(order.totalAmount || 0);
      totalRevenue += parseFloat(order.totalAmount || 0);
    });

    const dailyValues = Object.values(dailySales);
    const avgDaily = totalRevenue / Math.max(dailyValues.length, 1);
    const stdDev = Math.sqrt(
      dailyValues.reduce((sum, val) => sum + Math.pow(val - avgDaily, 2), 0) /
        Math.max(dailyValues.length, 1),
    );

    const anomalies = [];
    Object.entries(dailySales).forEach(([date, revenue]) => {
      const zScore = Math.abs((revenue - avgDaily) / Math.max(stdDev, 1));
      if (zScore > 2) {
        anomalies.push({
          date,
          revenue,
          type: revenue > avgDaily ? "spike" : "drop",
          severity: zScore > 3 ? "critical" : "warning",
        });
      }
    });

    return anomalies.slice(-5);
  }

  /**
   * Find revenue opportunities
   */
  static findRevenueOpportunities(products, orders) {
    const productSales = {};

    orders.forEach((order) => {
      order.items?.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            quantity: 0,
            revenue: 0,
            product: products.find((p) => p.id === item.productId),
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue +=
          parseFloat(item.product?.price || 0) * item.quantity;
      });
    });

    const opportunities = [];

    // Find underpriced high-demand items
    Object.values(productSales).forEach((sale) => {
      if (sale.quantity > 10 && sale.product?.price < 2000) {
        opportunities.push({
          type: "underpriced",
          product: sale.product?.name,
          currentPrice: sale.product?.price,
          suggestedPrice: Math.round(sale.product?.price * 1.15),
          potentialGain: Math.round(sale.product?.price * 0.15 * sale.quantity),
        });
      }
    });

    // Find bundle opportunities
    const categories = {};
    products.forEach((p) => {
      if (!categories[p.category]) categories[p.category] = [];
      categories[p.category].push(p);
    });

    Object.entries(categories).forEach(([cat, items]) => {
      if (items.length > 2) {
        opportunities.push({
          type: "bundle",
          category: cat,
          products: items.slice(0, 3).map((p) => p.name),
          suggestedDiscount: 10,
        });
      }
    });

    return opportunities.slice(0, 5);
  }

  /**
   * Price optimization suggestions
   */
  static optimizePricing(products, orders) {
    const suggestions = [];

    products.slice(0, 10).forEach((product) => {
      const productOrders = orders.flatMap(
        (o) => o.items?.filter((i) => i.productId === product.id) || [],
      );
      const salesCount = productOrders.length;

      if (salesCount > 5) {
        const avgPrice = product.price;
        const optimalPrice = Math.round(
          avgPrice * (1 + (salesCount > 10 ? 0.2 : 0.1)),
        );

        suggestions.push({
          product: product.name,
          currentPrice: avgPrice,
          optimalPrice,
          priceIncrease: optimalPrice - avgPrice,
          potentialRevenueBoost: Math.round(
            (optimalPrice - avgPrice) * salesCount,
          ),
          confidence: Math.min(100, salesCount * 5),
        });
      }
    });

    return suggestions.slice(0, 5);
  }

  /**
   * Calculate Customer Lifetime Value
   */
  static calculateCLV(users, orders) {
    const clvData = [];

    users.forEach((user) => {
      const userOrders = orders.filter((o) => o.userId === user.id);

      if (userOrders.length > 0) {
        const totalSpent = userOrders.reduce(
          (sum, o) => sum + parseFloat(o.totalAmount || 0),
          0,
        );
        const avgOrderValue = totalSpent / userOrders.length;
        const purchaseFrequency = userOrders.length;
        const daysSinceFirst = Math.max(
          1,
          (Date.now() - new Date(userOrders[0].date).getTime()) /
            (1000 * 60 * 60 * 24),
        );

        // Simple CLV = (Average Order Value × Purchase Frequency) × (Estimated Lifetime: 365 days)
        const clv = Math.round(
          avgOrderValue * (purchaseFrequency / (daysSinceFirst / 365)) * 365,
        );

        clvData.push({
          userId: user.id,
          name: user.name || "Customer",
          email: user.email,
          totalSpent,
          orderCount: purchaseFrequency,
          clv,
          tier: clv > 50000 ? "VIP" : clv > 20000 ? "Premium" : "Standard",
        });
      }
    });

    return clvData.sort((a, b) => b.clv - a.clv).slice(0, 10);
  }
}

export default AIManager;
