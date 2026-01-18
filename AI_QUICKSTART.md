# AI Features - Quick Start Guide

## What's New? 🎉

Your Terracotta e-commerce platform now has two powerful AI-powered features:

### 1. **Smart AI Search** 🔍

Instead of just keyword matching, users can now search naturally:

- "elegant pottery bowls for decoration"
- "gifts for home decor"
- "affordable handmade textiles"

### 2. **Personalized Recommendations** 👤

Products are recommended based on:

- Browsing history
- Purchase patterns
- Current product being viewed
- Price preferences

### 3. **Demand Forecasting** 📊

Sellers get AI-powered analytics:

- Sales trends & patterns
- Revenue forecasting
- Inventory recommendations
- Seasonal insights

---

## Using the Features

### For Customers - Search

#### Smart Search (Recommended)

```
Search: "elegant pottery bowls for decoration"
```

The AI understands intent and returns relevant products, even if exact keywords aren't in product titles.

#### How It Works

- Natural language processing
- Semantic understanding
- Category matching
- Automatic ranking by relevance

#### What You Get

- Highly relevant results
- Products sorted by relevance
- Clear explanations for results
- Faster shopping experience

---

### For Customers - Recommendations

#### On Product Pages

When viewing any product, you'll see:

- "You Might Also Like" section
- 6 personalized recommendations
- Based on your purchase history
- Or category matching for new visitors

#### Smart Suggestions

The system learns from:

- Products you've viewed
- Items you've purchased
- Your price range preferences
- Popular complementary items

---

### For Sellers - Demand Forecasting

#### Access the Dashboard

1. Log in as a seller
2. Navigate to seller dashboard
3. Look for "AI Sales Analytics" section

#### What You See

**Sales Summary**

- Total revenue (last 90 days)
- Number of orders
- Average order value

**Key Insights**

- Top performing products
- Underperforming items
- Category trends
- Seasonal patterns

**Recommendations**

- Stock optimization
- Pricing suggestions
- Marketing focus areas
- Inventory targets

**Forecasts**

- Next week revenue estimate
- Next month revenue estimate
- Confidence levels
- Expected order volume

#### Example Insights

```
✓ "Ceramic bowls are your top seller - 45 units sold"
✓ "Seasonal demand for holiday items peaks in November"
⚠️ "Textile sales declining - consider promotions"
→ "Stock up on popular pottery before holiday season"
```

---

## Important Notes

### About API Quotas ⚠️

The system uses Google Gemini API (free tier). This means:

#### Rate Limits

- **2 requests per minute** per feature
- Prevents overwhelming the service
- System will tell you when to retry

#### Caching

- Results cached for **1 hour**
- Same search within 1 hour = instant results
- Saves API quota & improves speed

#### Fallback Mode

If quota exceeded:

- Search uses keyword matching (still works!)
- Recommendations show popular items
- Forecasts use statistical analysis
- No functionality lost, just less AI

**Important:** Wait for quota reset if you see errors:

- Free tier resets daily (UTC midnight)
- Paid tier has much higher limits
- See `QUOTA_MANAGEMENT_GUIDE.md` for details

---

## Common Questions

### Q: Why is my search result not AI-powered?

**A:** You might have hit the rate limit. Wait a moment and try again. The free tier allows 2 requests per minute.

### Q: Can I still search/shop if API is down?

**A:** Yes! The system falls back to keyword search and basic recommendations. Everything still works.

### Q: How accurate are the forecasts?

**A:** Confidence levels are shown for each forecast:

- **High confidence:** Based on consistent 90-day pattern
- **Medium confidence:** Less clear patterns
- **Low confidence:** Minimal historical data

### Q: Why is my first search slow?

**A:** First request calls the AI API (~2 seconds). Subsequent identical searches use cache and are instant.

### Q: How often are forecasts updated?

**A:** Cached for 1 hour. New forecast available every hour. Refresh manually in dashboard if needed.

### Q: What if I want higher limits?

**A:** Upgrade to Gemini API paid tier:

- 100+ requests/minute
- Better forecasts
- Higher reliability
- ~$3-10/month for typical usage

---

## Implementation Details

### File Structure

```
├── lib/
│   └── geminiQuotaManager.js      ← Quota handling
├── app/api/ai/
│   ├── search/route.js            ← Smart search
│   ├── recommendations/route.js   ← Recommendations
│   └── demand-forecast/route.js   ← Sales forecasting
├── AI_FEATURES_GUIDE.md           ← Complete documentation
└── QUOTA_MANAGEMENT_GUIDE.md      ← Quota troubleshooting
```

### API Endpoints

#### Search

```
POST /api/ai/search
{
  "query": "user search query"
}
```

#### Recommendations

```
GET /api/ai/recommendations?productId=XXX&limit=6
```

#### Demand Forecast (Sellers only)

```
GET /api/ai/demand-forecast
```

---

## Troubleshooting

### Issue: "API Quota Exceeded" Error

**Short-term fix:**

- Wait 60 seconds
- Refresh the page
- Try again

**Long-term fix:**

1. Upgrade to Gemini API paid tier
2. Or: See `QUOTA_MANAGEMENT_GUIDE.md` for alternatives
3. Or: Wait for daily quota reset (UTC midnight)

### Issue: Recommendations Not Personalized

**Possible causes:**

1. New user with no purchase history (normal)
2. API in fallback mode
3. Not enough data

**Solution:**

- Browse more products
- Make a purchase
- Wait for data to accumulate

### Issue: Forecast Shows Generic Insights

**Possible causes:**

1. Not enough orders (need 7+ in 90 days)
2. API in fallback mode

**Solution:**

- Wait until you have more sales data
- Check back weekly
- Forecasts improve with more data

---

## Best Practices

### For Users

✅ Use natural language when searching
✅ Check recommendations on product pages
✅ Read the explanations for results
✅ Build purchase history for better recommendations

### For Sellers

✅ Check dashboard weekly
✅ Monitor your top products
✅ Follow the AI recommendations
✅ Track forecast accuracy over time
✅ Upgrade API if you need real-time updates

---

## Next Steps

### To Get Started

1. ✅ Features are live and working
2. Try smart search: Search for "pottery" instead of product name
3. Visit a product page: See recommendations
4. If seller: Check AI analytics in dashboard

### For More Info

- Read: `AI_FEATURES_GUIDE.md` (complete documentation)
- Read: `QUOTA_MANAGEMENT_GUIDE.md` (quota details)
- Check: Inline comments in code files
- API docs: https://ai.google.dev/docs

---

## Performance Tips

### Searches

- First search: ~1-2 seconds (uses AI)
- Follow-up search (same term): <100ms (cached)
- 3+ searches in 1 minute: May hit rate limit (expected)

### Recommendations

- First load: ~1-2 seconds
- Subsequent loads: Instant (cached)
- Different products: ~1-2 seconds each

### Forecasts

- First load: ~2-3 seconds
- Within 1 hour: Instant (cached)
- Next day: ~2-3 seconds (new data)

---

## Support

### Documentation

- `AI_FEATURES_GUIDE.md` - Complete feature documentation
- `QUOTA_MANAGEMENT_GUIDE.md` - Quota and troubleshooting
- Code comments - Inline explanations

### Quick Reference

- Quota limit: 2 req/min per feature
- Cache duration: 1 hour
- Fallback available: Yes (always works)
- Free tier cost: $0
- Paid tier: ~$3-10/month

---

## What's Coming Soon?

Potential future enhancements:

- Image search (upload photo to find similar products)
- Multi-language support
- Export forecasts as PDF
- Advanced competitor analysis
- Real-time alerts for trends
- Custom recommendation rules

---

**Ready to use?** Start searching! 🚀

The AI features are active and ready. Hit limitations? Check `QUOTA_MANAGEMENT_GUIDE.md` for solutions.

**Last Updated:** January 18, 2026
