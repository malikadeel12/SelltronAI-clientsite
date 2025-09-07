/**
 * Change Summary (MCP Context 7 Best Practices)
 * - Added client-side Firebase initialization with lazy, safe setup for Auth.
 * - Prevents crashes at import-time if env variables are missing; logs helpful warnings instead.
 * Why: `Register.jsx`/`Login.jsx` import Firebase Auth; vite failed because `firebase` package and init file were missing.
 * Dependencies/Related: Used by `client/src/pages/Auth/Register.jsx` and `client/src/pages/Auth/Login.jsx`.
 */

// --- Firebase Web SDK Imports ---
// We use modular v9+ SDK for tree-shaking and better DX.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// --- Internal State ---
// Hold a singleton auth instance; created upon first access.
let cachedAuthInstance = null;
let cachedDbInstance = null;

// --- Helper: Build Firebase Config From Vite Env ---
// NOTE: Values are read from Vite's `import.meta.env` at runtime. Make sure to define them in `.env.local`.
function getFirebaseConfigFromEnv() {
  // Using explicit names for clarity and maintainability.
  const maybeTrim = (v) => (typeof v === "string" ? v.trim() : v);
  const config = {
    apiKey: maybeTrim(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: maybeTrim(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: maybeTrim(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: maybeTrim(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: maybeTrim(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: maybeTrim(import.meta.env.VITE_FIREBASE_APP_ID),
  };

  // --- Validation Step ---
  // Warn (don't crash) if critical config is missing. Auth operations will fail later and be caught by callers.
  const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
  const missing = requiredKeys.filter((k) => !config[k]);
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `Firebase config is missing: ${missing.join(", ")}. ` +
        "Define VITE_FIREBASE_* variables in client/.env.local."
    );
  }

  return config;
}

// --- Public API: getAuthInstance ---
// Lazily initializes the Firebase app and returns the Auth instance.
export function getAuthInstance() {
  // Early return if we already created it.
  if (cachedAuthInstance) {
    return cachedAuthInstance;
  }

  // Initialize the app once, re-use on subsequent calls.
  const app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfigFromEnv());
  cachedAuthInstance = getAuth(app);
  return cachedAuthInstance;
}

// --- Public API: getDbInstance ---
// Lazily initializes the Firebase app and returns the Firestore instance.
export function getDbInstance() {
  // Early return if we already created it.
  if (cachedDbInstance) {
    return cachedDbInstance;
  }

  // Initialize the app once, re-use on subsequent calls.
  const app = getApps().length > 0 ? getApp() : initializeApp(getFirebaseConfigFromEnv());
  cachedDbInstance = getFirestore(app);
  return cachedDbInstance;
}

// Export db for backward compatibility
export const db = getDbInstance();

// NOTE: Intentionally NOT exporting a static `auth` at module import-time to avoid crashing
// when env isn't ready during build/dev. Call `getAuthInstance()` where needed.

// TODO: Add support for other Firebase services (Firestore/Storage) when required by business logic.


