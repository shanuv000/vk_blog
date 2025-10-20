import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';

let analytics = null;
let firebaseInitialized = false;

/**
 * Initialize Firebase Analytics
 * @returns {Object|null} Firebase Analytics instance or null if initialization fails
 */
export const initFirebaseAnalytics = () => {
  if (typeof window === 'undefined') {return null;}
  
  try {
    // Check if Firebase is already initialized
    if (firebaseInitialized) {
      return analytics;
    }
    
    // Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    
    // Check if all required Firebase config values are present
    const hasAllConfig = Object.values(firebaseConfig).every(value => 
      value && value !== 'your-firebase-api-key' && value !== 'undefined'
    );
    
    if (!hasAllConfig) {
      console.warn('Firebase Analytics: Missing or invalid configuration');
      return null;
    }
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    firebaseInitialized = true;
    
    return analytics;
  } catch (error) {
    console.error('Firebase Analytics initialization error:', error);
    return null;
  }
};

/**
 * Log an event to Firebase Analytics
 * @param {string} eventName - Name of the event
 * @param {Object} eventParams - Event parameters
 */
export const logFirebaseEvent = (eventName, eventParams = {}) => {
  try {
    const analyticsInstance = analytics || initFirebaseAnalytics();
    if (analyticsInstance) {
      logEvent(analyticsInstance, eventName, eventParams);
    }
  } catch (error) {
    console.error('Firebase Analytics logEvent error:', error);
  }
};

/**
 * Set user ID in Firebase Analytics
 * @param {string} userId - User ID
 */
export const setFirebaseUserId = (userId) => {
  try {
    const analyticsInstance = analytics || initFirebaseAnalytics();
    if (analyticsInstance && userId) {
      setUserId(analyticsInstance, userId);
    }
  } catch (error) {
    console.error('Firebase Analytics setUserId error:', error);
  }
};

/**
 * Set user properties in Firebase Analytics
 * @param {Object} properties - User properties
 */
export const setFirebaseUserProperties = (properties) => {
  try {
    const analyticsInstance = analytics || initFirebaseAnalytics();
    if (analyticsInstance && properties) {
      setUserProperties(analyticsInstance, properties);
    }
  } catch (error) {
    console.error('Firebase Analytics setUserProperties error:', error);
  }
};

/**
 * Track page view in Firebase Analytics
 * @param {string} pagePath - Page path
 * @param {string} pageTitle - Page title
 */
export const trackFirebasePageView = (pagePath, pageTitle) => {
  logFirebaseEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  });
};

/**
 * Track content view in Firebase Analytics
 * @param {string} contentType - Content type (e.g., 'post', 'page')
 * @param {string} contentId - Content ID
 * @param {string} contentName - Content name
 */
export const trackFirebaseContentView = (contentType, contentId, contentName) => {
  logFirebaseEvent('content_view', {
    content_type: contentType,
    content_id: contentId,
    content_name: contentName,
  });
};

/**
 * Track user engagement in Firebase Analytics
 * @param {string} engagementType - Engagement type
 * @param {Object} params - Additional parameters
 */
export const trackFirebaseEngagement = (engagementType, params = {}) => {
  logFirebaseEvent('user_engagement', {
    engagement_type: engagementType,
    ...params,
  });
};

/**
 * Track search in Firebase Analytics
 * @param {string} searchTerm - Search term
 */
export const trackFirebaseSearch = (searchTerm) => {
  logFirebaseEvent('search', {
    search_term: searchTerm,
  });
};

/**
 * Track exception in Firebase Analytics
 * @param {string} description - Exception description
 * @param {boolean} fatal - Whether the exception was fatal
 */
export const trackFirebaseException = (description, fatal = false) => {
  logFirebaseEvent('exception', {
    description,
    fatal,
  });
};
