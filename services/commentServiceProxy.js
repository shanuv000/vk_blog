/**
 * Proxy-based implementation of comment service to avoid CORS issues
 * This uses our own API proxy instead of direct Firebase REST API calls
 * Production optimized version
 */

// Firebase project configuration - hardcoded for production
const FIREBASE_PROJECT_ID = 'urtechy-35294';
const FIREBASE_API_KEY = 'AIzaSyCgdl-5bF_gj07SwmWdCwVip1jVQSlzZ2w';
const COMMENTS_COLLECTION = 'comments';

// Cache for comments to reduce API calls
const commentsCache = new Map();
const CACHE_TTL = 60000; // 1 minute in milliseconds

// Helper function to log errors only in development
const logError = (message, error) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(message, error);
  }
};

/**
 * Add a new comment using our API proxy
 * @param {string} postSlug - The slug of the post
 * @param {string} name - The name of the commenter
 * @param {string} content - The comment content
 * @returns {Promise<object>} - The added comment with ID
 */
export const addComment = async (postSlug, name, content) => {
  try {
    // Input validation
    if (!postSlug) throw new Error("Post slug is required");
    if (!content || !content.trim()) throw new Error("Comment content is required");
    
    // Create a JavaScript Date for immediate display
    const jsDate = new Date();
    const timestamp = jsDate.toISOString();
    
    // Prepare the comment data
    const commentData = {
      postSlug,
      name: name?.trim() || "Anonymous",
      content: content.trim(),
      createdAtString: timestamp,
      createdAt: {
        // Firestore server timestamp format for REST API
        ".sv": "timestamp"
      }
    };
    
    // Prepare the request to our proxy
    const endpoint = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${COMMENTS_COLLECTION}?key=${FIREBASE_API_KEY}`;
    
    // Make the request to our proxy with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch('/api/firebase-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          method: 'POST',
          body: {
            fields: convertToFirestoreFields(commentData)
          }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Extract the document ID from the name field
      const pathParts = responseData.name.split('/');
      const documentId = pathParts[pathParts.length - 1];
      
      // Create the comment object
      const newComment = {
        id: documentId,
        postSlug,
        name: commentData.name,
        content: commentData.content,
        createdAt: jsDate,
      };
      
      // Invalidate cache for this post
      invalidateCache(postSlug);
      
      return newComment;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    logError("Error adding comment:", error);
    throw new Error(error.message || "Failed to add comment");
  }
};

/**
 * Get comments for a specific post using our API proxy
 * @param {string} postSlug - The slug of the post
 * @param {number} commentsPerPage - Number of comments to load per page (default: 10)
 * @returns {Promise<Array>} - Array of comments
 */
export const getCommentsByPostSlug = async (postSlug, commentsPerPage = 10) => {
  try {
    // Validate inputs
    if (!postSlug) {
      return [];
    }
    
    // Check cache first
    const cacheKey = `${postSlug}_${commentsPerPage}`;
    const cachedData = commentsCache.get(cacheKey);
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return cachedData.comments;
    }
    
    // Create a structured query for Firestore REST API
    const structuredQuery = {
      from: [{ collectionId: COMMENTS_COLLECTION }],
      where: {
        fieldFilter: {
          field: { fieldPath: "postSlug" },
          op: "EQUAL",
          value: { stringValue: postSlug }
        }
      },
      orderBy: [
        { field: { fieldPath: "createdAt" }, direction: "DESCENDING" }
      ],
      limit: commentsPerPage
    };
    
    // Prepare the request to our proxy
    const endpoint = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;
    
    // Make the request to our proxy with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch('/api/firebase-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          method: 'POST',
          body: { structuredQuery }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Process the results
      const comments = responseData
        .filter(item => item.document) // Filter out empty results
        .map(item => {
          const doc = item.document;
          const fields = doc.fields;
          
          // Extract the document ID from the name field
          const pathParts = doc.name.split('/');
          const documentId = pathParts[pathParts.length - 1];
          
          // Convert Firestore fields to JavaScript object
          const data = convertFromFirestoreFields(fields);
          
          return {
            id: documentId,
            ...data,
            // Convert timestamp to JavaScript Date
            createdAt: data.createdAt 
              ? new Date(data.createdAt) 
              : data.createdAtString 
                ? new Date(data.createdAtString) 
                : new Date()
          };
        });
      
      // Update cache
      commentsCache.set(cacheKey, {
        comments,
        timestamp: Date.now()
      });
      
      return comments;
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    logError("Error fetching comments:", error);
    return [];
  }
};

/**
 * Invalidate cache for a specific post
 * @param {string} postSlug - The slug of the post
 */
function invalidateCache(postSlug) {
  // Remove all cache entries for this post
  for (const key of commentsCache.keys()) {
    if (key.startsWith(postSlug + '_')) {
      commentsCache.delete(key);
    }
  }
}

// The rest of the utility functions remain the same
// These are used internally and don't need optimization

/**
 * Convert a JavaScript object to Firestore fields format for REST API
 */
function convertToFirestoreFields(data) {
  const fields = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      fields[key] = { integerValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (value instanceof Date) {
      fields[key] = { timestampValue: value.toISOString() };
    } else if (Array.isArray(value)) {
      fields[key] = { 
        arrayValue: { 
          values: value.map(item => convertToFirestoreValue(item)) 
        } 
      };
    } else if (typeof value === 'object') {
      if (value['.sv'] === 'timestamp') {
        fields[key] = { timestampValue: value };
      } else {
        fields[key] = { 
          mapValue: { 
            fields: convertToFirestoreFields(value) 
          } 
        };
      }
    }
  }
  
  return fields;
}

function convertToFirestoreValue(value) {
  if (value === null || value === undefined) {
    return { nullValue: null };
  } else if (typeof value === 'string') {
    return { stringValue: value };
  } else if (typeof value === 'number') {
    return { integerValue: value };
  } else if (typeof value === 'boolean') {
    return { booleanValue: value };
  } else if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  } else if (Array.isArray(value)) {
    return { 
      arrayValue: { 
        values: value.map(item => convertToFirestoreValue(item)) 
      } 
    };
  } else if (typeof value === 'object') {
    return { 
      mapValue: { 
        fields: convertToFirestoreFields(value) 
      } 
    };
  }
}

function convertFromFirestoreFields(fields) {
  const data = {};
  
  for (const [key, value] of Object.entries(fields)) {
    data[key] = convertFromFirestoreValue(value);
  }
  
  return data;
}

function convertFromFirestoreValue(value) {
  if (value.nullValue !== undefined) {
    return null;
  } else if (value.stringValue !== undefined) {
    return value.stringValue;
  } else if (value.integerValue !== undefined) {
    return Number(value.integerValue);
  } else if (value.doubleValue !== undefined) {
    return Number(value.doubleValue);
  } else if (value.booleanValue !== undefined) {
    return value.booleanValue;
  } else if (value.timestampValue !== undefined) {
    return new Date(value.timestampValue).toISOString();
  } else if (value.arrayValue !== undefined) {
    return (value.arrayValue.values || []).map(item => convertFromFirestoreValue(item));
  } else if (value.mapValue !== undefined) {
    return convertFromFirestoreFields(value.mapValue.fields || {});
  } else {
    return null;
  }
}
