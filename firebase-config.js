/**
 * FIREBASE CONFIGURATION
 * Your Firebase project configuration for cloud sync
 * 
 * IMPORTANT: Keep this file private - don't share it publicly
 */

const firebaseConfig = {
  apiKey: "AIzaSyCFaQ6L03LLerzAlR2cj02QG_RDo53gzLk",
  authDomain: "ganado-venecia.firebaseapp.com",
  databaseURL: "https://ganado-venecia-default-rtdb.firebaseio.com",
  projectId: "ganado-venecia",
  storageBucket: "ganado-venecia.firebasestorage.app",
  messagingSenderId: "931365494438",
  appId: "1:931365494438:web:b9618219282fad9b715e67",
  measurementId: "G-ZZ3LMW93L4"
};

// Auto-initialize cloud sync if enabled
document.addEventListener('DOMContentLoaded', async function() {
  const syncEnabled = localStorage.getItem('cloudSync_enabled') === 'true';
  
  if (syncEnabled && typeof cloudSync !== 'undefined') {
    console.log('Auto-initializing cloud sync...');
    try {
      await cloudSync.initialize(firebaseConfig);
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
