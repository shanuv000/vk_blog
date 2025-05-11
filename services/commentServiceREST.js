/**
 * REST-based implementation of comment service to avoid CORS issues
 * This uses Firebase REST API instead of the WebChannel-based SDK
 */

// Firebase project configuration
const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'urtechy-35294';
const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCgdl-5bF_gj07SwmWdCwVip1jVQSlzZ2w';
const COMMENTS_COLLECTION = 'comments';

/**
 * Add a new comment using Firebase REST API
 * @param {string} postSlug - The slug of the post
 * @param {string} name - The name of the commenter
 * @param {string} content - The comment content
 * @returns {Promise<object>} - The added comment with ID
 */
export const addComment = async (postSlug, name, content) => {
  try {
    // Create a JavaScript Date for immediate display
    const jsDate = new Date();
    const timestamp = jsDate.toISOString();
    
    // Prepare the comment data
    const commentData = {
      postSlug,
      name: name.trim() || "Anonymous",
      content: content.trim(),
      createdAtString: timestamp,
      createdAt: {
        // Firestore server timestamp format for REST API
        ".sv": "timestamp"
      }
    };
    
    // Make the REST API call to add the document
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${COMMENTS_COLLECTION}?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: convertToFirestoreFields(commentData)
        }),
        // Important: Don't include credentials
        credentials: 'omit',
        mode: 'cors',
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    
    // Extract the document ID from the name field
    // Format: projects/{project_id}/databases/{database_id}/documents/{document_path}/{document_id}
    const pathParts = responseData.name.split('/');
    const documentId = pathParts[pathParts.length - 1];
    
    // Return the comment with an ID and a JavaScript Date object
    return {
      id: documentId,
      postSlug,
      name: commentData.name,
      content: commentData.content,
      createdAt: jsDate,
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment");
  }
};

/**
 * Get comments for a specific post using Firebase REST API
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
    
    // Make the REST API call to run the query
    const response = await fetch(
      `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ structuredQuery }),
        // Important: Don't include credentials
        credentials: 'omit',
        mode: 'cors',
      }
    );
    
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
    
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};

/**
 * Convert a JavaScript object to Firestore fields format for REST API
 * @param {object} data - The JavaScript object to convert
 * @returns {object} - The Firestore fields object
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
        // Handle server timestamp
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

/**
 * Convert a single value to Firestore value format for REST API
 * @param {any} value - The value to convert
 * @returns {object} - The Firestore value object
 */
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

/**
 * Convert Firestore fields format to JavaScript object
 * @param {object} fields - The Firestore fields object
 * @returns {object} - The JavaScript object
 */
function convertFromFirestoreFields(fields) {
  const data = {};
  
  for (const [key, value] of Object.entries(fields)) {
    data[key] = convertFromFirestoreValue(value);
  }
  
  return data;
}

/**
 * Convert a single Firestore value to JavaScript value
 * @param {object} value - The Firestore value object
 * @returns {any} - The JavaScript value
 */
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
