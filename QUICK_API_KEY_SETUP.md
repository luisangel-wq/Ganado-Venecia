# 🔑 Quick API Key Setup Guide

## ⚠️ IMPORTANT: Why NOT in Source Code

I **cannot** add your API key directly to `index.html` because:

1. ❌ It would be **exposed on GitHub** (public repository)
2. ❌ Google would **detect and block it** (same as before)
3. ❌ Anyone could **steal and abuse** your key
4. ❌ You'd hit the **same security error** again

---

## ✅ SOLUTION: Add It Through the Browser (30 seconds)

### Step-by-Step:

1. **Your app is running** at: http://localhost:8000
2. **Open** that URL in your browser
3. **Click** the "IA" tab (🤖 icon at the top)
4. **Click** the "Google" button
5. **Paste** your key: `AIzaSyBLfRo5o7SpVNhuijFLBlUskGVka0Ml66k`
6. **Click** "💾 Guardar API Key"

**Done!** ✅ Your key is now saved securely in localStorage.

---

## 🎯 Alternative: JavaScript Console (Even Faster!)

If you want to add it instantly:

1. **Open** http://localhost:8000
2. **Press** F12 (open Developer Tools)
3. **Go to** Console tab
4. **Paste** this command:

```javascript
localStorage.setItem('googleApiKey', 'AIzaSyBLfRo5o7SpVNhuijFLBlUskGVka0Ml66k');
localStorage.setItem('aiProvider', 'google');
alert('✅ API Key configured! Reload the page.');
```

5. **Press** Enter
6. **Reload** the page (F5)

**Done!** The key is now active.

---

## 🔐 For Production (If You Want to Share)

If you want others to use your app with AI features:

### Option 1: Each User Gets Their Own Key (Recommended)
- Document in README how to get a free Google Gemini key
- Users configure it through the UI
- Everyone's quota is separate

### Option 2: Backend Proxy (Advanced)
- Create a Node.js/Python backend
- Backend holds the key securely
- Frontend calls your backend (not Google directly)
- You can add rate limiting, monitoring, etc.

### Option 3: Environment Variables (For Deployment)
- Use Netlify/Vercel environment variables
- Key never appears in code
- Build process injects it at deployment time

---

## 💡 Current Status

Your key: `AIzaSyBLfRo5o7SpVNhuijFLBlUskGVka0Ml66k`

**To use it:**
- ✅ Add through browser UI (recommended)
- ✅ Add via console command (fastest)
- ❌ DO NOT commit to source code (security risk)

---

## 🚀 Test It Works

After adding the key:

1. Go to "IA" tab
2. Click any quick analysis button (e.g., "📋 Resumen General")
3. You should see the AI analysis appear

If you see an error, check:
- Key is correctly pasted (no extra spaces)
- You're using the "Google" provider
- Internet connection is working

---

**Need help?** The key is ready to use - just add it through the UI! 🎉
