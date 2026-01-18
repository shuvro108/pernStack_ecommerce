# Get Your FREE Gemini API Key

## 🎁 Free Tier Benefits

- **1,500 requests per day**
- **15 requests per minute**
- **No credit card required**
- **Better than Groq for recommendations!**

## 📝 Steps to Get API Key

1. **Go to Google AI Studio**

   ```
   https://aistudio.google.com/app/apikey
   ```

2. **Sign in with your Google account**

3. **Click "Create API Key"**

4. **Copy the API key** (starts with `AIzaSy...`)

5. **Add to your `.env` file:**

   ```bash
   GEMINI_API_KEY='AIzaSy...'  # Replace with your actual key
   ```

6. **Restart your dev server:**
   ```bash
   npm run dev
   ```

## ✅ Done!

Your app will now use:

- **Primary**: Groq AI (10k/month, ultra-fast)
- **Backup**: Gemini AI (1.5k/day, highest quality)
- **Fallback**: Local algorithms (always works)

## 🔍 How to Verify It's Working

Check the terminal logs when viewing products:

- ✅ `Using Groq AI for recommendations` → Groq is working
- ✅ `Using Gemini AI for recommendations` → Gemini backup kicked in
- ⚠️ `Using smart local recommendations` → Both APIs unavailable (local fallback)

Same for admin insights!
