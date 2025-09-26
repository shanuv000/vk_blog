/**
 * Demo configuration for HeroSpotlight component
 * Use this for testing and development when real data is not available
 */

export const demoFeaturedPosts = [
  {
    slug: "revolutionizing-web-development-2024",
    title:
      "Revolutionizing Web Development: The Next Generation of React and Beyond",
    excerpt:
      "Explore the cutting-edge technologies and frameworks that are shaping the future of web development, from React 19 to AI-powered development tools.",
    createdAt: "2024-12-26T10:00:00Z",
    publishedAt: "2024-12-26T10:00:00Z",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      width: 2000,
      height: 1200,
    },
    categories: [
      { name: "Technology", slug: "technology" },
      { name: "Web Development", slug: "web-development" },
    ],
    author: {
      name: "Alex Thompson",
      photo: {
        url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    },
    content: {
      raw: {
        children: [
          {
            type: "paragraph",
            children: [
              {
                text: "The landscape of web development is evolving at an unprecedented pace. With the emergence of React 19, TypeScript 5.0, and AI-powered development tools, developers are equipped with more powerful technologies than ever before. This comprehensive guide explores the revolutionary changes that are reshaping how we build modern web applications, from component-based architectures to server-side rendering optimizations. We'll dive deep into the new features, performance improvements, and developer experience enhancements that are making web development more efficient, scalable, and enjoyable.",
              },
            ],
          },
        ],
      },
    },
  },
  {
    slug: "mastering-modern-css-grid-flexbox",
    title: "Mastering Modern CSS: Grid, Flexbox, and Container Queries",
    excerpt:
      "A comprehensive guide to modern CSS layout techniques and responsive design patterns that every developer should master.",
    createdAt: "2024-12-25T15:30:00Z",
    publishedAt: "2024-12-25T15:30:00Z",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      width: 2000,
      height: 1200,
    },
    categories: [
      { name: "CSS", slug: "css" },
      { name: "Design", slug: "design" },
    ],
    author: {
      name: "Sarah Chen",
      photo: {
        url: "https://images.unsplash.com/photo-1494790108755-2616b612b8c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    },
    content: {
      raw: {
        children: [
          {
            type: "paragraph",
            children: [
              {
                text: "Modern CSS has evolved far beyond simple styling. With powerful layout systems like CSS Grid and Flexbox, along with new responsive techniques like container queries, developers can create sophisticated, flexible layouts that adapt seamlessly across all device sizes.",
              },
            ],
          },
        ],
      },
    },
  },
  {
    slug: "ai-powered-development-tools-2024",
    title: "AI-Powered Development: How Machine Learning is Transforming Code",
    excerpt:
      "Discover how artificial intelligence is revolutionizing software development with intelligent code completion, automated testing, and more.",
    createdAt: "2024-12-24T09:15:00Z",
    publishedAt: "2024-12-24T09:15:00Z",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
      width: 2000,
      height: 1200,
    },
    categories: [
      { name: "AI", slug: "ai" },
      { name: "Development", slug: "development" },
    ],
    author: {
      name: "Marcus Rodriguez",
      photo: {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      },
    },
    content: {
      raw: {
        children: [
          {
            type: "paragraph",
            children: [
              {
                text: "Artificial Intelligence is no longer a futuristic concept in software development—it's here, and it's transforming how we write, test, and deploy code. From GitHub Copilot to automated bug detection systems, AI tools are becoming integral to modern development workflows.",
              },
            ],
          },
        ],
      },
    },
  },
];

export const demoConfig = {
  // Enable demo mode for development
  enableDemo: process.env.NODE_ENV === "development",

  // Demo settings
  autoRotate: true,
  rotateInterval: 8000, // 8 seconds

  // Animation settings
  parallaxIntensity: 0.5,
  animationDuration: 0.8,
  staggerDelay: 0.2,
};

// Helper function to get demo posts or real posts
export const getFeaturedPostsForDemo = (realPosts = []) => {
  // In development, use demo posts if no real posts available
  if (demoConfig.enableDemo && (!realPosts || realPosts.length === 0)) {
    console.log("🎭 Using demo featured posts for HeroSpotlight");
    return demoFeaturedPosts;
  }

  return realPosts;
};

// Generate dynamic demo content for testing
export const generateDemoPost = (index) => {
  const titles = [
    "Breaking: Revolutionary New Framework Announced",
    "The Future of Mobile Development is Here",
    "Cloud Computing: What's Next in 2024",
    "Cybersecurity Trends Every Developer Should Know",
    "Machine Learning for Frontend Developers",
  ];

  const categories = [
    { name: "Breaking News", slug: "breaking-news" },
    { name: "Mobile", slug: "mobile" },
    { name: "Cloud", slug: "cloud" },
    { name: "Security", slug: "security" },
    { name: "ML", slug: "machine-learning" },
  ];

  const authors = [
    "Emma Watson",
    "John Doe",
    "Sarah Kim",
    "Mike Johnson",
    "Lisa Chen",
  ];

  return {
    slug: `demo-post-${index}`,
    title: titles[index % titles.length],
    excerpt:
      "This is a demo post generated for testing the HeroSpotlight component with dynamic content.",
    createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    featuredImage: {
      url: `https://picsum.photos/2000/1200?random=${index}`,
      width: 2000,
      height: 1200,
    },
    categories: [categories[index % categories.length]],
    author: {
      name: authors[index % authors.length],
      photo: {
        url: `https://picsum.photos/400/400?random=${index + 100}`,
      },
    },
    content: {
      raw: {
        children: [
          {
            type: "paragraph",
            children: [
              {
                text: "This is demo content for testing purposes. In a real application, this would contain the full article content with rich text formatting, images, and other media elements.",
              },
            ],
          },
        ],
      },
    },
  };
};
