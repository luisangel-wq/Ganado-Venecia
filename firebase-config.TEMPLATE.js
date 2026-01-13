/**
 * FIREBASE CONFIGURATION TEMPLATE
 *
 * SECURITY INSTRUCTIONS:
 * 1. Copy this file to: firebase-config.js
 * 2. Replace the placeholder values with your actual Firebase config
 * 3. NEVER commit firebase-config.js to git (it's in .gitignore)
 *
 * To get your Firebase config:
 * 1. Go to: https://console.firebase.google.com
 * 2. Select project: ganado-venecia
 * 3. Go to: Project Settings → General
 * 4. Scroll to: "Your apps" → Web app
 * 5. Copy the config values
 */

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY_HERE",
  authDomain: "ganado-venecia.firebaseapp.com",
  databaseURL: "https://ganado-venecia-default-rtdb.firebaseio.com",
  projectId: "ganado-venecia",
  storageBucket: "ganado-venecia.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
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
