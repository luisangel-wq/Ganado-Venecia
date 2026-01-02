# 🔑 WHERE TO ADD YOUR API KEY

## ⚠️ You're on the WRONG tab!

The API key configuration is in the **Config** tab, not the IA tab.

---

## ✅ CORRECT STEPS:

1. Look at the navigation tabs at the top
2. **Click on "⚙️ Config"** (last tab on the right)
3. Scroll down if needed
4. You'll see a section called **"Google Gemini API"**
5. **Paste your key** in the input field
6. Click **"💾 Guardar API Key"**

Then go back to the IA tab to use it!

---

## 🎯 EVEN FASTER: Use Console Command

Since the UI might be confusing, just use the browser console:

1. **Press F12** (or right-click → Inspect)
2. Click on **"Console"** tab
3. **Paste this command**:

```javascript
localStorage.setItem('googleApiKey', 'AIzaSyBLfRo5o7SpVNhuijFLBlUskGVka0Ml66k');
localStorage.setItem('aiProvider', 'google');
alert('✅ API Key guardada! Recarga la página (F5)');
```

4. **Press Enter**
5. **Reload the page** (F5 or Ctrl+R)

**Done!** Now go to the IA tab and try an analysis.

---

## 📍 Tab Locations:

```
[🏠 Inicio] [📝 Eventos] [📊 Inventario] [📸 Fotos] [⚖️ Progreso] 
[💉 Salud] [🌿 Potreros] [📥 Entradas] [📤 Salidas] [📈 Reportes] 
[🤖 IA] ← You are here (but API config is not here!)
[⚙️ Config] ← API KEY IS HERE! Click this tab!
```

---

## ✨ Quick Summary:

**Option 1 (UI):** Click **⚙️ Config** tab → Find API key input → Paste → Save

**Option 2 (Console):** Press F12 → Console → Paste command → Enter → Reload

**Both work perfectly!** Choose whichever is easier for you. 🎉
