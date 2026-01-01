# 🔧 Solución de Problemas - Cloud Sync

## 🔍 Diagnóstico: ¿Por qué no sincroniza?

Siga estos pasos en orden para identificar el problema:

---

## ✅ Paso 1: Verificar Configuración en el BROWSER (Computadora)

Abra la app en su computadora:

1. **Vaya a Config (⚙️)**
2. **Busque "☁️ Sincronización en la Nube"**
3. **Verifique:**
   - ¿Dice "● En línea" (verde)? ✅ o "⚫ Desconectado" ❌?
   - ¿La casilla "Sincronización Automática" está marcada?
   - ¿Aparece una fecha en "Última Sincronización"?

### Si dice "⚫ Desconectado":

1. Click en **"🧪 Probar Conexión"**
2. Si falla, hay un problema con Firebase
3. Vaya al **Paso 5** (Firebase Console)

### Si dice "● En línea" pero nunca sincronizó:

1. Click en **"☁️ Sincronizar Ahora"**
2. Espere 5-10 segundos
3. Verifique que diga "Última Sincronización: hace unos segundos"
4. Si sincronizó exitosamente, vaya al **Paso 2**

---

## ✅ Paso 2: Verificar Datos en Firebase Console

1. **Abra Firebase Console**: https://console.firebase.google.com/
2. **Seleccione su proyecto**: "ganado-venecia"
3. **Click en "Realtime Database"** (menú izquierdo)
4. **Verifique si hay datos:**
   - ¿Ve carpetas como `la_coruna`, `santa_catalina`, `la_vega`?
   - ¿Dentro de cada carpeta hay `entradas`, `salidas`, `config`?
   - ¿Los números coinciden con su inventario?

### Si NO hay datos en Firebase:
- **La sincronización desde el browser falló**
- Vuelva al Paso 1 y haga "Sincronizar Ahora"
- Verifique la consola del browser (F12 → Console) por errores

### Si SÍ hay datos en Firebase:
- ✅ El problema está en el teléfono
- Continúe al **Paso 3**

---

## ✅ Paso 3: Verificar Configuración en el TELÉFONO

En su teléfono, abra la app:

1. **Vaya a Config (⚙️)**
2. **Busque "☁️ Sincronización en la Nube"**
3. **Verifique:**
   - ¿Dice "● En línea" (verde)?
   - ¿La casilla "Sincronización Automática" está marcada?

### Si dice "⚫ Desconectado" en el teléfono:

1. Click en **"🧪 Probar Conexión"**
2. Si falla:
   - Verifique conexión a internet (WiFi/Datos)
   - La app puede no tener internet
   - Vaya al **Paso 4**

### Si dice "● En línea":

1. Click en **"☁️ Sincronizar Ahora"**
2. **IMPORTANTE:** Seleccione **"Descargar desde la nube"**
3. Espere 10-15 segundos
4. Vaya a **Inventario** y verifique si aparecen los datos

---

## ✅ Paso 4: Verificar Permisos de Red en el Teléfono

### iOS (iPhone/iPad):
1. **Ajustes → Safari**
2. Verifique que "Bloquear todas las cookies" esté **DESACTIVADO**
3. **Ajustes → General → VPN y Administración de dispositivos**
4. Verifique que no haya restricciones de red

### Android:
1. **Configuración → Aplicaciones**
2. Encuentre Chrome/Browser
3. **Permisos → Permitir datos en segundo plano**
4. Verifique que tenga acceso a internet

---

## ✅ Paso 5: Verificar Reglas de Firebase

Si el problema persiste, puede ser un problema de permisos en Firebase:

1. **Abra Firebase Console**
2. **Realtime Database → Rules** (pestaña)
3. Las reglas deben ser:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

⚠️ **NOTA:** Estas reglas permiten acceso público. Para producción, debe configurar autenticación.

Si las reglas son diferentes, cámbielas y haga click en **"Publicar"**.

---

## 🔧 Paso 6: Solución Manual (Si todo lo demás falla)

### Opción A: Transferir vía Backup

**En el Browser (Computadora):**
1. Vaya a **Inicio**
2. Click en **"💾 Respaldar Datos"**
3. Guarde el archivo JSON

**Envíe el archivo al teléfono:**
- Por email
- Por WhatsApp
- Por AirDrop (iOS)
- Por Google Drive

**En el Teléfono:**
1. Descargue/abra el archivo JSON
2. Vaya a **Inicio**
3. Click en **"📥 Restaurar Respaldo"**
4. Seleccione el archivo
5. ¡Datos restaurados!

---

## 🐛 Paso 7: Revisar Errores en Consola

### En el Browser (Computadora):
1. Presione **F12** (o Right-click → Inspect)
2. Vaya a la pestaña **"Console"**
3. Click en **"☁️ Sincronizar Ahora"**
4. Busque mensajes de error en rojo
5. Copie el error y búsquelo en Google o muéstrelo al desarrollador

### En el Teléfono (Safari/iOS):
1. En su Mac: **Safari → Preferencias → Avanzado**
2. Active "Mostrar menú Desarrollo"
3. Conecte su iPhone por USB
4. **Safari → Desarrollo → [Su iPhone] → [La App]**
5. Verifique errores en la consola

---

## 📋 Checklist Rápido

Marque lo que ya verificó:

- [ ] Sync activado en browser (computadora)
- [ ] "Sincronizar Ahora" ejecutado en browser
- [ ] Datos visibles en Firebase Console
- [ ] Sync activado en teléfono
- [ ] "Sincronizar Ahora" ejecutado en teléfono con "Descargar desde la nube"
- [ ] Internet funcionando en teléfono
- [ ] Cookies habilitadas en teléfono
- [ ] Reglas de Firebase permiten lectura/escritura
- [ ] Sin errores en consola

---

## 🆘 Si Nada Funciona

**Use la Opción A del Paso 6** (transferir vía backup) - Es la forma más confiable de mover datos entre dispositivos mientras se soluciona el problema de sync.

**Posibles causas del problema:**
1. Firebase Rules bloqueando acceso
2. Problema de red en el teléfono
3. Service Worker no actualizado
4. Caché del browser desactualizado

**Solución temporal:** Use backup/restore manual hasta identificar el problema de sync.
