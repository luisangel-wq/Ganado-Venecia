# 📱 Guía: Cómo Actualizar la App en el Teléfono

## 🔄 IMPORTANTE: Datos Guardados Localmente

**⚠️ Los datos se guardan EN EL NAVEGADOR de tu teléfono**, no en un servidor. Esto significa:

- ✅ **Ventaja**: Funciona sin internet, datos privados
- ⚠️ **Importante**: Los datos NO se sincronizan entre dispositivos automáticamente
- 📱 Cada dispositivo/navegador tiene su propia copia de datos

---

## 📊 ¿Por qué no veo mis datos?

Si no ves el inventario que agregaste antes, puede ser por:

1. **Estás usando un navegador diferente** (Safari vs Chrome)
2. **Accediste desde una URL diferente** (http vs https, con/sin www)
3. **El navegador borró el caché/datos**
4. **Estás en un dispositivo diferente**

---

## 🔄 Método 1: Actualizar la App (Mantiene Datos)

### En iPhone/iPad (Safari):

1. **Abrir la app instalada** desde el ícono en tu pantalla de inicio
2. **Deslizar hacia abajo** (pull to refresh) en la página
3. O cerrar y volver a abrir la app
4. Si no funciona:
   - Abre Safari → Ve a la URL donde tienes la app
   - Toca el botón **Compartir** (cuadro con flecha)
   - Selecciona **"Agregar a pantalla de inicio"** nuevamente
   - Esto actualizará la versión instalada

### En Android (Chrome):

1. **Abrir la app instalada** desde el ícono
2. **Deslizar hacia abajo** para refrescar
3. O cerrar y volver a abrir la app
4. Si no funciona:
   - Abre Chrome → Ve a la URL de la app
   - Menú (3 puntos) → **"Agregar a pantalla de inicio"**
   - Esto actualizará la app

---

## 💾 Método 2: Respaldar y Transferir Datos

Si estás cambiando de dispositivo o navegador:

### PASO 1: Respaldar en el dispositivo VIEJO

1. Abre la app
2. Ve a la pestaña **"Inicio"**
3. Encuentra la sección **"💾 Respaldo de Datos"**
4. Toca **"💾 Respaldar Datos"**
5. Se descargará un archivo `.json`
6. **Guarda este archivo** en Google Drive, Dropbox, o envíalo por email

### PASO 2: Restaurar en el dispositivo NUEVO

1. **Transfiere el archivo .json** al nuevo dispositivo (email, Drive, etc.)
2. Abre la app en el nuevo dispositivo
3. Ve a **"Inicio"** → **"💾 Respaldo de Datos"**
4. Toca **"📥 Restaurar Respaldo"**
5. Selecciona el archivo `.json` que guardaste
6. ¡Listo! Todos tus datos estarán ahí

---

## 🌐 Método 3: Acceder desde el Navegador

Si la app instalada no funciona, puedes:

1. **Abrir Safari/Chrome** directamente
2. **Ir a la URL** donde tienes alojada la app:
   - Si es GitHub Pages: `https://tuusuario.github.io/Ganado-Venecia/`
   - Si es local: `file:///ruta/a/index.html`
3. Los datos deberían estar ahí (si usaste el mismo navegador antes)

---

## 🔧 Solución de Problemas

### "No veo mis datos después de actualizar"

**Verificar:**
1. ¿Estás usando el **mismo navegador**? (Safari o Chrome)
2. ¿La **URL es exactamente la misma**?
3. ¿Tu navegador tiene espacio de almacenamiento disponible?
4. ¿El navegador borró datos automáticamente? (configuración de privacidad)

**Solución:**
- Si tienes un respaldo: Restaurarlo
- Si no: Los datos pueden estar en el navegador original

### "La app no se actualiza con las nuevas funciones"

**Limpiar caché del navegador:**

**iPhone (Safari):**
1. Ajustes → Safari
2. **"Borrar historial y datos de sitios web"**
3. ⚠️ IMPORTANTE: Respalde sus datos ANTES
4. Vuelve a instalar la app

**Android (Chrome):**
1. Chrome → Configuración → Privacidad
2. **"Borrar datos de navegación"**
3. Marca "Imágenes y archivos en caché"
4. ⚠️ NO marques "Datos de sitios" (perderías el inventario)
5. Vuelve a cargar la app

---

## 📤 Publicar App para Acceso Desde Cualquier Lugar

Para que la app sea accesible desde cualquier dispositivo:

### Opción A: GitHub Pages (GRATIS)

1. En tu computadora, abre Terminal/CMD
2. Ve a la carpeta del proyecto:
   ```bash
   cd /Users/beatrizescobar/Projects/Ganado-Venecia
   ```

3. Sube los cambios a GitHub:
   ```bash
   git add index.html
   git commit -m "Actualizar app con nuevas funciones"
   git push origin main
   ```

4. En GitHub.com:
   - Ve a tu repositorio
   - Settings → Pages
   - Source: "main branch"
   - Guarda

5. **Tu app estará en**: `https://luisangel-wq.github.io/Ganado-Venecia/index.html`

6. Abre esa URL en tu teléfono y agrega a pantalla de inicio

### Opción B: Netlify/Vercel (GRATIS, más fácil)

1. Ve a [netlify.com](https://netlify.com) o [vercel.com](https://vercel.com)
2. Crea cuenta (gratis)
3. "New Site from Git" → Conecta tu repo de GitHub
4. Deploy → Te da una URL como `ganado-venecia.netlify.app`
5. Abre esa URL en tu teléfono → Instala la app

**Ventajas:**
- ✅ URL permanente
- ✅ Actualizaciones automáticas cuando haces `git push`
- ✅ HTTPS gratis
- ✅ Accesible desde cualquier dispositivo

---

## 💡 Recomendaciones Importantes

### 1. **Respaldar Regularmente**
- Usa la función **"💾 Respaldar Datos"** cada semana
- Guarda el archivo en Google Drive o correo

### 2. **URL Consistente**
- Siempre accede desde la MISMA URL
- Marca la página como favorito/bookmark

### 3. **Un Solo Navegador por Dispositivo**
- Usa Safari O Chrome, no ambos
- Los datos no se comparten entre navegadores

### 4. **Sincronización Manual**
- Si usas múltiples dispositivos:
  - Respaldo desde dispositivo A
  - Restaurar en dispositivo B
  - Repetir cuando necesites sincronizar

---

## 📞 Checklist Rápido de Actualización

- [ ] Abre la app instalada
- [ ] Desliza hacia abajo para refrescar
- [ ] ¿No ves cambios? Cierra y vuelve a abrir
- [ ] ¿Aún no? Borra caché del navegador
- [ ] ¿Perdiste datos? Restaura desde respaldo
- [ ] ¿No hay respaldo? Accede desde el navegador original

---

## 🆘 Ayuda Adicional

Si sigues teniendo problemas:

1. **Verifica** que el archivo `index.html` esté actualizado en GitHub
2. **Confirma** la URL que estás usando
3. **Revisa** que el navegador tenga permisos de almacenamiento
4. **Considera** usar GitHub Pages o Netlify para actualizaciones automáticas

---

**📱 Última actualización**: Enero 2026
**👨‍💻 Sistema**: Ganado Finca - PWA v1.0
