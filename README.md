# 🐂 Ganado Finca

**Sistema de Gestión Ganadera para Fincas**

Aplicación web para el manejo integral de ganado bovino, diseñada para fincas ganaderas en Colombia con enfoque en cría y ceba de ganado grass-fed.

![Version](https://img.shields.io/badge/version-2.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🌟 Características

### 📊 Gestión de Inventario
- Registro de compras (lotes) y nacimientos
- Tracking de ventas y muertes
- Peso estimado con GDP (Ganancia Diaria de Peso)
- Perfil individual por animal con click

### 💉 Módulo de Salud
- Registro de vacunas, desparasitaciones y tratamientos
- Control de período de retiro para venta
- Alertas de refuerzos pendientes
- Historial de salud por animal

### 🌿 Gestión de Potreros
- Registro de potreros con tipo de pasto y capacidad
- Control de rotación y días de descanso
- Movimiento de animales entre potreros
- Historial de rotaciones

### 📸 Módulo de Fotos
- Sesiones fotográficas para estimación de peso por IA
- Seguimiento de BCS (Body Condition Score)
- Calibración con manga o vara de referencia
- Historial fotográfico por animal

### 🏠 Multi-Finca
- Soporte para múltiples fincas
- Bases de datos independientes por finca
- Cambio rápido entre fincas

### 📈 Reportes
- Análisis de compras y ventas
- Top vendedores y compradores
- Valor de inventario
- Exportación a Excel

## 🚀 Uso

### Opción 1: GitHub Pages (Recomendado)
Accede directamente desde: `https://[tu-usuario].github.io/ganado-finca/`

### Opción 2: Local
1. Descarga `index.html`
2. Abre en cualquier navegador moderno
3. ¡Listo! No requiere instalación ni servidor

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Móvil y tablet (responsive)
- ✅ Funciona offline (datos en localStorage)
- ✅ Cámara del dispositivo para fotos

## 💾 Datos

Los datos se almacenan localmente en el navegador (localStorage). Para respaldar:
1. Ve a **Configuración**
2. Click en **Exportar Datos (Excel)**

Para restaurar o migrar:
1. Ve a **Configuración**
2. Click en **Importar Excel**

## 📋 Estructura de Datos Excel

Para importar datos, el Excel debe tener estas columnas:

### Hoja "Entradas"
| Columna | Descripción |
|---------|-------------|
| Numero | Chapeta del animal |
| Tipo | COMPRA o NACIMIENTO |
| Sexo | MACHO o HEMBRA |
| Peso | Peso en kg |
| Fecha | Fecha de entrada |
| PrecioKilo | Precio por kg (compras) |
| Vendedor | Nombre del vendedor |
| Lote | Número de lote (opcional) |
| Raza | Raza del animal (opcional) |

### Hoja "Salidas"
| Columna | Descripción |
|---------|-------------|
| Numero | Chapeta del animal |
| Tipo | VENTA o MUERTE |
| Peso | Peso en kg |
| FechaSalida | Fecha de salida |
| PrecioKiloVenta | Precio de venta por kg |
| Comprador | Nombre del comprador |

## 🐄 Razas Soportadas

- Cebú (Brahman)
- Cebú × Angus
- Cebú × Simmental
- Cebú × Europeo
- Angus
- Simmental
- Holstein
- Normando
- BON (Blanco Orejinegro)
- Y más...

## 🌾 Tipos de Pasto

- Brachiaria
- Estrella
- Guinea
- Angleton
- Kikuyo
- Nativo/Mixto

## 📞 Soporte

Este proyecto fue desarrollado para la gestión de fincas ganaderas en Antioquia, Colombia.

## 📄 Licencia

MIT License - Libre para uso personal y comercial.

---

**Desarrollado con ❤️ para ganaderos colombianos**
