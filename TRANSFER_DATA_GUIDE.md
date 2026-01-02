# 📦 Guía: Transferir Datos de Local a GitHub Pages

## 🎯 Objetivo
Transferir los 97 animales + salidas de Santa Catalina desde su computadora local al sitio de GitHub Pages.

---

## 📋 PASO 1: Crear Backup Local (Donde tiene los datos)

### 1.1 Abrir versión LOCAL
```
file:///Users/beatrizescobar/Projects/Ganado-Venecia/index.html
```
O simplemente haga doble clic en el archivo `index.html` en su carpeta de proyecto.

### 1.2 Verificar que tiene los datos correctos
- Debería ver **97 animales** en Santa Catalina
- Debería ver **salidas** registradas

### 1.3 Crear el Backup
1. En la barra de navegación superior, haga clic en **"🏠 Inicio"**
2. Baje hasta la sección **"💾 Respaldo de Datos"**
3. Haga clic en el botón **"💾 Respaldar Datos"**
4. Se descargará un archivo JSON con un nombre como:
   ```
   GanadoFinca_Backup_2026-01-02_1715.json
   ```
5. **¡IMPORTANTE!** Anote dónde se guardó el archivo (probablemente en su carpeta Downloads)

---

## 📋 PASO 2: Restaurar en GitHub Pages

### 2.1 Abrir versión de GITHUB PAGES
```
https://luisangel-wq.github.io/Ganado-Venecia/
```

### 2.2 Verificar que está en Santa Catalina
- Asegúrese de que el selector de finca muestre **"⛪ Santa Catalina"**
- Actualmente debería mostrar solo 92 animales

### 2.3 Restaurar el Backup
1. Haga clic en **"🏠 Inicio"**
2. Baje hasta la sección **"💾 Respaldo de Datos"**
3. Haga clic en el botón **"📥 Restaurar Respaldo"**
4. Seleccione el archivo JSON que descargó en el Paso 1.3
5. Confirme cuando pregunte si desea restaurar

### 2.4 Recargar la página
Después de restaurar, **recargue la página** (F5 o Cmd+R) para ver los datos actualizados.

---

## ✅ VERIFICAR QUE FUNCIONÓ

Después de restaurar, debería ver en GitHub Pages:

### Santa Catalina:
- ✅ **97 animales** (no 92)
- ✅ **Salidas registradas** (no "No hay salidas registradas")
- ✅ Todos los datos de entradas y salidas

### La Coruña:
- ✅ Sus datos completos

### La Vega:
- ✅ Sus datos completos

---

## 🔄 PARA COMPARTIR CON SUS HERMANOS

Una vez que los datos estén en GitHub Pages:

1. **Envíeles el link:**
   ```
   https://luisangel-wq.github.io/Ganado-Venecia/
   ```

2. **Ellos verán los mismos datos** que usted ve en GitHub Pages

3. **Cada persona verá:**
   - Santa Catalina: 97 animales + salidas
   - La Coruña: Datos completos
   - La Vega: Datos completos

---

## ⚠️ NOTAS IMPORTANTES

### 📱 Datos por Navegador
- Los datos se guardan en cada navegador/dispositivo
- Si alguien agrega un animal en su teléfono, no aparecerá automáticamente en la computadora de otro
- Para sincronizar cambios entre dispositivos, use Backup/Restore o active Firebase Cloud Sync

### 🔐 Seguridad del Backup
- El archivo de backup contiene TODOS los datos de las 3 fincas
- Guárdelo en un lugar seguro (Google Drive, Dropbox)
- Puede usarlo para recuperar datos si algo sale mal

### 💾 Respaldos Regulares
Se recomienda hacer backup:
- Semanalmente
- Después de registrar compras importantes
- Antes de hacer cambios grandes
- Antes de compartir con otras personas

---

## 🆘 SI ALGO SALE MAL

### Problema: "No puedo encontrar el archivo de backup"
**Solución:** Busque en su carpeta Downloads por archivos `.json` recientes

### Problema: "Después de restaurar sigo viendo 92 animales"
**Solución:** 
1. Recargue la página (F5 o Cmd+R)
2. Limpie la caché del navegador (Ctrl+Shift+Del)
3. Intente en modo incógnito

### Problema: "Borré datos por error"
**Solución:** 
1. NO cierre el navegador
2. Restaure el último backup
3. Si no tiene backup, los datos se perdieron

---

## 📞 CONTACTO

Si tiene problemas con estos pasos, puede:
1. Revisar esta guía nuevamente
2. Intentar en otro navegador
3. Pedir ayuda mostrando qué paso no funcionó

---

**Fecha de creación:** 2 de enero de 2026
**Versión del sistema:** Con lotes iniciales configurados (L-58, L-173, L-241)
