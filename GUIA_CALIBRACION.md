# 📐 Guía de Calibración del Sistema de Peso por Foto

## ¿Qué es la Calibración?

La calibración es un proceso para **mejorar la precisión** de las estimaciones de peso que hace la Inteligencia Artificial. El sistema aprende de los pesos reales que tú proporcionas y ajusta automáticamente sus cálculos futuros.

## ¿Por Qué Calibrar?

- **Mayor Precisión**: Ajusta las estimaciones según las características específicas de tu ganado
- **Aprendizaje Continuo**: Entre más datos reales agregues, más preciso se vuelve
- **Confianza**: Sabrás exactamente qué tan preciso es el sistema

---

## 📍 Dónde Encontrar la Calibración

1. Abre la aplicación
2. Ve a la pestaña **"Peso x Foto"** 📷
3. Desplázate hacia abajo hasta la sección **"⚙️ Calibración del Sistema"**

---

## 🎯 Cómo Usar la Calibración - Paso a Paso

### Paso 1: Tomar Fotos con IA
1. En la sección superior de "Peso x Foto", selecciona un animal
2. Toma las fotos requeridas (Lateral, Trasera, Superior)
3. Haz clic en **"🤖 Analizar con IA"**
4. La IA te dará las medidas y el **peso estimado**

### Paso 2: Pesar el Animal en Báscula Real
- Lleva el animal a una báscula física
- Anota el **peso real exacto**

### Paso 3: Agregar el Peso Real al Sistema
1. Ve a la sección **"Calibración del Sistema"**
2. En el formulario **"➕ Agregar Peso Real"**:
   - **Animal (Chapeta)**: Ingresa el número del animal (ej: 101)
   - **Peso Real (kg)**: Ingresa el peso de la báscula (ej: 235.5)
   - **Largo (cm)**: Copia el valor que la IA detectó
   - **Altura (cm)**: Copia el valor que la IA detectó
   - **Ancho (cm)**: (Opcional) Copia si la IA lo detectó
3. Haz clic en **"✅ Agregar Calibración"**

### Paso 4: Sistema Ajustado
- El sistema automáticamente calculará un nuevo **ratio de precisión**
- Este ratio se aplicará a todas las estimaciones futuras
- ¡Entre más animales calibres, más preciso será!

---

## 📊 Interpretando el Estado de Calibración

### En la sección de calibración verás:

```
Estado de Calibración
0 puntos
Precisión actual: 1.35 ± 0.00
💡 Agrega medidas reales para mejorar la precisión
```

- **Puntos**: Número de animales calibrados
- **Precisión actual (ratio)**: Factor de ajuste (ej: 1.35 = las estimaciones se multiplican por 1.35)
- **± Desviación**: Qué tan consistentes son los datos

### Progresión Recomendada:

| Animales Calibrados | Estado de Precisión |
|---------------------|---------------------|
| 0-2 | 🟡 Inicial (usando 3 animales base) |
| 3-5 | 🟢 Buena |
| 6-10 | 🟢 Muy Buena |
| 11+ | 🟢 Excelente |

---

## ✅ Mejores Prácticas

### 1. **Calibra Animales Variados**
   - Diferentes tamaños (pequeños, medianos, grandes)
   - Diferentes edades
   - Machos y hembras

### 2. **Calidad de las Fotos**
   - Asegúrate que las barras de la manga estén visibles
   - Fotos bien iluminadas
   - Animal centrado y perpendicular a la cámara

### 3. **Peso Real Preciso**
   - Usa una báscula calibrada
   - Pesa el mismo día que tomas las fotos
   - Registra el peso con decimales (ej: 235.5 kg, no solo 235)

### 4. **Frecuencia**
   - Calibra al menos 1-2 animales por semana
   - Cuando compres un nuevo lote, calibra varios de ese lote
   - Si notas que las estimaciones están muy desviadas, agrega más calibraciones

---

## 📈 Historial de Calibración

En la tabla verás todos tus registros:

| Animal | Fecha | Peso Real | Ratio |
|--------|-------|-----------|-------|
| 101 | 30/12/2024 | 235.5 kg | 1.42 |

- **Ratio individual**: Cuánto se desvió la estimación para ese animal
- Puedes **Exportar** los datos para análisis
- Puedes **Eliminar** una entrada si fue un error

---

## 🔄 Reiniciar Calibración

Si quieres empezar de cero:
1. Haz clic en **"🔄 Reiniciar Calibración"**
2. Confirma la acción
3. El sistema volverá a usar los 3 animales base iniciales

---

## 🎓 Ejemplo Completo

**Situación**: Tienes un toro #101 y quieres calibrar

1. **Fotos IA**: 
   - Tomas fotos en la manga
   - IA estima: 220 kg

2. **Báscula Real**: 
   - Lo pesas: 242 kg

3. **Agregar Calibración**:
   - Animal: 101
   - Peso Real: 242
   - Largo: 145 (de IA)
   - Altura: 132 (de IA)
   - Ancho: 48 (de IA)

4. **Resultado**:
   - Sistema calcula ratio: 242/220 = 1.1
   - Ahora todas las estimaciones se ajustarán
   - Próxima estimación de 200 kg → se ajustará a 220 kg

---

## ❓ Preguntas Frecuentes

**P: ¿Cuántos animales debo calibrar?**  
R: Mínimo 5-6 para tener buena precisión. Entre más, mejor.

**P: ¿Debo calibrar todos mis animales?**  
R: No es necesario. Con 10-15 animales variados es suficiente para un hato de 50-100.

**P: ¿Qué pasa si el peso real está MUY diferente de la estimación?**  
R: Puede ser que la foto no fue buena o hubo error en la báscula. Verifica y agrega más calibraciones.

**P: ¿Puedo calibrar sin tomar fotos nuevas?**  
R: Sí, si ya tienes medidas de la IA guardadas, solo necesitas agregar el peso real con esas medidas.

**P: ¿El sistema se pone más lento con muchas calibraciones?**  
R: No, el sistema solo guarda hasta 100 calibraciones más recientes.

---

## 📞 Soporte

Si tienes dudas o problemas:
1. Verifica que las fotos tengan las barras de la manga visibles
2. Asegúrate que el peso real sea correcto
3. Revisa que las medidas IA se copien correctamente

---

**🎉 ¡Listo!** Con este sistema de calibración, tus estimaciones de peso serán cada vez más precisas y confiables.
