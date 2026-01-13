# 🔥 How to Update Firebase API Key (Optional)

**Important:** This is OPTIONAL. Your Firebase key is probably fine. Only do this if you want maximum security.

---

## 🎯 When to Update Firebase Key

✅ **Update if:**
- You see unauthorized access in Firebase Console
- You want extra security after repo was public
- Firebase shows unusual activity/usage

❌ **Don't update if:**
- Just want AI to work (only need Gemini key)
- Everything is working fine
- No security concerns

---

## 📋 Step-by-Step Instructions

### Step 1: Access Firebase Console (2 minutes)

1. Go to: **https://console.firebase.google.com**
2. Sign in with your Google account
3. Select project: **"ganado-venecia"**
4. You should see your project dashboard

### Step 2: Get Current Configuration (3 minutes)

1. Click the **gear icon** ⚙️ (top left, next to "Project Overview")
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Find the **Web app** (looks like `</>` icon)
5. You'll see the Firebase configuration

### Step 3: View Your Current Config

Your current config looks like this:

```javascript
{
  apiKey: "AIzaSyCFaQ6L03LLerzAlR2cj02QG_RDo53gzLk",
  authDomain: "ganado-venecia.firebaseapp.com",
  databaseURL: "https://ganado-venecia-default-rtdb.firebaseio.com",
  projectId: "ganado-venecia",
  storageBucket: "ganado-venecia.firebasestorage.app",
  messagingSenderId: "931365494438",
  appId: "1:931365494438:web:b9618219282fad9b715e67",
  measurementId: "G-ZZ3LMW93L4"
}
```

### Step 4: Option A - Keep Current Key (Recommended)

**If nothing is broken, keep using the current key.**

Just update your local `firebase-config.js` file:

```bash
# 1. Make sure firebase-config.js is not tracked by git
git rm --cached firebase-config.js

# 2. The file stays on your computer with current values
# 3. It won't be committed (thanks to .gitignore)
```

### Step 5: Option B - Regenerate API Key (Advanced)

⚠️ **Warning:** This will break the app on ALL devices until you update them!

1. In Firebase Console → Project Settings
2. Under "Your apps" → Web app
3. Click **"Add Firebase to your web app"** button
4. You'll see the config again
5. To regenerate the key:
   - Go to **"General"** tab
   - Scroll to **"Web API Key"**
   - Click the refresh/regenerate icon
   - Confirm regeneration
   - **Copy the new API key**

### Step 6: Update firebase-config.js (2 minutes)

On **YOUR computer** (the file is in your project folder):

1. Open: `firebase-config.js` in a text editor
2. Replace the `apiKey` value with your new key:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_NEW_KEY_HERE",  // ← Replace this line
  authDomain: "ganado-venecia.firebaseapp.com",
  databaseURL: "https://ganado-venecia-default-rtdb.firebaseio.com",
  projectId: "ganado-venecia",
  storageBucket: "ganado-venecia.firebasestorage.app",
  messagingSenderId: "931365494438",
  appId: "1:931365494438:web:b9618219282fad9b715e67",
  measurementId: "G-ZZ3LMW93L4"
};
```

3. **Save the file**
4. **DO NOT commit it to git** (it's in .gitignore)

### Step 7: Update Your Brothers' Devices

If you regenerated the key, your brothers need the new config:

**Option A: Share the file**
1. Send them the updated `firebase-config.js` file
2. They replace their local file
3. Refresh the app

**Option B: Share just the key**
1. Tell them to open `firebase-config.js`
2. Update line 9: `apiKey: "NEW_KEY_HERE"`
3. Save and refresh

---

## 🔒 Important: Secure Firebase with Security Rules

Firebase keys are meant to be public, but you should secure your database with rules:

### Step 1: Set Up Security Rules (5 minutes)

1. Go to Firebase Console
2. Click **"Realtime Database"** (left sidebar)
3. Click **"Rules"** tab
4. Replace with these rules:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

**This requires authentication to read/write data.**

### Step 2: Or Use These Family-Only Rules

If you want to restrict to specific users:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "ganado-data": {
      ".read": "auth != null && (auth.uid === 'YOUR_UID_1' || auth.uid === 'YOUR_UID_2' || auth.uid === 'YOUR_UID_3')",
      ".write": "auth != null && (auth.uid === 'YOUR_UID_1' || auth.uid === 'YOUR_UID_2' || auth.uid === 'YOUR_UID_3')"
    }
  }
}
```

Replace `YOUR_UID_1`, `YOUR_UID_2`, etc. with your actual user IDs.

---

## ✅ Verification Checklist

After updating Firebase config:

- [ ] firebase-config.js updated with new values
- [ ] File saved locally
- [ ] File NOT committed to git (check with `git status`)
- [ ] App still loads without errors
- [ ] Cloud sync still works
- [ ] Data still syncs between devices
- [ ] Brothers' devices updated (if you regenerated key)

---

## 🆘 Troubleshooting

### "Cloud sync not working after update"

**Check:**
1. Firebase config values are correct (no typos)
2. API key is active in Firebase Console
3. Browser console (F12) for specific errors
4. Internet connection is working

### "Can't find firebase-config.js"

**Location:** Should be in your project root:
```
/Users/beatrizescobar/Projects/Ganado-Venecia/firebase-config.js
```

### "Git wants to commit firebase-config.js"

**Solution:**
```bash
# Remove from git tracking
git rm --cached firebase-config.js

# Verify .gitignore contains:
# firebase-config.js

# Check status
git status
# Should NOT show firebase-config.js
```

---

## 📊 Summary

### Recommended: Keep Current Key
- Firebase keys are designed to be semi-public
- Secure with Firebase Security Rules instead
- Less hassle for your brothers
- Everything keeps working

### Advanced: Regenerate Key
- Maximum security
- Requires updating all devices
- More complex but more secure
- Good if you suspect unauthorized access

---

## 🎯 Quick Commands

```bash
# Check if firebase-config.js is tracked
git ls-files | grep firebase-config.js

# Remove from git tracking (keeps local file)
git rm --cached firebase-config.js

# Verify it's in .gitignore
cat .gitignore | grep firebase-config

# Check git status (should not show firebase-config.js)
git status
```

---

**Bottom Line:** For your use case (family app, private repo), keeping the current Firebase key and securing with Firebase Rules is the best approach.

Only regenerate if you have specific security concerns.
