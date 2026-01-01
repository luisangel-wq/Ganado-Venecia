/**
 * CLOUD SYNC MODULE
 * Automatic synchronization between devices using Firebase
 * 
 * Features:
 * - Real-time sync across all devices
 * - Offline support with automatic sync when online
 * - Simple setup with Firebase
 * - Conflict resolution (last-write-wins)
 */

class CloudSync {
    constructor() {
        this.enabled = false;
        this.userId = null;
        this.db = null;
        this.lastSync = null;
        this.syncInProgress = false;
        this.firebaseConfig = null;
        this.syncInterval = null;
        
        // Define RANCHES structure as fallback (in case main app hasn't loaded yet)
        this.RANCHES_FALLBACK = {
            la_coruna: {
                id: 'la_coruna',
                name: 'La Coruña',
                storageKey: 'ganadoFinca_LaCoruna'
            },
            santa_catalina: {
                id: 'santa_catalina',
                name: 'Santa Catalina',
                storageKey: 'ganadoFinca_SantaCatalina'
            },
            la_vega: {
                id: 'la_vega',
                name: 'La Vega',
                storageKey: 'ganadoFinca_LaVega'
            }
        };
    }
    
    /**
     * Get RANCHES object (from global scope or fallback)
     */
    getRanches() {
        return (typeof RANCHES !== 'undefined') ? RANCHES : this.RANCHES_FALLBACK;
    }

    /**
     * Initialize Firebase and setup sync
     */
    async initialize(firebaseConfig) {
        try {
            this.firebaseConfig = firebaseConfig;
            
            // Check if Firebase is loaded
            if (typeof firebase === 'undefined') {
                console.error('Firebase SDK not loaded');
                return false;
            }

            // Initialize Firebase
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }

            this.db = firebase.database();
            
            // Get or create user ID
            this.userId = localStorage.getItem('cloudSync_userId');
            if (!this.userId) {
                this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('cloudSync_userId', this.userId);
            }

            this.enabled = true;
            console.log('Cloud sync initialized with user ID:', this.userId);
            
            // Setup listeners
            this.setupListeners();
            
            // Initial sync
            await this.syncFromCloud();
            
            // Auto-sync every 30 seconds
            this.syncInterval = setInterval(() => this.syncToCloud(), 30000);
            
            return true;
        } catch (error) {
            console.error('Error initializing cloud sync:', error);
            return false;
        }
    }

    /**
     * Setup real-time listeners for cloud changes
     */
    setupListeners() {
        if (!this.enabled || !this.db) return;

        const userRef = this.db.ref(`users/${this.userId}`);
        
        userRef.on('value', (snapshot) => {
            if (this.syncInProgress) return; // Avoid infinite loops
            
            const cloudData = snapshot.val();
            if (cloudData && cloudData.lastModified) {
                const cloudTime = new Date(cloudData.lastModified);
                const localTime = this.lastSync ? new Date(this.lastSync) : new Date(0);
                
                // If cloud data is newer, sync from cloud
                if (cloudTime > localTime) {
                    console.log('Cloud data is newer, syncing from cloud...');
                    this.syncFromCloudSilent(cloudData);
                }
            }
        });
    }

    /**
     * Sync all ranch data to cloud
     */
    async syncToCloud() {
        if (!this.enabled || this.syncInProgress) return;

        try {
            this.syncInProgress = true;
            
            const RANCHES = this.getRanches();
            
            const allData = {
                ranches: {},
                photos: {},
                lastModified: new Date().toISOString(),
                deviceId: this.getDeviceId()
            };

            // Collect all ranch data
            Object.keys(RANCHES).forEach(ranchId => {
                const ranch = RANCHES[ranchId];
                const ranchData = localStorage.getItem(ranch.storageKey);
                if (ranchData) {
                    try {
                        allData.ranches[ranchId] = JSON.parse(ranchData);
                    } catch (e) {
                        console.error(`Error parsing data for ranch ${ranchId}:`, e);
                    }
                }

                // Collect photos
                const photosKey = 'animalPhotos_' + ranchId;
                const photos = localStorage.getItem(photosKey);
                if (photos) {
                    try {
                        allData.photos[ranchId] = JSON.parse(photos);
                    } catch (e) {
                        console.error(`Error parsing photos for ranch ${ranchId}:`, e);
                    }
                }
            });

            // Upload to Firebase
            await this.db.ref(`users/${this.userId}`).set(allData);
            
            this.lastSync = allData.lastModified;
            localStorage.setItem('cloudSync_lastSync', this.lastSync);
            
            console.log('Data synced to cloud successfully');
            return true;
        } catch (error) {
            console.error('Error syncing to cloud:', error);
            if (error.code === 'PERMISSION_DENIED') {
                console.error('Firebase permission denied - check database rules');
            }
            return false;
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Sync data from cloud to local
     */
    async syncFromCloud() {
        if (!this.enabled) return;

        try {
            const snapshot = await this.db.ref(`users/${this.userId}`).once('value');
            const cloudData = snapshot.val();
            
            if (!cloudData) {
                console.log('No cloud data found, will upload local data');
                await this.syncToCloud();
                return;
            }

            this.applySyncData(cloudData, true);
            return true;
        } catch (error) {
            console.error('Error syncing from cloud:', error);
            return false;
        }
    }

    /**
     * Silent sync from cloud (triggered by listeners)
     */
    syncFromCloudSilent(cloudData) {
        this.applySyncData(cloudData, false);
    }

    /**
     * Apply synced data to local storage
     */
    applySyncData(cloudData, showNotification = true) {
        if (!cloudData) return;

        const RANCHES = this.getRanches();
        let changesCount = 0;

        // Restore ranch data
        if (cloudData.ranches) {
            Object.keys(cloudData.ranches).forEach(ranchId => {
                const ranch = RANCHES[ranchId];
                if (ranch) {
                    try {
                        const newData = JSON.stringify(cloudData.ranches[ranchId]);
                        const oldData = localStorage.getItem(ranch.storageKey);
                        
                        if (newData !== oldData) {
                            localStorage.setItem(ranch.storageKey, newData);
                            changesCount++;
                            console.log(`Synced data for ranch: ${ranch.name}`);
                        }
                    } catch (e) {
                        console.error(`Error applying sync data for ranch ${ranchId}:`, e);
                    }
                }
            });
        }

        // Restore photos
        if (cloudData.photos) {
            Object.keys(cloudData.photos).forEach(ranchId => {
                const photosKey = 'animalPhotos_' + ranchId;
                try {
                    const newPhotos = JSON.stringify(cloudData.photos[ranchId]);
                    const oldPhotos = localStorage.getItem(photosKey);
                    
                    if (newPhotos !== oldPhotos) {
                        localStorage.setItem(photosKey, newPhotos);
                        changesCount++;
                        console.log(`Synced photos for ranch: ${ranchId}`);
                    }
                } catch (e) {
                    console.error(`Error applying sync photos for ranch ${ranchId}:`, e);
                }
            });
        }

        this.lastSync = cloudData.lastModified;
        localStorage.setItem('cloudSync_lastSync', this.lastSync);

        if (changesCount > 0) {
            console.log(`Synced ${changesCount} changes from cloud`);
            
            if (showNotification && typeof showToast === 'function') {
                showToast(`☁️ Sincronizado desde la nube (${changesCount} cambios)`, 'success');
                
                // Reload data in current view if updateAllViews exists
                if (typeof updateAllViews === 'function') {
                    updateAllViews();
                }
                
                // On mobile, suggest page reload for full UI refresh
                if (showNotification && changesCount > 0) {
                    setTimeout(() => {
                        if (confirm('¿Recargar la página para ver todos los cambios sincronizados?')) {
                            window.location.reload();
                        }
                    }, 1500);
                }
            }
        }
    }

    /**
     * Get unique device identifier
     */
    getDeviceId() {
        let deviceId = localStorage.getItem('cloudSync_deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('cloudSync_deviceId', deviceId);
        }
        return deviceId;
    }

    /**
     * Disable cloud sync
     */
    disable() {
        this.enabled = false;
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        if (this.db) {
            this.db.ref(`users/${this.userId}`).off();
        }
        console.log('Cloud sync disabled');
    }

    /**
     * Get sync status
     */
    getStatus() {
        return {
            enabled: this.enabled,
            userId: this.userId,
            lastSync: this.lastSync,
            deviceId: this.getDeviceId()
        };
    }

    /**
     * Force immediate sync
     */
    async forceSync() {
        if (!this.enabled) {
            console.error('Cloud sync is not enabled');
            return false;
        }

        console.log('Force syncing...');
        await this.syncToCloud();
        await this.syncFromCloud();
        return true;
    }
}

// Create global instance
window.cloudSync = new CloudSync();

// Auto-initialize on page load if Firebase config is available
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Checking for cloud sync auto-initialization...');
    
    // Wait a bit for firebase-config.js to load
    setTimeout(async () => {
        if (typeof firebaseConfig !== 'undefined' && typeof firebase !== 'undefined') {
            console.log('✅ Firebase config found, auto-initializing cloud sync...');
            
            try {
                const initialized = await window.cloudSync.initialize(firebaseConfig);
                if (initialized) {
                    console.log('✅ Cloud sync auto-initialized successfully');
                    
                    // Show subtle notification on mobile
                    if (typeof showToast === 'function') {
                        showToast('☁️ Sincronización automática activa', 'info');
                    }
                } else {
                    console.warn('⚠️ Cloud sync auto-initialization failed');
                }
            } catch (error) {
                console.error('❌ Error auto-initializing cloud sync:', error);
            }
        } else {
            console.log('ℹ️ Firebase config not found - cloud sync will initialize manually');
        }
    }, 1000);
});
