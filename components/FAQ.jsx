import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { HiSparkles, HiLightBulb } from "react-icons/hi2";
import Head from "next/head";

/**
 * Premium FAQ Component with Glassmorphic UI
 * Features: Smooth accordion, SEO schema, SSR support
 * 
 * Now reads FAQs directly from post.faQs (stored in Hygraph)
 * If no FAQs exist, triggers generation via API
 * 
 * FIXED: Removed conflicting animations to prevent flickering
 */
const FAQ = ({ post }) => {
  // Handle both array and null cases for faQs
  const postFaqs = useMemo(() => 
    Array.isArray(post?.faQs) ? post.faQs : [], 
    [post?.faQs]
  );
  
  const [faqs, setFaqs] = useState(postFaqs);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Extract plain text from post content for API
  const getContentText = useCallback(() => {
    if (!post?.content?.raw) return "";
    
    try {
      // Handle both object and string content
      const raw = typeof post.content.raw === "string" 
        ? JSON.parse(post.content.raw) 
        : post.content.raw;
      
      // Extract text from Hygraph rich text format
      const extractText = (node) => {
        if (!node) return "";
        if (typeof node === "string") return node;
        if (node.text) return node.text;
        if (node.children) return node.children.map(extractText).join(" ");
        return "";
      };
      
      if (Array.isArray(raw.children)) {
        return raw.children.map(extractText).join(" ").slice(0, 2000);
      }
      return "";
    } catch {
      return "";
    }
  }, [post?.content?.raw]);

  // Generate FAQs if none exist in Hygraph
  useEffect(() => {
    // If FAQs already exist from Hygraph, use them
    if (postFaqs.length > 0) {
      setFaqs(postFaqs);
      return;
    }

    // No FAQs exist - trigger generation
    if (!post?.slug || !post?.title || isGenerating) {
      return;
    }

    let isMounted = true;
    setIsGenerating(true);

    const generateFAQs = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/generate-faq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || "",
            content: getContentText(),
          }),
        });

        if (!isMounted) return;

        const data = await response.json();
        
        if (data.faqs && data.faqs.length > 0) {
          setFaqs(data.faqs);
        } else {
          setError("No FAQs generated");
        }
      } catch (err) {
        if (isMounted) {
          console.error("[FAQ] Error generating:", err);
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setIsGenerating(false);
        }
      }
    };

    generateFAQs();

    return () => {
      isMounted = false;
    };
  }, [post?.slug, post?.title, post?.excerpt, postFaqs.length, isGenerating, getContentText]);

  // Generate FAQ Schema for SEO
  const faqSchema = useMemo(() => {
    if (!faqs || faqs.length === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
  }, [faqs]);

  // Toggle FAQ expansion - memoized to prevent recreation
  const toggleFaq = useCallback((index) => {
    setExpandedIndex(prev => prev === index ? null : index);
  }, []);

  // Loading skeleton - only show when generating new FAQs
  if (loading && faqs.length === 0) {
    return (
      <section className="mt-12 mb-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-5 sm:h-6 w-40 sm:w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-3 sm:mb-4">
              <div className="h-10 sm:h-12 bg-gray-100 rounded-xl animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Don't render if no FAQs
  if (error || !faqs || faqs.length === 0) {
    return null;
  }

  return (
    <>
      {/* FAQ Schema for SEO */}
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqSchema),
          }}
        />
      </Head>

      <section className="mt-12 sm:mt-16 mb-8">
        {/* Premium Glassmorphic Container - No animation to prevent flickering */}
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,250,251,0.95) 100%)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255,255,255,0.5)",
          }}
        >
          {/* Gradient Border Effect */}
          <div 
            className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(236, 72, 153, 0.1) 100%)",
              padding: "1px",
              mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              maskComposite: "xor",
              WebkitMaskComposite: "xor",
            }}
          />

          <div className="p-4 sm:p-6 md:p-8">
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <HiSparkles className="text-white text-sm sm:text-lg" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <HiLightBulb className="text-gray-400" />
                  <span>AI-generated based on article content</span>
                </p>
              </div>
            </div>

            {/* FAQ Items - No staggered animation */}
            <div className="space-y-2 sm:space-y-3">
              {faqs.map((faq, index) => {
                const isExpanded = expandedIndex === index;
                
                return (
                  <div key={`faq-${index}`}>
                    <button
                      onClick={() => toggleFaq(index)}
                      className={`w-full text-left p-3 sm:p-4 md:p-5 rounded-xl sm:rounded-2xl group ${
                        isExpanded
                          ? "bg-white shadow-lg ring-1 ring-gray-100"
                          : "bg-gray-50/50 hover:bg-white hover:shadow-md"
                      }`}
                      aria-expanded={isExpanded}
                      style={{ transition: "background-color 0.2s ease, box-shadow 0.2s ease" }}
                    >
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <span 
                          className={`font-semibold text-sm sm:text-base leading-relaxed ${
                            isExpanded ? "text-indigo-600" : "text-gray-900"
                          }`}
                          style={{ transition: "color 0.2s ease" }}
                        >
                          {faq.question}
                        </span>
                        <div
                          className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                            isExpanded
                              ? "bg-indigo-100 text-indigo-600"
                              : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                          }`}
                          style={{ 
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s ease, background-color 0.2s ease, color 0.2s ease"
                          }}
                        >
                          <FaChevronDown className="text-[10px] sm:text-xs" />
                        </div>
                      </div>

                      {/* Answer - CSS-based animation instead of Framer Motion */}
                      <div
                        className="overflow-hidden"
                        style={{
                          maxHeight: isExpanded ? "500px" : "0px",
                          opacity: isExpanded ? 1 : 0,
                          transition: "max-height 0.3s ease-out, opacity 0.2s ease-out"
                        }}
                      >
                        <p className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 text-sm sm:text-base text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default FAQ;
