# Sentry Usage Quick Reference

## 🚨 Capturing Errors Manually

### Basic Error Capture
```javascript
import * as Sentry from "@sentry/nextjs";

try {
  // Your code
} catch (error) {
  Sentry.captureException(error);
}
```

### Capture with Context
```javascript
Sentry.captureException(error, {
  tags: {
    section: "blog-post",
    action: "load"
  },
  extra: {
    postId: post.id,
    category: post.category
  },
  level: "error" // or "warning", "info", "debug"
});
```

### Capture Messages
```javascript
// For non-error logging
Sentry.captureMessage("User performed action", {
  level: "info",
  tags: { action: "subscribe" }
});
```

## 👤 Adding User Context

```javascript
// Set user information (useful for tracking who experiences errors)
Sentry.setUser({
  id: "user-123",
  username: "john_doe",
  // Only if you enable PII:
  // email: "john@example.com"
});

// Clear user
Sentry.setUser(null);
```

## 🏷️ Adding Tags

```javascript
// Tags are searchable in Sentry
Sentry.setTag("page", "blog-post");
Sentry.setTag("category", category);

// Set multiple tags
Sentry.setTags({
  page: "home",
  feature: "carousel"
});
```

## 📊 Adding Context

```javascript
// Extra context for debugging
Sentry.setContext("blog_post", {
  id: post.id,
  title: post.title,
  author: post.author,
  publishedAt: post.publishedAt
});

// Multiple contexts
Sentry.setContext("user_preferences", {
  theme: "dark",
  language: "en"
});
```

## 🍞 Breadcrumbs (Track User Journey)

```javascript
// Automatically added for most actions, but you can add custom ones
Sentry.addBreadcrumb({
  category: "blog",
  message: "User viewed post",
  level: "info",
  data: {
    postId: post.id,
    title: post.title
  }
});
```

## ⏱️ Performance Monitoring

### Manual Transactions
```javascript
import * as Sentry from "@sentry/nextjs";

// Start a transaction
const transaction = Sentry.startTransaction({
  name: "Load Blog Posts",
  op: "function"
});

try {
  // Your code
  const posts = await fetchPosts();
  
  // Optional: Add spans for sub-operations
  const span = transaction.startChild({
    op: "db",
    description: "Fetch posts from API"
  });
  
  // ... operation
  
  span.finish();
} catch (error) {
  transaction.setStatus("internal_error");
  throw error;
} finally {
  transaction.finish();
}
```

### Simpler Performance Tracking
```javascript
import { withSentrySpan } from "@sentry/nextjs";

const result = await withSentrySpan({
  name: "fetch-blog-posts",
  op: "http.client"
}, async () => {
  return await fetch('/api/posts');
});
```

## 🔍 API Route Error Handling

```javascript
// pages/api/posts.js
import * as Sentry from "@sentry/nextjs";

export default async function handler(req, res) {
  try {
    const posts = await getPosts();
    res.status(200).json(posts);
  } catch (error) {
    // Capture error
    Sentry.captureException(error, {
      tags: { api_route: "posts" },
      extra: { method: req.method, query: req.query }
    });
    
    res.status(500).json({ error: "Internal Server Error" });
  }
}
```

## ⚛️ React Error Boundaries

Sentry automatically creates an error boundary, but you can also create custom ones:

```javascript
import * as Sentry from "@sentry/nextjs";
import { ErrorBoundary } from "@sentry/nextjs";

function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary
      fallback={({ error, componentStack, resetError }) => (
        <div>
          <h1>An error occurred</h1>
          <button onClick={resetError}>Try again</button>
        </div>
      )}
      showDialog={false}
      onError={(error, errorInfo) => {
        // Custom error handling
        console.error("Error boundary caught:", error);
      }}
    >
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
```

## 🎯 Filtering Errors Before Sending

Already configured in `instrumentation-client.ts`, but you can add more:

```javascript
Sentry.init({
  // ... other config
  beforeSend(event, hint) {
    // Don't send errors from certain URLs
    if (event.request?.url?.includes('/admin')) {
      return null;
    }
    
    // Modify error before sending
    if (event.exception) {
      // Remove sensitive data
      delete event.request?.cookies;
    }
    
    return event;
  }
});
```

## 📍 Common Use Cases

### 1. GraphQL Errors
```javascript
import * as Sentry from "@sentry/nextjs";

async function fetchGraphQL(query, variables) {
  try {
    const response = await client.query({ query, variables });
    return response.data;
  } catch (error) {
    Sentry.captureException(error, {
      tags: { 
        source: "graphql",
        query_name: query.definitions[0]?.name?.value 
      },
      extra: { 
        variables,
        graphQLErrors: error.graphQLErrors 
      }
    });
    throw error;
  }
}
```

### 2. Failed Image Loads
```javascript
<Image
  src={post.image.url}
  alt={post.title}
  onError={(e) => {
    Sentry.captureMessage("Image failed to load", {
      level: "warning",
      tags: { type: "image_error" },
      extra: { 
        src: e.target.src,
        alt: e.target.alt 
      }
    });
  }}
/>
```

### 3. Failed API Calls
```javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    Sentry.captureException(error, {
      tags: { 
        api: "external",
        status: error.message 
      },
      extra: { url }
    });
    throw error;
  }
}
```

### 4. Form Submission Errors
```javascript
const handleSubmit = async (formData) => {
  try {
    await submitForm(formData);
  } catch (error) {
    Sentry.captureException(error, {
      tags: { 
        form: "newsletter",
        action: "submit" 
      },
      extra: { 
        email: formData.email // Only if PII is enabled
      }
    });
    
    // Show error to user
    setError("Failed to submit form");
  }
};
```

## 🧪 Testing Sentry Integration

### Test Error Button (Development)
```javascript
import * as Sentry from "@sentry/nextjs";

export default function TestPage() {
  return (
    <div>
      <button onClick={() => {
        throw new Error("Sentry Test Error");
      }}>
        Throw Error
      </button>
      
      <button onClick={() => {
        Sentry.captureMessage("Test message");
      }}>
        Send Message
      </button>
      
      <button onClick={async () => {
        try {
          throw new Error("Async error test");
        } catch (error) {
          Sentry.captureException(error);
        }
      }}>
        Test Async Error
      </button>
    </div>
  );
}
```

## 🔕 Disabling Sentry in Specific Components

```javascript
import * as Sentry from "@sentry/nextjs";

function MyComponent() {
  const handleAction = () => {
    // Temporarily disable Sentry
    const client = Sentry.getCurrentHub().getClient();
    const options = client?.getOptions();
    const originalEnabled = options?.enabled;
    
    if (options) {
      options.enabled = false;
    }
    
    try {
      // Code that shouldn't report to Sentry
      performAction();
    } finally {
      // Re-enable
      if (options) {
        options.enabled = originalEnabled;
      }
    }
  };
}
```

## 📈 Best Practices

1. **Always add context**: Use tags, extra data, and breadcrumbs
2. **Don't over-capture**: Not every error needs to be sent
3. **Use appropriate levels**: `error`, `warning`, `info`, `debug`
4. **Test in development**: Check console logs before deploying
5. **Monitor quota**: Keep an eye on your Sentry usage
6. **Clean up PII**: Don't send sensitive user data
7. **Group similar errors**: Use tags to make errors searchable

## 🚫 What NOT to Do

❌ Don't capture expected errors (404s, validation errors)
❌ Don't send PII without user consent
❌ Don't capture in tight loops
❌ Don't ignore error context
❌ Don't set high sample rates on free tier

## 📚 More Resources

- [Sentry JavaScript SDK](https://docs.sentry.io/platforms/javascript/)
- [Next.js Specific Features](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/performance/)

---

**Quick Tip**: In development, all Sentry events are logged to console but not sent to Sentry. This helps you test without using your quota!
