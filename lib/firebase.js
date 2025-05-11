import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

// Apply settings to Firestore to fix CORS issues
// This is done in a try-catch to avoid issues during SSR
try {
  if (typeof window !== "undefined") {
    // Only run on client side
    const { setLogLevel, initializeFirestore } = require("firebase/firestore");

    // Create a new Firestore instance with settings that avoid CORS issues
    const firestoreWithSettings = initializeFirestore(app, {
      experimentalForceLongPolling: true, // Use long polling instead of WebSockets
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false, // Disable fetch streams which can cause CORS issues
    });

    // Replace the default instance with our configured one
    Object.assign(db, firestoreWithSettings);

    // Set log level to reduce console noise in production
    if (process.env.NODE_ENV === "production") {
      setLogLevel("error");
    }
  }
} catch (error) {
  // Silently handle errors in production
  if (process.env.NODE_ENV !== "production") {
    console.warn("Firebase settings could not be applied:", error);
  }
}
