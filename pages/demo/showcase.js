import React from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import { HeroSpotlight, EnhancedFeaturedPostCard } from "../../components";

// Demo data for showcase
const demoHeroData = {
  featuredPost: {
    title: "The Future of Web Development: React 19 and Beyond",
    excerpt:
      "Exploring the cutting-edge features and performance improvements that will revolutionize how we build web applications in the modern era.",
    slug: "future-of-web-development-react-19",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    },
    author: {
      name: "Alex Thompson",
      photo: {
        url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      },
    },
    categories: [{ name: "Development" }, { name: "React" }],
    createdAt: "2024-01-15T10:00:00Z",
  },
  auxiliaryPosts: [
    {
      title: "Mastering TypeScript: Advanced Patterns and Best Practices",
      slug: "mastering-typescript-patterns",
      featuredImage: {
        url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
      },
      categories: [{ name: "TypeScript" }],
      author: { name: "Sarah Chen" },
      createdAt: "2024-01-14T10:00:00Z",
    },
    {
      title: "Building Scalable APIs with Node.js and GraphQL",
      slug: "scalable-apis-nodejs-graphql",
      featuredImage: {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2329&q=80",
      },
      categories: [{ name: "Backend" }],
      author: { name: "Mike Rodriguez" },
      createdAt: "2024-01-13T10:00:00Z",
    },
  ],
};

const demoFeaturedPosts = [
  {
    title: "Advanced CSS Grid Techniques for Modern Layouts",
    excerpt:
      "Discover powerful CSS Grid features that will transform your approach to creating responsive, flexible layouts for any design challenge.",
    slug: "advanced-css-grid-techniques",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2187&q=80",
    },
    author: {
      name: "Emma Johnson",
      photo: {
        url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80",
      },
    },
    categories: [{ name: "CSS" }, { name: "Design" }],
    createdAt: "2024-01-12T10:00:00Z",
  },
  {
    title: "Performance Optimization Strategies for React Applications",
    excerpt:
      "Learn proven techniques to make your React applications blazingly fast and provide an exceptional user experience.",
    slug: "react-performance-optimization",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2274&q=80",
    },
    author: {
      name: "David Kim",
      photo: {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80",
      },
    },
    categories: [{ name: "Performance" }, { name: "React" }],
    createdAt: "2024-01-11T10:00:00Z",
  },
  {
    title: "Modern Authentication with JWT and OAuth2",
    excerpt:
      "Implement secure, scalable authentication systems using industry-standard protocols and best practices.",
    slug: "modern-authentication-jwt-oauth2",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    },
    author: {
      name: "Lisa Zhang",
      photo: {
        url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      },
    },
    categories: [{ name: "Security" }, { name: "Authentication" }],
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    title: "Building Progressive Web Apps with Next.js",
    excerpt:
      "Create engaging, app-like experiences on the web with Next.js and modern PWA capabilities.",
    slug: "progressive-web-apps-nextjs",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80",
    },
    author: {
      name: "John Park",
      photo: {
        url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      },
    },
    categories: [{ name: "PWA" }, { name: "Next.js" }],
    createdAt: "2024-01-09T10:00:00Z",
  },
  {
    title: "Database Design Patterns for Scalable Applications",
    excerpt:
      "Master the art of designing databases that can handle millions of users and complex queries efficiently.",
    slug: "database-design-patterns",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2021&q=80",
    },
    author: {
      name: "Maria Santos",
      photo: {
        url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80",
      },
    },
    categories: [{ name: "Database" }, { name: "Architecture" }],
    createdAt: "2024-01-08T10:00:00Z",
  },
  {
    title: "Microservices Architecture: From Monolith to Distributed",
    excerpt:
      "Learn how to break down monolithic applications into efficient, maintainable microservices.",
    slug: "microservices-architecture-guide",
    featuredImage: {
      url: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2325&q=80",
    },
    author: {
      name: "Robert Taylor",
      photo: {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80",
      },
    },
    categories: [{ name: "Architecture" }, { name: "Microservices" }],
    createdAt: "2024-01-07T10:00:00Z",
  },
];

const ComponentShowcase = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <>
      <Head>
        <title>Enhanced Featured Posts Showcase | VK Blog</title>
        <meta
          name="description"
          content="Showcase of enhanced hero spotlight and featured post components with modern styling and animations."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"
      >
        {/* Header */}
        <motion.header
          variants={sectionVariants}
          className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-10"
        >
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-4xl font-bold text-gray-900 text-center">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Enhanced Featured Posts Showcase
              </span>
            </h1>
            <p className="text-gray-600 text-center mt-2 text-lg">
              Modern, responsive, and visually appealing components
            </p>
          </div>
        </motion.header>

        <div className="container mx-auto px-4 py-8 space-y-16">
          {/* Hero Spotlight Section */}
          <motion.section variants={sectionVariants} className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Hero Spotlight Component
              </h2>
              <p className="text-gray-600 text-lg">
                Dominant featured post with parallax effects and auxiliary posts
              </p>
            </div>

            <HeroSpotlight
              featuredPost={demoHeroData.featuredPost}
              auxiliaryPosts={demoHeroData.auxiliaryPosts}
              loading={false}
            />
          </motion.section>

          {/* Enhanced Featured Posts Grid */}
          <motion.section variants={sectionVariants} className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Enhanced Featured Post Cards
              </h2>
              <p className="text-gray-600 text-lg">
                Three variants: Large, Default, and Compact with advanced
                styling
              </p>
            </div>

            {/* Large Variant Demo */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-800">
                Large Variant
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {demoFeaturedPosts.slice(0, 2).map((post, index) => (
                  <EnhancedFeaturedPostCard
                    key={post.slug}
                    post={post}
                    index={index}
                    variant="large"
                  />
                ))}
              </div>
            </div>

            {/* Default Variant Demo */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-800">
                Default Variant
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {demoFeaturedPosts.slice(2, 5).map((post, index) => (
                  <EnhancedFeaturedPostCard
                    key={post.slug}
                    post={post}
                    index={index}
                    variant="default"
                  />
                ))}
              </div>
            </div>

            {/* Compact Variant Demo */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-gray-800">
                Compact Variant
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {demoFeaturedPosts.slice(1, 5).map((post, index) => (
                  <EnhancedFeaturedPostCard
                    key={post.slug}
                    post={post}
                    index={index}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          </motion.section>

          {/* Features Overview */}
          <motion.section
            variants={sectionVariants}
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-gray-200/50 shadow-lg"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Component Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Advanced Animations",
                  description:
                    "Framer Motion powered smooth transitions and parallax effects",
                  icon: "🎬",
                },
                {
                  title: "Responsive Design",
                  description:
                    "Mobile-first approach with desktop and mobile optimized layouts",
                  icon: "📱",
                },
                {
                  title: "Glass Morphism",
                  description:
                    "Modern glass-like effects with backdrop blur and transparency",
                  icon: "✨",
                },
                {
                  title: "Performance Optimized",
                  description:
                    "Optimized images, lazy loading, and efficient rendering",
                  icon: "⚡",
                },
                {
                  title: "Accessibility Ready",
                  description:
                    "ARIA labels, keyboard navigation, and screen reader friendly",
                  icon: "♿",
                },
                {
                  title: "Multiple Variants",
                  description:
                    "Large, default, and compact variants for different use cases",
                  icon: "🎨",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-3xl mb-3">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Footer */}
        <motion.footer
          variants={sectionVariants}
          className="bg-gray-900 text-white py-12 mt-16"
        >
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to enhance your blog?
            </h3>
            <p className="text-gray-300 text-lg">
              These components are now integrated into your OptimizedHomepage
              component
            </p>
          </div>
        </motion.footer>
      </motion.div>
    </>
  );
};

export default ComponentShowcase;
