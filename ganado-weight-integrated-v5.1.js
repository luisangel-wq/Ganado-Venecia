/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🐄 GANADO VENECIA - INTEGRATED WEIGHT ESTIMATION MODULE v5.1
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * CALIBRATION DATA (from 5 real weights - Venecia herd):
 * ┌─────────┬────────────────────┬───────┬────────┬────────┬───────┐
 * │ Animal  │ Breed Type         │ Largo │ Altura │ Peso   │ Ratio │
 * ├─────────┼────────────────────┼───────┼────────┼────────┼───────┤
 * │ #278    │ Cebú dominante     │ 125   │ 105    │ 231 kg │ 1.348 │
 * │ Tan     │ Cebú × Europeo     │ 115   │ 102    │ 204 kg │ 1.360 │
 * │ Tan     │ Cebú × Europeo     │ 118   │ 103    │ 210 kg │ 1.348 │
 * │ Black   │ Girolando (Gir×Hol)│ 130   │ 108    │ 255 kg │ 1.350 │
 * │ #274    │ Europeo carne      │ 128   │ 107    │ 272 kg │ 1.418 │
 * └─────────┴────────────────────┴───────┴────────┴────────┴───────┘
 * 
 * KEY INSIGHT: European beef breeds have ~5% higher ratio (deeper chest)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function(global) {
    'use strict';

    // ════════════════════════════════════════════════════════════════════════
    // CONFIGURATION - CALIBRATED FOR VENECIA WITH BREED ADJUSTMENT
    // ════════════════════════════════════════════════════════════════════════
    
    const CONFIG = {
        version: '5.1',
        
        // Breed-specific ratios (perímetro / altura)
        // Based on 5 real weights from Venecia herd
        breedRatios: {
            'cebu_puro': 1.34,        // Cebú dominante (>70% Brahman) - lean frame, large ears, hump
            'cebu_europeo': 1.35,     // F1 cross (50-50) - medium build, moderate hump
            'girolando': 1.35,        // Gir × Holstein - dairy cross, tropical adapted
            'europeo_lechero': 1.35,  // Pure Holstein/Jersey type - angular, no hump
            'europeo_carne': 1.42     // Angus/Simmental/Charolais - deep chest, muscular, no hump
        },
        
        // Default ratio (weighted average)
        baseRatio: 1.36,
        
        // BCS adjustment: each BCS point = ±0.04 ratio change
        bcsAdjustment: 0.04,
        
        // Ancho/altura adjustment factor
        anchoBaseline: 0.52,
        anchoFactor: 0.12,
        
        // Valid ranges
        minRatio: 1.20,
        maxRatio: 1.55,
        
        // Formula constants
        schaefferConstant: 10840,
        
        // Storage
        storageKey: 'ganado_venecia_calibration_v5.1'
    };

    // ════════════════════════════════════════════════════════════════════════
    // BREED IDENTIFICATION HELPERS
    // ════════════════════════════════════════════════════════════════════════
    
    const BREED_CHARACTERISTICS = {
        'cebu_puro': {
            name: 'Cebú Puro/Dominante',
            description: 'Brahman >70%',
            visual: ['Gray/white spotted', 'Large pendulous ears', 'Prominent hump', 'Lean angular frame', 'Loose skin/dewlap'],
            ratio: 1.34,
            icon: '🐂'
        },
        'cebu_europeo': {
            name: 'Cebú × Europeo (F1)',
            description: 'Cruce carne 50-50',
            visual: ['Fawn/tan color', 'Medium ears', 'Small hump', 'Medium frame'],
            ratio: 1.35,
            icon: '🔀'
        },
        'girolando': {
            name: 'Girolando',
            description: 'Gir × Holstein (lechero tropical)',
            visual: ['Black & white or reddish', 'Medium ears (Gir influence)', 'Small/no hump', 'Dairy frame', 'Heat tolerant'],
            ratio: 1.35,
            icon: '🥛'
        },
        'europeo_lechero': {
            name: 'Europeo Lechero Puro',
            description: 'Holstein/Jersey puro',
            visual: ['Black & white or fawn', 'Small ears', 'No hump', 'Angular dairy frame', 'Prominent hip bones'],
            ratio: 1.35,
            icon: '🐄'
        },
        'europeo_carne': {
            name: 'Europeo Carne',
            description: 'Angus/Simmental/Charolais',
            visual: ['Solid black/red/brindle', 'Small ears', 'No hump', 'DEEP barrel chest', 'Heavy muscling', 'Blocky build'],
            ratio: 1.42,
            icon: '🥩'
        }
    };

    // ════════════════════════════════════════════════════════════════════════
    // CALIBRATION DATA - INITIALIZED WITH 5 REAL WEIGHTS
    // ════════════════════════════════════════════════════════════════════════
    
    let calibration = {
        points: [
            { id: '#278', fecha: '2024-12-30', largo: 125, altura: 105, ancho: 55, pesoReal: 231, ratio: 1.348, raza: 'cebu_puro' },
            { id: 'TAN_204', fecha: '2024-12-30', largo: 115, altura: 102, ancho: 50, pesoReal: 204, ratio: 1.360, raza: 'cebu_europeo' },
            { id: 'TAN_210', fecha: '2024-12-30', largo: 118, altura: 103, ancho: 52, pesoReal: 210, ratio: 1.348, raza: 'cebu_europeo' },
            { id: 'GIROLANDO_255', fecha: '2024-12-30', largo: 130, altura: 108, ancho: 58, pesoReal: 255, ratio: 1.350, raza: 'girolando' },
            { id: '#274', fecha: '2024-12-30', largo: 128, altura: 107, ancho: 55, pesoReal: 272, ratio: 1.418, raza: 'europeo_carne' }
        ],
        
        // Breed-specific averages
        breedAverages: {
            'cebu_puro': { ratio: 1.348, count: 1 },
            'cebu_europeo': { ratio: 1.354, count: 2 },
            'girolando': { ratio: 1.350, count: 1 },
            'europeo_carne': { ratio: 1.418, count: 1 }
        },
        
        averageRatio: 1.365,
        totalPoints: 5,
        lastUpdated: '2024-12-30'
    };

    // ════════════════════════════════════════════════════════════════════════
    // CORE FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════
    
    /**
     * Get base ratio for a breed type
     */
    function getRatioForBreed(raza) {
        // First check calibration data
        if (calibration.breedAverages[raza] && calibration.breedAverages[raza].count > 0) {
            return calibration.breedAverages[raza].ratio;
        }
        // Fall back to config defaults
        return CONFIG.breedRatios[raza] || CONFIG.baseRatio;
    }

    /**
     * Calculate perímetro using BREED-ADJUSTED calibrated ratio
     */
    function calcularPerimetroCalibrado(altura, ancho, bcs = 5, raza = null) {
        if (!altura || altura < 60) return null;
        
        // Get base ratio for breed (or average if unknown)
        let ratio = raza ? getRatioForBreed(raza) : calibration.averageRatio;
        
        // Adjust for BCS (Body Condition Score)
        const bcsOffset = (bcs - 5) * CONFIG.bcsAdjustment;
        ratio += bcsOffset;
        
        // Adjust for body width proportion
        if (ancho && ancho > 20) {
            const anchoRatio = ancho / altura;
            const anchoOffset = (anchoRatio - CONFIG.anchoBaseline) * CONFIG.anchoFactor;
            ratio += anchoOffset;
        }
        
        // Clamp to valid range
        ratio = Math.max(CONFIG.minRatio, Math.min(CONFIG.maxRatio, ratio));
        
        const perimetro = altura * ratio;
        return Math.round(perimetro * 10) / 10;
    }

    /**
     * Calculate weight using Schaeffer formula
     */
    function calcularPesoDesdePerimetro(perimetro, largo) {
        if (!perimetro || !largo || perimetro < 80 || largo < 50) return null;
        
        const peso = (perimetro * perimetro * largo) / CONFIG.schaefferConstant;
        return Math.round(peso);
    }

    /**
     * Main estimation function WITH BREED
     */
    function estimarPeso(largo, altura, ancho, bcs = 5, raza = null) {
        // Calculate perímetro with breed-adjusted formula
        const perimetro = calcularPerimetroCalibrado(altura, ancho, bcs, raza);
        if (!perimetro) {
            return { success: false, error: 'Medidas insuficientes' };
        }
        
        // Calculate weight
        const peso = calcularPesoDesdePerimetro(perimetro, largo);
        if (!peso) {
            return { success: false, error: 'No se pudo calcular el peso' };
        }
        
        // Calculate range (±8%)
        const rangoMin = Math.round(peso * 0.92);
        const rangoMax = Math.round(peso * 1.08);
        
        // Get breed info
        const breedInfo = raza ? BREED_CHARACTERISTICS[raza] : null;
        
        return {
            success: true,
            peso,
            rango: { min: rangoMin, max: rangoMax },
            perimetro,
            ratio: perimetro / altura,
            raza: raza,
            razaNombre: breedInfo ? breedInfo.name : 'No especificada',
            razaIcon: breedInfo ? breedInfo.icon : '🐄',
            calibracion: {
                puntos: calibration.totalPoints,
                ratioPromedio: calibration.averageRatio,
                ratioUsado: perimetro / altura
            }
        };
    }

    // ════════════════════════════════════════════════════════════════════════
    // CALIBRATION FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════
    
    /**
     * Add a calibration point from a real weight WITH BREED
     */
    function agregarCalibracion(id, largo, altura, ancho, pesoReal, raza = null) {
        if (!largo || !altura || !pesoReal) return null;
        
        // Calculate the perímetro that would produce this weight
        const perimetroIdeal = Math.sqrt((pesoReal * CONFIG.schaefferConstant) / largo);
        const ratioIdeal = perimetroIdeal / altura;
        
        // Validate ratio is reasonable
        if (ratioIdeal < 1.0 || ratioIdeal > 2.0) {
            console.warn('Ratio fuera de rango:', ratioIdeal);
            return null;
        }
        
        // Add or update calibration point
        const existingIndex = calibration.points.findIndex(p => p.id === id);
        const newPoint = {
            id: id || `CAL_${Date.now()}`,
            fecha: new Date().toISOString().split('T')[0],
            largo, altura, ancho,
            pesoReal,
            perimetroIdeal: Math.round(perimetroIdeal * 10) / 10,
            ratio: Math.round(ratioIdeal * 1000) / 1000,
            raza: raza
        };
        
        if (existingIndex >= 0) {
            calibration.points[existingIndex] = newPoint;
        } else {
            calibration.points.push(newPoint);
        }
        
        // Recalculate averages
        recalcularPromedios();
        
        // Save
        guardarCalibracion();
        
        return newPoint;
    }

    /**
     * Recalculate averages from all calibration points
     */
    function recalcularPromedios() {
        if (calibration.points.length === 0) {
            calibration.averageRatio = CONFIG.baseRatio;
            calibration.totalPoints = 0;
            return;
        }
        
        // Reset breed averages
        calibration.breedAverages = {};
        
        let totalRatio = 0;
        
        calibration.points.forEach(p => {
            totalRatio += p.ratio;
            
            // Update breed-specific average
            if (p.raza) {
                if (!calibration.breedAverages[p.raza]) {
                    calibration.breedAverages[p.raza] = { ratio: 0, count: 0, sum: 0 };
                }
                calibration.breedAverages[p.raza].sum += p.ratio;
                calibration.breedAverages[p.raza].count++;
            }
        });
        
        // Calculate breed averages
        Object.keys(calibration.breedAverages).forEach(raza => {
            const data = calibration.breedAverages[raza];
            data.ratio = Math.round((data.sum / data.count) * 1000) / 1000;
        });
        
        calibration.averageRatio = Math.round((totalRatio / calibration.points.length) * 1000) / 1000;
        calibration.totalPoints = calibration.points.length;
        calibration.lastUpdated = new Date().toISOString().split('T')[0];
    }

    // ════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ════════════════════════════════════════════════════════════════════════
    
    function guardarCalibracion() {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(calibration));
        } catch (e) {
            console.warn('No se pudo guardar calibración');
        }
    }

    function cargarCalibracion() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                const data = JSON.parse(saved);
                calibration = { ...calibration, ...data };
                console.log(`🐄 Calibración cargada: ${calibration.totalPoints} puntos`);
            }
        } catch (e) {
            console.warn('No se pudo cargar calibración');
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // REPLACE calcularPesoFoto - WITH BREED SUPPORT
    // ════════════════════════════════════════════════════════════════════════
    
    function calcularPesoFotoMejorado() {
        const largo = parseFloat(document.getElementById('inputLargoCuerpo')?.value) || 0;
        const altura = parseFloat(document.getElementById('inputAlturaCruz')?.value) || 0;
        const ancho = parseFloat(document.getElementById('inputAnchoCuerpo')?.value) || 0;
        const bcs = parseInt(document.getElementById('inputBCS')?.value) || 5;
        
        // Get breed selection if available
        const razaSelect = document.getElementById('inputRaza');
        const raza = razaSelect ? razaSelect.value : null;
        
        // Validation
        if (largo < 50 || altura < 60) {
            const resultDiv = document.getElementById('resultadosPesoFoto');
            if (resultDiv) resultDiv.style.display = 'none';
            return null;
        }
        
        // Check for manual perímetro input
        let perimetro = parseFloat(document.getElementById('inputPerimetroToracico')?.value) || 0;
        
        // If no perímetro entered, calculate with breed-adjusted ratio
        if (!perimetro || perimetro < 80 || perimetro > altura * 2.5) {
            perimetro = calcularPerimetroCalibrado(altura, ancho, bcs, raza);
            
            // Update UI
            const aiPerimetroEl = document.getElementById('aiPerimetro');
            if (aiPerimetroEl) {
                const breedInfo = raza ? BREED_CHARACTERISTICS[raza] : null;
                const label = breedInfo ? breedInfo.icon + ' ' + breedInfo.name : 'promedio';
                aiPerimetroEl.innerHTML = `${perimetro} cm <span style="color: #10b981; font-size: 0.7em;">⚡ ${label}</span>`;
            }
        }
        
        // Calculate weight
        const result = estimarPeso(largo, altura, ancho, bcs, raza);
        
        if (!result.success) {
            console.warn('Weight calculation failed:', result.error);
            return null;
        }
        
        // Calculate confidence
        let confianza = 70;
        if (typeof estimacionActual !== 'undefined') {
            if (estimacionActual.fotos?.lateral) confianza += 8;
            if (estimacionActual.fotos?.trasera) confianza += 8;
            if (estimacionActual.fotos?.superior) confianza += 4;
        }
        if (raza) confianza += 5;
        if (calibration.totalPoints >= 5) confianza += 3;
        confianza = Math.min(confianza, 95);
        
        // Store result
        if (typeof estimacionActual !== 'undefined') {
            estimacionActual.medidas = { largo, altura, ancho, perimetro: result.perimetro };
            estimacionActual.raza = raza;
            estimacionActual.resultado = {
                peso: result.peso,
                rango: result.rango,
                perimetroCalculado: result.perimetro,
                confianza: confianza,
                fecha: new Date().toISOString(),
                metodo: estimacionActual.metodo || 'Calibrado',
                raza: result.razaNombre,
                calibracion: result.calibracion
            };
        }
        
        // Update UI
        const elements = {
            peso: document.getElementById('resultadoPesoKg'),
            rango: document.getElementById('resultadoRango'),
            perimetro: document.getElementById('resultadoPerimetro'),
            confianza: document.getElementById('resultadoConfianza'),
            metodo: document.getElementById('resultadoMetodo'),
            container: document.getElementById('resultadosPesoFoto')
        };
        
        if (elements.peso) elements.peso.textContent = `${result.peso} kg`;
        if (elements.rango) elements.rango.textContent = `Rango: ${result.rango.min} - ${result.rango.max} kg`;
        if (elements.perimetro) elements.perimetro.textContent = `${result.perimetro} cm`;
        if (elements.confianza) elements.confianza.textContent = `${confianza}%`;
        if (elements.metodo) {
            const metodoText = raza ? `${result.razaIcon} ${result.razaNombre}` : '📊 Calibrado';
            elements.metodo.textContent = metodoText;
        }
        
        if (elements.container) {
            elements.container.style.display = 'block';
            elements.container.classList.add('show');
        }
        
        // Calculate GDP if animal selected
        if (typeof estimacionActual !== 'undefined' && estimacionActual.animalId) {
            calcularGDP(result.peso);
        }
        
        return result;
    }

    /**
     * Calculate GDP (Daily Weight Gain)
     */
    function calcularGDP(pesoActual) {
        try {
            const appData = JSON.parse(localStorage.getItem('ganadoData_venecia') || '{}');
            const inventario = appData.inventario || [];
            const animal = inventario.find(a => a.numero === estimacionActual.animalId);
            
            if (animal && animal.peso && animal.fechaEntrada) {
                const fechaEntrada = new Date(animal.fechaEntrada);
                const hoy = new Date();
                const diasEnFinca = Math.floor((hoy - fechaEntrada) / (1000 * 60 * 60 * 24));
                
                if (diasEnFinca > 0) {
                    const ganancia = pesoActual - animal.peso;
                    const gdp = Math.round((ganancia / diasEnFinca) * 1000);
                    
                    const gdpEl = document.getElementById('resultadoGDP');
                    if (gdpEl) gdpEl.textContent = `${gdp} g/día`;
                }
            }
        } catch (e) {
            console.warn('Error calculating GDP:', e);
        }
    }

    /**
     * Get breed options for UI dropdown
     */
    function getBreedOptions() {
        return Object.keys(BREED_CHARACTERISTICS).map(key => ({
            value: key,
            label: BREED_CHARACTERISTICS[key].name,
            description: BREED_CHARACTERISTICS[key].description,
            ratio: BREED_CHARACTERISTICS[key].ratio,
            icon: BREED_CHARACTERISTICS[key].icon
        }));
    }

    /**
     * Add breed selector to the UI
     */
    function addBreedSelectorToUI() {
        const container = document.getElementById('aiMeasurementResults');
        if (!container || document.getElementById('inputRaza')) return;
        
        const anchoRow = document.querySelector('[id*="inputAnchoCuerpo"]')?.closest('.ai-result-item');
        if (!anchoRow) return;
        
        const razaHTML = `
            <div class="ai-result-item" style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #374151; font-weight: 600;">🧬 Tipo Genético</span>
                    <select id="inputRaza" class="form-select" onchange="calcularPesoFoto()" style="width: 200px; font-size: 0.85rem;">
                        <option value="">-- Auto (promedio) --</option>
                        <option value="cebu_puro">🐂 Cebú Puro (1.34)</option>
                        <option value="cebu_europeo">🔀 Cebú × Europeo (1.35)</option>
                        <option value="girolando">🥛 Girolando - Gir×Holstein (1.35)</option>
                        <option value="europeo_lechero">🐄 Europeo Lechero Puro (1.35)</option>
                        <option value="europeo_carne">🥩 Europeo Carne (1.42)</option>
                    </select>
                </div>
                <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">
                    Europeo Carne (Angus/Simmental) = pecho más profundo
                </div>
            </div>
        `;
        
        anchoRow.insertAdjacentHTML('afterend', razaHTML);
        console.log('✅ Selector de raza agregado');
    }

    // ════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ════════════════════════════════════════════════════════════════════════
    
    function init() {
        // Load saved calibration
        cargarCalibracion();
        
        // Replace calcularPesoFoto
        if (typeof global.calcularPesoFoto !== 'undefined') {
            global._originalCalcularPesoFoto = global.calcularPesoFoto;
        }
        global.calcularPesoFoto = calcularPesoFotoMejorado;
        
        // Add breed selector
        setTimeout(addBreedSelectorToUI, 1000);
        
        // Expose module
        global.GanadoVeneciaWeight = {
            version: CONFIG.version,
            estimarPeso,
            calcularPerimetro: calcularPerimetroCalibrado,
            agregarCalibracion,
            getCalibration: () => ({ ...calibration }),
            getBreedOptions,
            getBreedCharacteristics: () => ({ ...BREED_CHARACTERISTICS }),
            getRatioForBreed,
            resetCalibration: () => {
                calibration = {
                    points: [
                        { id: '#278', fecha: '2024-12-30', largo: 125, altura: 105, ancho: 55, pesoReal: 231, ratio: 1.348, raza: 'cebu_puro' },
                        { id: 'TAN_204', fecha: '2024-12-30', largo: 115, altura: 102, ancho: 50, pesoReal: 204, ratio: 1.360, raza: 'cebu_europeo' },
                        { id: 'TAN_210', fecha: '2024-12-30', largo: 118, altura: 103, ancho: 52, pesoReal: 210, ratio: 1.348, raza: 'cebu_europeo' },
                        { id: 'GIROLANDO_255', fecha: '2024-12-30', largo: 130, altura: 108, ancho: 58, pesoReal: 255, ratio: 1.350, raza: 'girolando' },
                        { id: '#274', fecha: '2024-12-30', largo: 128, altura: 107, ancho: 55, pesoReal: 272, ratio: 1.418, raza: 'europeo_carne' }
                    ],
                    breedAverages: {
                        'cebu_puro': { ratio: 1.348, count: 1 },
                        'cebu_europeo': { ratio: 1.354, count: 2 },
                        'girolando': { ratio: 1.350, count: 1 },
                        'europeo_carne': { ratio: 1.418, count: 1 }
                    },
                    averageRatio: 1.365,
                    totalPoints: 5,
                    lastUpdated: new Date().toISOString().split('T')[0]
                };
                guardarCalibracion();
                showToast?.('Calibración reiniciada a 5 puntos iniciales', 'info');
            }
        };
        
        // Log initialization
        console.log('═══════════════════════════════════════════════════════════');
        console.log('  🐄 GANADO VENECIA WEIGHT MODULE v' + CONFIG.version);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('  Puntos de calibración:', calibration.totalPoints);
        console.log('  ');
        console.log('  Ratios por raza:');
        Object.keys(CONFIG.breedRatios).forEach(raza => {
            const cal = calibration.breedAverages[raza];
            const ratio = cal ? cal.ratio : CONFIG.breedRatios[raza];
            const icon = BREED_CHARACTERISTICS[raza]?.icon || '🐄';
            console.log(`    ${icon} ${raza}: ${ratio}`);
        });
        console.log('  ');
        console.log('  ✅ calcularPesoFoto() reemplazado');
        console.log('═══════════════════════════════════════════════════════════');
    }

    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(typeof window !== 'undefined' ? window : global);
