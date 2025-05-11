# Blog Comment System

This document describes the implementation of the comment system for the blog.

## Overview

The comment system allows users to leave comments on blog posts without requiring authentication. It uses Firebase Firestore to store and retrieve comments.

## Implementation Details

### Components

- **Comments.jsx**: The main component that displays the comment form and list of comments
- **PostDetail.jsx**: Updated to include the Comments component

### Services

- **commentService.js**: Contains functions for interacting with Firebase Firestore:
  - `addComment`: Adds a new comment to Firestore
  - `getCommentsByPostSlug`: Retrieves comments for a specific post
  - `deleteComment`: Deletes a comment (not exposed in the UI)

### Firebase Configuration

The comment system uses the existing Firebase configuration in `lib/firebase.js`. Make sure your Firebase project has Firestore enabled.

### Data Structure

Comments are stored in a Firestore collection called `comments` with the following structure:

```
comments/
  {commentId}/
    postSlug: string  // The slug of the post
    name: string      // The name of the commenter (optional, defaults to "Anonymous")
    content: string   // The comment content
    createdAt: timestamp  // When the comment was created
```

## Security Rules

Firestore security rules are defined in `firestore.rules`:

- Anyone can read comments
- Anyone can create comments with validation:
  - Required fields: postSlug, name, content, createdAt
  - Content must not be empty
  - Content must not exceed 2000 characters
  - Name must not exceed 50 characters
- Updates and deletes are not allowed from the client

## Deployment

To deploy the security rules to Firebase:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase: `firebase init firestore`
4. Deploy rules: `firebase deploy --only firestore:rules`

## Future Improvements

Potential future improvements for the comment system:

1. Add admin authentication to allow comment moderation
2. Add reply functionality for nested comments
3. Add email notifications for new comments
4. Add spam detection
5. Add reactions/likes to comments
