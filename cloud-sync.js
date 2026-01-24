/**
 * CLOUD SYNC MODULE v2.0
 * Automatic synchronization with Firebase - NOW WITH IMMEDIATE SYNC
 *
 * KEY CHANGES:
 * - Syncs IMMEDIATELY after every data change (debounced 2 seconds)
 * - Shows visible sync status indicator
 * - Queues changes when offline for later sync
 * - Warns before page close if unsync'd changes
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
        this.isInitialized = false;

        // NEW: Debounce timer for immediate sync
        this.syncDebounceTimer = null;
        this.pendingChanges = false;
        this.lastChangeTime = null;

        // NEW: Offline queue
        this.offlineQueue = [];
        this.isOnline = navigator.onLine;

        // Define RANCHES structure as fallback
        this.RANCHES_FALLBACK = {
            la_coruna: { id: 'la_coruna', name: 'La Coruña', storageKey: 'ganadoFinca_LaCoruna' },
            santa_catalina: { id: 'santa_catalina', name: 'Santa Catalina', storageKey: 'ganadoFinca_SantaCatalina' },
            la_vega: { id: 'la_vega', name: 'La Vega', storageKey: 'ganadoFinca_LaVega' },
            san_fernando: { id: 'san_fernando', name: 'San Fernando', storageKey: 'ganadoFinca_SanFernando' }
        };

        // Setup online/offline listeners
        this.setupNetworkListeners();
    }

    /**
     * Get RANCHES object (from global scope or fallback)
     */
    getRanches() {
        return (typeof RANCHES !== 'undefined') ? RANCHES : this.RANCHES_FALLBACK;
    }

    /**
     * Setup network status listeners
     */
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            console.log('📶 Back online - syncing pending changes...');
            this.isOnline = true;
            this.updateSyncIndicator('syncing', 'Reconectando...');
            this.flushOfflineQueue();
        });

        window.addEventListener('offline', () => {
            console.log('📴 Offline - changes will be queued');
            this.isOnline = false;
            this.updateSyncIndicator('offline', 'Sin conexión');
        });

        // Warn before page close if there are pending changes
        window.addEventListener('beforeunload', (e) => {
            if (this.pendingChanges && this.enabled) {
                e.preventDefault();
                e.returnValue = 'Hay cambios sin guardar. ¿Desea salir?';
                return e.returnValue;
            }
        });
    }

    /**
     * Initialize Firebase and setup sync
     */
    async initialize(firebaseConfig) {
        try {
            this.firebaseConfig = firebaseConfig;

            if (typeof firebase === 'undefined') {
                console.error('Firebase SDK not loaded');
                return false;
            }

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
            this.lastSync = localStorage.getItem('cloudSync_lastSync') || null;

            console.log('Cloud sync initialized with user ID:', this.userId);

            // Check if new device
            const localAnimalCount = this.countLocalAnimals();
            const isNewDevice = localAnimalCount === 0;

            if (isNewDevice) {
                console.log('📱 NEW DEVICE - Downloading from cloud...');
                this.updateSyncIndicator('syncing', 'Descargando...');
                await this.forceDownloadFromCloud();
            } else {
                // Initial sync to cloud
                console.log('📤 Initial sync to cloud...');
                this.updateSyncIndicator('syncing', 'Sincronizando...');
                await this.syncToCloud();
            }

            // Set up periodic two-way sync every 60 seconds (backup, not primary)
            this.syncInterval = setInterval(() => {
                if (!this.pendingChanges) {
                    this.twoWaySync();
                }
            }, 60000);

            this.updateSyncIndicator('synced', 'Sincronizado');
            return true;
        } catch (error) {
            console.error('Error initializing cloud sync:', error);
            this.updateSyncIndicator('error', 'Error de conexión');
            return false;
        }
    }

    /**
     * UPDATE SYNC STATUS INDICATOR
     * Shows visual feedback on sync state
     */
    updateSyncIndicator(status, message) {
        const indicator = document.getElementById('cloudSyncIndicator');
        const statusDot = document.getElementById('syncStatusDot');
        const statusText = document.getElementById('syncStatusText');

        if (!indicator) return;

        const colors = {
            'syncing': '#f59e0b',    // Yellow - in progress
            'synced': '#10b981',      // Green - success
            'error': '#ef4444',       // Red - error
            'offline': '#6b7280',     // Gray - offline
            'pending': '#3b82f6'      // Blue - pending changes
        };

        const icons = {
            'syncing': '🔄',
            'synced': '☁️',
            'error': '⚠️',
            'offline': '📴',
            'pending': '💾'
        };

        if (statusDot) {
            statusDot.style.background = colors[status] || colors['synced'];
            statusDot.style.animation = status === 'syncing' ? 'pulse 1s infinite' : 'none';
        }

        if (statusText) {
            statusText.textContent = message || status;
        }

        // Also update the icon in header if exists
        const headerIcon = indicator.querySelector('span:first-child');
        if (headerIcon) {
            headerIcon.textContent = icons[status] || '☁️';
        }

        console.log(`📊 Sync status: ${status} - ${message}`);
    }

    /**
     * IMMEDIATE SYNC - Called right after saveData()
     * Uses debouncing to avoid too many rapid syncs
     */
    scheduleImmediateSync() {
        if (!this.enabled) return;

        this.pendingChanges = true;
        this.lastChangeTime = Date.now();
        this.updateSyncIndicator('pending', 'Guardando...');

        // Clear existing timer
        if (this.syncDebounceTimer) {
            clearTimeout(this.syncDebounceTimer);
        }

        // Sync after 2 seconds of no changes
        this.syncDebounceTimer = setTimeout(async () => {
            if (this.isOnline) {
                await this.syncToCloud();
            } else {
                // Queue for later
                this.queueOfflineSync();
            }
        }, 2000);
    }

    /**
     * Queue sync for when back online
     */
    queueOfflineSync() {
        console.log('📴 Queuing changes for offline sync');
        this.offlineQueue.push({
            timestamp: Date.now(),
            data: this.collectAllData()
        });
        // Keep only latest 5 queued syncs
        if (this.offlineQueue.length > 5) {
            this.offlineQueue.shift();
        }
        this.updateSyncIndicator('offline', 'Guardado local');
    }

    /**
     * Flush offline queue when back online
     */
    async flushOfflineQueue() {
        if (this.offlineQueue.length === 0) {
            // No queue, just do a normal sync
            await this.syncToCloud();
            return;
        }

        console.log(`📤 Flushing ${this.offlineQueue.length} queued syncs...`);

        // Upload the latest data (most recent queue item)
        const latest = this.offlineQueue[this.offlineQueue.length - 1];
        if (latest && latest.data) {
            try {
                await this.db.ref(`users/${this.userId}`).set(latest.data);
                this.lastSync = latest.data.lastModified;
                localStorage.setItem('cloudSync_lastSync', this.lastSync);
                this.offlineQueue = [];
                this.pendingChanges = false;
                this.updateSyncIndicator('synced', 'Sincronizado');

                if (typeof showToast === 'function') {
                    showToast('☁️ Cambios guardados en la nube', 'success');
                }
            } catch (error) {
                console.error('Error flushing offline queue:', error);
                this.updateSyncIndicator('error', 'Error al sincronizar');
            }
        }
    }

    /**
     * Collect all ranch data for sync
     */
    collectAllData() {
        const RANCHES = this.getRanches();
        const allData = {
            ranches: {},
            photos: {},
            lastModified: new Date().toISOString(),
            deviceId: this.getDeviceId()
        };

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

        return allData;
    }

    /**
     * Force download from cloud (for new devices)
     */
    async forceDownloadFromCloud() {
        if (!this.enabled) return;

        try {
            const snapshot = await this.db.ref(`users/${this.userId}`).once('value');
            const cloudData = snapshot.val();

            if (!cloudData || !cloudData.ranches) {
                console.log('No data in cloud yet');
                this.updateSyncIndicator('synced', 'Sincronizado');
                return false;
            }

            const RANCHES = this.getRanches();

            Object.keys(cloudData.ranches).forEach(ranchId => {
                const ranch = RANCHES[ranchId];
                if (ranch) {
                    try {
                        localStorage.setItem(ranch.storageKey, JSON.stringify(cloudData.ranches[ranchId]));
                        console.log(`✅ Downloaded: ${ranch.name}`);
                    } catch (e) {
                        console.error(`Error saving data for ${ranchId}:`, e);
                    }
                }
            });

            if (cloudData.photos) {
                Object.keys(cloudData.photos).forEach(ranchId => {
                    const photosKey = 'animalPhotos_' + ranchId;
                    try {
                        localStorage.setItem(photosKey, JSON.stringify(cloudData.photos[ranchId]));
                    } catch (e) {
                        console.error(`Error saving photos for ${ranchId}:`, e);
                    }
                });
            }

            this.lastSync = cloudData.lastModified;
            localStorage.setItem('cloudSync_lastSync', this.lastSync);

            if (typeof showToast === 'function') {
                showToast('☁️ Datos descargados. Recargando...', 'success');
            }

            setTimeout(() => window.location.reload(), 1500);
            return true;
        } catch (error) {
            console.error('Error downloading from cloud:', error);
            this.updateSyncIndicator('error', 'Error de descarga');
            return false;
        }
    }

    /**
     * Sync all ranch data to cloud - NOW MUCH FASTER
     */
    async syncToCloud() {
        if (!this.enabled || this.syncInProgress) return false;

        try {
            this.syncInProgress = true;
            this.updateSyncIndicator('syncing', 'Sincronizando...');

            const allData = this.collectAllData();

            // Upload to Firebase
            await this.db.ref(`users/${this.userId}`).set(allData);

            this.lastSync = allData.lastModified;
            localStorage.setItem('cloudSync_lastSync', this.lastSync);
            this.pendingChanges = false;

            console.log('✅ Synced to cloud at', this.lastSync);
            this.updateSyncIndicator('synced', 'Sincronizado');

            return true;
        } catch (error) {
            console.error('Error syncing to cloud:', error);
            this.updateSyncIndicator('error', 'Error');

            // Queue for later if network error
            if (!this.isOnline || error.code === 'NETWORK_ERROR') {
                this.queueOfflineSync();
            }

            return false;
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Sync data from cloud to local (FORCE download - user clicked button)
     */
    async syncFromCloud() {
        if (!this.enabled) return;

        try {
            this.updateSyncIndicator('syncing', 'Descargando...');

            const snapshot = await this.db.ref(`users/${this.userId}`).once('value');
            const cloudData = snapshot.val();

            if (!cloudData) {
                await this.syncToCloud();
                return;
            }

            await this.forceApplyCloudData(cloudData);
            return true;
        } catch (error) {
            console.error('Error syncing from cloud:', error);
            this.updateSyncIndicator('error', 'Error de descarga');
            return false;
        }
    }

    /**
     * Force apply cloud data (user explicitly requested)
     */
    async forceApplyCloudData(cloudData) {
        if (!cloudData || !cloudData.ranches) return;

        const RANCHES = this.getRanches();
        let changesCount = 0;

        Object.keys(cloudData.ranches).forEach(ranchId => {
            const ranch = RANCHES[ranchId];
            if (ranch) {
                try {
                    localStorage.setItem(ranch.storageKey, JSON.stringify(cloudData.ranches[ranchId]));
                    changesCount++;
                } catch (e) {
                    console.error(`Error saving ${ranchId}:`, e);
                }
            }
        });

        if (cloudData.photos) {
            Object.keys(cloudData.photos).forEach(ranchId => {
                const photosKey = 'animalPhotos_' + ranchId;
                try {
                    localStorage.setItem(photosKey, JSON.stringify(cloudData.photos[ranchId]));
                } catch (e) {
                    console.error(`Error saving photos for ${ranchId}:`, e);
                }
            });
        }

        this.lastSync = cloudData.lastModified;
        localStorage.setItem('cloudSync_lastSync', this.lastSync);

        if (typeof showToast === 'function') {
            showToast(`☁️ Descargado: ${changesCount} fincas. Recargando...`, 'success');
        }

        setTimeout(() => window.location.reload(), 1500);
    }

    /**
     * TWO-WAY SYNC: Check cloud for changes AND upload local changes
     * CRITICAL: NEVER download if there are pending local changes!
     */
    async twoWaySync() {
        if (!this.enabled || this.syncInProgress || !this.isOnline) return;

        // CRITICAL: If we have pending changes, ALWAYS upload first - never download!
        if (this.pendingChanges) {
            console.log('📤 Pending local changes - uploading first (NOT downloading)');
            await this.syncToCloud();
            return;
        }

        try {
            this.syncInProgress = true;

            const snapshot = await this.db.ref(`users/${this.userId}`).once('value');
            const cloudData = snapshot.val();

            if (!cloudData) {
                this.syncInProgress = false;
                await this.syncToCloud();
                return;
            }

            const cloudTime = cloudData.lastModified ? new Date(cloudData.lastModified).getTime() : 0;
            const localTime = this.lastSync ? new Date(this.lastSync).getTime() : 0;
            const cloudDeviceId = cloudData.deviceId;
            const myDeviceId = this.getDeviceId();

            // Only download if:
            // 1. Cloud data is from ANOTHER device
            // 2. Cloud timestamp is newer
            // 3. We have NO pending local changes
            if (cloudDeviceId !== myDeviceId && cloudTime > localTime && !this.pendingChanges) {
                // Double-check: compare actual data to see if cloud has more info
                const cloudTotal = this.countAnimalsInData(cloudData);
                const localTotal = this.countLocalAnimals();
                const cloudPotrerosTotal = this.countPotreroAssignments(cloudData);
                const localPotrerosTotal = this.countLocalPotreroAssignments();

                console.log(`📊 Comparing: Cloud(${cloudTotal} animals, ${cloudPotrerosTotal} assignments) vs Local(${localTotal} animals, ${localPotrerosTotal} assignments)`);

                // Only download if cloud has MORE data (not less or equal)
                if (cloudTotal > localTotal || cloudPotrerosTotal > localPotrerosTotal) {
                    console.log('⬇️ Cloud has more data - downloading...');
                    await this.applyCloudDataSmart(cloudData);

                    if (typeof showToast === 'function') {
                        showToast('☁️ Nuevos datos de otro dispositivo', 'success');
                    }
                } else {
                    console.log('📤 Local data is same or better - uploading...');
                    this.syncInProgress = false;
                    await this.syncToCloud();
                }
            } else {
                this.syncInProgress = false;
                await this.syncToCloud();
            }
        } catch (error) {
            console.error('Two-way sync error:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Count potrero assignments in cloud data
     */
    countPotreroAssignments(cloudData) {
        if (!cloudData || !cloudData.ranches) return 0;
        let count = 0;
        Object.keys(cloudData.ranches).forEach(ranchId => {
            const ranchData = cloudData.ranches[ranchId];
            if (ranchData?.animalPotreros) {
                count += Object.keys(ranchData.animalPotreros).length;
            }
        });
        return count;
    }

    /**
     * Count local potrero assignments
     */
    countLocalPotreroAssignments() {
        const RANCHES = this.getRanches();
        let count = 0;
        Object.keys(RANCHES).forEach(ranchId => {
            const ranch = RANCHES[ranchId];
            const ranchData = localStorage.getItem(ranch.storageKey);
            if (ranchData) {
                try {
                    const data = JSON.parse(ranchData);
                    if (data?.animalPotreros) {
                        count += Object.keys(data.animalPotreros).length;
                    }
                } catch (e) {}
            }
        });
        return count;
    }

    /**
     * Smart apply of cloud data
     */
    async applyCloudDataSmart(cloudData) {
        if (!cloudData || !cloudData.ranches) return;

        const RANCHES = this.getRanches();
        let changesApplied = false;

        Object.keys(cloudData.ranches).forEach(ranchId => {
            const ranch = RANCHES[ranchId];
            if (ranch) {
                try {
                    const cloudRanchData = cloudData.ranches[ranchId];
                    const localRanchDataStr = localStorage.getItem(ranch.storageKey);
                    const localRanchData = localRanchDataStr ? JSON.parse(localRanchDataStr) : null;

                    const cloudCount = cloudRanchData?.entradas?.length || 0;
                    const localCount = localRanchData?.entradas?.length || 0;

                    if (cloudCount >= localCount) {
                        localStorage.setItem(ranch.storageKey, JSON.stringify(cloudRanchData));
                        changesApplied = true;
                    }
                } catch (e) {
                    console.error(`Error applying sync for ${ranchId}:`, e);
                }
            }
        });

        if (cloudData.photos) {
            Object.keys(cloudData.photos).forEach(ranchId => {
                const photosKey = 'animalPhotos_' + ranchId;
                try {
                    localStorage.setItem(photosKey, JSON.stringify(cloudData.photos[ranchId]));
                } catch (e) {
                    console.error(`Error applying photos for ${ranchId}:`, e);
                }
            });
        }

        this.lastSync = cloudData.lastModified;
        localStorage.setItem('cloudSync_lastSync', this.lastSync);

        if (changesApplied) {
            if (typeof loadData === 'function') loadData();
            if (typeof updateAllViews === 'function') updateAllViews();
            this.updateSyncIndicator('synced', 'Sincronizado');
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
            if (ranchData?.entradas?.length) count += ranchData.entradas.length;
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
                    if (data?.entradas?.length) count += data.entradas.length;
                } catch (e) {}
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
        if (this.syncInterval) clearInterval(this.syncInterval);
        if (this.syncDebounceTimer) clearTimeout(this.syncDebounceTimer);
        if (this.db) this.db.ref(`users/${this.userId}`).off();
        this.updateSyncIndicator('offline', 'Desactivado');
    }

    /**
     * Get sync status
     */
    getStatus() {
        return {
            enabled: this.enabled,
            userId: this.userId,
            lastSync: this.lastSync,
            deviceId: this.getDeviceId(),
            pendingChanges: this.pendingChanges,
            isOnline: this.isOnline
        };
    }

    /**
     * Force immediate sync
     */
    async forceSync() {
        if (!this.enabled) return false;
        await this.syncToCloud();
        return true;
    }
}

// Create global instance
window.cloudSync = new CloudSync();

// FAMILY SYNC CODE
const FAMILY_SYNC_ID = 'user_1767286295709_gwj75h9dp';

// Auto-initialize with family sync
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔄 Cloud Sync v2.0: Initializing...');

    // Set shared family ID
    const currentUserId = localStorage.getItem('cloudSync_userId');
    if (currentUserId !== FAMILY_SYNC_ID) {
        localStorage.setItem('cloudSync_userId', FAMILY_SYNC_ID);
        cloudSync.userId = FAMILY_SYNC_ID;
    }

    if (typeof firebaseConfig !== 'undefined') {
        try {
            setTimeout(async () => {
                const success = await cloudSync.initialize(firebaseConfig);
                if (success) {
                    console.log('✅ Cloud sync initialized!');
                    localStorage.setItem('cloudSync_enabled', 'true');
                }
            }, 500);
        } catch (error) {
            console.error('Error initializing cloud sync:', error);
        }
    } else {
        console.warn('⚠️ Firebase config not found');
    }
});
