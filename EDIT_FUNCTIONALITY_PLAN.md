# 📝 Plan: Add Edit Functionality to Ganado Venecia

## 🎯 Objective
Add the ability to edit animal data, compras (purchases), and ventas (sales) after they've been registered.

## 📋 Requirements

### 1. **Edit Inventory Animals** 🐂
When viewing an animal's profile (clicking on animal in inventory):
- ✏️ Edit weight
- ✏️ Edit breed
- ✏️ Edit sex
- ✏️ Edit entry date
- ✏️ Edit entry price
- ✏️ Edit lote
- ✏️ Edit chapeta number
- ✏️ Edit any other basic info

### 2. **Edit Compras (Purchase Records)** 📥
In the Entradas/Eventos tab:
- ✏️ Edit animal weight at purchase
- ✏️ Edit purchase price per kg
- ✏️ Edit total purchase cost
- ✏️ Edit purchase date
- ✏️ Edit seller/transporter info

### 3. **Edit Ventas (Sales Records)** 📤
In the Salidas tab:
- ✏️ Edit sale weight
- ✏️ Edit sale price per kg
- ✏️ Edit total sale value
- ✏️ Edit sale date
- ✏️ Edit buyer info

## 🔨 Implementation Approach

### Option A: Inline Editing ✨ (RECOMMENDED)
- Add "✏️ Editar" button next to data fields
- Click button → field becomes editable
- Save changes → update localStorage & sync to cloud
- Better UX, faster editing

### Option B: Edit Modal/Dialog 
- Add "✏️ Editar" button
- Opens modal/dialog with form
- Edit all fields
- Save changes
- More traditional approach

## 📐 Technical Implementation

### Key Functions to Add:

```javascript
// 1. Edit animal in inventory
function editAnimalData(numero) {
    // Find animal
    // Show editable form
    // Save changes to entradas array
    // Update display
    // Sync to cloud
}

// 2. Edit purchase record
function editCompraRecord(numero, index) {
    // Find entrada record
    // Allow editing: peso, costo, fecha, etc.
    // Save changes
    // Sync to cloud
}

// 3. Edit sale record
function editVentaRecord(numero, index) {
    // Find salida record
    // Allow editing: peso, precio, fecha, comprador, etc.
    // Save changes
    // Sync to cloud
}

// 4. Update animal calculations
function recalculateAnimalMetrics(numero) {
    // After editing, recalculate:
    // - GDP (ganancia diaria)
    // - Current estimated weight
    // - ROI
    // - Days in farm
}
```

### Files to Modify:
- `index.html` - Main application file
  - Add edit buttons to animal profile display
  - Add edit buttons to eventos/entradas table
  - Add edit buttons to salidas table
  - Implement edit functions
  - Handle form validation
  - Update cloud sync after edits

### Safety Measures:
1. ✅ Confirmation before saving major changes
2. ✅ Validate data (no negative weights, valid dates, etc.)
3. ✅ Keep edit history/audit log (optional)
4. ✅ Auto-sync to cloud after edit
5. ✅ Show toast notification on successful edit

## 🎨 UI/UX Design

### Animal Profile Edit:
```
┌─────────────────────────────────────┐
│ 🐂 Animal #123                      │
│                                     │
│ Peso: 350 kg        [✏️ Editar]    │
│ Raza: Cebú          [✏️ Editar]    │
│ Sexo: Macho         [✏️ Editar]    │
│ Lote: A1            [✏️ Editar]    │
│ Fecha Entrada: ...  [✏️ Editar]    │
│                                     │
│ [💾 Guardar Cambios] [❌ Cancelar] │
└─────────────────────────────────────┘
```

### Purchase/Sale Edit:
```
┌─────────────────────────────────────┐
│ Editar Venta #123                   │
│                                     │
│ Peso Salida: [___] kg              │
│ Precio/Kg:   $[____]               │
│ Total:       $_______ (calculado)  │
│ Fecha:       [____/__/__]          │
│ Comprador:   [_____________]       │
│                                     │
│ [💾 Guardar] [❌ Cancelar]         │
└─────────────────────────────────────┘
```

## 📊 Data Integrity

### What Happens When You Edit:
1. **Edit Animal Weight at Entry:**
   - Updates base weight
   - Recalculates GDP
   - Updates estimated current weight
   
2. **Edit Sale Weight:**
   - Updates sale record
   - Recalculates total sale value
   - Updates profit metrics
   
3. **Edit Dates:**
   - Recalculates days in farm
   - Updates GDP calculations
   - May affect reports

## 🚀 Implementation Steps

1. ✅ Create this plan document
2. ⏳ Add edit functions to index.html
3. ⏳ Add edit buttons to UI
4. ⏳ Test edit functionality
5. ⏳ Ensure cloud sync works
6. ⏳ Commit and deploy

## ⚠️ Important Notes

- **Cloud Sync:** All edits must sync to Firebase to keep devices in sync
- **Validation:** Prevent invalid data (negative weights, future dates, etc.)
- **User Feedback:** Show clear messages when edits succeed or fail
- **Permissions:** Consider if you want to restrict who can edit (future feature)

## 📝 Next Steps

Once you approve this plan, I will:
1. Implement the edit functions
2. Add edit buttons to the UI
3. Test thoroughly
4. Commit and push changes
5. Update all devices

---
**Status:** 📋 Planning Complete - Awaiting Approval for Implementation
**Priority:** 🔴 High
**Complexity:** 🟡 Medium
