/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🐄 CATTLE WEIGHT ESTIMATION MODULE - VENECIA RANCH
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Version: 4.0 (Auto-Calibrating)
 * Last Updated: 2024-12-30
 * Calibrated for: Cebú × Europeo crosses, grass-fed, Venecia, Antioquia
 * 
 * CALIBRATION DATA (3 animals):
 * ┌──────────┬───────┬────────┬───────┬────────┬────────────┬───────┐
 * │ Animal   │ Largo │ Altura │ Ancho │ Peso   │ Perímetro  │ Ratio │
 * ├──────────┼───────┼────────┼───────┼────────┼────────────┼───────┤
 * │ IMG_1609 │ 125   │ 105    │ 55    │ 231 kg │ 141.5 cm   │ 1.348 │
 * │ IMG_1588 │ 115   │ 102    │ 50    │ 204 kg │ 138.7 cm   │ 1.360 │
 * │ IMG_1596 │ 118   │ 103    │ 52    │ 210 kg │ 138.9 cm   │ 1.348 │
 * └──────────┴───────┴────────┴───────┴────────┴────────────┴───────┘
 * Average Ratio: 1.352 | Average Error: 3.7%
 * 
 * USAGE:
 *   <script src="cattle-weight-venecia-v4.js"></script>
 * 
 * The module auto-initializes and provides:
 *   - CattleWeight.estimate(largo, altura, ancho, bcs)
 *   - CattleWeight.calibrate(largo, altura, ancho, pesoReal)
 *   - CattleWeight.getCalibrationData()
 *   - CattleWeight.syncWithInventory(inventarioArray)
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function(global) {
    'use strict';

    // ════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ════════════════════════════════════════════════════════════════════════
    
    const CONFIG = {
        // Version info
        version: '4.0',
        lastUpdated: '2024-12-30',
        
        // Base ratio calibrated from 3 animals (average: 1.352)
        baseRatio: 1.35,
        
        // Valid ratio range
        minRatio: 1.15,
        maxRatio: 1.55,
        
        // BCS adjustment per point (±0.04)
        bcsAdjustment: 0.04,
        
        // Ancho/altura baseline for adjustment
        anchoAlturaBaseline: 0.52,
        anchoAdjustmentFactor: 0.15,
        
        // Schaeffer formula constant
        schaefferConstant: 10840,
        
        // Minimum calibration points before adjusting base ratio
        minCalibrationPoints: 3,
        
        // Maximum calibration age (days) - older points get less weight
        maxCalibrationAge: 365,
        
        // Storage key for localStorage
        storageKey: 'venecia_cattle_calibration_v4'
    };

    // ════════════════════════════════════════════════════════════════════════
    // CALIBRATION DATA STORE
    // ════════════════════════════════════════════════════════════════════════
    
    let calibrationData = {
        // Initial calibration from real weights
        points: [
            { id: 'IMG_1609', fecha: '2024-12-30', largo: 125, altura: 105, ancho: 55, peso: 231, ratio: 1.348 },
            { id: 'IMG_1588', fecha: '2024-12-30', largo: 115, altura: 102, ancho: 50, peso: 204, ratio: 1.360 },
            { id: 'IMG_1596', fecha: '2024-12-30', largo: 118, altura: 103, ancho: 52, peso: 210, ratio: 1.348 }
        ],
        
        // Computed values (updated when points change)
        averageRatio: 1.352,
        standardDeviation: 0.007,
        lastUpdated: '2024-12-30',
        totalPoints: 3
    };

    // ════════════════════════════════════════════════════════════════════════
    // BCS FACTORS (computed from base ratio)
    // ════════════════════════════════════════════════════════════════════════
    
    function getBCSFactors(baseRatio) {
        const factors = {};
        for (let bcs = 1; bcs <= 9; bcs++) {
            factors[bcs] = Math.round((baseRatio + (bcs - 5) * CONFIG.bcsAdjustment) * 1000) / 1000;
        }
        return factors;
    }

    let bcsFactors = getBCSFactors(CONFIG.baseRatio);

    // ════════════════════════════════════════════════════════════════════════
    // CORE CALCULATION FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════
    
    /**
     * Calculate perímetro from measurements using calibrated ratio
     * @param {number} altura - Height at withers (cm)
     * @param {number} ancho - Body width (cm) - optional
     * @param {number} bcs - Body Condition Score (1-9), default 5
     * @returns {Object} { perimetro, ratio, adjustments }
     */
    function calcularPerimetro(altura, ancho, bcs = 5) {
        if (!altura || altura < 60) {
            return { perimetro: null, ratio: null, error: 'Altura inválida' };
        }

        // Get base ratio for BCS
        let ratio = bcsFactors[bcs] || calibrationData.averageRatio;
        const adjustments = { base: ratio, bcs: 0, ancho: 0 };

        // Adjust for body width if available
        if (ancho && ancho > 20) {
            const anchoAlturaRatio = ancho / altura;
            const anchoAdjustment = (anchoAlturaRatio - CONFIG.anchoAlturaBaseline) * CONFIG.anchoAdjustmentFactor;
            ratio += anchoAdjustment;
            adjustments.ancho = anchoAdjustment;
        }

        // Clamp ratio to valid range
        ratio = Math.max(CONFIG.minRatio, Math.min(CONFIG.maxRatio, ratio));

        const perimetro = Math.round(altura * ratio * 10) / 10;

        return { perimetro, ratio, adjustments };
    }

    /**
     * Calculate weight from perímetro and largo using Schaeffer formula
     * @param {number} perimetro - Chest girth (cm)
     * @param {number} largo - Body length (cm)
     * @returns {Object} { peso, rango, formulas }
     */
    function calcularPeso(perimetro, largo) {
        if (!perimetro || !largo || perimetro < 80 || largo < 50) {
            return { peso: null, error: 'Medidas inválidas' };
        }

        const P = perimetro;
        const L = largo;

        // Multiple formulas for comparison
        const formulas = {
            schaeffer: (P * P * L) / 10840,
            crevat: (P * P * L) / 11880,
            quetelet: (P * P * L) / 10000,
            cebu: (P * P * L) / 11200
        };

        // Weighted average (Schaeffer and Cebú formula get more weight)
        const peso = Math.round(
            formulas.schaeffer * 0.35 +
            formulas.crevat * 0.20 +
            formulas.quetelet * 0.15 +
            formulas.cebu * 0.30
        );

        return {
            peso,
            rango: {
                min: Math.round(peso * 0.92),
                max: Math.round(peso * 1.08)
            },
            formulas: {
                schaeffer: Math.round(formulas.schaeffer),
                crevat: Math.round(formulas.crevat),
                quetelet: Math.round(formulas.quetelet),
                cebu: Math.round(formulas.cebu)
            }
        };
    }

    /**
     * Main estimation function - combines all steps
     * @param {number} largo - Body length (cm)
     * @param {number} altura - Height at withers (cm)
     * @param {number} ancho - Body width (cm) - optional
     * @param {number} bcs - Body Condition Score (1-9), default 5
     * @returns {Object} Complete estimation result
     */
    function estimate(largo, altura, ancho = null, bcs = 5) {
        const timestamp = new Date().toISOString();
        
        // Calculate perímetro
        const perimResult = calcularPerimetro(altura, ancho, bcs);
        if (perimResult.error) {
            return { success: false, error: perimResult.error, timestamp };
        }

        // Calculate peso
        const pesoResult = calcularPeso(perimResult.perimetro, largo);
        if (pesoResult.error) {
            return { success: false, error: pesoResult.error, timestamp };
        }

        // Calculate confidence based on data quality
        let confianza = 70;
        if (ancho && ancho > 20) confianza += 10;
        if (bcs >= 4 && bcs <= 6) confianza += 5;
        if (calibrationData.totalPoints >= 5) confianza += 10;
        confianza = Math.min(95, confianza);

        return {
            success: true,
            timestamp,
            medidas: { largo, altura, ancho, bcs },
            perimetro: perimResult.perimetro,
            ratio: perimResult.ratio,
            peso: pesoResult.peso,
            rango: pesoResult.rango,
            confianza,
            formulas: pesoResult.formulas,
            calibracion: {
                version: CONFIG.version,
                puntos: calibrationData.totalPoints,
                ratioPromedio: calibrationData.averageRatio
            }
        };
    }

    // ════════════════════════════════════════════════════════════════════════
    // CALIBRATION FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════
    
    /**
     * Calculate the ideal ratio from a known weight
     * @param {number} peso - Actual weight (kg)
     * @param {number} largo - Body length (cm)
     * @param {number} altura - Height at withers (cm)
     * @returns {Object} { perimetroIdeal, ratioIdeal }
     */
    function calcularRatioIdeal(peso, largo, altura) {
        const perimetroIdeal = Math.sqrt((peso * CONFIG.schaefferConstant) / largo);
        const ratioIdeal = perimetroIdeal / altura;
        return {
            perimetroIdeal: Math.round(perimetroIdeal * 10) / 10,
            ratioIdeal: Math.round(ratioIdeal * 1000) / 1000
        };
    }

    /**
     * Add a new calibration point from a real weight
     * @param {Object} data - { id, largo, altura, ancho, pesoReal }
     * @returns {Object} Calibration result
     */
    function calibrate(data) {
        const { id, largo, altura, ancho, pesoReal } = data;

        if (!largo || !altura || !pesoReal) {
            return { success: false, error: 'Faltan datos requeridos (largo, altura, pesoReal)' };
        }

        // Calculate ideal ratio for this animal
        const { perimetroIdeal, ratioIdeal } = calcularRatioIdeal(pesoReal, largo, altura);

        // Check if ratio is within valid range
        if (ratioIdeal < CONFIG.minRatio || ratioIdeal > CONFIG.maxRatio) {
            return {
                success: false,
                error: `Ratio calculado (${ratioIdeal}) fuera de rango válido (${CONFIG.minRatio}-${CONFIG.maxRatio}). Verificar medidas.`,
                ratioIdeal
            };
        }

        // Create calibration point
        const newPoint = {
            id: id || `CAL_${Date.now()}`,
            fecha: new Date().toISOString().split('T')[0],
            largo,
            altura,
            ancho: ancho || null,
            peso: pesoReal,
            perimetro: perimetroIdeal,
            ratio: ratioIdeal
        };

        // Check for duplicate (same animal)
        const existingIndex = calibrationData.points.findIndex(p => p.id === newPoint.id);
        if (existingIndex >= 0) {
            calibrationData.points[existingIndex] = newPoint;
        } else {
            calibrationData.points.push(newPoint);
        }

        // Recalculate statistics
        updateCalibrationStats();

        // Save to localStorage
        saveCalibration();

        // Calculate what the old formula would have estimated
        const oldEstimate = estimate(largo, altura, ancho, 5);

        return {
            success: true,
            mensaje: 'Calibración agregada exitosamente',
            punto: newPoint,
            estadisticas: {
                totalPuntos: calibrationData.totalPoints,
                ratioPromedio: calibrationData.averageRatio,
                desviacionEstandar: calibrationData.standardDeviation
            },
            comparacion: {
                pesoReal: pesoReal,
                pesoEstimadoAnterior: oldEstimate.peso,
                errorAnterior: oldEstimate.peso ? Math.round((oldEstimate.peso - pesoReal) / pesoReal * 100 * 10) / 10 : null
            }
        };
    }

    /**
     * Update calibration statistics from all points
     */
    function updateCalibrationStats() {
        const points = calibrationData.points;
        
        if (points.length === 0) {
            calibrationData.averageRatio = CONFIG.baseRatio;
            calibrationData.standardDeviation = 0;
            calibrationData.totalPoints = 0;
            return;
        }

        // Calculate weighted average (newer points get more weight)
        const now = new Date();
        let weightedSum = 0;
        let totalWeight = 0;

        points.forEach(point => {
            const age = Math.max(1, (now - new Date(point.fecha)) / (1000 * 60 * 60 * 24));
            const weight = Math.max(0.5, 1 - (age / CONFIG.maxCalibrationAge));
            weightedSum += point.ratio * weight;
            totalWeight += weight;
        });

        const avgRatio = weightedSum / totalWeight;

        // Calculate standard deviation
        const squaredDiffs = points.map(p => Math.pow(p.ratio - avgRatio, 2));
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / points.length;
        const stdDev = Math.sqrt(avgSquaredDiff);

        // Update calibration data
        calibrationData.averageRatio = Math.round(avgRatio * 1000) / 1000;
        calibrationData.standardDeviation = Math.round(stdDev * 1000) / 1000;
        calibrationData.totalPoints = points.length;
        calibrationData.lastUpdated = new Date().toISOString().split('T')[0];

        // Update BCS factors if we have enough data
        if (points.length >= CONFIG.minCalibrationPoints) {
            bcsFactors = getBCSFactors(calibrationData.averageRatio);
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    // INVENTORY SYNC FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════
    
    /**
     * Sync calibration with inventory data
     * Automatically calibrates when animals have both photo measurements and real weights
     * 
     * @param {Array} inventario - Array of animals from inventory
     * @param {Object} options - { medidasField, pesoField, chapetaField }
     * @returns {Object} Sync results
     */
    function syncWithInventory(inventario, options = {}) {
        const {
            chapetaField = 'chapeta',
            pesoRealField = 'pesoReal',         // Field with actual weighed weight
            pesoEntradaField = 'peso',           // Field with entry weight
            medidasField = 'medidasFoto',        // Field with photo measurements
            fechaPesoField = 'fechaPeso'         // Field with weight date
        } = options;

        const results = {
            processed: 0,
            calibrated: 0,
            skipped: 0,
            errors: [],
            newPoints: []
        };

        if (!Array.isArray(inventario)) {
            return { ...results, error: 'Inventario debe ser un array' };
        }

        inventario.forEach(animal => {
            results.processed++;

            // Get measurements (could be from photo analysis or manual entry)
            const medidas = animal[medidasField];
            const pesoReal = animal[pesoRealField];
            const chapeta = animal[chapetaField];

            // Need both measurements and real weight to calibrate
            if (!medidas || !pesoReal) {
                results.skipped++;
                return;
            }

            const { largo, altura, ancho } = medidas;

            if (!largo || !altura) {
                results.skipped++;
                return;
            }

            // Check if this animal is already in calibration data
            const existing = calibrationData.points.find(p => p.id === chapeta);
            if (existing && existing.peso === pesoReal) {
                results.skipped++;
                return; // Already calibrated with same weight
            }

            // Add calibration point
            const calResult = calibrate({
                id: chapeta,
                largo,
                altura,
                ancho,
                pesoReal
            });

            if (calResult.success) {
                results.calibrated++;
                results.newPoints.push(calResult.punto);
            } else {
                results.errors.push({ chapeta, error: calResult.error });
            }
        });

        return results;
    }

    /**
     * Auto-calibrate when a new weight is recorded for an animal with photo measurements
     * Call this when updating an animal's weight in the inventory
     * 
     * @param {string} chapeta - Animal ID
     * @param {number} pesoReal - Actual weight
     * @param {Object} medidas - { largo, altura, ancho } from photo analysis
     */
    function autoCalibrate(chapeta, pesoReal, medidas) {
        if (!medidas || !medidas.largo || !medidas.altura || !pesoReal) {
            return { success: false, error: 'Datos insuficientes para calibración' };
        }

        return calibrate({
            id: chapeta,
            largo: medidas.largo,
            altura: medidas.altura,
            ancho: medidas.ancho,
            pesoReal
        });
    }

    // ════════════════════════════════════════════════════════════════════════
    // PERSISTENCE FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════
    
    /**
     * Save calibration data to localStorage
     */
    function saveCalibration() {
        try {
            const data = JSON.stringify(calibrationData);
            localStorage.setItem(CONFIG.storageKey, data);
            return true;
        } catch (e) {
            console.warn('CattleWeight: No se pudo guardar calibración', e);
            return false;
        }
    }

    /**
     * Load calibration data from localStorage
     */
    function loadCalibration() {
        try {
            const stored = localStorage.getItem(CONFIG.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                calibrationData = { ...calibrationData, ...data };
                updateCalibrationStats();
                console.log(`🐄 CattleWeight: Calibración cargada (${calibrationData.totalPoints} puntos)`);
            }
        } catch (e) {
            console.warn('CattleWeight: No se pudo cargar calibración', e);
        }
    }

    /**
     * Export calibration data for backup
     */
    function exportCalibration() {
        return {
            version: CONFIG.version,
            exported: new Date().toISOString(),
            data: calibrationData
        };
    }

    /**
     * Import calibration data from backup
     */
    function importCalibration(backupData) {
        if (!backupData || !backupData.data || !backupData.data.points) {
            return { success: false, error: 'Formato de backup inválido' };
        }

        calibrationData = backupData.data;
        updateCalibrationStats();
        saveCalibration();

        return {
            success: true,
            mensaje: `Importados ${calibrationData.totalPoints} puntos de calibración`
        };
    }

    /**
     * Reset calibration to initial values
     */
    function resetCalibration() {
        calibrationData = {
            points: [
                { id: 'IMG_1609', fecha: '2024-12-30', largo: 125, altura: 105, ancho: 55, peso: 231, ratio: 1.348 },
                { id: 'IMG_1588', fecha: '2024-12-30', largo: 115, altura: 102, ancho: 50, peso: 204, ratio: 1.360 },
                { id: 'IMG_1596', fecha: '2024-12-30', largo: 118, altura: 103, ancho: 52, peso: 210, ratio: 1.348 }
            ],
            averageRatio: 1.352,
            standardDeviation: 0.007,
            lastUpdated: new Date().toISOString().split('T')[0],
            totalPoints: 3
        };
        bcsFactors = getBCSFactors(CONFIG.baseRatio);
        saveCalibration();
        return { success: true, mensaje: 'Calibración reiniciada a valores iniciales (3 puntos)' };
    }

    // ════════════════════════════════════════════════════════════════════════
    // UI INTEGRATION HELPERS
    // ════════════════════════════════════════════════════════════════════════
    
    /**
     * Get preset values for quick selection
     */
    function getPresets() {
        return {
            terneroMuyPequeno: { label: 'Ternero muy pequeño (~125kg)', largo: 100, altura: 85, ancho: 40, peso: 125 },
            terneroPequeno: { label: 'Ternero pequeño (~175kg)', largo: 108, altura: 92, ancho: 45, peso: 175 },
            terneroMediano: { label: 'Ternero mediano (~210kg)', largo: 115, altura: 100, ancho: 50, peso: 210 },
            novillaLiviana: { label: 'Novilla liviana (~280kg)', largo: 125, altura: 108, ancho: 55, peso: 280 },
            novilloMediano: { label: 'Novillo mediano (~350kg)', largo: 135, altura: 115, ancho: 60, peso: 350 },
            novilloPesado: { label: 'Novillo pesado (~420kg)', largo: 145, altura: 122, ancho: 68, peso: 420 },
            toroAdulto: { label: 'Toro adulto (~500kg)', largo: 155, altura: 130, ancho: 75, peso: 500 }
        };
    }

    /**
     * Generate HTML for calibration status display
     */
    function getCalibrationStatusHTML() {
        return `
        <div class="calibration-status" style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 1rem; font-size: 0.85rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <strong style="color: #166534;">🐄 Calibración Venecia v${CONFIG.version}</strong>
                <span style="background: #dcfce7; color: #166534; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">
                    ${calibrationData.totalPoints} puntos
                </span>
            </div>
            <div style="color: #15803d;">
                Ratio: <strong>${calibrationData.averageRatio}</strong> ± ${calibrationData.standardDeviation}<br>
                Última actualización: ${calibrationData.lastUpdated}
            </div>
        </div>`;
    }

    // ════════════════════════════════════════════════════════════════════════
    // REPLACE EXISTING FUNCTIONS (if they exist)
    // ════════════════════════════════════════════════════════════════════════
    
    function replaceExistingFunctions() {
        // Replace calcularPesoFoto if it exists
        if (typeof global.calcularPesoFoto !== 'undefined') {
            global._originalCalcuarPesoFoto = global.calcularPesoFoto;
        }
        
        global.calcularPesoFoto = function() {
            const largo = parseFloat(document.getElementById('inputLargoCuerpo')?.value) || 0;
            const altura = parseFloat(document.getElementById('inputAlturaCruz')?.value) || 0;
            const ancho = parseFloat(document.getElementById('inputAnchoCuerpo')?.value) || 0;
            const bcs = parseInt(document.getElementById('inputBCS')?.value) || 5;

            const result = estimate(largo, altura, ancho, bcs);

            if (!result.success) {
                console.warn('CattleWeight:', result.error);
                return null;
            }

            // Update UI elements if they exist
            const elements = {
                peso: document.getElementById('resultadoPesoKg'),
                rango: document.getElementById('resultadoRango'),
                perimetro: document.getElementById('resultadoPerimetro') || document.getElementById('aiPerimetro'),
                confianza: document.getElementById('resultadoConfianza'),
                container: document.getElementById('resultadosPesoFoto')
            };

            if (elements.peso) elements.peso.textContent = `${result.peso} kg`;
            if (elements.rango) elements.rango.textContent = `Rango: ${result.rango.min} - ${result.rango.max} kg`;
            if (elements.perimetro) elements.perimetro.textContent = `${result.perimetro} cm`;
            if (elements.confianza) elements.confianza.textContent = `${result.confianza}%`;
            if (elements.container) elements.container.style.display = 'block';

            // Store in global if estimacionActual exists
            if (typeof global.estimacionActual !== 'undefined') {
                global.estimacionActual.medidas = result.medidas;
                global.estimacionActual.resultado = result;
            }

            return result;
        };

        console.log('✅ CattleWeight: calcularPesoFoto reemplazado');
    }

    // ════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ════════════════════════════════════════════════════════════════════════
    
    const CattleWeight = {
        // Version
        version: CONFIG.version,
        
        // Core functions
        estimate,
        calcularPerimetro,
        calcularPeso,
        calcularRatioIdeal,
        
        // Calibration
        calibrate,
        autoCalibrate,
        syncWithInventory,
        getCalibrationData: () => ({ ...calibrationData }),
        resetCalibration,
        
        // Persistence
        saveCalibration,
        loadCalibration,
        exportCalibration,
        importCalibration,
        
        // UI Helpers
        getPresets,
        getCalibrationStatusHTML,
        getBCSFactors: () => ({ ...bcsFactors }),
        
        // Configuration
        getConfig: () => ({ ...CONFIG })
    };

    // ════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ════════════════════════════════════════════════════════════════════════
    
    function init() {
        // Load saved calibration
        loadCalibration();
        
        // Replace existing functions
        replaceExistingFunctions();
        
        // Expose globally
        global.CattleWeight = CattleWeight;
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('  🐄 CATTLE WEIGHT MODULE - VENECIA v' + CONFIG.version);
        console.log('═══════════════════════════════════════════════════════════');
        console.log('  Puntos de calibración: ' + calibrationData.totalPoints);
        console.log('  Ratio promedio: ' + calibrationData.averageRatio);
        console.log('  Desviación estándar: ' + calibrationData.standardDeviation);
        console.log('');
        console.log('  Uso: CattleWeight.estimate(largo, altura, ancho, bcs)');
        console.log('  Calibrar: CattleWeight.calibrate({id, largo, altura, ancho, pesoReal})');
        console.log('═══════════════════════════════════════════════════════════');
    }

    // Run on DOM ready or immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})(typeof window !== 'undefined' ? window : global);
