# 📊 Guía de Importación de Datos desde Excel

## ✨ ¿Qué es esto?

Esta herramienta te permite importar todos los datos de una finca desde archivos Excel (.xlsx) directamente, sin necesidad de convertirlos a CSV. Es la forma más rápida de cargar toda la información de tus animales.

## 🎯 Ventajas

- ✅ **Carga directa desde Excel**: No necesitas convertir a CSV
- ✅ **Maneja fechas automáticamente**: Las fechas de Excel se convierten correctamente
- ✅ **Detecta columnas flexiblemente**: Los nombres de columnas pueden variar
- ✅ **Vista previa antes de importar**: Revisa los datos antes de guardarlos
- ✅ **Cálculos automáticos**: Si falta el costo total, lo calcula automáticamente

## 📋 Preparar tus Archivos Excel

### Archivos Necesarios

Necesitas preparar **2 archivos Excel** separados:

1. **Entradas.xlsx** (REQUERIDO)
   - Contiene los animales que compraste o ingresaste a la finca
   
2. **Salidas.xlsx** (OPCIONAL)
   - Contiene los animales que vendiste

### Formato del Archivo "Entradas.xlsx"

Tu archivo debe tener estas columnas (la primera fila):

| Columna | Nombres Aceptados | Requerido | Descripción |
|---------|------------------|-----------|-------------|
| **Número** | Número, Chapeta, numero, chapeta | ✅ SÍ | Identificación del animal |
| **Peso** | Peso Inicial, Peso, peso | ✅ SÍ | Peso en kilogramos |
| **Sexo** | Sexo, sexo | No | MACHO o HEMBRA (por defecto: MACHO) |
| **Raza** | Raza, raza | No | Raza del animal |
| **Lote** | Lote, lote | No | Número o nombre del lote |
| **Fecha** | Fecha de entrada, Fecha, fecha | No | Fecha de ingreso (formato: DD/MM/AAAA o Excel) |
| **Precio** | Precio/Kilo, Precio, precio | No | Precio por kilogramo en pesos |
| **Vendedor** | Vendedor, vendedor | No | Nombre del vendedor |
| **Costo Total** | Costo Total, CostoTotal, costoTotal | No | Se calcula si no se proporciona |

**Ejemplo de Entradas.xlsx:**

| Número | Peso | Sexo | Raza | Lote | Fecha de entrada | Precio/Kilo | Vendedor | Costo Total |
|--------|------|------|------|------|-----------------|-------------|----------|-------------|
| 001 | 450 | MACHO | Brahman | L1 | 15/01/2025 | 8500 | Juan Pérez | 3825000 |
| 002 | 380 | MACHO | Cebú | L1 | 15/01/2025 | 8500 | Juan Pérez | 3230000 |
| 003 | 420 | HEMBRA | Brahman | L2 | 20/01/2025 | 8200 | María López | 3444000 |

### Formato del Archivo "Salidas.xlsx"

Tu archivo debe tener estas columnas:

| Columna | Nombres Aceptados | Requerido | Descripción |
|---------|------------------|-----------|-------------|
| **Número** | Número, Chapeta, numero | ✅ SÍ | Identificación del animal vendido |
| **Peso** | Peso, peso, Peso Salida | ✅ SÍ | Peso final en kilogramos |
| **Fecha Salida** | Fecha Salida, Fecha, fecha | No | Fecha de venta |
| **Precio/Kilo Venta** | Precio/Kilo Venta, Precio, precio | No | Precio de venta por kg |
| **Comprador** | Comprador, comprador | No | Nombre del comprador |
| **Costo de venta** | Costo de venta, Total, total | No | Se calcula si no se proporciona |

**Ejemplo de Salidas.xlsx:**

| Número | Peso | Fecha Salida | Precio/Kilo Venta | Comprador | Costo de venta |
|--------|------|-------------|------------------|-----------|---------------|
| 001 | 520 | 20/06/2025 | 9500 | Frigorífico ABC | 4940000 |
| 005 | 480 | 25/06/2025 | 9500 | Frigorífico ABC | 4560000 |

## 🚀 Proceso de Importación

### Paso 1: Abrir la Herramienta

1. Inicia el servidor local (si no está corriendo):
   ```bash
   python3 -m http.server 8000
   ```

2. Abre en tu navegador:
   ```
   http://localhost:8000/import-excel-ranch.html
   ```

### Paso 2: Seleccionar la Finca

En la página, selecciona la finca destino:
- 🏠 Santa Catalina
- 🌾 La Vega
- ⛰️ La Coruña

### Paso 3: Cargar el Archivo de Entradas

1. Click en la zona que dice "Click aquí para seleccionar Entradas.xlsx"
2. Selecciona tu archivo de entradas
3. El sistema procesará el archivo y mostrará:
   - ✅ Número de filas procesadas
   - ⚠️ Advertencias si hay filas con datos incompletos
   - ✅ Confirmación de entradas válidas

### Paso 4: Cargar el Archivo de Salidas (Opcional)

1. Click en la zona que dice "Click aquí para seleccionar Salidas.xlsx"
2. Selecciona tu archivo de salidas (si tienes uno)
3. El sistema procesará el archivo

### Paso 5: Revisar la Vista Previa

El sistema mostrará:
- 📊 Estadísticas resumidas:
  - Número de entradas
  - Número de salidas
  - Animales en inventario
  - Total en compras
  - Total en ventas

- 👀 Vista previa de las primeras 15 filas de cada archivo

### Paso 6: Importar los Datos

1. Revisa cuidadosamente la vista previa
2. Click en el botón **"✅ IMPORTAR DATOS A LA FINCA"**
3. Confirma la acción (⚠️ esto reemplazará los datos existentes)
4. Espera a que termine la importación

### Paso 7: Verificar en la Aplicación

1. Click en **"✅ Ir a la Aplicación"**
2. Selecciona la finca que acabas de importar
3. Verifica que todos los datos estén correctos

## ⚠️ Importante

### Antes de Importar

- ⚠️ **RESPALDA TUS DATOS**: La importación reemplaza TODOS los datos existentes de la finca
- ✅ **Verifica los archivos**: Asegúrate de que los datos sean correctos
- ✅ **Prueba con una finca**: Si no estás seguro, prueba con una finca de prueba primero

### Formatos de Fecha Aceptados

El sistema acepta:
- Fechas de Excel (formato numérico)
- DD/MM/AAAA
- AAAA-MM-DD
- DD-MM-AAAA

### Números y Valores

- Los números pueden tener separadores de miles o no
- Los decimales pueden usar punto (.) o coma (,)
- Si el "Costo Total" o "Costo de venta" están vacíos, se calculan automáticamente:
  - Costo Total = Peso × Precio/Kilo
  - Costo de venta = Peso × Precio/Kilo Venta

## 🔧 Solución de Problemas

### "No se encontraron entradas válidas"

**Causa**: El archivo no tiene las columnas requeridas (Número y Peso)

**Solución**:
1. Verifica que la primera fila tenga los nombres de columnas
2. Asegúrate de tener al menos las columnas "Número" y "Peso"
3. Los nombres pueden variar (ver tabla de nombres aceptados arriba)

### "Error al leer el archivo Excel"

**Causa**: El archivo puede estar corrupto o en un formato incorrecto

**Solución**:
1. Abre el archivo en Excel
2. Guárdalo de nuevo como .xlsx (Excel 2007 o posterior)
3. Asegúrate de que no haya contraseña en el archivo

### "Fila X: Falta número o peso - ignorada"

**Causa**: Esa fila no tiene valor en las columnas Número o Peso

**Solución**:
- Esto es normal si tienes filas vacías
- Las filas con datos incompletos se ignoran automáticamente
- Verifica que las filas importantes tengan todos los datos requeridos

### Fechas incorrectas

**Causa**: El formato de fecha no se reconoce

**Solución**:
1. En Excel, formatea las fechas como "Fecha" (no como texto)
2. Usa el formato DD/MM/AAAA o deja que Excel maneje las fechas
3. Evita formatos de texto personalizados

## 📝 Ejemplo Completo

### Escenario: Importar datos de La Vega

**Archivos preparados:**
- `LaVega_Entradas.xlsx` - 113 animales comprados
- `LaVega_Salidas.xlsx` - 28 animales vendidos

**Proceso:**

1. ✅ Abrir http://localhost:8000/import-excel-ranch.html
2. ✅ Seleccionar "🌾 La Vega"
3. ✅ Cargar LaVega_Entradas.xlsx → **113 entradas procesadas**
4. ✅ Cargar LaVega_Salidas.xlsx → **28 salidas procesadas**
5. ✅ Revisar vista previa:
   - 113 entradas
   - 28 salidas
   - 85 animales en inventario
   - $97,450,000 total en compras
   - $26,600,000 total en ventas
6. ✅ Click en "IMPORTAR DATOS"
7. ✅ Confirmar
8. ✅ **IMPORTACIÓN EXITOSA**
9. ✅ Ir a la aplicación y verificar

## 💡 Consejos

### Para Mejores Resultados

1. **Usa plantillas**: Crea una plantilla en Excel con las columnas correctas y úsala siempre
2. **Mantén consistencia**: Usa siempre los mismos nombres de columnas
3. **Limpia los datos**: Elimina filas vacías o con datos incompletos antes de importar
4. **Respalda regularmente**: Exporta tus datos periódicamente como respaldo

### Trabajar con Múltiples Fincas

Si tienes datos de las 3 fincas:
1. Prepara 6 archivos (2 por finca)
2. Importa una finca a la vez
3. Verifica cada finca antes de continuar con la siguiente

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:

1. **Revisa el log**: En la página de importación, hay un log que muestra los detalles del proceso
2. **Consola del navegador**: Presiona F12 y revisa la consola para ver errores técnicos
3. **Archivo de ejemplo**: Crea un archivo pequeño de prueba con 5-10 animales y prueba primero

## 📚 Recursos Adicionales

- **CSV Import**: Si prefieres usar CSV, también puedes usar `import-csv-ranch.html`
- **Exportar datos**: Desde la app principal, puedes exportar a Excel o CSV
- **Backup**: Siempre haz respaldo antes de importaciones grandes

---

**Última actualización**: Enero 2026
**Versión**: 1.0
**Tecnología**: SheetJS (xlsx.js) para lectura de archivos Excel
