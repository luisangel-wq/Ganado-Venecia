/**
 * FIREBASE CONFIG FALLBACK
 * This file provides Firebase configuration if firebase-config.js is missing
 *
 * HOW IT WORKS:
 * - Checks if firebaseConfig exists
 * - If not, creates it with the correct values
 * - This ensures the app works even if firebase-config.js file is missing
 */

(function() {
    // Only run if firebaseConfig is NOT already defined
    if (typeof firebaseConfig === 'undefined') {
        console.log('⚠️ firebase-config.js not found - using fallback configuration');

        // Define Firebase configuration
        window.firebaseConfig = {
            apiKey: "AIzaSyCFaQ6L03LLerzAlR2cj02QG_RDo53gzLk",
            authDomain: "ganado-venecia.firebaseapp.com",
            databaseURL: "https://ganado-venecia-default-rtdb.firebaseio.com",
            projectId: "ganado-venecia",
            storageBucket: "ganado-venecia.firebasestorage.app",
            messagingSenderId: "931365494438",
            appId: "1:931365494438:web:b9618219282fad9b715e67",
            measurementId: "G-ZZ3LMW93L4"
        };

        console.log('✅ Firebase configuration loaded from fallback');

        // Auto-initialize cloud sync if enabled
        document.addEventListener('DOMContentLoaded', async function() {
            const syncEnabled = localStorage.getItem('cloudSync_enabled') === 'true';

            if (syncEnabled && typeof cloudSync !== 'undefined') {
                console.log('Auto-initializing cloud sync from fallback...');
                try {
                    await cloudSync.initialize(window.firebaseConfig);
                    console.log('Cloud sync initialized successfully');

                    // Update UI if it exists
                    if (typeof updateSyncStatus === 'function') {
                        updateSyncStatus();
                    }
                } catch (error) {
                    console.error('Error initializing cloud sync:', error);
                }
            }
        });
    } else {
        console.log('✅ firebase-config.js loaded successfully');
    }
})();
