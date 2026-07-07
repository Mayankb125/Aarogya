const path = require("path");
const fs = require("fs");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore: getFs, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

let firebaseApp = null;

function isFirebaseAvailable() {
  const value = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!value) return false;
  // JSON string form: assume valid.
  if (value.trim().startsWith("{")) return true;
  // File path form: only available if the file actually exists.
  return fs.existsSync(path.resolve(process.cwd(), value));
}

function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp;
  }

  const serviceAccountValue = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountValue) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT is missing from environment");
  }

  // Local dev uses a file path. Railway can pass the full JSON string instead.
  const serviceAccount = serviceAccountValue.trim().startsWith("{")
    ? JSON.parse(serviceAccountValue)
    : require(path.resolve(process.cwd(), serviceAccountValue));

  // Service account stays on backend only; never expose it to React frontend.
  firebaseApp = initializeApp({
    credential: cert(serviceAccount),
  });

  return firebaseApp;
}

function getFirestore() {
  initializeFirebase();
  return getFs();
}

function getAdminAuth() {
  initializeFirebase();
  return getAuth();
}

module.exports = {
  FieldValue,
  getAdminAuth,
  getFirestore,
  initializeFirebase,
  isFirebaseAvailable,
};
