/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🐄 GANADO VENECIA - ESTIMACIÓN COMBINADA v1.0
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Combines two independent weight estimates for better accuracy:
 *   1. TEAM ESTIMATE: Visual assessment by experienced ranch workers
 *   2. PHOTO GROWTH: Dimensional change from baseline photo in manga
 * 
 * PRINCIPLE:
 * - Team estimates capture qualitative factors (condition, fill, muscle)
 * - Photo growth captures objective dimensional change
 * - Combined estimate is more accurate than either alone
 * - System learns optimal weighting from validation data over time
 * 
 * WORKFLOW:
 * 1. Entry: Scale weight (only time we have true weight)
 * 2. Follow-up (3-6 months): Team estimate + Photo → Combined estimate
 * 3. Sale/validation: Compare with actual sale weight → Calibrate weights
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function(global) {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    const CONFIG = {
        version: '1.0',
        
        // Default weights for combining estimates
        // These adapt based on validation data
        defaultWeights: {
            teamEstimate: 0.50,      // 50% weight to team visual estimate
            photoGrowth: 0.50        // 50% weight to photo-based calculation
        },
        
        // Confidence adjustments
        confidenceFactors: {
            // Team estimate confidence based on experience level
            teamExperience: {
                'novato': 0.7,       // Less experienced
                'intermedio': 0.85,  // Moderate experience
                'experto': 1.0       // Very experienced
            },
            
            // Photo estimate confidence based on interval
            photoInterval: {
                short: { maxDays: 60, factor: 0.8 },    // Too short, small changes
                optimal: { maxDays: 180, factor: 1.0 }, // 2-6 months, ideal
                long: { maxDays: 365, factor: 0.9 }     // Very long, still ok
            },
            
            // Agreement bonus - if both estimates are close, more confident
            agreementThreshold: 0.10,  // 10% difference
            agreementBonus: 1.15       // 15% confidence boost
        },
        
        // Allometric scaling (same as growth tracker)
        allometry: {
            combinedExponent: 2.5
        },
        
        // Storage
        storageKey: 'ganado_combined_estimation_v1'
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // DATA STRUCTURE
    // ═══════════════════════════════════════════════════════════════════════════
    
    let estimationData = {
        animals: {},
        calibration: {
            teamAccuracy: [],      // Historical team estimate errors
            photoAccuracy: [],     // Historical photo estimate errors
            combinedAccuracy: [],  // Historical combined estimate errors
            learnedWeights: null   // Optimized weights based on data
        },
        lastUpdated: null
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // CORE ESTIMATION FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Calculate photo-based weight estimate using dimensional growth
     */
    function calculatePhotoEstimate(baselineWeight, baselineMeasures, currentMeasures) {
        if (!baselineWeight || !baselineMeasures || !currentMeasures) {
            return null;
        }
        
        // Calculate dimensional ratios
        const largoRatio = currentMeasures.largo / baselineMeasures.largo;
        const alturaRatio = currentMeasures.altura / baselineMeasures.altura;
        const anchoRatio = currentMeasures.ancho / baselineMeasures.ancho;
        
        // Volumetric growth using allometric scaling
        const volumeRatio = Math.pow(
            largoRatio * alturaRatio * anchoRatio, 
            CONFIG.allometry.combinedExponent / 3
        );
        
        const estimatedWeight = baselineWeight * volumeRatio;
        
        return {
            weight: Math.round(estimatedWeight),
            volumeRatio: volumeRatio,
            growth: {
                largo: (largoRatio - 1) * 100,
                altura: (alturaRatio - 1) * 100,
                ancho: (anchoRatio - 1) * 100,
                volumetric: (volumeRatio - 1) * 100
            }
        };
    }

    /**
     * Combine team estimate with photo-based estimate
     */
    function combineEstimates(teamEstimate, photoEstimate, options = {}) {
        if (!teamEstimate && !photoEstimate) {
            return null;
        }
        
        // If only one estimate available, use it
        if (!teamEstimate) {
            return {
                combinedWeight: photoEstimate.weight,
                method: 'photo_only',
                confidence: 70,
                breakdown: { team: null, photo: photoEstimate.weight }
            };
        }
        
        if (!photoEstimate) {
            return {
                combinedWeight: teamEstimate,
                method: 'team_only',
                confidence: 65,
                breakdown: { team: teamEstimate, photo: null }
            };
        }
        
        // Get weights (use learned weights if available)
        let weights = CONFIG.defaultWeights;
        if (estimationData.calibration.learnedWeights) {
            weights = estimationData.calibration.learnedWeights;
        }
        
        // Adjust weights based on conditions
        let teamWeight = weights.teamEstimate;
        let photoWeight = weights.photoGrowth;
        
        // Adjust for team experience
        const experience = options.teamExperience || 'intermedio';
        const expFactor = CONFIG.confidenceFactors.teamExperience[experience] || 0.85;
        teamWeight *= expFactor;
        
        // Adjust for photo interval
        if (options.daysSinceBaseline) {
            const days = options.daysSinceBaseline;
            if (days < 60) {
                photoWeight *= CONFIG.confidenceFactors.photoInterval.short.factor;
            } else if (days > 365) {
                photoWeight *= CONFIG.confidenceFactors.photoInterval.long.factor;
            }
        }
        
        // Normalize weights
        const totalWeight = teamWeight + photoWeight;
        teamWeight /= totalWeight;
        photoWeight /= totalWeight;
        
        // Calculate weighted average
        const combinedWeight = Math.round(
            (teamEstimate * teamWeight) + (photoEstimate.weight * photoWeight)
        );
        
        // Calculate confidence
        let confidence = 75;
        
        // Check agreement between estimates
        const difference = Math.abs(teamEstimate - photoEstimate.weight);
        const avgEstimate = (teamEstimate + photoEstimate.weight) / 2;
        const percentDiff = difference / avgEstimate;
        
        if (percentDiff <= CONFIG.confidenceFactors.agreementThreshold) {
            // Estimates agree - higher confidence
            confidence = Math.min(90, confidence * CONFIG.confidenceFactors.agreementBonus);
        } else if (percentDiff > 0.25) {
            // Large disagreement - lower confidence, flag for review
            confidence = Math.max(50, confidence * 0.8);
        }
        
        return {
            combinedWeight: combinedWeight,
            method: 'combined',
            confidence: Math.round(confidence),
            breakdown: {
                team: teamEstimate,
                photo: photoEstimate.weight,
                teamWeight: Math.round(teamWeight * 100),
                photoWeight: Math.round(photoWeight * 100)
            },
            agreement: {
                difference: Math.round(difference),
                percentDiff: Math.round(percentDiff * 100),
                status: percentDiff <= 0.10 ? 'excellent' : 
                        percentDiff <= 0.20 ? 'good' : 
                        percentDiff <= 0.30 ? 'moderate' : 'poor'
            },
            photoGrowth: photoEstimate.growth
        };
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ANIMAL TRACKING
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Register animal with entry (scale) weight
     */
    function registerAnimal(chapeta, entryData) {
        const animal = {
            chapeta: chapeta,
            breed: entryData.breed || 'cebu_europeo',
            entryDate: entryData.date || new Date().toISOString().split('T')[0],
            entryWeight: entryData.scaleWeight,  // This is the ONLY true weight
            baseline: {
                date: entryData.date || new Date().toISOString().split('T')[0],
                weight: entryData.scaleWeight,
                measures: {
                    largo: entryData.largo,
                    altura: entryData.altura,
                    ancho: entryData.ancho
                },
                photoRef: entryData.photoRef || null,
                source: 'scale'  // Mark as verified scale weight
            },
            followUps: [],
            finalWeight: null  // Will be set at sale/validation
        };
        
        estimationData.animals[chapeta] = animal;
        estimationData.lastUpdated = new Date().toISOString();
        saveData();
        
        return { success: true, animal };
    }

    /**
     * Add follow-up measurement with team estimate
     */
    function addFollowUp(chapeta, followUpData) {
        const animal = estimationData.animals[chapeta];
        if (!animal) {
            return { success: false, error: `Animal ${chapeta} no encontrado` };
        }
        
        const baseline = animal.baseline;
        const date = followUpData.date || new Date().toISOString().split('T')[0];
        
        // Calculate days since baseline
        const daysSinceBaseline = Math.floor(
            (new Date(date) - new Date(baseline.date)) / (1000 * 60 * 60 * 24)
        );
        
        // Get photo-based estimate
        const currentMeasures = {
            largo: followUpData.largo,
            altura: followUpData.altura,
            ancho: followUpData.ancho
        };
        
        const photoEstimate = calculatePhotoEstimate(
            baseline.weight,
            baseline.measures,
            currentMeasures
        );
        
        // Get team estimate
        const teamEstimate = followUpData.teamEstimate;
        
        // Combine estimates
        const combined = combineEstimates(teamEstimate, photoEstimate, {
            teamExperience: followUpData.teamExperience || 'intermedio',
            daysSinceBaseline: daysSinceBaseline
        });
        
        // Create follow-up record
        const followUp = {
            date: date,
            daysSinceEntry: daysSinceBaseline,
            measures: currentMeasures,
            teamEstimate: teamEstimate,
            photoEstimate: photoEstimate ? photoEstimate.weight : null,
            combinedEstimate: combined ? combined.combinedWeight : null,
            confidence: combined ? combined.confidence : null,
            agreement: combined ? combined.agreement : null,
            photoRef: followUpData.photoRef || null,
            bcs: followUpData.bcs || null,
            notes: followUpData.notes || null,
            
            // Detailed breakdown
            estimationDetails: combined
        };
        
        // Calculate growth metrics
        if (combined) {
            const previousWeight = animal.followUps.length > 0 
                ? animal.followUps[animal.followUps.length - 1].combinedEstimate 
                : baseline.weight;
            const previousDate = animal.followUps.length > 0
                ? animal.followUps[animal.followUps.length - 1].date
                : baseline.date;
            
            const daysSincePrevious = Math.floor(
                (new Date(date) - new Date(previousDate)) / (1000 * 60 * 60 * 24)
            );
            
            followUp.growth = {
                fromEntry: {
                    weightGain: combined.combinedWeight - baseline.weight,
                    days: daysSinceBaseline,
                    gdp: Math.round(((combined.combinedWeight - baseline.weight) / daysSinceBaseline) * 1000)
                },
                fromPrevious: {
                    weightGain: combined.combinedWeight - previousWeight,
                    days: daysSincePrevious,
                    gdp: daysSincePrevious > 0 
                        ? Math.round(((combined.combinedWeight - previousWeight) / daysSincePrevious) * 1000)
                        : 0
                }
            };
        }
        
        animal.followUps.push(followUp);
        estimationData.lastUpdated = new Date().toISOString();
        saveData();
        
        return {
            success: true,
            followUp: followUp,
            summary: {
                chapeta: chapeta,
                entryWeight: baseline.weight,
                currentEstimate: combined ? combined.combinedWeight : null,
                totalGain: combined ? combined.combinedWeight - baseline.weight : null,
                gdp: followUp.growth ? followUp.growth.fromEntry.gdp : null,
                confidence: combined ? combined.confidence : null,
                agreement: combined ? combined.agreement.status : null
            }
        };
    }

    /**
     * Record final/validation weight (from sale or scale)
     */
    function recordFinalWeight(chapeta, finalData) {
        const animal = estimationData.animals[chapeta];
        if (!animal) {
            return { success: false, error: `Animal ${chapeta} no encontrado` };
        }
        
        const actualWeight = finalData.scaleWeight;
        const date = finalData.date || new Date().toISOString().split('T')[0];
        
        // Get the last estimate for comparison
        const lastFollowUp = animal.followUps[animal.followUps.length - 1];
        
        // Calculate accuracy of each estimation method
        const accuracy = {
            team: null,
            photo: null,
            combined: null
        };
        
        if (lastFollowUp) {
            if (lastFollowUp.teamEstimate) {
                const teamError = Math.abs(lastFollowUp.teamEstimate - actualWeight) / actualWeight;
                accuracy.team = {
                    estimate: lastFollowUp.teamEstimate,
                    actual: actualWeight,
                    error: Math.round(teamError * 100),
                    errorKg: Math.abs(lastFollowUp.teamEstimate - actualWeight)
                };
                
                // Store for calibration
                estimationData.calibration.teamAccuracy.push({
                    chapeta, date, error: teamError
                });
            }
            
            if (lastFollowUp.photoEstimate) {
                const photoError = Math.abs(lastFollowUp.photoEstimate - actualWeight) / actualWeight;
                accuracy.photo = {
                    estimate: lastFollowUp.photoEstimate,
                    actual: actualWeight,
                    error: Math.round(photoError * 100),
                    errorKg: Math.abs(lastFollowUp.photoEstimate - actualWeight)
                };
                
                estimationData.calibration.photoAccuracy.push({
                    chapeta, date, error: photoError
                });
            }
            
            if (lastFollowUp.combinedEstimate) {
                const combinedError = Math.abs(lastFollowUp.combinedEstimate - actualWeight) / actualWeight;
                accuracy.combined = {
                    estimate: lastFollowUp.combinedEstimate,
                    actual: actualWeight,
                    error: Math.round(combinedError * 100),
                    errorKg: Math.abs(lastFollowUp.combinedEstimate - actualWeight)
                };
                
                estimationData.calibration.combinedAccuracy.push({
                    chapeta, date, error: combinedError
                });
            }
        }
        
        // Record final weight
        animal.finalWeight = {
            date: date,
            weight: actualWeight,
            source: finalData.source || 'sale',
            accuracy: accuracy
        };
        
        // Recalibrate weights based on accumulated data
        recalibrateWeights();
        
        estimationData.lastUpdated = new Date().toISOString();
        saveData();
        
        // Calculate overall performance
        const daysSinceEntry = Math.floor(
            (new Date(date) - new Date(animal.entryDate)) / (1000 * 60 * 60 * 24)
        );
        const totalGain = actualWeight - animal.entryWeight;
        const gdp = Math.round((totalGain / daysSinceEntry) * 1000);
        
        return {
            success: true,
            validation: {
                chapeta: chapeta,
                entryWeight: animal.entryWeight,
                finalWeight: actualWeight,
                totalGain: totalGain,
                days: daysSinceEntry,
                gdp: gdp,
                accuracy: accuracy,
                bestMethod: determineBestMethod(accuracy)
            }
        };
    }

    /**
     * Determine which method was most accurate
     */
    function determineBestMethod(accuracy) {
        const methods = [];
        
        if (accuracy.team) methods.push({ name: 'team', error: accuracy.team.error });
        if (accuracy.photo) methods.push({ name: 'photo', error: accuracy.photo.error });
        if (accuracy.combined) methods.push({ name: 'combined', error: accuracy.combined.error });
        
        if (methods.length === 0) return null;
        
        methods.sort((a, b) => a.error - b.error);
        return methods[0].name;
    }

    /**
     * Recalibrate estimation weights based on historical accuracy
     */
    function recalibrateWeights() {
        const teamData = estimationData.calibration.teamAccuracy;
        const photoData = estimationData.calibration.photoAccuracy;
        
        // Need at least 3 data points to recalibrate
        if (teamData.length < 3 || photoData.length < 3) {
            return;
        }
        
        // Calculate average error for each method
        const avgTeamError = teamData.reduce((sum, d) => sum + d.error, 0) / teamData.length;
        const avgPhotoError = photoData.reduce((sum, d) => sum + d.error, 0) / photoData.length;
        
        // Weight inversely proportional to error
        // Lower error = higher weight
        const teamInvError = 1 / (avgTeamError + 0.01);  // Add small constant to avoid division by zero
        const photoInvError = 1 / (avgPhotoError + 0.01);
        const totalInvError = teamInvError + photoInvError;
        
        estimationData.calibration.learnedWeights = {
            teamEstimate: teamInvError / totalInvError,
            photoGrowth: photoInvError / totalInvError
        };
        
        console.log('🎯 Pesos recalibrados:', estimationData.calibration.learnedWeights);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // REPORTING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════════════════
    
    /**
     * Get current status of an animal
     */
    function getAnimalStatus(chapeta) {
        const animal = estimationData.animals[chapeta];
        if (!animal) return null;
        
        const lastFollowUp = animal.followUps[animal.followUps.length - 1];
        
        return {
            chapeta: chapeta,
            breed: animal.breed,
            entryDate: animal.entryDate,
            entryWeight: animal.entryWeight,
            currentEstimate: lastFollowUp ? lastFollowUp.combinedEstimate : animal.entryWeight,
            lastUpdate: lastFollowUp ? lastFollowUp.date : animal.entryDate,
            totalGain: lastFollowUp ? lastFollowUp.combinedEstimate - animal.entryWeight : 0,
            gdp: lastFollowUp && lastFollowUp.growth ? lastFollowUp.growth.fromEntry.gdp : 0,
            confidence: lastFollowUp ? lastFollowUp.confidence : 100,
            followUpCount: animal.followUps.length,
            isSold: animal.finalWeight !== null,
            finalWeight: animal.finalWeight ? animal.finalWeight.weight : null
        };
    }

    /**
     * Get accuracy statistics
     */
    function getAccuracyStats() {
        const teamData = estimationData.calibration.teamAccuracy;
        const photoData = estimationData.calibration.photoAccuracy;
        const combinedData = estimationData.calibration.combinedAccuracy;
        
        const calcStats = (data) => {
            if (data.length === 0) return null;
            const errors = data.map(d => d.error * 100);
            return {
                count: data.length,
                avgError: (errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(1),
                minError: Math.min(...errors).toFixed(1),
                maxError: Math.max(...errors).toFixed(1)
            };
        };
        
        return {
            teamEstimate: calcStats(teamData),
            photoGrowth: calcStats(photoData),
            combined: calcStats(combinedData),
            currentWeights: estimationData.calibration.learnedWeights || CONFIG.defaultWeights,
            recommendation: getMethodRecommendation()
        };
    }

    /**
     * Get recommendation on best method
     */
    function getMethodRecommendation() {
        const stats = getAccuracyStats();
        
        if (!stats.combined || stats.combined.count < 3) {
            return 'Necesita más datos de validación (mínimo 3 animales vendidos)';
        }
        
        const teamError = parseFloat(stats.teamEstimate?.avgError || 100);
        const photoError = parseFloat(stats.photoGrowth?.avgError || 100);
        const combinedError = parseFloat(stats.combined?.avgError || 100);
        
        if (combinedError <= teamError && combinedError <= photoError) {
            return `✅ Método combinado es el más preciso (${combinedError}% error promedio)`;
        } else if (teamError < photoError) {
            return `El equipo es más preciso que las fotos. Considerar aumentar peso del equipo.`;
        } else {
            return `Las fotos son más precisas que el equipo. Considerar aumentar peso de fotos.`;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════
    
    function saveData() {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(estimationData));
        } catch (e) {
            console.warn('No se pudo guardar datos de estimación');
        }
    }

    function loadData() {
        try {
            const saved = localStorage.getItem(CONFIG.storageKey);
            if (saved) {
                estimationData = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('No se pudo cargar datos de estimación');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    
    function init() {
        loadData();
        
        global.GanadoCombinedEstimation = {
            version: CONFIG.version,
            
            // Core functions
            registerAnimal,
            addFollowUp,
            recordFinalWeight,
            
            // Quick estimate (without saving)
            quickEstimate: (baselineWeight, baselineMeasures, currentMeasures, teamEstimate, options) => {
                const photoEst = calculatePhotoEstimate(baselineWeight, baselineMeasures, currentMeasures);
                return combineEstimates(teamEstimate, photoEst, options);
            },
            
            // Reporting
            getAnimalStatus,
            getAccuracyStats,
            getAllAnimals: () => Object.keys(estimationData.animals),
            
            // Data management
            exportData: () => JSON.stringify(estimationData, null, 2),
            importData: (jsonStr) => {
                try {
                    estimationData = JSON.parse(jsonStr);
                    saveData();
                    return { success: true };
                } catch (e) {
                    return { success: false, error: e.message };
                }
            },
            
            // Configuration
            config: CONFIG
        };
        
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('  🐄 GANADO COMBINED ESTIMATION v' + CONFIG.version);
        console.log('═══════════════════════════════════════════════════════════════');
        console.log('');
        console.log('  Combina estimación del equipo + crecimiento por fotos');
        console.log('  para mayor precisión en seguimiento de peso.');
        console.log('');
        console.log('  Uso:');
        console.log('    GanadoCombinedEstimation.registerAnimal(chapeta, {...})');
        console.log('    GanadoCombinedEstimation.addFollowUp(chapeta, {...})');
        console.log('    GanadoCombinedEstimation.recordFinalWeight(chapeta, {...})');
        console.log('═══════════════════════════════════════════════════════════════');
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    } else {
        init();
    }

})(typeof window !== 'undefined' ? window : global);
