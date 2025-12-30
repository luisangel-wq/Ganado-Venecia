# 🐂 Ganado-Venecia - Sistema de Gestión Ganadera

## 📋 Resumen del Proyecto

**Ganado-Venecia** es una aplicación web completa para la gestión integral de ganado bovino en fincas colombianas, con enfoque en cría y ceba de ganado grass-fed.

### 🎯 Características Principales

#### 1️⃣ **Multi-Finca**
- Soporte para 2 fincas: **La Coruña** 🏔️ y **Santa Catalina** ⛪
- Bases de datos independientes por finca
- Cambio rápido entre fincas con diferentes temas de color
- Almacenamiento separado en localStorage

#### 2️⃣ **Gestión de Inventario**
- **Compras por Lote**: Sistema de registro de compras con lote workflow
  - Define información del lote (vendedor, precio/kg, cantidad, fecha)
  - Agrega animales uno por uno al lote
  - Validación de cantidad exacta antes de guardar
  - Numeración consecutiva automática de chapetas

- **Nacimientos**: Registro de terneros nacidos
  - Vinculación con madre (vaca)
  - Herencia automática de raza
  - Peso típico al nacer

- **Ventas**: Sistema de venta por lote
  - Selección de múltiples animales del inventario
  - Peso de venta individual por animal
  - Cálculo automático de GDP (Ganancia Diaria de Peso)
  - Ganancia en kg por animal

- **Muertes**: Registro de pérdidas con causa

#### 3️⃣ **Módulo de Salud** 💉
- **Vacunas**: Registro de vacunación (Aftosa, Carbón, Brucelosis, etc.)
- **Desparasitaciones**: Control de parásitos (Ivermectina, Albendazol, etc.)
- **Tratamientos**: Medicamentos con período de retiro
- **Revisiones veterinarias**: Historial médico completo
- **Alertas automáticas**:
  - Refuerzos pendientes
  - Período de retiro activo (animales no vendibles)
  - Vacunas vencidas
- Aplicación masiva (múltiples animales en una sesión)
- Tracking de lotes de productos y veterinarios

#### 4️⃣ **Gestión de Potreros** 🌿
- **Registro de potreros** con:
  - Área (hectáreas)
  - Tipo de pasto (Brachiaria, Estrella, Guinea, etc.)
  - Capacidad (cabezas)
  - Fuente de agua (quebrada, bebedero, jagüey, pozo)
  - Estado (disponible, ocupado, descanso, mantenimiento)
- **Rotación de animales**:
  - Movimiento de animales entre potreros
  - Tracking de días en cada potrero
  - Historial completo de rotaciones
  - Cálculo automático de días de descanso
- **Alertas de descanso**: Potreros listos para usar (30+ días)

#### 5️⃣ **Módulo de Fotos** 📸
Sistema avanzado de captura fotográfica para estimación de peso con IA:

- **Identificación por chapeta**:
  - Foto de chapeta o entrada manual
  - Validación automática en inventario

- **Tipos de fotos**:
  - 📐 Lateral (obligatoria)
  - 🔙 Trasera (obligatoria)
  - ⬆️ Superior (opcional)

- **Calibración para IA**:
  - 🚧 **Manga calibrada**: Barras con marcas de altura
    - Posición en manga (entrada/centro/salida)
    - Marcas visibles para calibración precisa
  - 📏 **Vara de 1m**: Referencia estándar
    - Visibilidad por foto
    - Distancia aproximada (2m, 3m, 4m, 5m+)
  - 🏷️ **Solo chapeta**: Referencia limitada
  - ❌ **Sin referencia**: Estimación menos precisa

- **Datos adicionales**:
  - **BCS** (Body Condition Score 1-5)
  - Temporada (Lluvias fuertes, Veranillo, Lluvias, Seco)
  - Calidad del pasto
  - Peso visual estimado
  - Peso báscula (si disponible)
  - Estado de salud

- **Alertas de fotos**:
  - 🔴 Vencidas (>90 días sin foto)
  - 🟡 Próximas (60-90 días)
  - 🟢 Al día (<60 días)

- **Historial fotográfico**:
  - Visor de sesiones con navegación
  - Gráficos de tendencia BCS
  - Tracking de peso con báscula

#### 6️⃣ **Reportes y Análisis** 📊
- **Dashboard principal**:
  - Total de animales (machos/hembras)
  - Kg totales y promedio
  - Valor del inventario
  - Actividad reciente

- **Por Vendedor**:
  - Animales comprados
  - Kg totales
  - Inversión total
  - Precio/kg promedio

- **Por Comprador**:
  - Animales vendidos
  - Ingresos totales
  - GDP promedio

- **Tablas ordenables**: Click en columnas para ordenar

#### 7️⃣ **Import/Export** 📥📤
- **Importar Excel** con hojas:
  - Entradas (compras y nacimientos)
  - Salidas (ventas y muertes)
  - Formato compatible con Excel/LibreOffice

- **Exportar Excel** con hojas:
  - Entradas
  - Salidas
  - Inventario actual
  - Sesiones de fotos

- **Exportar CSV** para análisis externo

#### 8️⃣ **Perfil Individual** 🐂
Click en cualquier animal del inventario para ver:
- Información básica (lote, vendedor, raza, sexo)
- Peso y crecimiento (GDP calculado)
- Información financiera (costo, valor actual)
- Ubicación (potrero actual)
- Estado de salud (historial de tratamientos)
- Historial fotográfico con BCS

## 🔧 Configuración

### GDP (Ganancia Diaria de Peso)
- **Default**: 0.31 kg/día (promedio calibrado anualmente)
- Ajustable según las condiciones de tu finca

### GDP por Temporada (Referencia)
| Temporada | Meses | GDP Estimado | Calidad Pasto |
|-----------|-------|--------------|---------------|
| 🌧️ Lluvias Fuertes | Abr-May | **0.42 kg/día** | Excelente |
| 🌧️ Lluvias | Sep-Nov | **0.36 kg/día** | Bueno |
| 🌤️ Veranillo | Jun-Ago | **0.30 kg/día** | Regular |
| ☀️ Seco/Verano | Dic-Mar | **0.22 kg/día** | Escaso |

### Otros Ajustes
- Precio de venta estimado ($/kg)
- Peso objetivo de venta (kg)
- Peso mínimo de venta (kg)
- Intervalo de fotos recomendado (días)

## 💾 Almacenamiento de Datos

- **LocalStorage del navegador** (sin servidor)
- Base de datos independiente por finca
- Respaldo recomendado mediante exportación a Excel
- Las fotos se comprimen automáticamente para optimizar espacio

## 📱 Compatibilidad

- ✅ **Navegadores**: Chrome, Firefox, Safari, Edge
- ✅ **Dispositivos**: Desktop, tablet, móvil (responsive)
- ✅ **Funciona offline** (PWA-ready)
- ✅ **Cámara del dispositivo** para captura de fotos
- ✅ **Sin instalación requerida**

## 🚀 Cómo Usar

### Opción 1: Abrir Directamente
1. Abre `index.html` en cualquier navegador moderno
2. Selecciona tu finca (La Coruña o Santa Catalina)
3. Comienza a registrar animales

### Opción 2: Servidor Local (Recomendado para desarrollo)
```bash
# Con Python 3
cd /Users/beatrizescobar/Projects/Ganado-Venecia
python3 -m http.server 8080

# Luego abre: http://localhost:8080
```

### Opción 3: GitHub Pages
El repositorio está configurado para publicarse en GitHub Pages automáticamente.

## 📦 Estructura del Proyecto

```
Ganado-Venecia/
├── index.html                          # Aplicación principal (todo-en-uno)
├── guia_manga_calibrada.html          # Guía de uso: manga calibrada
├── guia_vara_calibracion.html         # Guía de uso: vara de 1m
└── README.md                           # Documentación del proyecto
```

## 🎨 Temas por Finca

- **La Coruña** 🏔️: Tema naranja (#ff9800)
- **Santa Catalina** ⛪: Tema azul (#1976d2)

## 📝 Workflow Típico

1. **Inicio**: Seleccionar finca
2. **Compra**: Registrar lote de animales comprados
3. **Salud**: Vacunar y desparasitar
4. **Potreros**: Asignar a potrero inicial
5. **Fotos**: Sesión fotográfica cada 90 días
6. **Rotación**: Mover entre potreros según necesidad
7. **Venta**: Cuando alcancen peso objetivo
8. **Reportes**: Analizar rendimiento y rentabilidad

## 🔐 Seguridad y Privacidad

- Todos los datos se almacenan **localmente** en tu navegador
- No hay transmisión de datos a servidores externos
- Las fotos se comprimen pero permanecen en tu dispositivo
- Realiza backups periódicos con la función de exportar

## 🛠️ Próximas Mejoras Sugeridas

- [ ] Integración con backend (Firebase/Supabase) para sincronización
- [ ] App móvil nativa (React Native/Flutter)
- [ ] Análisis predictivo de precios
- [ ] Integración con IA para estimación de peso real desde fotos
- [ ] Sistema de usuarios y permisos
- [ ] Reportes PDF automáticos
- [ ] Notificaciones push para alertas
- [ ] Dashboard de comparación entre fincas
- [ ] Gráficos de crecimiento interactivos

## 📞 Soporte

Para preguntas o mejoras, contacta al equipo de desarrollo o abre un issue en GitHub.

---

**Desarrollado con ❤️ para ganaderos colombianos**

*Última actualización: Diciembre 30, 2025*
