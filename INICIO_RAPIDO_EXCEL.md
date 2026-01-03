# 🚀 Inicio Rápido - Importar Excel

## ⚡ 3 Pasos para Importar tus Datos

### 1️⃣ Preparar tus Archivos Excel

Crea 2 archivos Excel con estos datos:

**Entradas.xlsx** - Debe tener mínimo estas columnas:
- `Número` o `Chapeta` (identificación del animal)
- `Peso` o `Peso Inicial` (peso en kg)

**Salidas.xlsx** - Debe tener mínimo estas columnas (opcional):
- `Número` o `Chapeta` (identificación del animal)
- `Peso` (peso final en kg)

### 2️⃣ Abrir la Herramienta

```bash
# Abre la terminal en la carpeta del proyecto y ejecuta:
python3 -m http.server 8000
```

Luego abre en tu navegador:
```
http://localhost:8000/import-excel-ranch.html
```

### 3️⃣ Importar

1. Selecciona la finca (Santa Catalina, La Vega, o La Coruña)
2. Click en la zona de "Entradas.xlsx" y selecciona tu archivo
3. (Opcional) Click en la zona de "Salidas.xlsx" si tienes ventas
4. Revisa la vista previa
5. Click en "✅ IMPORTAR DATOS A LA FINCA"
6. ¡Listo! Ve a la aplicación para ver tus datos

## ✨ Características Principales

- ✅ **No necesitas convertir a CSV** - Carga archivos Excel directamente
- ✅ **Detecta fechas automáticamente** - Las fechas de Excel se manejan correctamente
- ✅ **Flexible con nombres** - Las columnas pueden tener varios nombres
- ✅ **Vista previa** - Revisa antes de importar
- ✅ **Cálculos automáticos** - Calcula costos totales si no los proporcionas

## 📊 Ejemplo Rápido de Entradas.xlsx

```
Número | Peso | Sexo   | Raza    | Lote | Fecha      | Precio/Kilo
-------|------|--------|---------|------|------------|-------------
001    | 450  | MACHO  | Brahman | L1   | 15/01/2025 | 8500
002    | 380  | MACHO  | Cebú    | L1   | 15/01/2025 | 8500
003    | 420  | HEMBRA | Brahman | L2   | 20/01/2025 | 8200
```

## 📊 Ejemplo Rápido de Salidas.xlsx

```
Número | Peso | Fecha Salida | Precio/Kilo Venta | Comprador
-------|------|--------------|-------------------|----------------
001    | 520  | 20/06/2025   | 9500              | Frigorífico ABC
```

## ⚠️ Importante

- **RESPALDA tus datos** antes de importar
- La importación **reemplaza** todos los datos existentes de la finca
- Asegúrate de seleccionar la **finca correcta**

## 🆘 ¿Problemas?

**"No se encontraron entradas válidas"**
→ Verifica que tu archivo tenga las columnas "Número" y "Peso"

**"Error al leer el archivo"**  
→ Guarda el archivo como .xlsx (Excel 2007 o posterior)

**Fechas incorrectas**
→ En Excel, formatea las fechas como "Fecha" (no como texto)

## 📚 Más Información

Lee la **GUIA_IMPORTAR_EXCEL.md** para instrucciones detalladas.

---

**¿Listo para empezar?**  
Abre: `http://localhost:8000/import-excel-ranch.html`
