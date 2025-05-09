// Next.js API route for diagnosing post rendering issues
// This provides a way to test if a post can be fetched and processed correctly

import { getPostDetails } from "../../services";
import { ensureValidContent, processPostContent } from "../../utils/postValidation";

export default async function handler(req, res) {
  // Set CORS headers to allow requests from specific domains
  const allowedOrigins = [
    'https://blog.urtechy.com',
    'https://urtechy.com',
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Get the slug from the query parameter
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ message: "Slug parameter is required" });
  }

  try {
    // Record the start time for performance measurement
    const startTime = Date.now();
    
    // Try multiple approaches to fetch the post data
    const diagnostics = {
      slug,
      timestamp: new Date().toISOString(),
      attempts: [],
      success: false,
      data: null,
      processingTime: 0
    };

    // Attempt 1: Standard getPostDetails function
    try {
      console.log(`[post-diagnostics] Attempt 1: Using standard getPostDetails for ${slug}`);
      const data = await getPostDetails(slug);
      
      diagnostics.attempts.push({
        method: "standard",
        success: !!data,
        time: Date.now() - startTime
      });
      
      if (data) {
        diagnostics.success = true;
        diagnostics.data = {
          title: data.title,
          excerpt: data.excerpt?.substring(0, 100) + (data.excerpt?.length > 100 ? '...' : ''),
          hasContent: !!data.content,
          contentType: data.content ? Object.keys(data.content).join(', ') : 'none',
          hasFeaturedImage: !!data.featuredImage,
          hasAuthor: !!data.author,
          categoriesCount: data.categories?.length || 0,
          createdAt: data.createdAt,
          publishedAt: data.publishedAt
        };
        
        // Try to process the content to see if it works
        try {
          const validContent = ensureValidContent(data);
          const processedContent = processPostContent(validContent);
          
          diagnostics.contentProcessing = {
            validationSuccess: true,
            processingSuccess: true
          };
        } catch (processingError) {
          diagnostics.contentProcessing = {
            validationSuccess: false,
            processingSuccess: false,
            error: processingError.message
          };
        }
      }
    } catch (error) {
      diagnostics.attempts.push({
        method: "standard",
        success: false,
        error: error.message,
        time: Date.now() - startTime
      });
    }

    // If standard method failed, try direct API call
    if (!diagnostics.success) {
      try {
        console.log(`[post-diagnostics] Attempt 2: Using direct API call for ${slug}`);
        const { gql, fetchFromCDN } = require("../../services/hygraph");
        
        const directQuery = gql`
          query GetPostDirectly($slug: String!) {
            post(where: { slug: $slug }) {
              title
              excerpt
              featuredImage {
                url
              }
              content {
                raw
              }
            }
          }
        `;
        
        const result = await fetchFromCDN(directQuery, { slug });
        
        diagnostics.attempts.push({
          method: "direct",
          success: !!result?.post,
          time: Date.now() - startTime
        });
        
        if (result?.post) {
          diagnostics.success = true;
          diagnostics.data = {
            title: result.post.title,
            excerpt: result.post.excerpt?.substring(0, 100) + (result.post.excerpt?.length > 100 ? '...' : ''),
            hasContent: !!result.post.content,
            contentType: result.post.content ? Object.keys(result.post.content).join(', ') : 'none',
            hasFeaturedImage: !!result.post.featuredImage,
            directApiSuccess: true
          };
        }
      } catch (error) {
        diagnostics.attempts.push({
          method: "direct",
          success: false,
          error: error.message,
          time: Date.now() - startTime
        });
      }
    }

    // Record total processing time
    diagnostics.processingTime = Date.now() - startTime;
    
    // Return the diagnostics
    return res.status(200).json(diagnostics);
  } catch (error) {
    return res.status(500).json({
      slug,
      timestamp: new Date().toISOString(),
      error: true,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
}
