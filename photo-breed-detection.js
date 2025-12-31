/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🧬 BREED DETECTION & CLASSIFICATION MODULE
 * ═══════════════════════════════════════════════════════════════════════════
 * Uses Gemini 2.0 Flash Exp for improved breed detection
 */

(function(global) {
    'use strict';

    const BREED_DETECTION = {
        
        /**
         * Enhanced breed detection prompt for Gemini
         */
        buildBreedPrompt() {
            return `You are an expert in Colombian cattle breed identification, specialized in tropical beef and dairy breeds.

## COMMON BREEDS IN COLOMBIA (Tropical/Subtropical):

### 1. CEBÚ PURO/DOMINANTE (Brahman >70%)
Visual: Gray/white with dark spotted pattern OR solid red/cream, LARGE pendulous ears (30+ cm), PROMINENT hump (giba) on shoulders, lean angular frame, loose skin/dewlap under neck
Body: Narrow chest, longer legs, heat-adapted
ID Key: If you see LARGE EARS + BIG HUMP + LOOSE SKIN = Cebú
Ratio: 1.34

### 2. CEBÚ × EUROPEO (F1 Cross 50-50)
Visual: Fawn/tan/light brown solid color, MEDIUM ears (20cm), SMALL hump, medium muscling
Body: Intermediate build - not as lean as pure Cebú, not as deep as European beef
ID Key: Moderate features, tan color, small hump
Ratio: 1.35

### 3. GIROLANDO (Gir × Holstein)
Visual: Black & white patches OR reddish brown, medium-to-large ears with Gir influence, small/no hump, dairy frame (angular, visible ribs), heat tolerant
Body: Dairy build but tropical adapted
ID Key: Black & white dairy + tropical features = Girolando
Ratio: 1.35

### 4. EUROPEO LECHERO PURO (Holstein/Jersey)
Visual: Black & white (Holstein) OR solid fawn/cream (Jersey), SMALL ears (<15cm), NO HUMP, very angular dairy frame, prominent hip bones, narrow chest
Body: Thin, dairy-optimized
ID Key: Clearly dairy, NO tropical features = European Dairy
Ratio: 1.35

### 5. EUROPEO CARNE (Angus/Simmental/Charolais/Brangus)
Visual: Solid BLACK (Angus), RED (Simmental), or WHITE (Charolais), SMALL ears, NO HUMP, DEEP barrel chest, HEAVY muscling especially in hindquarters, BLOCKY rectangular build
Body: Low-set, thick, muscular
ID Key: Black/red solid + NO HUMP + DEEP CHEST + BLOCKY = European Beef
Ratio: 1.42 (HIGHEST - deepest chest)

## CRITICAL DECISION TREE:

1. **Check EARS:**
   - LARGE droopy ears (>25cm) → Cebú influence → go to 2
   - SMALL ears (<15cm) → European → go to 4

2. **Check HUMP:**
   - PROMINENT hump (>10cm high) → Cebú Puro
   - SMALL hump (5cm) → Cebú × Europeo
   - NO hump → European → go to 3

3. **Check COLOR (if no hump):**
   - Black & white patches → Holstein OR Girolando
   - Solid black/red/white → European Beef
   - Tan/fawn → Could be Jersey or F1 → check build

4. **Check BUILD:**
   - Angular, thin, visible ribs → Dairy (Holstein/Jersey)
   - DEEP chest, blocky, muscular → Beef (Angus/Simmental)
   - Intermediate → F1 Cross

## YOUR TASK:

Analyze the photos and provide:

1. **Primary breed classification** (one of the 5 categories above)
2. **Confidence** (0-100%)
3. **Key visual evidence** seen in photos
4. **Alternative possibilities** if confidence <80%

## OUTPUT FORMAT (JSON):

{
  "breed": "<cebu_puro|cebu_europeo|girolando|europeo_lechero|europeo_carne>",
  "breedName": "<Spanish name>",
  "confidence": <0-100>,
  "evidence": [
    "Feature 1 observed",
    "Feature 2 observed"
  ],
  "alternatives": [
    {"breed": "<code>", "reason": "<why possible>"}
  ],
  "notes": "<any special observations>"
}

ONLY respond with the JSON, no additional text.`;
        },

        /**
         * Detect breed from photos using Gemini 2.0 Flash Exp
         */
        async detectBreed(photos) {
            const apiKey = localStorage.getItem('googleApiKey');
            if (!apiKey) {
                console.warn('No Gemini API key found');
                return null;
            }

            try {
                const prompt = this.buildBreedPrompt();
                const imageParts = [];

                // Add all available photos
                ['lateral', 'trasera', 'superior', 'chapeta'].forEach(type => {
                    if (photos[type]) {
                        imageParts.push({
                            inlineData: {
                                mimeType: 'image/jpeg',
                                data: photos[type].split(',')[1]
                            }
                        });
                    }
                });

                if (imageParts.length === 0) {
                    console.warn('No photos provided for breed detection');
                    return null;
                }

                // Use Gemini 2.0 Flash Exp for better accuracy
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contents: [{
                                parts: [
                                    { text: prompt },
                                    ...imageParts
                                ]
                            }],
                            generationConfig: {
                                temperature: 0.1, // Low temperature for consistency
                                maxOutputTokens: 1024
                            }
                        })
                    }
                );

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }

                const data = await response.json();
                const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                
                // Parse JSON response
                const parsed = this.parseBreedResponse(aiText);
                
                console.log('🧬 Breed detected:', parsed);
                return parsed;

            } catch (error) {
                console.error('Breed detection error:', error);
                return null;
            }
        },

        /**
         * Parse AI response
         */
        parseBreedResponse(aiText) {
            try {
                // Extract JSON from markdown code blocks if present
                let jsonStr = aiText;
                const jsonMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (jsonMatch) {
                    jsonStr = jsonMatch[1];
                }

                // Find JSON object
                const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
                if (objectMatch) {
                    jsonStr = objectMatch[0];
                }

                const parsed = JSON.parse(jsonStr);
                
                return {
                    breed: parsed.breed || 'cebu_europeo',
                    breedName: parsed.breedName || 'No detectada',
                    confidence: parsed.confidence || 50,
                    evidence: parsed.evidence || [],
                    alternatives: parsed.alternatives || [],
                    notes: parsed.notes || ''
                };
            } catch (e) {
                console.error('Error parsing breed response:', e, aiText);
                return {
                    breed: 'cebu_europeo',
                    breedName: 'Cebú × Europeo (predeterminado)',
                    confidence: 50,
                    evidence: ['No se pudo analizar'],
                    alternatives: [],
                    notes: 'Error en detección automática'
                };
            }
        },

        /**
         * Show breed detection UI - Now with smart learning integration
         */
        showBreedUI(breedData) {
            const container = document.getElementById('breedDetectionResult');
            if (!container) {
                // Create container if it doesn't exist
                const aiResults = document.getElementById('aiMeasurementResults');
                if (aiResults) {
                    const breedDiv = document.createElement('div');
                    breedDiv.id = 'breedDetectionResult';
                    breedDiv.style.marginTop = '1rem';
                    aiResults.insertAdjacentElement('beforebegin', breedDiv);
                }
            }

            const confidenceColor = breedData.confidence >= 80 ? '#10b981' : 
                                   breedData.confidence >= 60 ? '#f59e0b' : '#ef4444';

            const breedInfo = GanadoVeneciaWeight?.getBreedCharacteristics?.()?.[breedData.breed] || {};
            const icon = breedInfo.icon || '🐄';
            const ratio = breedInfo.ratio || 1.35;

            const html = `
                <div style="background: linear-gradient(135deg, #faf5ff, #f3e8ff); border: 2px solid #a855f7; border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div>
                            <div style="font-size: 0.75rem; color: #7c3aed; font-weight: 600; text-transform: uppercase; margin-bottom: 0.25rem;">
                                🧬 Raza Detectada por IA
                            </div>
                            <div style="font-size: 1.5rem; font-weight: 800; color: #6b21a8; display: flex; align-items: center; gap: 0.5rem;">
                                <span>${icon}</span>
                                <span>${breedData.breedName}</span>
                            </div>
                            <div style="font-size: 0.85rem; color: #9333ea; margin-top: 0.25rem;">
                                Ratio perímetro: ${ratio} | Confianza: <span style="color: ${confidenceColor}; font-weight: 700;">${breedData.confidence}%</span>
                            </div>
                        </div>
                        <button onclick="showSmartBreedSelector('${breedData.breed}')" class="btn btn-secondary" style="padding: 0.4rem 0.75rem; font-size: 0.8rem;">
                            ✏️ Cambiar
                        </button>
                    </div>

                    ${breedData.evidence.length > 0 ? `
                        <div style="background: white; border-radius: 8px; padding: 0.75rem; margin-bottom: 0.75rem;">
                            <div style="font-size: 0.75rem; font-weight: 600; color: #6b7280; margin-bottom: 0.5rem;">Evidencia Visual:</div>
                            <ul style="margin: 0; padding-left: 1.25rem; font-size: 0.8rem; color: #374151;">
                                ${breedData.evidence.map(e => `<li>${e}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    ${breedData.alternatives.length > 0 && breedData.confidence < 80 ? `
                        <div style="font-size: 0.75rem; color: #7c3aed;">
                            💡 También podría ser: ${breedData.alternatives.map(a => a.breed).join(', ')}
                        </div>
                    ` : ''}

                    <input type="hidden" id="detectedBreed" value="${breedData.breed}">
                    <input type="hidden" id="aiSuggestedBreed" value="${breedData.breed}">
                </div>
            `;

            const resultContainer = document.getElementById('breedDetectionResult');
            if (resultContainer) {
                resultContainer.innerHTML = html;
            }

            // Update the breed selector if it exists
            const breedSelect = document.getElementById('inputRaza');
            if (breedSelect) {
                breedSelect.value = breedData.breed;
                // Trigger calculation with new breed
                if (typeof calcularPesoFoto === 'function') {
                    calcularPesoFoto();
                }
            }

            return breedData;
        },

        /**
         * Show smart breed selector (delegates to learning system)
         */
        showSmartBreedSelector(aiSuggestion) {
            if (typeof openSmartBreedSelector === 'function') {
                openSmartBreedSelector(aiSuggestion, (breedValue, breedInfo) => {
                    // Update detected breed
                    document.getElementById('detectedBreed').value = breedValue;
                    
                    // Update breed selector
                    const breedSelect = document.getElementById('inputRaza');
                    if (breedSelect) {
                        breedSelect.value = breedValue;
                    }

                    // Show updated breed info
                    this.showBreedUI({
                        breed: breedValue,
                        breedName: breedInfo.label,
                        confidence: 100,
                        evidence: ['Seleccionado manualmente por el usuario'],
                        alternatives: [],
                        notes: 'Confirmado manualmente'
                    });

                    // Recalculate with new breed
                    if (typeof calcularPesoFoto === 'function') {
                        calcularPesoFoto();
                    }
                });
            } else {
                console.error('Breed Learning System not loaded');
                showToast?.('Sistema de aprendizaje no disponible', 'error');
            }
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // GLOBAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    global.showBreedChangeDialog = function() {
        BREED_DETECTION.showBreedChangeDialog();
    };

    global.closeBreedChangeDialog = function() {
        const modal = document.getElementById('breedChangeModal');
        if (modal) modal.remove();
    };

    global.confirmBreedChange = function() {
        const selected = document.querySelector('input[name="breedChoice"]:checked');
        if (!selected) return;

        const newBreed = selected.value;
        const breedOptions = GanadoVeneciaWeight?.getBreedOptions?.() || [];
        const breedInfo = breedOptions.find(b => b.value === newBreed);

        if (breedInfo) {
            // Update stored breed
            document.getElementById('detectedBreed').value = newBreed;
            
            // Update breed selector
            const breedSelect = document.getElementById('inputRaza');
            if (breedSelect) {
                breedSelect.value = newBreed;
            }

            // Show updated breed info
            BREED_DETECTION.showBreedUI({
                breed: newBreed,
                breedName: breedInfo.label,
                confidence: 100,
                evidence: ['Seleccionado manualmente por el usuario'],
                alternatives: [],
                notes: 'Confirmado manualmente'
            });

            // Recalculate with new breed
            if (typeof calcularPesoFoto === 'function') {
                calcularPesoFoto();
            }

            showToast?.(`✅ Raza actualizada: ${breedInfo.icon} ${breedInfo.label}`, 'success');
        }

        closeBreedChangeDialog();
    };

    // Expose module
    global.BreedDetection = BREED_DETECTION;

    console.log('🧬 Breed Detection Module loaded');

})(typeof window !== 'undefined' ? window : global);
