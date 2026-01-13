# 🔒 Security Fix - API Key Update Required

**Date:** January 13, 2026
**Status:** FIXED - User Action Required
**Priority:** HIGH

---

## 🚨 What Happened

The embedded Google Gemini API key in your application was **compromised and publicly exposed**. Google has disabled this key for security reasons (Error 403).

Additionally, the app was using **outdated model names** that no longer exist in Google's API, causing 404 errors.

---

## ✅ What Was Fixed

### 1. Security Issue
- **Removed** the compromised API key from the code
- Users now **must configure their own API key** for security

### 2. Model Updates
Updated to stable Gemini models (January 2026):

**Before:**
- ❌ `gemini-2.0-flash` (v1beta endpoint) - 403 Error
- ❌ `gemini-1.5-flash-latest` (v1beta) - 404 Error
- ❌ `gemini-pro` (v1) - 404 Error

**After:**
- ✅ `gemini-1.5-flash` (v1 endpoint) - Fast & stable
- ✅ `gemini-1.5-pro` (v1 endpoint) - Advanced fallback

### 3. Better Error Messages
- Clear guidance when API key is missing
- Helpful messages for 403 (compromised key)
- Auto-scroll to configuration section
- Link to get new API key: https://aistudio.google.com/apikey

---

## 🔑 ACTION REQUIRED: Get Your Own API Key

### Step 1: Get a Free Google AI Studio API Key

1. Go to: **https://aistudio.google.com/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"** or **"Get API Key"**
4. Copy the key (starts with `AIza...`)

### Step 2: Configure in the App

1. Open the app: [index.html](index.html)
2. Navigate to: **Configuración → IA**
3. Find the section: **"API Key de Google"**
4. Paste your new API key
5. Click **"Guardar"** (Save)

### Step 3: Test It

1. Go to the **IA** tab
2. Try a quick analysis: "Cuanto vale el inventario de La Vega"
3. You should see results without errors

---

## 📊 API Limits (Free Tier)

Google AI Studio Free Tier includes:
- ✅ **15 requests per minute**
- ✅ **1,500 requests per day**
- ✅ **Perfect for small-medium ranch operations**
- ✅ **No credit card required**

For higher limits, you can upgrade to Google Cloud billing.

---

## 🔍 Files Modified

### [index.html](index.html)

**Lines 14641-14651:** Removed compromised key and updated models
```javascript
// BEFORE:
const DEFAULT_GEMINI_API_KEY = 'AIzaSyA2OpWwDWSvFVdtEGOEQiE5eKnt6CFKcqA'; // COMPROMISED
const GEMINI_MODEL_FALLBACKS = [
    { name: 'gemini-2.0-flash', endpoint: 'v1beta' },      // 403 Error
    { name: 'gemini-1.5-flash-latest', endpoint: 'v1beta' }, // 404 Error
    { name: 'gemini-pro', endpoint: 'v1' }                  // 404 Error
];

// AFTER:
const DEFAULT_GEMINI_API_KEY = ''; // Removed - use your own key
const GEMINI_MODEL_FALLBACKS = [
    { name: 'gemini-1.5-flash', endpoint: 'v1' },  // ✅ Stable
    { name: 'gemini-1.5-pro', endpoint: 'v1' }     // ✅ Stable
];
```

**Lines 14658-14667:** Better error handling when no key is configured

**Lines 14729-14737:** Specific error messages for API failures

---

## 🆘 Troubleshooting

### Error: "Por favor configure su API Key de Google"
**Solution:** Follow the steps above to get and configure your own API key.

### Error: "API Key inválida o reportada como comprometida"
**Solution:** Your API key may have been leaked. Generate a new one at https://aistudio.google.com/apikey

### Error: "Límite de API alcanzado"
**Solution:** You've hit the rate limit (15 requests/min or 1,500/day). Wait a minute and try again.

### Still seeing 404 errors?
**Solution:** Refresh the page (Ctrl+F5 or Cmd+Shift+R) to load the updated code.

---

## 🔐 Security Best Practices

1. **Never commit API keys to Git** - Use environment variables or user configuration
2. **Each user should have their own key** - Don't share keys between devices/users
3. **Regenerate keys if exposed** - If your key appears in logs or is shared publicly
4. **Monitor API usage** - Check usage at https://aistudio.google.com to detect unauthorized use

---

## ✅ Verification Checklist

After configuring your API key, verify:

- [ ] No more 403 "API key was reported as leaked" errors
- [ ] No more 404 "model not found" errors
- [ ] AI responses work in the **IA** tab
- [ ] Custom questions get answered
- [ ] Photo recognition works (if you use that feature)

---

## 📞 Support

If you continue to have issues after following these steps:

1. Check browser console (F12) for detailed error messages
2. Verify your API key is valid at https://aistudio.google.com/apikey
3. Ensure you have internet connectivity
4. Try clearing browser cache and refreshing

---

**Status:** ✅ CODE FIXED - Awaiting user API key configuration
