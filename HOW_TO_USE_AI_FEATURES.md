# 🚀 How to Use AI Features - Practical Guide

## Quick Navigation

- **Customers:** Jump to "For Customers"
- **Sellers:** Jump to "For Sellers"
- **Developers:** Jump to "For Developers"

---

## For Customers 👥

### Feature 1: Smart AI Search

**Where:** Search bar on homepage or `/all-products`

**How to Use:**

```
1. Click the search bar at the top
2. Type a natural language question or description:
   - "elegant pottery bowls"
   - "affordable handmade gifts"
   - "purple textiles under ৳50"
   - "pottery with cracks for vintage look"
3. Press Enter
4. See AI-powered results sorted by relevance
```

**What Happens Behind the Scenes:**

- AI understands your intent (not just keywords)
- Matches products semantically (meaning-based)
- Ranks results by relevance
- If quota exceeded: Falls back to keyword search
- Response time: < 2 seconds

**Example Search:**

```
Query: "nice decorative bowls for my living room"

AI Returns:
✓ Pottery bowls (matches "decorative bowls")
✓ Large ceramics (matches "living room decoration")
✓ Handwoven baskets (similar category)
✓ Wall decor (similar aesthetic)
```

---

### Feature 2: Personalized Recommendations

**Where:** Product detail pages (click any product)

**How to Use:**

```
1. Click any product to view details
2. Scroll to "You Might Also Like" section
3. See 6 personalized recommendations
4. Click to view more details
```

**What You See:**

- **AI picks based on:**
  - Products you've viewed
  - Similar price range
  - Same category
  - Aesthetic/style match

- **First time?**
  - AI shows category-based recommendations
  - Learn preferences from your browsing

- **Returning customer?**
  - AI remembers your history
  - Personalized to your taste

---

## For Sellers 📊

### Feature 3: Demand Forecasting & Analytics

**Where:** Seller Dashboard → `/seller/ai-insights` (or click "AI Insights")

**How to Access:**

```
1. Login as seller
2. Click "AI Insights" in sidebar
3. View analytics dashboard
4. See sales trends & forecasts
```

**What You See:**

#### Section 1: Sales Analysis

```
- Last 30 days sales volume
- Revenue total
- Average order value
- Best selling products
```

#### Section 2: Trend Predictions

```
- Next 90 days revenue forecast
- Product performance predictions
- Seasonal patterns
- Growth/decline indicators
```

#### Section 3: Recommendations

```
- Which products to stock more
- Seasonal product suggestions
- Pricing recommendations
- Inventory optimization tips
```

**Example Dashboard:**

```
Total Sales (30 days): ৳4,250
Forecast (90 days): ৳13,200 projected
↑ Growth: +28% trending upward

Top Performing: Pottery Bowls (45 units)
Recommendation: Increase pottery stock
Seasonal: Spring demand for lightweight items
```

---

## For Developers 💻

### API Endpoints

#### 1. Smart Search API

**Endpoint:**

```
POST /api/ai/search
```

**Request:**

```bash
curl -X POST http://localhost:3000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "elegant pottery bowls",
    "limit": 10,
    "userId": "user123"  // Optional - for personalization
  }'
```

**Response (Success):**

```json
{
  "success": true,
  "query": "elegant pottery bowls",
  "source": "AI",
  "results": [
    {
      "_id": "prod123",
      "name": "Handmade Ceramic Bowl",
      "price": 45,
      "image": "url",
      "relevanceScore": 0.95,
      "reason": "Matches 'elegant' and 'pottery'"
    }
  ]
}
```

**Response (Quota Exceeded - Auto Fallback):**

```json
{
  "success": true,
  "query": "elegant pottery bowls",
  "source": "fallback",
  "reason": "Using keyword search (quota exceeded)",
  "results": [
    {
      "_id": "prod456",
      "name": "Pottery Decorative Bowl",
      "price": 35,
      "image": "url"
    }
  ]
}
```

---

#### 2. Recommendations API

**Endpoint:**

```
GET /api/ai/recommendations?productId=PRODUCT_ID&userId=USER_ID
```

**Request:**

```bash
curl "http://localhost:3000/api/ai/recommendations?productId=prod123&userId=user456"
```

**Response:**

```json
{
  "success": true,
  "productId": "prod123",
  "source": "AI",
  "recommendations": [
    {
      "_id": "prod789",
      "name": "Matching Ceramic Set",
      "price": 89,
      "image": "url",
      "reason": "Similar style and price"
    }
  ],
  "count": 6
}
```

---

#### 3. Demand Forecast API

**Endpoint:**

```
GET /api/ai/demand-forecast
```

**Headers:**

```
Authorization: Bearer YOUR_SELLER_TOKEN
```

**Request:**

```bash
curl -H "Authorization: Bearer token" \
  http://localhost:3000/api/ai/demand-forecast
```

**Response:**

```json
{
  "success": true,
  "seller": "seller123",
  "analysis": {
    "period": "Last 30 days",
    "totalRevenue": 4250,
    "totalOrders": 89,
    "averageOrderValue": 47.75,
    "topProducts": [
      {
        "productId": "prod123",
        "name": "Ceramic Bowl",
        "units": 45,
        "revenue": 1800
      }
    ]
  },
  "forecast": {
    "nextPeriod": "90 days",
    "projectedRevenue": 13200,
    "growthRate": 0.28,
    "trend": "upward"
  },
  "recommendations": [
    "Stock more Ceramic Bowls (high demand)",
    "Prepare for Spring seasonal peak",
    "Consider pricing increase for bestsellers"
  ]
}
```

---

## Rate Limiting & Quotas

### Limits per Feature

```
Smart Search:    2 requests/minute
Recommendations: 2 requests/minute
Demand Forecast: 2 requests/minute
```

### What Happens at Limit?

```
❌ Limit reached
  ↓
✅ Auto fallback activated (no user-facing error)
  ↓
Results still delivered (keyword search, category match, stats)
  ↓
Quota reset in 1 minute
```

---

## Error Handling & Fallbacks

### Search Fallback Sequence

```
1. Try: AI-powered semantic search
2. If quota exceeded: Keyword search fallback
3. Still no results: Category suggestions
4. User always gets: Some recommendations
```

### Recommendations Fallback

```
1. Try: AI personalized recommendations
2. If quota exceeded: Category-based similar items
3. User sees: Relevant products anyway
```

### Forecast Fallback

```
1. Try: AI analysis & predictions
2. If quota exceeded: Statistical analysis
3. Seller sees: Basic but accurate forecasts
```

---

## Testing the Features

### Test 1: Try Smart Search

```
1. Go to homepage
2. Search for: "gifts under 30"
3. See results ranked by AI relevance
4. Try different searches to test AI understanding
```

### Test 2: Check Recommendations

```
1. Click any product
2. Scroll to "You Might Also Like"
3. Click recommendation to verify relevance
4. View multiple products to see pattern learning
```

### Test 3: View Seller Dashboard

```
1. Login as seller (if available)
2. Navigate to AI Insights
3. Check sales forecast
4. Review recommendations
```

### Test 4: API Testing

```bash
# Test search
curl -X POST http://localhost:3000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query":"pottery"}'

# Test recommendations (replace IDs)
curl "http://localhost:3000/api/ai/recommendations?productId=YOUR_PRODUCT_ID"

# Test forecast (with seller token)
curl -H "Authorization: Bearer SELLER_TOKEN" \
  http://localhost:3000/api/ai/demand-forecast
```

---

## Troubleshooting

### Issue: Search returns no results

```
✓ Check: Product database has items
✓ Try: Different search terms
✓ Check: Network tab in browser DevTools
✓ Review: AI_FEATURES_GUIDE.md for advanced options
```

### Issue: Recommendations missing

```
✓ Check: Product database populated
✓ Try: Refreshing page
✓ Check: Browser console for errors
✓ Verify: User is logged in (for personalization)
```

### Issue: Forecast page shows error

```
✓ Verify: You're logged in as seller
✓ Check: Seller has at least 1 order
✓ Try: Refresh page
✓ Check: Browser console errors
```

### Issue: Getting rate limit errors

```
✓ Wait: 1 minute for quota reset
✓ Know: Fallback algorithms activate automatically
✓ Check: Your search frequency isn't too high
✓ Note: 2 requests/minute is the limit per endpoint
```

---

## Features Comparison

### Before AI Integration

```
Search:  Keyword only → Limited results
Recs:    Random products → Low relevance
Forecast: Manual analysis → Time consuming
```

### After AI Integration

```
Search:  Semantic understanding → Highly relevant
Recs:    Personalized patterns → Perfect matches
Forecast: AI predictions → Data-driven decisions
```

---

## More Information

For detailed information, see:

- **Quick Reference:** [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Full API Docs:** [AI_FEATURES_GUIDE.md](AI_FEATURES_GUIDE.md)
- **Architecture:** [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)
- **Quota Help:** [QUOTA_MANAGEMENT_GUIDE.md](QUOTA_MANAGEMENT_GUIDE.md)
- **Bug Fixes:** [BUGFIX_SUMMARY.md](BUGFIX_SUMMARY.md)

---

**TL;DR:**

- ✅ **Customers:** Use search bar or view recommendations on product pages
- ✅ **Sellers:** Click "AI Insights" on dashboard for forecasts
- ✅ **Developers:** POST to `/api/ai/search`, GET `/api/ai/recommendations`, GET `/api/ai/demand-forecast`
- ✅ **All features have fallbacks** - always work, even if quota exceeded
