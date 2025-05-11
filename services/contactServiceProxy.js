/**
 * Proxy-based implementation of contact service to avoid CORS issues
 * This uses our own API proxy instead of direct Firebase REST API calls
 */

// Firebase project configuration
const FIREBASE_PROJECT_ID =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "urtechy-35294";
const FIREBASE_API_KEY =
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
  "AIzaSyCgdl-5bF_gj07SwmWdCwVip1jVQSlzZ2w";
const CONTACTS_COLLECTION = "contacts";

// Helper function to log errors only in development
const logError = (message, error) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(message, error);
  }
};

/**
 * Submit contact form data using our API proxy
 * @param {object} formData - The form data to submit
 * @returns {Promise<object>} - The response data
 */
export const submitContactForm = async (formData) => {
  try {
    // Add timestamp and source fields
    const contactData = {
      ...formData,
      fullName: `${formData.firstName} ${formData.lastName}`,
      timestamp: {
        // Firestore server timestamp format for REST API
        ".sv": "timestamp",
      },
      source: "contact_form",
      submittedAt: new Date().toISOString(),
    };

    // Prepare the request to our proxy
    const endpoint = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${CONTACTS_COLLECTION}?key=${FIREBASE_API_KEY}`;

    // Make the request to our proxy
    const response = await fetch("/api/firebase-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint,
        method: "POST",
        body: {
          fields: convertToFirestoreFields(contactData),
        },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to submit form: ${response.status} ${response.statusText}`
      );
    }

    const responseData = await response.json();

    // Extract the document ID from the name field
    // Format: projects/{project_id}/databases/{database_id}/documents/{document_path}/{document_id}
    const pathParts = responseData.name.split("/");
    const documentId = pathParts[pathParts.length - 1];

    return {
      success: true,
      id: documentId,
      message: "Form submitted successfully",
    };
  } catch (error) {
    logError("Error submitting contact form:", error);
    throw new Error("Failed to submit contact form");
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
    } else if (typeof value === "string") {
      fields[key] = { stringValue: value };
    } else if (typeof value === "number") {
      fields[key] = { integerValue: value };
    } else if (typeof value === "boolean") {
      fields[key] = { booleanValue: value };
    } else if (value instanceof Date) {
      fields[key] = { timestampValue: value.toISOString() };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((item) => convertToFirestoreValue(item)),
        },
      };
    } else if (typeof value === "object") {
      if (value[".sv"] === "timestamp") {
        // Handle server timestamp
        fields[key] = { timestampValue: value };
      } else {
        fields[key] = {
          mapValue: {
            fields: convertToFirestoreFields(value),
          },
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
  } else if (typeof value === "string") {
    return { stringValue: value };
  } else if (typeof value === "number") {
    return { integerValue: value };
  } else if (typeof value === "boolean") {
    return { booleanValue: value };
  } else if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  } else if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => convertToFirestoreValue(item)),
      },
    };
  } else if (typeof value === "object") {
    return {
      mapValue: {
        fields: convertToFirestoreFields(value),
      },
    };
  }
}
