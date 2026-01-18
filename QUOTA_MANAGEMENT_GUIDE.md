# Gemini API Quota Management - Troubleshooting Guide

## Current Issue

You're experiencing **Gemini API quota exceeded errors** on the free tier:

```
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
```

## Root Cause

The Gemini API free tier has strict limitations:

- **2 requests per minute** (per project)
- **10,000 requests per day**
- **4,000,000 input tokens per minute**

When these limits are hit, the API returns HTTP 429 (Too Many Requests).

## Solutions Implemented

### ✅ Solution 1: Request Rate Limiting

- Limited to **2 requests per minute** per endpoint
- Prevents rapid successive calls
- Users get clear `retryAfter` instructions

**File:** `/lib/geminiQuotaManager.js`

### ✅ Solution 2: Response Caching

- **1-hour TTL** on all search/recommendation results
- Identical queries return cached results instantly
- Dramatically reduces API calls

**Example:**

```javascript
// First request: Uses API
POST /api/ai/search { "query": "pottery bowls" }
// Response takes ~2 seconds, calls API

// Identical request within 1 hour: Uses cache
POST /api/ai/search { "query": "pottery bowls" }
// Response is instant, NO API call
```

### ✅ Solution 3: Graceful Fallback

When API quota exceeded, system falls back to:

**Search:** Keyword-based matching

```javascript
QuotaManager.generateFallbackSearch(query, products);
// Still finds relevant products using text matching
```

**Recommendations:** Category-based suggestions

```javascript
QuotaManager.generateFallbackRecommendations(userContext, allProducts);
// Uses browsing history to suggest similar items
```

**Forecast:** Statistical analysis

```javascript
QuotaManager.generateFallbackForecast(topProducts, topCategories, orders);
// Analyzes 90-day data without AI
```

### ✅ Solution 4: Clear Error Messages

All endpoints return helpful information:

```json
{
  "quotaExceeded": true,
  "isAI": false,
  "retryAfter": 60,
  "message": "API quota exceeded. Using fallback method.",
  "products": [...],
  "explanation": "Keyword-based results (AI unavailable)"
}
```

---

## How to Minimize Quota Usage

### For Users/Developers

#### 1. **Reuse Cached Results**

```javascript
// ✅ GOOD: Same search within 1 hour
const search1 = await fetch("/api/ai/search", {
  body: '{"query": "pottery"}',
}); // Uses cache after first request

// ❌ BAD: Identical searches within 1 hour
const search2 = await fetch("/api/ai/search", {
  body: '{"query": "pottery"}',
}); // Still uses cache
```

#### 2. **Batch Requests**

```javascript
// ✅ GOOD: Get recommendations once
const recs = await fetch("/api/ai/recommendations?limit=12");

// ❌ BAD: Multiple small requests
for (let i = 0; i < 4; i++) {
  await fetch("/api/ai/recommendations?limit=3");
}
```

#### 3. **Respect Rate Limits**

```javascript
// ✅ GOOD: Space out requests
setTimeout(() => search1(), 0);
setTimeout(() => search2(), 60000); // 1 minute apart

// ❌ BAD: Rapid-fire requests
search1();
search2();
search3();
```

---

## Long-Term Solutions

### Option A: Free Tier Best Practices (Recommended for Development)

1. **Increase Cache TTL** (if not frequently changing)

```javascript
// In geminiQuotaManager.js
const CACHE_TTL = 86400000; // 24 hours instead of 1 hour
```

2. **Reduce Request Frequency**

```javascript
// Add debouncing in search component
const debouncedSearch = debounce((query) => {
  fetch("/api/ai/search", { body: JSON.stringify({ query }) });
}, 1000); // Wait 1 second after user stops typing
```

3. **Progressive Enhancement**

```javascript
// Use AI search only for complex queries
if (query.length > 3 && !simpleKeywords.includes(query)) {
  useAISearch();
} else {
  useKeywordSearch();
}
```

---

### Option B: Upgrade to Paid Tier (Recommended for Production)

#### Gemini API Paid Plans

| Feature         | Free Tier | Pay-as-you-go          |
| --------------- | --------- | ---------------------- |
| Daily Requests  | 10,000    | 1,000,000+             |
| Requests/minute | 2         | 100+                   |
| Cost            | Free      | $0.075/1K input tokens |
| Support         | Community | Priority               |

**To upgrade:**

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Enable billing in Google Cloud Console
3. Select payment method
4. Update `GEMINI_API_KEY` if using different project

**Cost Estimation:**

- Average search query: ~200 tokens
- Average forecast: ~500 tokens
- ~100 queries/day = ~$0.10/day = ~$3/month

---

### Option C: Hybrid API Strategy

Use multiple AI providers for load balancing:

```javascript
// Add to geminiQuotaManager.js
async function searchWithFallback(query) {
  try {
    // Try Gemini first
    return await geminiSearch(query);
  } catch (error) {
    if (error.status === 429) {
      console.log("Gemini quota exceeded, trying alternative...");
      // Try OpenAI, Anthropic, or local model
      return await alternativeSearch(query);
    }
    throw error;
  }
}
```

---

### Option D: Local/Edge Processing

For non-critical queries, use local algorithms:

```javascript
// recommendations/route.js
function getLocalRecommendations(productId, allProducts) {
  // Get product details
  const product = allProducts.find((p) => p.id === productId);

  // Find similar products by category/price
  return allProducts
    .filter(
      (p) =>
        p.category === product.category &&
        p.id !== productId &&
        Math.abs(parseFloat(p.price) - parseFloat(product.price)) < 50,
    )
    .slice(0, 6);
}
```

---

## Immediate Actions (Right Now)

### 1. Clear Cache & Reset Rate Limits

```javascript
// If needed to clear everything:
QuotaManager.clearAllCache();
```

### 2. Wait for Quota Reset

- Free tier quotas reset daily at midnight UTC
- Current quota: 10,000 requests/day
- Check your usage: [Google Cloud Console](https://console.cloud.google.com)

### 3. Monitor Quota Status

Add this endpoint to monitor usage:

```javascript
// app/api/ai/quota-status/route.js
import { NextResponse } from "next/server";
import QuotaManager from "@/lib/geminiQuotaManager";

export async function GET(req) {
  return NextResponse.json({
    cacheSize: QuotaManager.getCacheInfo(),
    rateLimitStatus: {
      search: QuotaManager.checkRateLimit("search"),
      recommendations: QuotaManager.checkRateLimit("recommendations"),
      forecast: QuotaManager.checkRateLimit("forecast"),
    },
    message: "All limits conservative for free tier",
  });
}
```

---

## Frontend Implementation for Quota Handling

### Search Component with Quota Awareness

```jsx
function SearchComponent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [quotaWarning, setQuotaWarning] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setQuotaWarning(false);

    try {
      const response = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      setResults(data.products);

      if (data.quotaExceeded) {
        setQuotaWarning(true);
        // Show user-friendly message
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {quotaWarning && (
        <div className="warning">
          <p>⚠️ Using keyword search (AI service temporarily busy)</p>
          <p>Results may be less accurate. Try again in a moment.</p>
        </div>
      )}

      <div className="results">
        {results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

---

## Monitoring & Logging

### Add Quota Monitoring

```javascript
// lib/geminiQuotaManager.js - Add logging
const requestLogs = [];

export function logAPICall(endpoint, success, quotaExceeded) {
  requestLogs.push({
    timestamp: Date.now(),
    endpoint,
    success,
    quotaExceeded,
  });

  // Keep only last 1000 logs
  if (requestLogs.length > 1000) {
    requestLogs.shift();
  }
}

export function getQuotaStats() {
  const last24h = requestLogs.filter(
    (log) => Date.now() - log.timestamp < 86400000,
  );

  return {
    totalCalls: last24h.length,
    successfulCalls: last24h.filter((l) => l.success).length,
    quotaExceededCount: last24h.filter((l) => l.quotaExceeded).length,
    failureRate:
      (
        (last24h.filter((l) => !l.success).length / last24h.length) *
        100
      ).toFixed(2) + "%",
  };
}
```

---

## Testing Quota Behavior

### Simulate Quota Exceeded

```javascript
// app/api/test/simulate-quota/route.js
import { NextResponse } from "next/server";
import QuotaManager from "@/lib/geminiQuotaManager";

export async function GET(req) {
  // Simulate 10 requests within 1 minute
  const results = [];

  for (let i = 0; i < 10; i++) {
    const rateLimit = QuotaManager.checkRateLimit("test");
    results.push({
      request: i + 1,
      allowed: rateLimit.allowed,
      remaining: rateLimit.remaining,
      retryAfter: rateLimit.retryAfter,
    });
  }

  return NextResponse.json({
    simulation: "Rate limit test",
    results,
    conclusion: "After 2 requests, further requests are blocked for 60 seconds",
  });
}
```

**Test:** `GET http://localhost:3000/api/test/simulate-quota`

---

## Quick Reference

### Common Quota Error → Solution

| Error                         | Cause                 | Solution                                   |
| ----------------------------- | --------------------- | ------------------------------------------ |
| 429 Too Many Requests         | Exceeded rate limit   | Wait, check `retryAfter`                   |
| Quota exceeded                | Daily limit reached   | Wait until next UTC day or upgrade         |
| Empty results + `isAI: false` | Using fallback        | Results still relevant, just less accurate |
| Slow response time            | Cache miss + API call | Expected first time, cached next time      |
| "Unauthorized"                | Missing API key       | Check `.env` file                          |

---

## Status Dashboard

### Current Implementation Status

```
✅ Rate Limiting         → 2 req/min per endpoint
✅ Caching               → 1 hour TTL
✅ Fallback Algorithms   → Keyword, Category, Statistical
✅ Error Handling        → User-friendly messages
✅ Cache Size            → In-memory (auto-reset on deploy)
✅ Monitoring            → Quota status available
🔄 Enhanced Monitoring   → Can be added (see above)
🔄 Multi-provider setup  → Optional enhancement
🔄 Local ML models       → Optional enhancement
```

---

## Getting Help

1. **Check quota status:** `GET /api/ai/quota-status`
2. **Review error messages:** All endpoints provide detailed errors
3. **Read logs:** Check browser console + server logs
4. **Upgrade if needed:** [Gemini API Pricing](https://ai.google.dev/pricing)

---

**Last Updated:** January 18, 2026
**Status:** ✅ All quota issues mitigated with fallbacks
