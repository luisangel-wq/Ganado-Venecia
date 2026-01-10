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

            // Get or create user ID (use family ID if set)
            this.userId = localStorage.getItem('cloudSync_userId');
            if (!this.userId) {
                this.userId = 'user_1767286295709_gwj75h9dp'; // Default family ID
                localStorage.setItem('cloudSync_userId', this.userId);
            }

            this.enabled = true;
            this.isInitialized = true;

            // CRITICAL: Load lastSync from localStorage before any comparisons
            this.lastSync = localStorage.getItem('cloudSync_lastSync') || null;

            console.log('Cloud sync initialized with user ID:', this.userId);
            console.log('Last sync time from storage:', this.lastSync);

            // Check if this is a new device (no local data)
            const localAnimalCount = this.countLocalAnimals();
            const isNewDevice = localAnimalCount === 0;

            if (isNewDevice) {
                console.log('📱 NEW DEVICE DETECTED - Will download data from cloud');
                // Force download from cloud for new devices
                await this.forceDownloadFromCloud();
            } else {
                // Device has local data - just upload to cloud on init
                // Don't download on init to avoid loops - user can manually download if needed
                console.log(`📊 Local: ${localAnimalCount} animals`);
                console.log('📤 Syncing local data to cloud...');
                await this.syncToCloud();
                console.log('✅ Local data synced to cloud');
            }

            // DISABLED: Real-time listeners were causing infinite loops
            // this.setupListeners();

            // Auto-sync every 60 seconds (upload only)
            console.log('⏰ Starting auto-sync interval (every 60 seconds)');
            this.syncInterval = setInterval(() => {
                console.log('⏰ Auto-sync timer triggered - uploading to cloud...');
                this.syncToCloud().then(() => {
                    console.log('⏰ Auto-sync upload complete');
                }).catch(err => {
                    console.error('⏰ Auto-sync error:', err);
                });
            }, 60000);

            return true;
        } catch (error) {
            console.error('Error initializing cloud sync:', error);
            return false;
        }
    }

    /**
     * Force download from cloud (for new devices)
     */
    async forceDownloadFromCloud() {
        if (!this.enabled) return;

        try {
            console.log('⬇️ Downloading data from cloud...');
            const snapshot = await this.db.ref(`users/${this.userId}`).once('value');
            const cloudData = snapshot.val();

            if (!cloudData || !cloudData.ranches) {
                console.log('No data in cloud yet');
                return false;
            }

            const RANCHES = this.getRanches();

            // Apply ranch data without validation (trust cloud data for new devices)
            Object.keys(cloudData.ranches).forEach(ranchId => {
                const ranch = RANCHES[ranchId];
                if (ranch) {
                    try {
                        localStorage.setItem(ranch.storageKey, JSON.stringify(cloudData.ranches[ranchId]));
                        console.log(`✅ Downloaded data for: ${ranch.name}`);
                    } catch (e) {
                        console.error(`Error saving data for ${ranchId}:`, e);
                    }
                }
            });

            // Apply photos
            if (cloudData.photos) {
                Object.keys(cloudData.photos).forEach(ranchId => {
                    const photosKey = 'animalPhotos_' + ranchId;
                    try {
                        localStorage.setItem(photosKey, JSON.stringify(cloudData.photos[ranchId]));
                        console.log(`✅ Downloaded photos for: ${ranchId}`);
                    } catch (e) {
                        console.error(`Error saving photos for ${ranchId}:`, e);
                    }
                });
            }

            this.lastSync = cloudData.lastModified;
            localStorage.setItem('cloudSync_lastSync', this.lastSync);

            // Reload the page to show new data
            console.log('🔄 Data downloaded! Reloading page...');
            if (typeof showToast === 'function') {
                showToast('☁️ Datos descargados de la nube. Recargando...', 'success');
            }

            setTimeout(() => {
                window.location.reload();
            }, 1500);

            return true;
        } catch (error) {
            console.error('Error downloading from cloud:', error);
            return false;
        }
    }

    /**
     * Setup real-time listeners for cloud changes
     */
    setupListeners() {
        if (!this.enabled || !this.db) return;

        const userRef = this.db.ref(`users/${this.userId}`);
        let lastProcessedTime = 0; // Debounce to prevent rapid re-syncs
        let isFirstLoad = true; // Skip the first trigger which is the initial load

        userRef.on('value', (snapshot) => {
            // Skip the first load - we handle that in initialize()
            if (isFirstLoad) {
                isFirstLoad = false;
                const cloudData = snapshot.val();
                if (cloudData && cloudData.lastModified) {
                    // Just update our lastSync to current cloud time
                    this.lastSync = cloudData.lastModified;
                    localStorage.setItem('cloudSync_lastSync', this.lastSync);
                }
                return;
            }

            if (this.syncInProgress) return; // Avoid infinite loops

            const cloudData = snapshot.val();
            if (cloudData && cloudData.lastModified) {
                const cloudTime = new Date(cloudData.lastModified).getTime();

                // Debounce: don't process same timestamp twice
                if (cloudTime === lastProcessedTime) {
                    return;
                }

                // Check if the change came from a different device
                const cloudDeviceId = cloudData.deviceId;
                const myDeviceId = this.getDeviceId();
                const isFromOtherDevice = cloudDeviceId && cloudDeviceId !== myDeviceId;

                // Only sync if it's from another device
                if (isFromOtherDevice) {
                    lastProcessedTime = cloudTime;
                    console.log(`☁️ Change from device ${cloudDeviceId} - syncing...`);
                    this.syncFromCloudSilent(cloudData);
                } else {
                    // It's our own change - just update lastSync
                    this.lastSync = cloudData.lastModified;
                    localStorage.setItem('cloudSync_lastSync', this.lastSync);
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

            console.log('✅ Data synced to cloud successfully at', this.lastSync);

            // Update UI status if available
            if (typeof updateSyncStatus === 'function') {
                updateSyncStatus();
            }

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
        // Apply data to localStorage first
        this.applySyncData(cloudData, false);

        // Show notification
        if (typeof showToast === 'function') {
            showToast('☁️ Datos sincronizados desde otro dispositivo', 'success');
        }

        // Update UI without page reload to avoid loops
        if (typeof loadData === 'function') {
            loadData();
        }
        if (typeof updateAllViews === 'function') {
            updateAllViews();
        }

        console.log('✅ Sync from other device complete - UI updated');
    }

    /**
     * Apply synced data to local storage
     */
    applySyncData(cloudData, showNotification = true) {
        if (!cloudData) return;

        const RANCHES = this.getRanches();
        let changesCount = 0;

        // DATA VALIDATION: Check if cloud data is suspicious (empty or too small)
        const cloudAnimalCount = this.countAnimalsInData(cloudData);
        const localAnimalCount = this.countLocalAnimals();

        // Prevent overwriting good data with empty/minimal data
        if (localAnimalCount > 10 && cloudAnimalCount < localAnimalCount * 0.5) {
            console.warn('⚠️ SYNC BLOCKED: Cloud data appears incomplete');
            console.warn(`Local has ${localAnimalCount} animals, cloud has ${cloudAnimalCount}`);

            if (showNotification && typeof showToast === 'function') {
                showToast('⚠️ Sincronización bloqueada: Los datos en la nube parecen incompletos. Use Backup/Restore manual.', 'warning');
            }

            // Optionally ask user what to do
            if (showNotification && confirm(
                `ADVERTENCIA: Sincronización bloqueada\n\n` +
                `Datos locales: ${localAnimalCount} animales\n` +
                `Datos en la nube: ${cloudAnimalCount} animales\n\n` +
                `Los datos de la nube parecen estar incompletos o vacíos.\n\n` +
                `¿Desea SOBRESCRIBIR la nube con sus datos locales?\n` +
                `(Recomendado si sus datos locales son correctos)`
            )) {
                // Upload local data to cloud instead
                this.syncToCloud();
            }

            return; // Don't apply cloud data
        }

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
            console.log(`✅ Synced ${changesCount} changes from cloud`);

            // CRITICAL: Reload the data variable from localStorage before updating views
            // The 'data' variable in index.html needs to be refreshed with the new localStorage data
            if (typeof loadData === 'function') {
                console.log('🔄 Reloading data from localStorage...');
                loadData(); // This reloads the in-memory 'data' variable
            }

            // Now update the UI with the fresh data
            if (typeof updateAllViews === 'function') {
                console.log('🔄 Updating UI with new data...');
                updateAllViews();
            }

            // Show subtle notification (only if not silent sync)
            if (showNotification && typeof showToast === 'function') {
                showToast(`☁️ ${changesCount} cambio(s) sincronizado(s)`, 'success');
            }
        }
    }

    /**
     * Get animal count from cloud (without downloading all data)
     */
    async getCloudAnimalCount() {
        if (!this.enabled || !this.db) return 0;

        try {
            const snapshot = await this.db.ref(`users/${this.userId}`).once('value');
            const cloudData = snapshot.val();
            return this.countAnimalsInData(cloudData);
        } catch (error) {
            console.error('Error getting cloud animal count:', error);
            return 0;
        }
    }

    /**
     * Count animals in cloud data
     */
    countAnimalsInData(cloudData) {
        if (!cloudData || !cloudData.ranches) return 0;

        let count = 0;
        Object.keys(cloudData.ranches).forEach(ranchId => {
            const ranchData = cloudData.ranches[ranchId];
            // Check both 'entradas' (app uses this) and 'cattle' (legacy)
            if (ranchData && ranchData.entradas && Array.isArray(ranchData.entradas)) {
                count += ranchData.entradas.length;
            } else if (ranchData && ranchData.cattle && Array.isArray(ranchData.cattle)) {
                count += ranchData.cattle.length;
            }
        });

        return count;
    }

    /**
     * Count animals in local storage
     */
    countLocalAnimals() {
        const RANCHES = this.getRanches();
        let count = 0;

        Object.keys(RANCHES).forEach(ranchId => {
            const ranch = RANCHES[ranchId];
            const ranchData = localStorage.getItem(ranch.storageKey);
            if (ranchData) {
                try {
                    const data = JSON.parse(ranchData);
                    // Check both 'entradas' (app uses this) and 'cattle' (legacy)
                    if (data && data.entradas && Array.isArray(data.entradas)) {
                        count += data.entradas.length;
                    } else if (data && data.cattle && Array.isArray(data.cattle)) {
                        count += data.cattle.length;
                    }
                } catch (e) {
                    console.error(`Error counting animals for ranch ${ranchId}:`, e);
                }
            }
        });

        return count;
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

    /**
     * Trigger automatic sync after data changes
     * Call this whenever local data is modified
     */
    async triggerAutoSync() {
        if (!this.enabled) return;

        console.log('📤 Data changed - syncing to cloud...');
        await this.syncToCloud();
    }
}

// Create global instance
window.cloudSync = new CloudSync();

// FAMILY SYNC CODE - Shared user ID for all family members
const FAMILY_SYNC_ID = 'user_1767286295709_gwj75h9dp';

// Auto-initialize with family sync
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Cloud Sync: Initializing family sync...');

    // Set the shared family ID for everyone
    const currentUserId = localStorage.getItem('cloudSync_userId');
    if (currentUserId !== FAMILY_SYNC_ID) {
        console.log('📱 Setting shared family sync ID:', FAMILY_SYNC_ID);
        localStorage.setItem('cloudSync_userId', FAMILY_SYNC_ID);
        cloudSync.userId = FAMILY_SYNC_ID;
    }

    // Check if Firebase config is available
    if (typeof firebaseConfig !== 'undefined') {
        try {
            // Small delay to ensure page is fully loaded
            setTimeout(async () => {
                const success = await cloudSync.initialize(firebaseConfig);
                if (success) {
                    console.log('✅ Family sync initialized successfully!');
                    localStorage.setItem('cloudSync_enabled', 'true');

                    // Update sync status in UI
                    if (typeof updateSyncStatus === 'function') {
                        updateSyncStatus();
                    }
                } else {
                    console.error('❌ Failed to initialize family sync');
                }
            }, 1000);
        } catch (error) {
            console.error('Error initializing family sync:', error);
        }
    } else {
        console.warn('⚠️ Firebase config not found - sync disabled');
    }
});
