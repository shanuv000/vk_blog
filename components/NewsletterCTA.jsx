import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";

/**
 * Newsletter CTA Component
 * Engagement section for email signup
 */
const NewsletterCTA = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || isLoading) {
      return;
    }

    setIsLoading(true);
    
    // Simulate submission - in production, connect to your email service
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsLoading(false);
    setEmail("");
  };

  if (isSubmitted) {
    return (
      <section className="my-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 border border-primary/20"
        >
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
              <FaPaperPlane className="text-primary text-2xl" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-3">
              Thanks for subscribing! 🎉
            </h3>
            <p className="text-text-secondary">
              You&apos;ll receive the latest tech news and insights in your inbox.
            </p>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="my-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 border border-border hover:border-primary/30 transition-colors duration-300"
      >
        <div className="max-w-2xl mx-auto text-center">
          {/* Icon */}
          <div className="w-14 h-14 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
            <FaEnvelope className="text-primary text-xl" />
          </div>

          {/* Heading */}
          <h3 className="text-2xl md:text-3xl font-heading font-bold text-text-primary mb-3">
            Stay Updated
          </h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Get the latest tech news, tutorials, and insights delivered straight to your inbox.
          </p>

          {/* Form */}
          <form 
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-lg bg-secondary border border-border text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
              aria-label="Email address"
            />
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Subscribe</span>
                  <FaPaperPlane className="text-sm" />
                </>
              )}
            </motion.button>
          </form>

          {/* Privacy note */}
          <p className="text-xs text-text-tertiary mt-4">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default NewsletterCTA;
