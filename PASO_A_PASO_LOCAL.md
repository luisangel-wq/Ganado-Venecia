# 📝 GUÍA PASO A PASO - CONFIGURACIÓN LOCAL

**Objetivo:** Tener la aplicación funcionando perfectamente EN TU COMPUTADORA primero, antes de pensar en compartir o sincronizar.

---

## 🎯 PASO 1: ABRIR LA APLICACIÓN CORRECTAMENTE

### ✅ LA FORMA CORRECTA:
1. El servidor ya está corriendo en tu computadora
2. **Abre este link en Chrome o Safari:**
   ```
   http://localhost:8000
   ```
3. **Guarda este link en tus marcadores** - siempre úsalo para abrir la app

### ❌ NO HAGAS ESTO:
- ❌ No hagas doble clic en `index.html`
- ❌ No abres archivos directamente desde Finder
- ❌ No uses links que empiecen con `file://`

**¿Por qué?** Porque el navegador guarda los datos de forma diferente según cómo abras la página.

---

## 📥 PASO 2: IMPORTAR TUS DATOS DE EXCEL

1. **Abre:** http://localhost:8000
2. **Ve a la pestaña:** 🏠 Inicio
3. **Busca la sección:** "📂 Importar/Exportar Datos"
4. **Haz clic en:** "📥 Importar Excel"
5. **Selecciona tu archivo Excel** (La Coruna.xlsx, por ejemplo)

### 📊 SOBRE LAS COLUMNAS DE EXCEL:

**✅ EL ORDEN DE LAS COLUMNAS NO IMPORTA**
- Puedes tener las columnas en cualquier orden
- Lo que importa son los NOMBRES de las columnas

**✅ NOMBRES QUE LA APP RECONOCE:**

Para **Entradas (Compras)**:
- `Número` o `Numero` → Chapeta del animal
- `Lote` → Número de lote
- `Vendedor` → Nombre del vendedor
- `Raza` → Raza del animal
- `Sexo` → MACHO o HEMBRA
- `Peso Inicial` o `Peso` → Peso en kg
- `$/Kg` o `Precio/Kilo` o `Precio/kilo` → Precio por kilo
- `Fecha de entrada` o `Fecha` → Fecha de compra

Para **Salidas (Ventas)**:
- `Número` o `Numero` → Chapeta del animal
- `Peso` → Peso de venta
- `Fecha` o `Fecha Salida` → Fecha de venta
- `$/Kg` o `Precio/Kilo Venta` → Precio de venta por kilo
- `Comprador` → Nombre del comprador

**EJEMPLOS VÁLIDOS:**
```
✅ $/Kg
✅ Precio/Kilo
✅ Precio/kilo
✅ PrecioKilo
✅ Precio x Kg
✅ Precio por Kilo
```

Todos estos funcionan igual. Usa el que prefieras.

---

## 🔍 PASO 3: VERIFICAR QUE LOS DATOS SE IMPORTARON

Después de importar, deberías ver un mensaje verde:
```
✅ Importados XX animales a [Nombre de Finca]
```

### Para verificar en la app:

1. **🏠 Pestaña Inicio:**
   - Arriba verás: Total Animales, Machos, Hembras
   - Si ves "0" → los datos NO se importaron

2. **📊 Pestaña Inventario:**
   - Deberías ver una tabla con todos tus animales
   - Cada fila = un animal con su chapeta, lote, peso, etc.

3. **📥 Pestaña Entradas:**
   - Ver todas las compras y nacimientos

### 🚨 Si NO ves los datos:

1. **Verifica que estés en:** http://localhost:8000
2. **Presiona:** Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac) para recargar
3. **Verifica la finca seleccionada:** Arriba en la barra gris debe decir la finca correcta
4. **Vuelve a importar el Excel** - esta vez en http://localhost:8000

---

## 💾 PASO 4: RESPALDAR TUS DATOS

**UNA VEZ que veas los datos en la app**, crea un respaldo:

1. Ve a **🏠 Inicio**
2. Busca la sección: "💾 Respaldo de Datos"
3. Haz clic en **"💾 Respaldar Datos"**
4. Se descargará un archivo JSON con TODO:
   - Datos de las 3 fincas
   - Todas las entradas y salidas
   - Registros de salud
   - Potreros
   - Todo

5. **GUARDA ESTE ARCHIVO EN:**
   - ✅ Google Drive
   - ✅ Dropbox
   - ✅ iCloud
   - ✅ USB (copia adicional)

### 📅 ¿Cuándo hacer respaldos?

- ⭐ **AHORA** - después de importar
- 📆 **Semanalmente** - todos los domingos por ejemplo
- 📝 **Después de eventos importantes:**
  - Compraste varios animales
  - Vendiste un lote
  - Agregaste muchos registros

---

## 👨‍👨‍👦 PASO 5: COMPARTIR CON TUS HERMANOS (DESPUÉS)

**⚠️ NO HAGAS ESTO TODAVÍA** - primero asegúrate de que TODO funciona en TU computadora.

Cuando estés listo (en unos días):

### Opción A: Compartir el Respaldo (Simple)
1. Envía el archivo de respaldo JSON a tus hermanos
2. Ellos abren la app en SU computadora
3. Van a Inicio → "📥 Restaurar Respaldo"
4. Seleccionan tu archivo
5. ¡Listo! Tienen todos tus datos

**Ventaja:** Simple, no necesita internet
**Desventaja:** Cada uno trabaja independiente, sin sincronización automática

### Opción B: Sincronización en la Nube (Avanzado)
Esto permite que todos vean los mismos datos en tiempo real.

**Lo haremos MÁS ADELANTE** cuando la app local funcione perfectamente.

---

## 🔄 WORKFLOW DIARIO RECOMENDADO

### Para trabajar en TU computadora:

1. **Abre:** http://localhost:8000
2. **Trabaja normalmente:**
   - Registra compras
   - Registra ventas
   - Agrega eventos de salud
   - etc.
3. **Al terminar el día:**
   - Haz un respaldo si hubo cambios importantes

### Para compartir actualizaciones con hermanos:

**Por ahora (SIN CLOUD):**
- Al final de la semana, haz un respaldo
- Envía el archivo JSON por WhatsApp o email
- Ellos lo restauran en su computadora

**Más adelante (CON CLOUD):**
- Configuraremos Firebase
- Los cambios se sincronizarán automáticamente
- Cada uno puede trabajar y todos verán lo mismo

---

## ❓ PREGUNTAS FRECUENTES

### ¿Por qué no veo mis datos?
- Probablemente abriste la app con doble-clic en vez de http://localhost:8000
- Solución: Siempre usa http://localhost:8000

### ¿Puedo usar otro navegador?
- Sí, pero los datos de Chrome NO se verán en Safari
- Cada navegador tiene su propio almacenamiento
- **Recomendación:** Escoge UNO (Chrome recomendado) y úsalo siempre

### ¿El orden de las columnas en Excel importa?
- **NO** - el orden no importa
- Solo importan los NOMBRES de las columnas
- Puedes tener las columnas en cualquier orden

### ¿Qué pasa si cierro la computadora?
- Los datos quedan guardados en el navegador
- La próxima vez que abras http://localhost:8000 seguirán ahí
- Por eso es importante hacer respaldos

### ¿Necesito internet para usar la app?
- **NO** - la app funciona completamente sin internet
- Solo necesitas internet para:
  - Sincronización en la nube (opcional, más adelante)
  - IA de análisis (opcional)

### ¿Cómo arranco el servidor cada vez?
```bash
cd /Users/beatrizescobar/Projects/Ganado-Venecia
python3 -m http.server 8000
```
Luego abre: http://localhost:8000

---

## 📞 PRÓXIMOS PASOS

### AHORA (Hoy):
1. ✅ Abre http://localhost:8000
2. ✅ Importa tu Excel
3. ✅ Verifica que veas los datos
4. ✅ Haz un respaldo

### ESTA SEMANA:
1. Familiarízate con la app
2. Registra algunos eventos de prueba
3. Exporta datos para ver cómo funciona
4. Avísame cuando todo funcione bien

### DESPUÉS (Cuando estés listo):
1. Configuraremos la sincronización en la nube
2. Daremos acceso a tus hermanos
3. Probaremos que todos puedan trabajar simultáneamente

---

## 🆘 SI ALGO NO FUNCIONA

1. **Toma una captura de pantalla** del problema
2. **Copia cualquier mensaje de error** que veas
3. **Dime exactamente qué paso estabas haciendo**
4. Te ayudaré a resolverlo

---

**🎯 ENFOQUE:** Primero local → Después respaldos → Luego compartir → Finalmente cloud

**📧 ¿Listo para empezar?** Abre http://localhost:8000 e importa tu Excel.
