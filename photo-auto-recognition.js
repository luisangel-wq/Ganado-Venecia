/**
 * AI-Powered Photo Auto-Recognition System
 * Automatically detects:
 * - Photo view type (chapeta, lateral, trasera, superior)
 * - Chapeta number from tag photo (OCR)
 */

// Global state for photo batch
let photoBatch = {
    photos: [],
    detectedChapeta: null,
    autoClassified: false
};

/**
 * Build AI prompt for photo classification
 */
function buildPhotoClassificationPrompt() {
    return `Eres un experto en análisis de imágenes de ganado bovino. Analiza las imágenes proporcionadas y clasifícalas en las siguientes categorías:

CATEGORÍAS DE FOTOS:
1. **CHAPETA**: Foto del arete o chapeta de identificación del animal (primer plano del número)
2. **LATERAL**: Vista lateral completa del animal (de lado, mostrando todo el cuerpo)
3. **TRASERA**: Vista trasera del animal (desde atrás)
4. **SUPERIOR**: Vista superior/cenital del animal (desde arriba)

INSTRUCCIONES:
- Para cada imagen, determina a qué categoría pertenece
- Si es una foto de CHAPETA, intenta extraer el NÚMERO visible en el arete
- Responde en formato JSON simple

FORMATO DE RESPUESTA:
{
  "clasificacion": [
    {
      "imagen": 1,
      "tipo": "CHAPETA" | "LATERAL" | "TRASERA" | "SUPERIOR",
      "numero_chapeta": "xxx" (solo si tipo es CHAPETA y el número es legible),
      "confianza": 0-100
    },
    ...
  ],
  "numero_detectado": "xxx" (el número de chapeta encontrado, si existe),
  "recomendaciones": "observaciones sobre la calidad de las fotos"
}

Responde SOLO con el JSON, sin texto adicional.`;
}

// Rate limiting state with queue
let lastApiCall = 0;
const MIN_API_INTERVAL = 3000; // 3 seconds between calls (more conservative)
let apiQueue = [];
let isProcessingQueue = false;

/**
 * Wait for rate limit cooldown
 */
async function waitForRateLimit() {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    
    if (timeSinceLastCall < MIN_API_INTERVAL) {
        const waitTime = MIN_API_INTERVAL - timeSinceLastCall;
        console.log(`⏳ Esperando ${waitTime}ms antes de llamar API...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    lastApiCall = Date.now();
}

/**
 * Retry with exponential backoff - improved version
 */
async function retryWithBackoff(fn, maxRetries = 4) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            const isRateLimit = error.message.includes('429') || 
                               error.message.includes('quota') || 
                               error.message.includes('rate limit') ||
                               error.message.includes('RESOURCE_EXHAUSTED');
            
            if (isRateLimit && i < maxRetries - 1) {
                // More aggressive backoff: 5s, 10s, 20s, 40s
                const retryDelay = Math.pow(2, i + 2) * 1000; // Start at 4 seconds
                
                const userMessage = `⏳ Límite de API alcanzado. Reintentando en ${retryDelay/1000} segundos... (intento ${i + 1}/${maxRetries})`;
                console.log(userMessage);
                
                // Show toast to user
                if (typeof showToast === 'function') {
                    showToast(userMessage, 'warning');
                }
                
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                
                // Wait additional time after backoff before retry
                await waitForRateLimit();
                continue;
            }
            
            // If not rate limit or max retries reached
            if (isRateLimit) {
                throw new Error('Límite de API alcanzado. Por favor espere 60 segundos antes de intentar nuevamente.');
            }
            
            throw error;
        }
    }
}

/**
 * Call Gemini AI to classify photos and detect chapeta number
 */
async function classifyPhotosWithAI(photoDataArray) {
    const apiKey = localStorage.getItem('googleApiKey');
    if (!apiKey) {
        throw new Error('API Key de Google no configurada');
    }

    const prompt = buildPhotoClassificationPrompt();
    
    // Prepare image parts
    const imageParts = photoDataArray.map(photoData => ({
        inlineData: {
            mimeType: 'image/jpeg',
            data: photoData.split(',')[1]
        }
    }));

    // Wait for rate limit if needed
    await waitForRateLimit();

    // Wrap API call with retry logic
    return await retryWithBackoff(async () => {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            ...imageParts
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 1024
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
                
                if (response.status === 429) {
                    throw new Error(`429: ${errorMsg}`);
                }
                
                throw new Error(errorMsg);
            }

            const data = await response.json();
            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            return parseClassificationResponse(aiText);
        } catch (error) {
            console.error('AI Classification Error:', error);
            throw error;
        }
    });
}

/**
 * Parse AI classification response
 */
function parseClassificationResponse(aiText) {
    try {
        // Extract JSON from response
        let jsonStr = aiText;
        
        const jsonMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonStr = jsonMatch[1];
        }
        
        const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            jsonStr = objectMatch[0];
        }
        
        const parsed = JSON.parse(jsonStr);
        return parsed;
    } catch (e) {
        console.error('Error parsing AI response:', e);
        throw new Error('No se pudo interpretar la respuesta de la IA');
    }
}

/**
 * Handle multiple photo upload with auto-classification
 */
async function handleMultiplePhotoUpload(files) {
    if (!files || files.length === 0) return;
    
    // Limit number of photos to prevent rate limiting
    const maxPhotos = 4;
    if (files.length > maxPhotos) {
        showToast(`⚠️ Máximo ${maxPhotos} fotos a la vez para evitar límites de API. Procesando las primeras ${maxPhotos}...`, 'warning');
        files = Array.from(files).slice(0, maxPhotos);
    }
    
    // Show loading
    showAutoRecognitionLoading(true, `Analizando ${files.length} fotos con IA... Por favor espere...`);
    
    try {
        // Convert files to data URLs
        const photoDataArray = await Promise.all(
            Array.from(files).map(file => fileToDataURL(file))
        );
        
        // Store in batch
        photoBatch.photos = photoDataArray.map((dataUrl, index) => ({
            id: Date.now() + index,
            dataUrl: dataUrl,
            type: null,
            detected: false
        }));
        
        // Call AI for classification with rate limiting
        showAutoRecognitionLoading(true, 'Conectando con IA (puede tomar 3-10 segundos)...');
        const classification = await classifyPhotosWithAI(photoDataArray);
        
        // Apply classification results
        applyClassificationResults(classification);
        
        // Update UI
        displayClassifiedPhotos();
        
        showAutoRecognitionLoading(false);
        
        if (classification.numero_detectado) {
            showToast(`🤖 IA detectó: Chapeta #${classification.numero_detectado} + ${photoBatch.photos.length} fotos clasificadas`, 'success');
        } else {
            showToast(`🤖 ${photoBatch.photos.length} fotos clasificadas automáticamente`, 'success');
        }
        
    } catch (error) {
        showAutoRecognitionLoading(false);
        
        console.error('Classification error:', error);
        
        // Better error messages
        let userMessage = '❌ Error en clasificación: ';
        let messageType = 'warning';
        
        if (error.message.includes('429') || error.message.includes('quota') || error.message.includes('rate limit') || error.message.includes('RESOURCE_EXHAUSTED')) {
            userMessage = '⏳ Límite de API alcanzado después de varios reintentos.\n\n' +
                         '✅ Las fotos se cargaron correctamente - puedes clasificarlas manualmente.\n\n' +
                         '💡 Espera 60 segundos antes de subir más fotos con IA.\n\n' +
                         '🎯 Tip: Sube máximo 4 fotos a la vez para evitar límites.';
            messageType = 'info';
        } else if (error.message.includes('API Key')) {
            userMessage = '❌ API Key no configurada.\n\nVe a la pestaña IA → Configuración para agregar tu API Key de Google Gemini.';
            messageType = 'error';
        } else {
            userMessage += error.message;
        }
        
        showToast(userMessage, messageType);
        
        // Fallback: show photos without classification so user can classify manually
        displayClassifiedPhotos();
    }
}

/**
 * Convert file to data URL
 */
function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Apply AI classification results to photo batch
 */
function applyClassificationResults(classification) {
    if (!classification.clasificacion) return;
    
    classification.clasificacion.forEach((result, index) => {
        if (photoBatch.photos[index]) {
            photoBatch.photos[index].type = result.tipo.toLowerCase();
            photoBatch.photos[index].detected = true;
            photoBatch.photos[index].confianza = result.confianza;
            
            if (result.numero_chapeta) {
                photoBatch.photos[index].chapetaNumber = result.numero_chapeta;
            }
        }
    });
    
    // Set detected chapeta number
    if (classification.numero_detectado) {
        photoBatch.detectedChapeta = classification.numero_detectado;
        
        // Auto-select animal if exists in inventory
        const animalSelect = document.getElementById('pesoFotoAnimal');
        if (animalSelect) {
            const option = Array.from(animalSelect.options).find(
                opt => opt.value === classification.numero_detectado
            );
            if (option) {
                animalSelect.value = classification.numero_detectado;
                loadAnimalForPhotoWeight();
            }
        }
    }
    
    photoBatch.autoClassified = true;
}

/**
 * Display classified photos with visual feedback
 */
function displayClassifiedPhotos() {
    const container = document.getElementById('autoClassifiedPhotosGrid');
    if (!container) return;
    
    if (photoBatch.photos.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    const typeLabels = {
        'chapeta': '🏷️ Chapeta',
        'lateral': '📐 Lateral',
        'trasera': '🔙 Trasera',
        'superior': '⬆️ Superior'
    };
    
    const typeColors = {
        'chapeta': '#8b5cf6',
        'lateral': '#3b82f6',
        'trasera': '#10b981',
        'superior': '#f59e0b'
    };
    
    container.innerHTML = photoBatch.photos.map((photo, index) => `
        <div class="classified-photo-card" style="border: 3px solid ${photo.type ? typeColors[photo.type] : '#d1d5db'};">
            <img src="${photo.dataUrl}" alt="Foto ${index + 1}">
            <div class="photo-classification-badge" style="background: ${photo.type ? typeColors[photo.type] : '#6b7280'};">
                ${photo.detected ? '🤖 ' : ''}${photo.type ? typeLabels[photo.type] : '❓ Sin clasificar'}
            </div>
            ${photo.confianza ? `<div class="photo-confidence">${photo.confianza}% confianza</div>` : ''}
            <div class="photo-actions">
                <select class="photo-type-selector" onchange="manuallyReclassifyPhoto(${index}, this.value)" style="font-size: 0.8rem; padding: 0.25rem;">
                    <option value="">Cambiar tipo...</option>
                    <option value="chapeta" ${photo.type === 'chapeta' ? 'selected' : ''}>🏷️ Chapeta</option>
                    <option value="lateral" ${photo.type === 'lateral' ? 'selected' : ''}>📐 Lateral</option>
                    <option value="trasera" ${photo.type === 'trasera' ? 'selected' : ''}>🔙 Trasera</option>
                    <option value="superior" ${photo.type === 'superior' ? 'selected' : ''}>⬆️ Superior</option>
                </select>
                <button onclick="removePhotoFromBatch(${index})" class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">🗑️</button>
            </div>
        </div>
    `).join('');
    
    // Show chapeta detection if found
    if (photoBatch.detectedChapeta) {
        const chapetaInfo = document.getElementById('autoDetectedChapeta');
        if (chapetaInfo) {
            chapetaInfo.style.display = 'block';
            chapetaInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #10b981; border-radius: 12px;">
                    <div style="font-size: 2.5rem;">🤖✅</div>
                    <div>
                        <div style="font-weight: 800; font-size: 1.25rem; color: #059669;">Chapeta Detectada: #${photoBatch.detectedChapeta}</div>
                        <div style="font-size: 0.85rem; color: #666;">La IA identificó automáticamente el número del animal</div>
                    </div>
                </div>
            `;
        }
    }
    
    // Enable analyze button if we have classified photos
    updateAnalyzeButtonState();
}

/**
 * Manually reclassify a photo
 */
function manuallyReclassifyPhoto(index, newType) {
    if (photoBatch.photos[index]) {
        photoBatch.photos[index].type = newType;
        photoBatch.photos[index].detected = false; // Mark as manually changed
        displayClassifiedPhotos();
        showToast(`Foto ${index + 1} reclasificada como ${newType}`, 'info');
    }
}

/**
 * Remove photo from batch
 */
function removePhotoFromBatch(index) {
    photoBatch.photos.splice(index, 1);
    displayClassifiedPhotos();
    showToast('Foto eliminada', 'warning');
}

/**
 * Update analyze button state based on classified photos
 */
function updateAnalyzeButtonState() {
    const btn = document.getElementById('btnAnalyzeAutoPhotos');
    if (!btn) return;
    
    const hasLateral = photoBatch.photos.some(p => p.type === 'lateral');
    const hasTrasera = photoBatch.photos.some(p => p.type === 'trasera');
    const hasRequiredPhotos = hasLateral && hasTrasera;
    
    btn.disabled = !hasRequiredPhotos;
    
    if (hasRequiredPhotos) {
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    } else {
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    }
}

/**
 * Analyze classified photos with AI + BREED DETECTION
 */
async function analyzeClassifiedPhotos() {
    if (photoBatch.photos.length === 0) {
        showToast('No hay fotos para analizar', 'warning');
        return;
    }
    
    // Map classified photos to estimacionActual structure
    estimacionActual.fotos = {
        lateral: photoBatch.photos.find(p => p.type === 'lateral')?.dataUrl || null,
        trasera: photoBatch.photos.find(p => p.type === 'trasera')?.dataUrl || null,
        superior: photoBatch.photos.find(p => p.type === 'superior')?.dataUrl || null
    };
    
    // Set animal ID if detected
    if (photoBatch.detectedChapeta && !estimacionActual.animalId) {
        estimacionActual.animalId = photoBatch.detectedChapeta;
    }
    
    // STEP 1: Detect breed first (parallel with measurement analysis)
    let breedPromise = null;
    if (typeof BreedDetection !== 'undefined') {
        showToast('🧬 Detectando raza del animal...', 'info');
        breedPromise = BreedDetection.detectBreed(estimacionActual.fotos);
    }
    
    // STEP 2: Analyze measurements
    const measurementPromise = analyzeWithGemini();
    
    // Wait for both to complete
    try {
        const [breedResult] = await Promise.all([breedPromise, measurementPromise]);
        
        // Display breed detection results
        if (breedResult && typeof BreedDetection !== 'undefined') {
            BreedDetection.showBreedUI(breedResult);
            
            // Store breed in estimacionActual
            estimacionActual.raza = breedResult.breed;
            
            // Recalculate weight with breed info
            if (typeof calcularPesoFoto === 'function') {
                setTimeout(() => calcularPesoFoto(), 500);
            }
        }
    } catch (error) {
        console.error('Error in analysis:', error);
    }
}

/**
 * Show/hide auto-recognition loading
 */
function showAutoRecognitionLoading(show, message = 'Analizando fotos con IA...') {
    const loadingDiv = document.getElementById('autoRecognitionLoading');
    if (loadingDiv) {
        if (show) {
            loadingDiv.style.display = 'block';
            const messageEl = loadingDiv.querySelector('[style*="font-weight: 600"]');
            if (messageEl) {
                messageEl.textContent = message;
            }
        } else {
            loadingDiv.style.display = 'none';
        }
    }
}

/**
 * Clear photo batch
 */
function clearPhotoBatch() {
    photoBatch = {
        photos: [],
        detectedChapeta: null,
        autoClassified: false
    };
    displayClassifiedPhotos();
    
    const chapetaInfo = document.getElementById('autoDetectedChapeta');
    if (chapetaInfo) {
        chapetaInfo.style.display = 'none';
    }
}

// Export functions for global use
window.handleMultiplePhotoUpload = handleMultiplePhotoUpload;
window.manuallyReclassifyPhoto = manuallyReclassifyPhoto;
window.removePhotoFromBatch = removePhotoFromBatch;
window.analyzeClassifiedPhotos = analyzeClassifiedPhotos;
window.clearPhotoBatch = clearPhotoBatch;
