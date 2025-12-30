# 📱 Instalar Ganado-Venecia en iPhone como App

## ✅ Sí, usa la misma API de Google Gemini

**Buenas noticias:** El mismo Google Gemini API Key funciona tanto en:
- ✅ Tu computadora/navegador web
- ✅ iPhone/iPad como app instalada
- ✅ Android como app instalada

**La API Key ya está pre-configurada en la app:** `AIzaSyA4y3nCiv79TevLUfRGEx4gDfRFEVYCaac`

Esta API funciona perfectamente desde dispositivos móviles porque Google Gemini permite llamadas desde el navegador.

---

## 📲 MÉTODO 1: Instalar desde GitHub Pages (Recomendado)

### Paso 1: Subir a GitHub Pages

**En tu Mac:**

1. **Navega al directorio:**
```bash
cd /Users/beatrizescobar/Projects/Ganado-Venecia
```

2. **Inicializa Git (si no está ya):**
```bash
git init
git add .
git commit -m "Initial commit - Ganado Venecia PWA"
```

3. **Crea repositorio en GitHub:**
   - Ve a https://github.com/new
   - Nombre: `ganado-venecia`
   - Haz clic en "Create repository"

4. **Sube el código:**
```bash
git remote add origin https://github.com/TU_USUARIO/ganado-venecia.git
git branch -M main
git push -u origin main
```

5. **Activa GitHub Pages:**
   - Ve a Settings > Pages
   - Source: "Deploy from a branch"
   - Branch: `main` / `root`
   - Save

6. **Espera 2-3 minutos** y tu app estará en:
   `https://TU_USUARIO.github.io/ganado-venecia/`

### Paso 2: Instalar en tu iPhone

1. **Abre Safari** en tu iPhone (⚠️ DEBE ser Safari, no Chrome)

2. **Visita la URL:**
   `https://TU_USUARIO.github.io/ganado-venecia/`

3. **Toca el botón "Compartir"** (cuadro con flecha hacia arriba) en la barra inferior

4. **Selecciona "Agregar a pantalla de inicio"** (Add to Home Screen)
   - Icono: 🐂 con fondo verde
   - Nombre: Ganado Finca (puedes cambiar el nombre)

5. **Toca "Agregar"** en la esquina superior derecha

6. **¡Listo!** La app aparecerá en tu pantalla de inicio como cualquier otra app

---

## 📲 MÉTODO 2: Instalar Localmente (Más Rápido para Probar)

### Opción A: Usando Python HTTP Server

**En tu Mac:**

1. **Navega al directorio:**
```bash
cd /Users/beatrizescobar/Projects/Ganado-Venecia
```

2. **Inicia un servidor web:**
```bash
python3 -m http.server 8080
```

3. **Encuentra la IP de tu Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```
   Busca algo como: `inet 192.168.1.XXX`

4. **En tu iPhone:**
   - Abre Safari
   - Ve a: `http://192.168.1.XXX:8080/index.html`
   - Sigue los mismos pasos (Compartir > Agregar a pantalla de inicio)

⚠️ **Nota:** Tu Mac e iPhone deben estar en la misma red WiFi

### Opción B: Usando AirDrop (Más Simple)

1. **En tu Mac:**
   - Abre Finder > Ve a `/Users/beatrizescobar/Projects/Ganado-Venecia`
   - Selecciona los 3 archivos: `index.html`, `manifest.json`, `sw.js`
   - Click derecho > Compartir > AirDrop > Selecciona tu iPhone

2. **En tu iPhone:**
   - Acepta los archivos
   - Los archivos se guardarán en la app "Archivos"
   - Abre `index.html` con Safari
   - Safari te preguntará si quieres "Agregar a pantalla de inicio"

---

## 🎯 Características que Funcionarán en iPhone

### ✅ Funciona Perfectamente:
- 📱 Instalación como app nativa
- 💾 Almacenamiento local (todos tus datos)
- 🔄 Funciona SIN internet (offline)
- 📷 Acceso a la cámara del teléfono
- 🖼️ Captura de fotos de chapetas y animales
- 🤖 Google Gemini AI (requiere internet)
- 📊 Todos los reportes y gráficos
- 📁 Importar/Exportar Excel
- 🏠 Multi-finca (La Coruña, Santa Catalina, La Vega)

### ⚠️ Limitaciones de iOS:
- El Service Worker puede tener límites de almacenamiento (generalmente 50MB por app)
- Si tomas muchas fotos, considera exportar datos periódicamente
- La app puede ser eliminada automáticamente por iOS si no se usa por mucho tiempo

---

## 🔑 Configuración de API (Ya está hecha, pero por si acaso)

La app ya viene con una API Key de Google Gemini pre-configurada. Pero si necesitas cambiarla:

1. **Obtén tu propia API Key (Gratis):**
   - Ve a: https://aistudio.google.com/app/apikey
   - Inicia sesión con tu cuenta de Google
   - Haz clic en "Create API Key"
   - Copia la API Key

2. **En la app (desde el iPhone):**
   - Abre la app
   - Ve a la pestaña "Análisis IA" (🤖)
   - Pega tu nueva API Key
   - Haz clic en "💾 Guardar"

---

## 📝 Uso Recomendado

### Sincronización de Datos entre Dispositivos:

**La app guarda datos localmente en cada dispositivo**, entonces:

1. **En tu Mac:** Registra compras y datos principales
2. **En tu iPhone en el campo:** Toma fotos y registra eventos de salud
3. **Exporta/Importa regularmente:**
   - En iPhone: Exporta a Excel cuando termines
   - Envía el archivo a tu Mac (AirDrop, WhatsApp, Email)
   - En Mac: Importa el Excel para consolidar datos

### Backup Recomendado:

**Exporta tu inventario cada semana:**
- Pestaña "Inicio" > "📤 Exportar a Excel"
- Guarda en iCloud Drive o Google Drive

---

## 🆘 Solución de Problemas

### La app no se instala en iPhone:
- ✅ Asegúrate de usar **Safari** (no Chrome/Firefox)
- ✅ Verifica que el sitio sea HTTPS o local (HTTP)
- ✅ Intenta cerrar y reabrir Safari

### La cámara no funciona:
- ✅ Ve a Configuración > Safari > Cámara > "Preguntar"
- ✅ Cuando la app pida acceso a la cámara, acepta

### Las fotos ocupan mucho espacio:
- ✅ La app comprime automáticamente las fotos a 800px
- ✅ Si aún así ocupan mucho, exporta y elimina sesiones antiguas

### El análisis de IA no funciona:
- ✅ Necesitas conexión a internet para Google Gemini
- ✅ Verifica que la API Key esté configurada
- ✅ Revisa que no hayas excedido el límite gratuito (60 llamadas/minuto)

### Los datos desaparecieron:
- ✅ Cada finca tiene datos separados (La Coruña, Santa Catalina, La Vega)
- ✅ Verifica que estés en la finca correcta (selector en la parte superior)
- ✅ iOS puede limpiar datos de apps no usadas - haz backups regulares

---

## 🎉 ¡Listo para Usar!

Una vez instalada, la app funcionará como cualquier app nativa de iPhone:
- 📲 Icono en pantalla de inicio
- 🚀 Se abre a pantalla completa (sin barras de Safari)
- 💾 Todos tus datos guardados localmente
- 🔄 Funciona offline en el campo
- 📷 Acceso directo a la cámara

---

## 📞 Necesitas Ayuda?

Si tienes problemas con la instalación:
1. Verifica que estés usando Safari (no otro navegador)
2. Asegúrate de que tu iPhone esté actualizado (iOS 14+)
3. Prueba con el Método 2 (servidor local) primero para testing

**Consejo Pro:** Instala la app en tu iPhone principal Y en un iPad como backup. Los dos dispositivos pueden compartir datos mediante exportación/importación de Excel.
