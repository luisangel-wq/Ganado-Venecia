/**
 * CLOUD SYNC MODULE v3.0 - CLOUD-FIRST ARCHITECTURE
 * Firebase is the source of truth - local storage is just a cache
 *
 * KEY FEATURES:
 * - CLOUD-FIRST: Always loads from Firebase on startup
 * - REAL-TIME: Firebase listeners for live updates from other devices
 * - IMMEDIATE UPLOAD: All changes sync to cloud within 2 seconds
 * - OFFLINE SUPPORT: Queues changes when offline
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

        // Debounce timer for immediate sync
        this.syncDebounceTimer = null;
        this.pendingChanges = false;
        this.lastChangeTime = null;

        // Offline queue
        this.offlineQueue = [];
        this.isOnline = navigator.onLine;

        // Real-time listener reference
        this.realtimeListener = null;
        this.suppressNextUpdate = false; // Prevent echo when we upload

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
     * Initialize Firebase and setup sync - CLOUD-FIRST
     * Always downloads from cloud first, then enables real-time listeners
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

            console.log('☁️ Cloud-First Sync v3.0 initializing with user ID:', this.userId);

            // CLOUD-FIRST: Always download from cloud on startup
            console.log('☁️ CLOUD-FIRST: Downloading latest data from Firebase...');
            this.updateSyncIndicator('syncing', 'Descargando...');

            const cloudData = await this.downloadFromCloud();

            if (cloudData) {
                // Cloud has data - use it as source of truth
                console.log('✅ Cloud data loaded successfully');
                await this.applyCloudDataSilent(cloudData);
            } else {
                // No cloud data yet - upload local data
                console.log('📤 No cloud data found - uploading local data...');
                await this.syncToCloud();
            }

            // Setup REAL-TIME listener for live updates
            this.setupRealtimeListener();

            // Set up periodic backup sync every 60 seconds
            this.syncInterval = setInterval(() => {
                if (!this.pendingChanges) {
                    this.syncToCloud();
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
     * Download data from cloud (without applying)
     */
    async downloadFromCloud() {
        try {
            const snapshot = await this.db.ref(`users/${this.userId}`).once('value');
            return snapshot.val();
        } catch (error) {
            console.error('Error downloading from cloud:', error);
            return null;
        }
    }

    /**
     * Apply cloud data silently (without reload) - for initial load
     */
    async applyCloudDataSilent(cloudData) {
        if (!cloudData || !cloudData.ranches) return;

        const RANCHES = this.getRanches();

        Object.keys(cloudData.ranches).forEach(ranchId => {
            const ranch = RANCHES[ranchId];
            if (ranch) {
                try {
                    localStorage.setItem(ranch.storageKey, JSON.stringify(cloudData.ranches[ranchId]));
                    console.log(`✅ Loaded: ${ranch.name}`);
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

        // Reload data in UI if available
        if (typeof loadData === 'function') loadData();
        if (typeof updateAllViews === 'function') updateAllViews();
    }

    /**
     * Setup REAL-TIME listener for live updates from other devices
     */
    setupRealtimeListener() {
        if (this.realtimeListener) {
            // Already listening
            return;
        }

        console.log('👂 Setting up real-time Firebase listener...');

        this.realtimeListener = this.db.ref(`users/${this.userId}`).on('value', (snapshot) => {
            // Skip if we just uploaded (to prevent echo)
            if (this.suppressNextUpdate) {
                this.suppressNextUpdate = false;
                return;
            }

            const cloudData = snapshot.val();
            if (!cloudData) return;

            const cloudTime = cloudData.lastModified ? new Date(cloudData.lastModified).getTime() : 0;
            const localTime = this.lastSync ? new Date(this.lastSync).getTime() : 0;
            const cloudDeviceId = cloudData.deviceId;
            const myDeviceId = this.getDeviceId();

            // Only apply if:
            // 1. Data is from another device
            // 2. Cloud timestamp is newer than our last sync
            // 3. We don't have pending local changes
            if (cloudDeviceId !== myDeviceId && cloudTime > localTime && !this.pendingChanges) {
                console.log('🔄 Real-time update from another device!');
                this.applyCloudDataSilent(cloudData);

                if (typeof showToast === 'function') {
                    showToast('☁️ Actualización de otro dispositivo', 'info');
                }
            }
        }, (error) => {
            console.error('Real-time listener error:', error);
        });

        console.log('✅ Real-time listener active');
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
     * Sync all ranch data to cloud - CLOUD-FIRST PRIMARY METHOD
     */
    async syncToCloud() {
        if (!this.enabled || this.syncInProgress) return false;

        try {
            this.syncInProgress = true;
            this.updateSyncIndicator('syncing', 'Guardando en nube...');

            const allData = this.collectAllData();

            // Suppress real-time listener to prevent echo
            this.suppressNextUpdate = true;

            // Upload to Firebase
            await this.db.ref(`users/${this.userId}`).set(allData);

            this.lastSync = allData.lastModified;
            localStorage.setItem('cloudSync_lastSync', this.lastSync);
            this.pendingChanges = false;

            console.log('☁️ Saved to cloud at', this.lastSync);
            this.updateSyncIndicator('synced', 'Guardado ☁️');

            return true;
        } catch (error) {
            console.error('Error syncing to cloud:', error);
            this.updateSyncIndicator('error', 'Error');
            this.suppressNextUpdate = false;

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
     * TWO-WAY SYNC: Simplified for cloud-first architecture
     * Real-time listener handles downloads, this just ensures upload
     */
    async twoWaySync() {
        if (!this.enabled || this.syncInProgress || !this.isOnline) return;

        // Simply upload to ensure cloud has latest data
        await this.syncToCloud();
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
     * Disable cloud sync and cleanup listeners
     */
    disable() {
        this.enabled = false;
        if (this.syncInterval) clearInterval(this.syncInterval);
        if (this.syncDebounceTimer) clearTimeout(this.syncDebounceTimer);

        // Remove real-time listener
        if (this.db && this.realtimeListener) {
            this.db.ref(`users/${this.userId}`).off('value', this.realtimeListener);
            this.realtimeListener = null;
        }

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

// Auto-initialize with family sync - CLOUD-FIRST
document.addEventListener('DOMContentLoaded', async function() {
    console.log('☁️ Cloud Sync v3.0 CLOUD-FIRST: Initializing...');

    // Set shared family ID
    const currentUserId = localStorage.getItem('cloudSync_userId');
    if (currentUserId !== FAMILY_SYNC_ID) {
        localStorage.setItem('cloudSync_userId', FAMILY_SYNC_ID);
        cloudSync.userId = FAMILY_SYNC_ID;
    }

    if (typeof firebaseConfig !== 'undefined') {
        try {
            // Small delay to ensure Firebase SDK is loaded
            setTimeout(async () => {
                const success = await cloudSync.initialize(firebaseConfig);
                if (success) {
                    console.log('✅ Cloud-First sync active!');
                    console.log('   📥 Data loaded from Firebase');
                    console.log('   👂 Real-time listener active');
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
