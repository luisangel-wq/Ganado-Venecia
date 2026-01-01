# 🌐 Cómo Acceder desde el Teléfono

## 📋 Pasos Rápidos

### Paso 1: Iniciar Servidor en la PC

Abre Terminal en tu Mac y ejecuta:

```bash
cd /Users/beatrizescobar/Projects/Ganado-Venecia
python3 -m http.server 8000
```

Deberías ver:
```
Serving HTTP on :: port 8000 (http://[::]:8000/) ...
```

**¡Deja esta ventana abierta!** El servidor debe estar corriendo.

---

### Paso 2: Encontrar la IP de tu Mac

En otra ventana de Terminal, ejecuta:

```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Verás algo como:
```
inet 192.168.1.XXX netmask 0xffffff00 broadcast 192.168.1.255
```

La IP es el número que dice `192.168.1.XXX` (o similar).

**Ejemplos de IPs comunes:**
- 192.168.1.XXX
- 192.168.0.XXX  
- 10.0.0.XXX

---

### Paso 3: Abrir en el Teléfono

**IMPORTANTE:** El teléfono debe estar en la **misma red WiFi** que tu Mac.

En Safari o Chrome del teléfono, abre:

```
http://192.168.1.XXX:8000/check-user-id.html
```

*(Reemplaza XXX con los números de tu IP)*

---

## 🎯 URLs Importantes

Una vez que tengas la IP, usa estas URLs:

**Para verificar User ID:**
```
http://TU_IP:8000/check-user-id.html
```

**Para usar la app principal:**
```
http://TU_IP:8000/index.html
```

---

## ❌ Problemas Comunes

### "No se puede conectar al servidor"

✅ **Soluciones:**
1. Verifica que el servidor esté corriendo en la PC
2. Verifica que ambos dispositivos están en la misma WiFi
3. Intenta apagar y encender el WiFi del teléfono
4. En la Mac, ve a: System Preferences → Security → Firewall
   - Si está activo, añade Python como excepción

### "Connection refused"

✅ **Soluciones:**
1. Verifica el puerto: debe ser `:8000`
2. Cierra el servidor (Ctrl+C) y reinicia
3. Intenta otro puerto: `python3 -m http.server 8080`

### No encuentro mi IP

✅ **Método alternativo:**
1. En Mac: System Preferences → Network
2. Selecciona WiFi (debe tener punto verde)
3. Verás "Status: Connected" y debajo tu IP

---

## 🔄 Comando Todo-en-Uno

Copia y pega esto en Terminal:

```bash
echo "🌐 Tu IP es:" && ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' && echo "" && echo "📡 Iniciando servidor..." && cd /Users/beatrizescobar/Projects/Ganado-Venecia && python3 -m http.server 8000
```

Esto:
1. Muestra tu IP
2. Inicia el servidor automáticamente

---

## 📱 En el Teléfono

Una vez que el servidor esté corriendo:

1. **Abre Safari o Chrome**

2. **Escribe en la barra de dirección:**
   ```
   http://192.168.1.XXX:8000/check-user-id.html
   ```
   (Reemplaza XXX con tu IP)

3. **Verás la página del verificador de User ID**

4. **Sigue las instrucciones en pantalla**

---

## 🛑 Detener el Servidor

Cuando termines, en la Terminal presiona:
```
Ctrl + C
```

---

## 💡 Alternativa: GitHub Pages

Si esto es muy complicado, puedes subir los archivos a GitHub y acceder desde cualquier lugar:

1. Commit y push los archivos
2. En GitHub: Settings → Pages → Enable
3. Accede desde: `https://tuusuario.github.io/Ganado-Venecia/check-user-id.html`

---

## 🎯 Resultado Esperado

Cuando funcione correctamente, en el teléfono verás:

- 🔍 Título: "Verificador de User ID"
- 📋 Tu User ID actual mostrado
- 🔘 Botones para copiar y cambiar el ID
- 💡 Instrucciones claras

¡Y podrás copiar/cambiar el User ID sin escribir código!
