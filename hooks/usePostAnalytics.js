import { useEffect } from 'react';
import useAnalytics from './useAnalytics';

/**
 * Custom hook for tracking post-related analytics
 * @param {Object} post - The post object
 * @returns {Object} - Analytics tracking functions specific to posts
 */
const usePostAnalytics = (post) => {
  const { 
    trackEvent, 
    trackContentInteraction, 
    trackSocialInteraction 
  } = useAnalytics();

  // Track post view on mount
  useEffect(() => {
    if (post?.slug) {
      trackContentInteraction('post', post.slug, 'view');
      
      // Track post metadata
      trackEvent('post_view', {
        post_id: post.slug,
        post_title: post.title,
        post_category: post.categories?.[0]?.name || 'Uncategorized',
        post_author: post.author?.name || 'Unknown',
        post_date: post.publishedAt || post.createdAt,
      });
    }
  }, [post, trackContentInteraction, trackEvent]);

  // Track post share
  const trackShare = (platform) => {
    if (post?.slug) {
      trackSocialInteraction(platform, 'share', post.slug);
      
      trackEvent('post_share', {
        post_id: post.slug,
        post_title: post.title,
        share_platform: platform,
      });
    }
  };

  // Track post comment
  const trackComment = () => {
    if (post?.slug) {
      trackContentInteraction('post', post.slug, 'comment');
      
      trackEvent('post_comment', {
        post_id: post.slug,
        post_title: post.title,
      });
    }
  };

  // Track related post click
  const trackRelatedPostClick = (relatedPostSlug, relatedPostTitle) => {
    if (post?.slug) {
      trackEvent('related_post_click', {
        source_post_id: post.slug,
        source_post_title: post.title,
        target_post_id: relatedPostSlug,
        target_post_title: relatedPostTitle,
      });
    }
  };

  // Track post category click
  const trackCategoryClick = (categorySlug, categoryName) => {
    trackEvent('category_click', {
      category_id: categorySlug,
      category_name: categoryName,
      source_post_id: post?.slug,
      source_post_title: post?.title,
    });
  };

  return {
    trackShare,
    trackComment,
    trackRelatedPostClick,
    trackCategoryClick,
  };
};

export default usePostAnalytics;
