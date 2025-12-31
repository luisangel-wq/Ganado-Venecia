/**
 * Cattle Weight Estimation Module v6.0 - JavaScript
 * Using Manga Bar Reference System
 * 
 * MANGA REFERENCE SYSTEM:
 * =======================
 * 
 * LATERAL VIEW (Side):
 * - Floor: y = 800 pixels
 * - Bar heights from floor: 18, 46, 74, 102, 130, 158 cm
 * - Spacing: 18cm (floor to bar 6), then 28cm between bars
 * - Scale: 4.02 px/cm (calibrated from 102cm bar at y=390)
 * 
 * BACK VIEW (Rear):
 * - Internal width: 60.5 cm between manga columns
 * - Use for measuring animal width (ANCHO)
 * 
 * MEASUREMENTS:
 * - ALTURA: Floor to withers (cruz) - from lateral view
 * - LARGO: Shoulder to pin bone - from lateral view
 * - ANCHO: Widest point of barrel - from back view
 * 
 * Author: Converted from Python v6.0 for Luis's Venecia Ranch
 * Date: December 2024
 */

const CattleWeightV6 = (function() {
    'use strict';
    
    // ============================================================
    // BREED DEFINITIONS
    // ============================================================
    
    const BreedType = {
        CEBU_PURO: {
            key: 'CEBU_PURO',
            displayName: 'Cebú Puro',
            ratio: 1.25,
            description: 'Zebu puro, giba pronunciada'
        },
        CEBU_EUROPEO: {
            key: 'CEBU_EUROPEO',
            displayName: 'Cebú × Europeo',
            ratio: 1.30,
            description: 'Cruces F1, giba moderada'
        },
        GIROLANDO: {
            key: 'GIROLANDO',
            displayName: 'Girolando',
            ratio: 1.35,
            description: 'Gyr × Holstein, lechero tropical'
        },
        EUROPEO_LECHERO: {
            key: 'EUROPEO_LECHERO',
            displayName: 'Europeo Lechero',
            ratio: 1.38,
            description: 'Holstein, Jersey, sin giba'
        },
        EUROPEO_CARNE: {
            key: 'EUROPEO_CARNE',
            displayName: 'Europeo Carne',
            ratio: 1.42,
            description: 'Angus, Hereford, compacto'
        }
    };
    
    // ============================================================
    // BCS (BODY CONDITION SCORE) DEFINITIONS
    // ============================================================
    
    const BCS = {
        VERY_THIN: {
            score: 3,
            ratioAdjustment: -0.08,
            displayName: 'Muy Flaco',
            description: 'Costillas muy visibles'
        },
        THIN: {
            score: 4,
            ratioAdjustment: -0.04,
            displayName: 'Delgado',
            description: 'Costillas visibles'
        },
        MODERATE: {
            score: 5,
            ratioAdjustment: 0.00,
            displayName: 'Moderado',
            description: 'Costillas palpables, no visibles'
        },
        GOOD: {
            score: 6,
            ratioAdjustment: 0.04,
            displayName: 'Bueno',
            description: 'Costillas cubiertas'
        },
        FAT: {
            score: 7,
            ratioAdjustment: 0.08,
            displayName: 'Gordo',
            description: 'Depósitos de grasa visibles'
        }
    };
    
    // ============================================================
    // MANGA REFERENCE CONSTANTS
    // ============================================================
    
    const MangaLateralRef = {
        FLOOR_Y: 800,
        
        BAR_HEIGHTS: {
            6: 18,   // Lowest bar
            5: 46,
            4: 74,
            3: 102,  // Key reference bar
            2: 130,
            1: 158   // Highest bar
        },
        
        DEFAULT_SCALE: 4.02,
        
        getBarY: function(barNum, scale = null) {
            if (scale === null) scale = this.DEFAULT_SCALE;
            const height = this.BAR_HEIGHTS[barNum] || 0;
            return Math.round(this.FLOOR_Y - height * scale);
        },
        
        getAllBarPositions: function(scale = null) {
            const positions = {};
            for (const barNum in this.BAR_HEIGHTS) {
                positions[barNum] = this.getBarY(parseInt(barNum), scale);
            }
            return positions;
        },
        
        calibrate: function(knownBar, barY) {
            const height = this.BAR_HEIGHTS[knownBar];
            return (this.FLOOR_Y - barY) / height;
        }
    };
    
    const MangaBackRef = {
        INTERNAL_WIDTH_CM: 60.5,
        
        getScale: function(leftX, rightX) {
            const widthPx = Math.abs(rightX - leftX);
            return widthPx / this.INTERNAL_WIDTH_CM;
        }
    };
    
    // ============================================================
    // WEIGHT CALCULATION FUNCTIONS
    // ============================================================
    
    /**
     * Calculate weight using Schaeffer formula with breed and BCS adjustments
     * 
     * @param {number} alturaCm - Height from floor to withers (cm)
     * @param {number} largoCm - Length from shoulder to pin bone (cm)
     * @param {object} breed - Breed type object
     * @param {object} bcs - Body condition score object
     * @returns {object} Calculation results
     */
    function calculateWeight(alturaCm, largoCm, breed, bcs = BCS.MODERATE) {
        // Calculate adjusted ratio
        const baseRatio = breed.ratio;
        const adjustedRatio = baseRatio + bcs.ratioAdjustment;
        
        // Calculate perímetro
        const perimetro = alturaCm * adjustedRatio;
        
        // Schaeffer formula: Weight = (Perimeter² × Length) / 10840
        const peso = (perimetro * perimetro * largoCm) / 10840;
        
        return {
            altura_cm: Math.round(alturaCm * 10) / 10,
            largo_cm: Math.round(largoCm * 10) / 10,
            perimetro_cm: Math.round(perimetro * 10) / 10,
            peso_kg: Math.round(peso * 10) / 10,
            breed: breed.displayName,
            breed_ratio: baseRatio,
            bcs: bcs.displayName,
            bcs_score: bcs.score,
            adjusted_ratio: Math.round(adjustedRatio * 1000) / 1000
        };
    }
    
    /**
     * Estimate weight from lateral view measurements
     * 
     * @param {number} cruzY - Y-coordinate of withers (cruz)
     * @param {number} shoulderX - X-coordinate of shoulder point
     * @param {number} pinboneX - X-coordinate of pin bone
     * @param {object} breed - Breed type object
     * @param {object} bcs - Body condition score object
     * @param {number} floorY - Y-coordinate of floor (default 800)
     * @param {number} calibrationBar - Bar number for calibration (default 3)
     * @param {number} calibrationBarY - Y-coordinate of calibration bar (default 390)
     * @returns {object} Estimation results
     */
    function estimateFromLateral(
        cruzY,
        shoulderX,
        pinboneX,
        breed,
        bcs = BCS.MODERATE,
        floorY = 800,
        calibrationBar = 3,
        calibrationBarY = 390
    ) {
        // Calibrate scale
        const scale = MangaLateralRef.calibrate(calibrationBar, calibrationBarY);
        
        // Calculate measurements
        const alturaCm = (floorY - cruzY) / scale;
        const largoCm = Math.abs(pinboneX - shoulderX) / scale;
        
        // Calculate weight
        const result = calculateWeight(alturaCm, largoCm, breed, bcs);
        
        // Add measurement details
        result.scale_px_per_cm = Math.round(scale * 100) / 100;
        result.floor_y = floorY;
        result.calibration = `Bar ${calibrationBar} at y=${calibrationBarY}`;
        result.cruz_y = cruzY;
        result.shoulder_x = shoulderX;
        result.pinbone_x = pinboneX;
        
        return result;
    }
    
    /**
     * Estimate animal width from back view
     * 
     * @param {number} mangaLeftX - X-coordinate of left manga column
     * @param {number} mangaRightX - X-coordinate of right manga column
     * @param {number} animalLeftX - X-coordinate of animal's left edge
     * @param {number} animalRightX - X-coordinate of animal's right edge
     * @returns {object} Width measurement results
     */
    function estimateAnchoFromBack(mangaLeftX, mangaRightX, animalLeftX, animalRightX) {
        const scale = MangaBackRef.getScale(mangaLeftX, mangaRightX);
        const widthPx = Math.abs(animalRightX - animalLeftX);
        const anchoCm = widthPx / scale;
        
        return {
            manga_width_cm: MangaBackRef.INTERNAL_WIDTH_CM,
            manga_width_px: Math.abs(mangaRightX - mangaLeftX),
            scale_px_per_cm: Math.round(scale * 100) / 100,
            ancho_cm: Math.round(anchoCm * 10) / 10,
            animal_width_px: widthPx
        };
    }
    
    /**
     * Detect breed from name (used with AI breed detection)
     * 
     * @param {string} breedName - Detected breed name
     * @returns {object} Breed type object
     */
    function detectBreedType(breedName) {
        if (!breedName) return BreedType.CEBU_EUROPEO; // Default
        
        const name = breedName.toLowerCase();
        
        if (name.includes('cebú') || name.includes('cebu') || name.includes('brahman') || name.includes('gyr')) {
            if (name.includes('cruza') || name.includes('cruce') || name.includes('×') || name.includes('x')) {
                return BreedType.CEBU_EUROPEO;
            }
            return BreedType.CEBU_PURO;
        }
        
        if (name.includes('girolando') || name.includes('gyr') && name.includes('holstein')) {
            return BreedType.GIROLANDO;
        }
        
        if (name.includes('holstein') || name.includes('jersey') || name.includes('ayrshire')) {
            return BreedType.EUROPEO_LECHERO;
        }
        
        if (name.includes('angus') || name.includes('hereford') || name.includes('charolais') || 
            name.includes('simmental') || name.includes('limousin')) {
            return BreedType.EUROPEO_CARNE;
        }
        
        // Default to middle ground
        return BreedType.CEBU_EUROPEO;
    }
    
    /**
     * Map BCS score number to BCS object
     * 
     * @param {number} score - BCS score (1-9)
     * @returns {object} BCS object
     */
    function getBCSFromScore(score) {
        if (score <= 3) return BCS.VERY_THIN;
        if (score === 4) return BCS.THIN;
        if (score === 5) return BCS.MODERATE;
        if (score === 6) return BCS.GOOD;
        return BCS.FAT;
    }
    
    /**
     * Get reference information for Gemini AI prompt
     * 
     * @returns {string} Reference information text
     */
    function getGeminiReferenceInfo() {
        return `
## MANGA CALIBRATION REFERENCE (CRITICAL - USE THESE EXACT VALUES):

LATERAL VIEW BARS (from floor upward):
- Floor: y = 800 pixels (reference point)
- Bar 6 (lowest): 18 cm from floor
- Bar 5: 46 cm from floor
- Bar 4: 74 cm from floor
- Bar 3: 102 cm from floor (KEY REFERENCE - usually at y=390)
- Bar 2: 130 cm from floor
- Bar 1 (highest): 158 cm from floor

SPACING: 28 cm between bars (except floor to Bar 6 = 18 cm)
SCALE: 4.02 pixels per cm (when Bar 3 is at y=390)

BACK VIEW:
- Internal width between manga columns: 60.5 cm
- Use this to calibrate horizontal measurements

## MEASUREMENT INSTRUCTIONS FOR AI:

1. ALTURA (Height):
   - Measure from floor (y=800) to animal's withers (cruz)
   - Count how many bars fit in that height
   - Use bar spacing (28cm) to calculate

2. LARGO (Length):
   - Measure from shoulder point to pin bone (base of tail)
   - Use the same scale as altura
   - Typical range: 120-170 cm

3. BREED DETECTION:
   - Identify breed from photo
   - Use this to select appropriate ratio:
     * Cebú Puro: 1.25 (giba pronunciada)
     * Cebú × Europeo: 1.30 (giba moderada)
     * Girolando: 1.35 (lechero tropical)
     * Europeo Lechero: 1.38 (Holstein, sin giba)
     * Europeo Carne: 1.42 (Angus, compacto)

4. FORMULA:
   Perímetro = Altura × Breed_Ratio
   Peso = (Perímetro² × Largo) / 10840

## EXPECTED OUTPUT FORMAT:
{
  "altura_cm": <number>,
  "largo_cm": <number>,
  "breed_detected": "<breed name>",
  "bcs_score": <1-7>,
  "confidence": <0-100>,
  "notes": "<observations>"
}
`;
    }
    
    // ============================================================
    // PUBLIC API
    // ============================================================
    
    return {
        BreedType,
        BCS,
        MangaLateralRef,
        MangaBackRef,
        calculateWeight,
        estimateFromLateral,
        estimateAnchoFromBack,
        detectBreedType,
        getBCSFromScore,
        getGeminiReferenceInfo,
        
        // Version info
        version: '6.0',
        description: 'Manga-based weight estimation with breed and BCS adjustments'
    };
})();

// Make available globally
window.CattleWeightV6 = CattleWeightV6;

console.log('═══════════════════════════════════════════════════════════');
console.log('  🐄 CATTLE WEIGHT MODULE v6.0 - Manga Reference System');
console.log('═══════════════════════════════════════════════════════════');
console.log('  ✅ Breed-specific ratios with BCS adjustments');
console.log('  ✅ Precise manga bar calibration system');
console.log('  ✅ Schaeffer formula: (Perimeter² × Length) / 10840');
console.log('  ✅ Gemini AI integration ready');
console.log('═══════════════════════════════════════════════════════════');
