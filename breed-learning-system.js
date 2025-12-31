/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎓 BREED LEARNING & SMART SELECTION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * Learns from user selections to provide smart breed recommendations
 * Tracks frequency, learns from corrections, and auto-suggests breeds
 */

(function(global) {
    'use strict';

    const BREED_LEARNING = {
        
        STORAGE_KEY: 'ganadoVenecia_breedLearning',
        
        /**
         * Default breed options with Colombian standards
         */
        DEFAULT_BREEDS: [
            { value: 'cebu_puro', label: 'Cebú Puro', icon: '🐄', ratio: 1.34 },
            { value: 'cebu_europeo', label: 'Cebú × Europeo (F1)', icon: '🐂', ratio: 1.35 },
            { value: 'girolando', label: 'Girolando (Gir × Holstein)', icon: '🐮', ratio: 1.35 },
            { value: 'europeo_lechero', label: 'Europeo Lechero (Holstein/Jersey)', icon: '🥛', ratio: 1.35 },
            { value: 'europeo_carne', label: 'Europeo Carne (Angus/Simmental)', icon: '🥩', ratio: 1.42 },
            { value: 'brahman', label: 'Brahman', icon: '🐃', ratio: 1.34 },
            { value: 'brangus', label: 'Brangus', icon: '🐂', ratio: 1.38 },
            { value: 'simbra', label: 'Simbra', icon: '🐄', ratio: 1.37 },
            { value: 'angus', label: 'Angus', icon: '⚫', ratio: 1.42 },
            { value: 'simmental', label: 'Simmental', icon: '🔴', ratio: 1.40 },
            { value: 'charolais', label: 'Charolais', icon: '⚪', ratio: 1.40 },
            { value: 'holstein', label: 'Holstein', icon: '⬛', ratio: 1.35 },
            { value: 'jersey', label: 'Jersey', icon: '🟤', ratio: 1.33 }
        ],

        /**
         * Initialize or load learning data
         */
        initLearning() {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }

            // Initialize with default structure
            return {
                breedFrequency: {}, // { breedValue: count }
                customBreeds: [], // { value, label, icon, ratio, addedDate }
                aiCorrections: {}, // { aiSuggestion: { accepted: count, correctedTo: { breed: count } } }
                lastUpdated: new Date().toISOString(),
                totalSelections: 0
            };
        },

        /**
         * Save learning data
         */
        saveLearning(data) {
            data.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        },

        /**
         * Record a breed selection
         */
        recordSelection(breedValue, aiSuggestion = null) {
            const data = this.initLearning();
            
            // Update frequency
            data.breedFrequency[breedValue] = (data.breedFrequency[breedValue] || 0) + 1;
            data.totalSelections++;

            // Track AI corrections if applicable
            if (aiSuggestion && aiSuggestion !== breedValue) {
                if (!data.aiCorrections[aiSuggestion]) {
                    data.aiCorrections[aiSuggestion] = { accepted: 0, correctedTo: {} };
                }
                data.aiCorrections[aiSuggestion].correctedTo[breedValue] = 
                    (data.aiCorrections[aiSuggestion].correctedTo[breedValue] || 0) + 1;
            } else if (aiSuggestion === breedValue) {
                if (!data.aiCorrections[aiSuggestion]) {
                    data.aiCorrections[aiSuggestion] = { accepted: 0, correctedTo: {} };
                }
                data.aiCorrections[aiSuggestion].accepted++;
            }

            this.saveLearning(data);
            console.log('🎓 Breed selection recorded:', breedValue);
        },

        /**
         * Add a custom breed
         */
        addCustomBreed(label, ratio = 1.35) {
            const data = this.initLearning();
            
            // Generate value from label
            const value = 'custom_' + label.toLowerCase().replace(/[^a-z0-9]/g, '_');
            
            // Check if already exists
            if (data.customBreeds.some(b => b.value === value)) {
                return { success: false, message: 'Esta raza ya existe' };
            }

            const customBreed = {
                value: value,
                label: label,
                icon: '🐄',
                ratio: ratio,
                addedDate: new Date().toISOString()
            };

            data.customBreeds.push(customBreed);
            this.saveLearning(data);

            console.log('✅ Custom breed added:', customBreed);
            return { success: true, breed: customBreed };
        },

        /**
         * Get all breeds sorted by frequency (most common first)
         */
        getBreedsSortedByFrequency() {
            const data = this.initLearning();
            const allBreeds = [...this.DEFAULT_BREEDS, ...data.customBreeds];

            // Sort by frequency
            return allBreeds.sort((a, b) => {
                const freqA = data.breedFrequency[a.value] || 0;
                const freqB = data.breedFrequency[b.value] || 0;
                return freqB - freqA; // Descending order
            }).map(breed => ({
                ...breed,
                frequency: data.breedFrequency[breed.value] || 0,
                percentage: data.totalSelections > 0 
                    ? ((data.breedFrequency[breed.value] || 0) / data.totalSelections * 100).toFixed(1)
                    : 0
            }));
        },

        /**
         * Get top N most common breeds
         */
        getTopBreeds(n = 5) {
            return this.getBreedsSortedByFrequency().slice(0, n);
        },

        /**
         * Predict best breed based on AI suggestion and historical corrections
         */
        predictBreed(aiSuggestion) {
            const data = this.initLearning();
            
            // If no AI suggestion, return most common breed
            if (!aiSuggestion) {
                const topBreeds = this.getTopBreeds(1);
                return topBreeds.length > 0 ? topBreeds[0].value : 'cebu_europeo';
            }

            // Check AI correction history
            const corrections = data.aiCorrections[aiSuggestion];
            if (!corrections) {
                return aiSuggestion; // Trust AI if no correction history
            }

            // Calculate correction probability
            const totalFeedback = corrections.accepted + 
                Object.values(corrections.correctedTo).reduce((sum, count) => sum + count, 0);
            
            const acceptanceRate = totalFeedback > 0 ? corrections.accepted / totalFeedback : 0;

            // If AI is frequently correct (>70%), trust it
            if (acceptanceRate > 0.7) {
                return aiSuggestion;
            }

            // Find most common correction
            const mostCommonCorrection = Object.entries(corrections.correctedTo)
                .sort((a, b) => b[1] - a[1])[0];

            if (mostCommonCorrection && mostCommonCorrection[1] > corrections.accepted) {
                console.log(`🎓 Learning: AI suggested ${aiSuggestion}, but user usually corrects to ${mostCommonCorrection[0]}`);
                return mostCommonCorrection[0];
            }

            return aiSuggestion;
        },

        /**
         * Get learning statistics
         */
        getStats() {
            const data = this.initLearning();
            const topBreeds = this.getTopBreeds(5);
            
            return {
                totalSelections: data.totalSelections,
                uniqueBreeds: Object.keys(data.breedFrequency).length,
                customBreeds: data.customBreeds.length,
                topBreeds: topBreeds,
                aiAccuracyRate: this.calculateAIAccuracy(data)
            };
        },

        /**
         * Calculate AI accuracy rate
         */
        calculateAIAccuracy(data) {
            let totalAISuggestions = 0;
            let totalAccepted = 0;

            Object.values(data.aiCorrections).forEach(correction => {
                const total = correction.accepted + 
                    Object.values(correction.correctedTo).reduce((sum, count) => sum + count, 0);
                totalAISuggestions += total;
                totalAccepted += correction.accepted;
            });

            return totalAISuggestions > 0 
                ? ((totalAccepted / totalAISuggestions) * 100).toFixed(1)
                : null;
        },

        /**
         * Show smart breed selector UI
         */
        showSmartBreedSelector(aiSuggestion = null, onSelect = null) {
            const breeds = this.getBreedsSortedByFrequency();
            const predicted = aiSuggestion ? this.predictBreed(aiSuggestion) : null;
            const stats = this.getStats();

            const html = `
                <div class="modal active" id="smartBreedModal" onclick="if(event.target===this) closeSmartBreedSelector()">
                    <div class="modal-content" style="max-width: 600px;">
                        <div class="modal-header" style="background: linear-gradient(135deg, #a855f7, #7c3aed);">
                            <div>
                                <span>🎓 Selección Inteligente de Raza</span>
                                <div style="font-size: 0.75rem; opacity: 0.9; margin-top: 0.25rem;">
                                    ${stats.totalSelections} selecciones registradas
                                </div>
                            </div>
                            <button class="modal-close" onclick="closeSmartBreedSelector()">×</button>
                        </div>
                        <div class="modal-body" style="max-height: 60vh; overflow-y: auto;">
                            
                            ${aiSuggestion ? `
                                <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 2px solid #10b981; border-radius: 12px; padding: 1rem; margin-bottom: 1rem;">
                                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                                        <div style="font-size: 2rem;">🤖</div>
                                        <div style="flex: 1;">
                                            <div style="font-weight: 700; color: #059669;">IA Sugiere</div>
                                            <div style="font-size: 0.9rem; color: #047857;">
                                                ${breeds.find(b => b.value === predicted)?.icon || '🐄'} 
                                                ${breeds.find(b => b.value === predicted)?.label || aiSuggestion}
                                            </div>
                                            ${predicted !== aiSuggestion ? `
                                                <div style="font-size: 0.75rem; color: #059669; margin-top: 0.25rem;">
                                                    💡 Ajustado según tu historial
                                                </div>
                                            ` : ''}
                                        </div>
                                        <button onclick="selectBreed('${predicted}', '${aiSuggestion}')" 
                                                class="btn btn-success" style="padding: 0.5rem 1rem;">
                                            ✅ Aceptar
                                        </button>
                                    </div>
                                </div>
                            ` : ''}

                            <div style="margin-bottom: 1rem;">
                                <div style="font-size: 0.85rem; font-weight: 600; color: #6b7280; margin-bottom: 0.5rem;">
                                    📊 Tus Razas Más Comunes:
                                </div>
                            </div>

                            <div id="breedList" style="display: flex; flex-direction: column; gap: 0.5rem;">
                                ${breeds.map(breed => {
                                    const isAISuggested = breed.value === predicted;
                                    const isTop = breed.frequency > 0;
                                    
                                    return `
                                        <label class="breed-option-card" 
                                               style="display: flex; align-items: center; padding: 0.75rem 1rem; 
                                                      border: 2px solid ${isAISuggested ? '#10b981' : (isTop ? '#a855f7' : '#e5e7eb')}; 
                                                      border-radius: 10px; cursor: pointer; transition: all 0.2s;
                                                      background: ${isAISuggested ? '#f0fdf4' : (isTop ? '#faf5ff' : 'white')};"
                                               onclick="selectBreed('${breed.value}', '${aiSuggestion || ''}')">
                                            <div style="font-size: 1.5rem; margin-right: 0.75rem;">${breed.icon}</div>
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600; color: #374151; display: flex; align-items: center; gap: 0.5rem;">
                                                    ${breed.label}
                                                    ${isAISuggested ? '<span style="font-size: 0.7rem; background: #10b981; color: white; padding: 0.15rem 0.4rem; border-radius: 8px;">🤖 IA</span>' : ''}
                                                    ${isTop && !isAISuggested ? '<span style="font-size: 0.7rem; background: #a855f7; color: white; padding: 0.15rem 0.4rem; border-radius: 8px;">⭐ Frecuente</span>' : ''}
                                                </div>
                                                <div style="font-size: 0.75rem; color: #6b7280;">
                                                    Ratio: ${breed.ratio} 
                                                    ${breed.frequency > 0 ? `| Usada ${breed.frequency}× (${breed.percentage}%)` : ''}
                                                </div>
                                            </div>
                                            <div style="color: #a855f7; font-size: 1.2rem;">→</div>
                                        </label>
                                    `;
                                }).join('')}
                            </div>

                            <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid #e5e7eb;">
                                <button onclick="showAddCustomBreed()" class="btn btn-outline" style="width: 100%;">
                                    ➕ Agregar Raza Personalizada
                                </button>
                            </div>

                            ${stats.aiAccuracyRate ? `
                                <div style="margin-top: 1rem; padding: 0.75rem; background: #f3f4f6; border-radius: 8px; font-size: 0.8rem; color: #6b7280; text-align: center;">
                                    🎯 Precisión IA en tu finca: ${stats.aiAccuracyRate}% (${stats.totalSelections} selecciones)
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal
            const existingModal = document.getElementById('smartBreedModal');
            if (existingModal) existingModal.remove();

            document.body.insertAdjacentHTML('beforeend', html);

            // Store callback
            if (onSelect) {
                window._breedSelectCallback = onSelect;
            }
        },

        /**
         * Show add custom breed dialog
         */
        showAddCustomBreed() {
            const html = `
                <div class="modal active" id="customBreedModal" onclick="if(event.target===this) closeCustomBreedModal()">
                    <div class="modal-content" style="max-width: 450px;">
                        <div class="modal-header" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
                            <span>➕ Agregar Raza Personalizada</span>
                            <button class="modal-close" onclick="closeCustomBreedModal()">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Nombre de la Raza <span class="required">*</span></label>
                                <input type="text" id="customBreedName" class="form-input" 
                                       placeholder="Ej: Nelore, Guzerat, Santa Gertrudis" 
                                       style="font-size: 1rem;">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Ratio Perímetro/Altura (opcional)</label>
                                <input type="number" id="customBreedRatio" class="form-input" 
                                       value="1.35" min="1.3" max="1.5" step="0.01"
                                       style="font-size: 1rem;">
                                <div class="form-hint">
                                    💡 Valores típicos: 1.34 (Cebú), 1.35 (Cruces), 1.42 (Europeo Carne)
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" onclick="closeCustomBreedModal()">Cancelar</button>
                            <button class="btn btn-primary" onclick="saveCustomBreed()" 
                                    style="background: #f59e0b;">
                                ✅ Agregar Raza
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', html);
            setTimeout(() => document.getElementById('customBreedName')?.focus(), 100);
        }
    };

    // ═══════════════════════════════════════════════════════════════════════
    // GLOBAL FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════

    global.openSmartBreedSelector = function(aiSuggestion = null, callback = null) {
        BREED_LEARNING.showSmartBreedSelector(aiSuggestion, callback);
    };

    global.closeSmartBreedSelector = function() {
        const modal = document.getElementById('smartBreedModal');
        if (modal) modal.remove();
        window._breedSelectCallback = null;
    };

    global.selectBreed = function(breedValue, aiSuggestion = null) {
        // Record selection for learning
        BREED_LEARNING.recordSelection(breedValue, aiSuggestion);

        // Find breed info
        const allBreeds = [...BREED_LEARNING.DEFAULT_BREEDS, ...BREED_LEARNING.initLearning().customBreeds];
        const breedInfo = allBreeds.find(b => b.value === breedValue);

        // Execute callback if exists
        if (window._breedSelectCallback) {
            window._breedSelectCallback(breedValue, breedInfo);
        }

        // Update UI if breed selector exists
        const breedSelect = document.getElementById('inputRaza');
        if (breedSelect) {
            breedSelect.value = breedValue;
            // Trigger calculation
            if (typeof calcularPesoFoto === 'function') {
                calcularPesoFoto();
            }
        }

        // Show feedback
        if (aiSuggestion && breedValue !== aiSuggestion) {
            showToast?.(`🎓 Registrado: Preferiste ${breedInfo?.label} sobre sugerencia IA`, 'info');
        } else {
            showToast?.(`✅ Raza seleccionada: ${breedInfo?.icon} ${breedInfo?.label}`, 'success');
        }

        closeSmartBreedSelector();
    };

    global.showAddCustomBreed = function() {
        BREED_LEARNING.showAddCustomBreed();
    };

    global.closeCustomBreedModal = function() {
        const modal = document.getElementById('customBreedModal');
        if (modal) modal.remove();
    };

    global.saveCustomBreed = function() {
        const name = document.getElementById('customBreedName')?.value.trim();
        const ratio = parseFloat(document.getElementById('customBreedRatio')?.value) || 1.35;

        if (!name) {
            showToast?.('Ingresa el nombre de la raza', 'error');
            return;
        }

        const result = BREED_LEARNING.addCustomBreed(name, ratio);

        if (result.success) {
            showToast?.(`✅ Raza agregada: ${result.breed.label}`, 'success');
            closeCustomBreedModal();
            
            // Refresh breed selector
            openSmartBreedSelector(null, window._breedSelectCallback);
        } else {
            showToast?.(result.message, 'warning');
        }
    };

    global.getBreedLearningStats = function() {
        return BREED_LEARNING.getStats();
    };

    // Expose module
    global.BreedLearning = BREED_LEARNING;

    console.log('🎓 Breed Learning System loaded');

})(typeof window !== 'undefined' ? window : global);
