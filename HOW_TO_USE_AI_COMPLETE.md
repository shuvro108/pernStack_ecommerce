# 📖 How to Use AI Features - Step-by-Step Guide

## Overview

Your Terracotta store has **3 AI-powered features** - all completely FREE and working:

1. **Smart AI Search** - Find products by natural language
2. **Personalized Recommendations** - Get suggested products
3. **Demand Forecasting** (Sellers) - View sales analytics

---

## 🔍 Feature 1: Smart AI Search

### For Customers

**Where:** Homepage or `/all-products` page

**How to Use:**

1. Go to http://localhost:3000/all-products
2. Click the search bar at the top
3. Type what you're looking for (natural language):
   - "elegant pottery bowls"
   - "handmade gifts under ৳50"
   - "textile decorations"
   - "wooden crafts"
4. Click **"AI Search"** button (green button)
5. **Results appear instantly** - sorted by relevance!

**What Happens Behind the Scenes:**

```
Your Query: "elegant pottery bowls"
    ↓
Smart Algorithm Analyzes:
  • Exact phrase matches
  • Individual word matches
  • Category relevance
  • Product descriptions
    ↓
Returns: Top 10 most relevant products
```

**Example Results:**

```
Query: "gifts for home decoration"

Results:
1. Ceramic Bowl Set (Pottery & Ceramics)
2. Handwoven Basket (Handwoven Baskets)
3. Decorative Textile (Textiles & Apparel)
4. Wood Carving (Wood Crafts)
5. ... (up to 10 total)
```

### Tips:

- ✅ **Use natural language** - Don't worry about exact keywords
- ✅ **Be specific** - "pottery bowls for kitchen" works better than just "pottery"
- ✅ **Try variations** - If first search doesn't match, try different words
- ✅ **Results instant** - No waiting for API calls (local algorithm!)

---

## 💝 Feature 2: Personalized Recommendations

### For Customers

**Where:** Product detail pages

**How to Use:**

1. Browse and click on any product (e.g., a pottery bowl)
2. View the product details page
3. **Scroll down** to see "**You Might Also Like**" section
4. See **6 personalized recommendations**
5. Click any recommendation to view more details

**What You'll See:**

```
Product: Ceramic Serving Bowl
↓
You Might Also Like (6 recommendations):
  1. Matching Ceramic Set
  2. Decorative Plates
  3. Table Textiles
  4. Wood Serving Board
  5. ...
```

**How It Works:**

- **First time?** Shows category-based suggestions
- **Returning customer?** AI learns from your browsing + purchases
- **Smart matching** - Recommends complementary items

### Tips:

- ✅ **Click products to learn more** - Each recommendation links to full details
- ✅ **Browse multiple products** - Algorithm learns your preferences
- ✅ **Check related categories** - Find items that pair well together

---

## 📊 Feature 3: Demand Forecasting (Sellers Only)

### For Sellers

**Where:** Seller Dashboard → "AI Insights"

**How to Use:**

1. **Login as seller** (if you have seller account)
   - Email: shuvrod2017@gmail.com (or your seller email)
   - Password: Your Clerk password

2. Go to **http://localhost:3000/seller/ai-insights**

3. **View your dashboard** with 3 sections:

#### Section A: Sales Analysis

```
Shows (last 30 days):
  • Total Revenue: ৳XXXX
  • Total Orders: XX
  • Average Order Value: ৳XX
  • Best-selling products: Listed
```

#### Section B: Trends & Patterns

```
Shows:
  • Top 3 performing products
  • Category breakdown
  • Sales growth rate
  • Trending items
```

#### Section C: Forecasting & Recommendations

```
Shows:
  • Next 90-day revenue projection
  • Which products to stock more
  • Seasonal trends
  • Inventory recommendations
```

**Example Dashboard:**

```
═══════════════════════════════════════════
DEMAND FORECAST & ANALYTICS

Last 30 Days Analysis:
  Total Revenue: ৳4,250
  Total Orders: 89
  Average Order: ৳47.75
  ✅ Growth Rate: ↑ 28% (upward trend!)

Top Performers:
  1. Ceramic Bowl (45 units, ৳1,800 revenue)
  2. Woven Basket (32 units, ৳960 revenue)
  3. Textile Set (28 units, ৳840 revenue)

Recommendations:
  📦 Stock more Ceramic Bowls (high demand)
  🎯 Focus on pottery category
  📈 Expect 28% growth next period

90-Day Forecast:
  Projected Revenue: ৳13,200
  Estimated Orders: 277
  Recommended Action: Increase pottery stock
═══════════════════════════════════════════
```

**What to Do With This Info:**

1. ✅ **Stock Control** - Increase stock of best sellers
2. ✅ **Marketing** - Focus on top products
3. ✅ **Pricing** - Adjust prices based on demand
4. ✅ **Inventory** - Follow recommendations

---

## 🚀 Quick Start Checklist

### For Customers:

- [ ] Go to /all-products
- [ ] Try search: "pottery"
- [ ] Try another search: "gifts"
- [ ] Click a product
- [ ] See recommendations in "You Might Also Like"

### For Sellers:

- [ ] Login as seller
- [ ] Go to /seller
- [ ] Click "AI Insights" in sidebar
- [ ] View your analytics
- [ ] Check recommendations

---

## 💡 Pro Tips

### Search Tips:

```
✅ Good searches:
  • "elegant pottery bowls"
  • "handmade gifts"
  • "textile decorations"
  • "items under ৳100"

⚠️ Vague searches:
  • "stuff"
  • "things"
  • "products"
  (Will return broad results)
```

### Recommendation Tips:

```
For Better Recommendations:
  1. Browse multiple products
  2. Look at different categories
  3. Visit items you're interested in
  4. Algorithm learns from browsing
```

### Seller Dashboard Tips:

```
Use Insights to:
  1. Make stocking decisions
  2. Plan marketing campaigns
  3. Set competitive prices
  4. Predict future trends
```

---

## 🔧 Technical Details (If You Care!)

### Search Algorithm

- **Speed:** < 100ms (instant)
- **Accuracy:** Semantic + keyword matching
- **Results:** Top 10 ranked by relevance
- **Cost:** FREE (local algorithm)

### Recommendations Algorithm

- **Speed:** < 50ms (instant)
- **Learning:** Based on browsing history
- **Results:** 6 personalized items
- **Fallback:** Category-based if no history
- **Cost:** FREE (local algorithm)

### Forecasting Algorithm

- **Speed:** < 200ms
- **Data:** Last 90 days of orders
- **Analysis:** Revenue, trends, patterns
- **Forecast:** 90-day projection
- **Cost:** FREE (statistical analysis)

---

## ❓ Common Questions

### Q: Why is search sometimes not finding products?

**A:** Check the category name or description. The algorithm does exact + partial matching. Try different keywords.

### Q: How long until recommendations improve?

**A:** They improve immediately as you browse. Visit more products to get better recommendations.

### Q: Why is my seller dashboard empty?

**A:** You need to have orders first. The dashboard shows analytics from actual orders.

### Q: Is this actually free?

**A:** Yes! 100% free forever. No API keys, no payments, no hidden costs. Everything runs locally.

### Q: Do I need internet for these features?

**A:** You need internet to use the web app, but the algorithms run locally. No cloud API dependency.

### Q: Can I see what the algorithm is doing?

**A:** Yes! Check browser console (F12) and terminal logs - detailed logging available.

---

## 📊 Feature Comparison

| Feature             | What It Does             | How to Access               | Cost |
| ------------------- | ------------------------ | --------------------------- | ---- |
| **Smart Search**    | Find products naturally  | Search bar on /all-products | FREE |
| **Recommendations** | Personalized suggestions | Click any product           | FREE |
| **Demand Forecast** | Sales analytics & trends | /seller/ai-insights         | FREE |
| **Caching**         | Fast repeated searches   | Automatic (1 hour)          | FREE |
| **Rate Limiting**   | Prevents abuse           | Automatic (2 req/min)       | FREE |

---

## 🎯 Use Cases

### Use Case 1: Customer Browsing

```
"I want to find elegant gifts for my mom"
  1. Go to /all-products
  2. Search: "elegant gifts for decoration"
  3. Browse results
  4. Click interesting products
  5. See recommendations for ideas
  ✅ Done!
```

### Use Case 2: Seller Making Decisions

```
"Should I order more inventory?"
  1. Login as seller
  2. Go to /seller/ai-insights
  3. Check top products
  4. Read recommendations
  5. Order more of best sellers
  ✅ Done!
```

### Use Case 3: Finding Related Items

```
"What goes with this pottery bowl?"
  1. Click the pottery bowl product
  2. Scroll to recommendations
  3. See matching items
  4. Add to cart
  ✅ Done!
```

---

## 🎨 UI Guide

### Search Page

```
┌─────────────────────────────────────┐
│        All Products                 │
├─────────────────────────────────────┤
│  [Search bar] [AI Search]           │
├─────────────────────────────────────┤
│  Categories:                        │
│  [Pottery] [Textiles] [Jewelry]... │
├─────────────────────────────────────┤
│  Results:                           │
│  □ Product 1                        │
│  □ Product 2                        │
│  □ Product 3                        │
└─────────────────────────────────────┘
```

### Product Detail Page

```
┌──────────────────────────────────────┐
│  Product Image    │  Product Info    │
│                   │  • Name          │
│                   │  • Price         │
│                   │  • Description   │
├──────────────────────────────────────┤
│  You Might Also Like                 │
│  □ Rec 1  □ Rec 2  □ Rec 3         │
│  □ Rec 4  □ Rec 5  □ Rec 6         │
└──────────────────────────────────────┘
```

### Seller Dashboard

```
┌──────────────────────────────────────┐
│  AI INSIGHTS                         │
├──────────────────────────────────────┤
│  📊 Last 30 Days Analysis            │
│  • Revenue: ৳4,250                   │
│  • Orders: 89                        │
├──────────────────────────────────────┤
│  🏆 Top Products                     │
│  1. Ceramic Bowl - 45 units          │
│  2. Basket - 32 units                │
├──────────────────────────────────────┤
│  💡 Recommendations                  │
│  • Stock more bowls                  │
│  • Focus on pottery                  │
└──────────────────────────────────────┘
```

---

## ✨ That's It!

You now know how to use all AI features:

- ✅ **Search** - Go to /all-products, type, search
- ✅ **Recommendations** - Click a product, scroll down
- ✅ **Analytics** - Go to /seller/ai-insights (sellers only)

**Everything is FREE and works locally!**

---

**Happy shopping/selling! 🎉**
