# AI Features Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Search Form  │  │   Product    │  │   Seller Dashboard       │  │
│  │              │  │   Details    │  │   (AI Analytics)         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
└──────────┬──────────────┬──────────────────┬──────────────────────────┘
           │              │                  │
           │ POST query   │ GET product      │ GET forecast
           │              │                  │
┌──────────▼──────────────▼──────────────────▼──────────────────────────┐
│                    NEXT.js API Layer                                   │
│                                                                        │
│  ┌─────────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │ /api/ai/search      │  │ /api/ai/          │  │ /api/ai/       │  │
│  │                     │  │ recommendations   │  │ demand-        │  │
│  │ - Rate limit check  │  │                   │  │ forecast       │  │
│  │ - Cache lookup      │  │ - Rate limit      │  │                │  │
│  │ - Gemini call       │  │ - Cache lookup    │  │ - Rate limit   │  │
│  │ - Fallback search   │  │ - Gemini call     │  │ - Cache        │  │
│  │ - Cache result      │  │ - Fallback        │  │ - Analysis     │  │
│  │ - Return response   │  │ - Cache result    │  │ - Forecast     │  │
│  └─────────────────────┘  └──────────────────┘  └────────────────┘  │
│                                                                        │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ QuotaManager (/lib/geminiQuotaManager.js)                      │  │
│  │  • Rate limiting logic (2 req/min)                             │  │
│  │  • Cache management (1 hour TTL)                               │  │
│  │  • Fallback algorithms                                         │  │
│  │  • Error handling                                              │  │
│  └────────────────────────────────────────────────────────────────┘  │
└────────┬──────────────────────────────────────────────────────────────┘
         │
    ┌────▼─────────────────────────────────────────────────┐
    │  External APIs & Data                                 │
    │                                                        │
    │  ┌──────────────────┐  ┌─────────────────────────┐  │
    │  │ Google Gemini    │  │ Prisma/PostgreSQL DB    │  │
    │  │ API              │  │ - Products              │  │
    │  │ (AI Models)      │  │ - Orders                │  │
    │  │ Status: 429 when │  │ - Users                 │  │
    │  │ quota exceeded   │  │ - Reviews               │  │
    │  └──────────────────┘  └─────────────────────────┘  │
    │                                                        │
    └─────────────────────────────────────────────────────┘
```

---

## Request Flow - Smart Search

```
USER SEARCH
    │
    ▼
┌─────────────────────────────────────────┐
│ POST /api/ai/search                     │
│ {"query": "elegant pottery bowls"}      │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        ┌─────────────────────┐
        │ Check Rate Limit    │
        │ (2 req/min)         │
        └────┬──────────┬─────┘
             │          │
        ALLOWED    BLOCKED (Wait 60s)
             │          │
             ▼          ▼
        Try Cache   Return: "Rate limited"
             │
        ┌────┴────┐
        │          │
    HIT   MISS
    (instant)
        │
        ▼
    Return cached
    results
        │
        ▼
   USER SEES RESULTS

   [If MISS]
    │
    ▼
   Fetch all products
   from database
    │
    ▼
   Initialize Gemini AI
    │
    ▼
   Send prompt + products
    │
    ▼
   ┌──────────────────┐
   │ GEMINI RESPONSE  │
   └────┬─────────┬──┘
        │         │
    SUCCESS  QUOTA_ERROR/429
        │         │
        ▼         ▼
    Parse JSON  Use Fallback:
    Results   Keyword Search
        │         │
        ▼         ▼
    Cache for 1hr
    (instant future searches)
        │
        ▼
    Return to user
```

---

## Request Flow - Recommendations

```
USER VIEWS PRODUCT
    │
    ▼
GET /api/ai/recommendations?productId=prod-1
    │
    ▼
┌─────────────────────────────────────────┐
│ Check Rate Limit (2 req/min per user)   │
└──────────────┬─────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
    ALLOWED      BLOCKED
        │             │
        ▼             ▼
   Try Cache    Return cached recs
   for this      or generic list
   user
        │
    ┌───┴───┐
    │       │
   HIT    MISS
        │
        ▼
    If user logged in:
    ├─ Get purchase history
    ├─ Get category preferences
    └─ Get recent views
        │
        ▼
    Fetch all products
        │
        ▼
    Build AI prompt with context:
    - "User bought pottery"
    - "Currently viewing textiles"
    - "Price range: $30-50"
        │
        ▼
    Call Gemini API
        │
    ┌──────────┬──────────┐
    │          │          │
   SUCCESS  QUOTA_ERR  ERROR
    │          │          │
    ▼          ▼          ▼
  Parse    Fallback  Return error
  Results  Cats      message
    │
    ▼
  Cache for 1hr
  (instant next time)
    │
    ▼
  Return recommendations
  to user
    │
    ▼
USER SEES:
"You Might Also Like"
├─ Product A (reason: similar category)
├─ Product B (reason: complements)
└─ ...
```

---

## Request Flow - Demand Forecasting

```
SELLER VISITS DASHBOARD
    │
    ▼
GET /api/ai/demand-forecast
    │
    ▼
┌──────────────────────┐
│ Check Authentication │
│ (seller only)        │
└────┬──────────┬──────┘
     │          │
  VALID     INVALID
     │          │
     ▼          ▼
  Continue  Return 401/403
     │
     ▼
Rate Limit Check
(2 req/min per seller)
     │
  ┌──┴──┐
  │     │
 OK  BLOCKED
  │     │
  ▼     ▼
Cache  Return cached
lookup forecast
  │
┌─┴─┐
│   │
HIT MISS
│
▼
Instant
return

[If MISS]
│
▼
Query Orders (last 90 days)
├─ Get product sales
├─ Get category sales
└─ Get daily trends
│
▼
Analyze Data:
├─ Top products (by revenue)
├─ Top categories
├─ Sales trends
└─ Calculate averages
│
▼
Build AI prompt with:
- Sales summary
- Top 10 products
- Top 5 categories
- 30-day trend
│
▼
Call Gemini API
│
┌──────────┬──────────┐
│          │          │
SUCCESS  QUOTA_ERR  ERROR
│          │          │
▼          ▼          ▼
Parse    Fallback  Return
AI      Analysis  error
Insights
│
▼
Cache for 1hr
│
▼
Return to seller:
├─ Sales summary
├─ Key insights
├─ Trends (growing/declining)
├─ Recommendations
└─ Revenue forecast
```

---

## Cache & Rate Limit States

```
REQUEST TIMELINE
(Single endpoint, same user)

Time:    0s      30s     60s     90s     120s    150s
         │       │       │       │       │       │
Req 1 ───┼──→ [CACHE HIT - INSTANT]
         │       │       │       │       │       │
Req 2 ───┼──────┼──→ [CACHE HIT - INSTANT]
         │       │       │       │       │       │
Req 3 ───┼──────┼──────┼──→ [RATE LIMITED: WAIT 60s]
         │       │       │       │       │       │
Req 4 ───┼──────┼──────┼──────┼──→ [RATE LIMITED: WAIT 30s]
         │       │       │       │       │       │
         RATE LIMIT WINDOW (60 seconds)
                                       └───────┘
                                    After 60s: Can request

Cache expires: 1 hour (3600 seconds)
```

---

## Fallback Strategy Decision Tree

```
REQUEST COMES IN
    │
    ▼
API Available?
    │
    ├─ NO → Use Fallback
    │
    └─ YES → Rate Limit OK?
             │
             ├─ NO → Use Fallback or Cache
             │
             └─ YES → Check Cache?
                      │
                      ├─ HIT → Return instantly
                      │
                      └─ MISS → Call Gemini
                               │
                               ├─ SUCCESS → Cache & Return
                               │
                               ├─ QUOTA (429) → Fallback
                               │
                               └─ ERROR (500) → Fallback


FALLBACK SELECTION
    │
    ├─ SEARCH
    │  └─ Keyword-based text matching
    │     Results: Still relevant, less "smart"
    │
    ├─ RECOMMENDATIONS
    │  └─ Category-based suggestions
    │     Results: Good, just not personalized
    │
    └─ FORECAST
       └─ Statistical trend analysis
          Results: Useful, just not AI-enhanced
```

---

## Data Flow - Quota Manager

```
QuotaManager Operations:

┌─────────────────────────────────────┐
│ INCOMING REQUEST                    │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │ Check Rate Limit     │
    │ requestTimestamps    │
    │ Map                  │
    └────┬──────────┬──────┘
         │          │
      PASS       FAIL
         │          │
         ▼          ▼
       Continue  Return 429/
                 RetryAfter
         │
         ▼
    ┌──────────────────────┐
    │ Check Cache          │
    │ cache Map            │
    │ timestamp validation  │
    └────┬──────────┬──────┘
         │          │
      VALID     EXPIRED/
      (HIT)     MISS
         │          │
         ▼          ▼
      Return    Continue
      cached
         │
         ▼
    ┌──────────────────────┐
    │ Execute API Call     │
    │ Monitor for errors   │
    └────┬──────────┬──────┘
         │          │
      SUCCESS    ERROR
         │          │
         ▼          ▼
    Store in  Analyze
    Cache     Error Type
    (1hr)         │
         │        └──→ Is 429?
         │             │
         │             ├─ YES → generateFallback()
         │             └─ NO → rethrow error
         │
         ▼
    Return Result


CACHE LIFECYCLE
    │
    Now ──→ 30min ──→ 60min ──→ 90min
    │       │         │         │
    ┌─────┐ │ ┌─────┐ │ ┌─────┐ │
    │STORE│ │ │ HIT │ │ │EXPIRE│
    └─────┘ │ └─────┘ │ └─────┘
            │         │
         timestamp:   Delete
        Jan 18        from
        12:00PM       Map


RATE LIMIT WINDOW
    │
    Now ──→ Request 1 ──→ Request 2 ──→ Request 3
    │       stored       stored        BLOCKED!
    │       time[0]      time[1]
    │                                  "Wait 60s"
    │
    Now+60s: time[0] expired from window
            Request 3 now allowed ✓
```

---

## Performance Comparison

```
SCENARIO: User does identical search 10 times in 1 hour

WITHOUT CACHING:
Request 1: 2000ms (API call)
Request 2: 2000ms (API call)
Request 3: 2000ms (API call)
Request 4: 2000ms (API call)
Request 5: 2000ms (API call)
...
Total:    20,000ms (20 seconds of waiting)
API Calls: 10

WITH CACHING:
Request 1: 2000ms (API call + store in cache)
Request 2: 50ms   (return from cache) ✓ 40x faster
Request 3: 50ms   (return from cache) ✓
Request 4: 50ms   (return from cache) ✓
Request 5: 50ms   (return from cache) ✓
...
Total:    2,450ms (2.4 seconds)
API Calls: 1

IMPROVEMENT: 89% reduction in time, 90% reduction in API calls


QUOTA COMPARISON:

FREE TIER (Current):
Users/day: 100 active users
Searches/user/day: 50 searches
With cache: 100 × 50 × 1 API call = 5,000 API calls
Free limit: 10,000 API calls ✓ WORKS

Forecast calls: 50 sellers, 10 calls/day = 500 API calls
Total: 5,000 + 500 = 5,500 API calls/day
Usage: 55% of daily quota ✓

WITHOUT CACHE:
Same scenario: 100 × 50 = 5,000 + 500 = 5,500 searches
Total API calls: 5,500 × 100% = 5,500 ✓ Still works!

But if 200 active users: 10,000+ API calls/day ✗ EXCEEDS QUOTA
```

---

## Error Handling Flow

```
┌─────────────────────────────────┐
│ API CALL MADE                   │
└────────────────┬────────────────┘
                 │
                 ▼
         Try/Catch Block
                 │
    ┌────────────┴────────────┐
    │                         │
SUCCESS              ERROR
    │                 │
    ▼                 ▼
Parse         handleGeminiError()
Response           │
    │      ┌───────┼───────┐
    │      │       │       │
    ▼   429err  503err  Other
Return         │       │       │
Result    ┌────┘   ┌───┘   ┌──┘
          │        │       │
          ▼        ▼       ▼
       Generate Fallback  Throw
       Fallback           Error
       Return with
       metadata:
       - isAI: false
       - quotaExceeded: true
       - retryAfter: 60
       - message: "..."


USER RECEIVES:
{
  products: [...],
  explanation: "Using fallback search",
  isAI: false,
  quotaExceeded: true,
  retryAfter: 60,
  message: "Please wait 60 seconds before retry"
}

User Experience:
✓ Gets results
✓ Knows why results are different
✓ Knows when to retry
✓ No "error" perception
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────┐
│           Terracotta e-commerce                 │
├─────────────────────────────────────────────────┤
│ Frontend          │ React/Next.js               │
│ Backend           │ Next.js API Routes          │
│ Database          │ PostgreSQL (Neon)           │
│ ORM               │ Prisma                      │
│ Auth              │ Clerk                       │
│ Files             │ Cloudinary                  │
│ Job Queue         │ Inngest                     │
├─────────────────────────────────────────────────┤
│ AI Features       │                             │
│ ├─ Search         │ Google Gemini 2.0 Flash    │
│ ├─ Recommendations│ Google Gemini 2.0 Flash    │
│ └─ Forecasting    │ Google Gemini 2.0 Flash    │
├─────────────────────────────────────────────────┤
│ New Modules       │                             │
│ └─ QuotaManager   │ In-memory caching + limits  │
│                   │ /lib/geminiQuotaManager.js  │
└─────────────────────────────────────────────────┘
```

---

## Deployment Architecture

```
GitHub Repository
    │
    ├─ Code push
    │
    ▼
Vercel (or self-hosted)
    │
    ├─ Build
    │  └─ npm run build
    │
    ├─ Deploy
    │  └─ Next.js server starts
    │
    ▼
Running Application
    │
    ├─ /app/api/ai/search
    ├─ /app/api/ai/recommendations
    ├─ /app/api/ai/demand-forecast
    │
    ├─ /lib/geminiQuotaManager.js (in-memory)
    │
    ├─ Connects to:
    │  ├─ PostgreSQL/Neon (persistent)
    │  ├─ Google Gemini API (external)
    │  └─ Clerk Auth (external)
    │
    ▼
User Requests
    │
    ├─ Browser → Next.js API
    ├─ API → QuotaManager
    ├─ QuotaManager → Cache/Gemini/Fallback
    └─ Response → Browser
```

---

**Diagrams Generated:** January 18, 2026
**Format:** ASCII Art (works everywhere)
**Last Updated:** Implementation Summary
