/**
 * SEO Audit Component
 * Analyzes page SEO and provides recommendations
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const SEOAudit = () => {
  const [seoData, setSeoData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const analyzeSEO = () => {
      const analysis = {
        title: analyzeTitle(),
        description: analyzeDescription(),
        headings: analyzeHeadings(),
        images: analyzeImages(),
        links: analyzeLinks(),
        structuredData: analyzeStructuredData(),
        openGraph: analyzeOpenGraph(),
        twitter: analyzeTwitter(),
        canonical: analyzeCanonical(),
        performance: analyzePerformance(),
        score: 0,
        issues: [],
        recommendations: [],
      };

      // Calculate overall score
      analysis.score = calculateSEOScore(analysis);
      
      setSeoData(analysis);
    };

    // Run analysis after page loads
    const timer = setTimeout(analyzeSEO, 2000);
    return () => clearTimeout(timer);
  }, [router.asPath]);

  const analyzeTitle = () => {
    const title = document.title;
    const length = title.length;
    
    return {
      content: title,
      length,
      isOptimal: length >= 30 && length <= 60,
      issues: length < 30 ? ['Title too short'] : length > 60 ? ['Title too long'] : [],
    };
  };

  const analyzeDescription = () => {
    const metaDesc = document.querySelector('meta[name="description"]');
    const content = metaDesc?.getAttribute('content') || '';
    const length = content.length;
    
    return {
      content,
      length,
      exists: !!metaDesc,
      isOptimal: length >= 120 && length <= 160,
      issues: !metaDesc ? ['Missing meta description'] : 
              length < 120 ? ['Description too short'] : 
              length > 160 ? ['Description too long'] : [],
    };
  };

  const analyzeHeadings = () => {
    const h1s = document.querySelectorAll('h1');
    const h2s = document.querySelectorAll('h2');
    const h3s = document.querySelectorAll('h3');
    
    return {
      h1Count: h1s.length,
      h2Count: h2s.length,
      h3Count: h3s.length,
      hasH1: h1s.length > 0,
      multipleH1: h1s.length > 1,
      issues: h1s.length === 0 ? ['Missing H1 tag'] : 
              h1s.length > 1 ? ['Multiple H1 tags found'] : [],
    };
  };

  const analyzeImages = () => {
    const images = document.querySelectorAll('img');
    const imagesWithoutAlt = Array.from(images).filter(img => !img.alt);
    
    return {
      total: images.length,
      withoutAlt: imagesWithoutAlt.length,
      altOptimization: ((images.length - imagesWithoutAlt.length) / images.length) * 100 || 0,
      issues: imagesWithoutAlt.length > 0 ? [`${imagesWithoutAlt.length} images missing alt text`] : [],
    };
  };

  const analyzeLinks = () => {
    const links = document.querySelectorAll('a');
    const externalLinks = Array.from(links).filter(link => 
      link.href && !link.href.includes(window.location.hostname)
    );
    const linksWithoutRel = externalLinks.filter(link => 
      !link.getAttribute('rel')?.includes('noopener')
    );
    
    return {
      total: links.length,
      external: externalLinks.length,
      withoutNoopener: linksWithoutRel.length,
      issues: linksWithoutRel.length > 0 ? 
        [`${linksWithoutRel.length} external links missing rel="noopener"`] : [],
    };
  };

  const analyzeStructuredData = () => {
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    const schemas = [];
    
    jsonLdScripts.forEach(script => {
      try {
        const data = JSON.parse(script.textContent);
        schemas.push(data['@type'] || 'Unknown');
      } catch (e) {
        // Invalid JSON-LD
      }
    });
    
    return {
      count: jsonLdScripts.length,
      schemas,
      hasArticle: schemas.includes('Article'),
      hasWebsite: schemas.includes('WebSite'),
      hasBreadcrumb: schemas.includes('BreadcrumbList'),
      issues: jsonLdScripts.length === 0 ? ['No structured data found'] : [],
    };
  };

  const analyzeOpenGraph = () => {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    
    return {
      hasTitle: !!ogTitle,
      hasDescription: !!ogDescription,
      hasImage: !!ogImage,
      hasUrl: !!ogUrl,
      issues: [
        !ogTitle && 'Missing og:title',
        !ogDescription && 'Missing og:description',
        !ogImage && 'Missing og:image',
        !ogUrl && 'Missing og:url',
      ].filter(Boolean),
    };
  };

  const analyzeTwitter = () => {
    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    
    return {
      hasCard: !!twitterCard,
      hasTitle: !!twitterTitle,
      hasDescription: !!twitterDescription,
      hasImage: !!twitterImage,
      issues: [
        !twitterCard && 'Missing twitter:card',
        !twitterTitle && 'Missing twitter:title',
        !twitterDescription && 'Missing twitter:description',
        !twitterImage && 'Missing twitter:image',
      ].filter(Boolean),
    };
  };

  const analyzeCanonical = () => {
    const canonical = document.querySelector('link[rel="canonical"]');
    
    return {
      exists: !!canonical,
      url: canonical?.href || '',
      issues: !canonical ? ['Missing canonical URL'] : [],
    };
  };

  const analyzePerformance = () => {
    const performanceEntries = performance.getEntriesByType('navigation')[0];
    
    return {
      loadTime: Math.round(performanceEntries?.loadEventEnd || 0),
      domContentLoaded: Math.round(performanceEntries?.domContentLoadedEventEnd || 0),
      issues: performanceEntries?.loadEventEnd > 3000 ? ['Slow page load time'] : [],
    };
  };

  const calculateSEOScore = (analysis) => {
    let score = 100;
    
    // Deduct points for issues
    Object.values(analysis).forEach(section => {
      if (section.issues) {
        score -= section.issues.length * 5;
      }
    });
    
    return Math.max(0, score);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Don't render in production
  if (process.env.NODE_ENV !== 'development' || !seoData) {
    return null;
  }

  const allIssues = Object.values(seoData).reduce((acc, section) => {
    if (section.issues) {
      acc.push(...section.issues);
    }
    return acc;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`px-4 py-2 rounded-lg shadow-lg transition-colors ${getScoreColor(seoData.score)}`}
      >
        SEO Score: {seoData.score}/100
      </button>
      
      {isVisible && (
        <div className="absolute top-12 right-0 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-lg">SEO Analysis</h3>
            <p className="text-sm text-gray-600">
              Score: {seoData.score}/100 | Issues: {allIssues.length}
            </p>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Title Analysis */}
            <div>
              <h4 className="font-semibold text-sm">Title ({seoData.title.length} chars)</h4>
              <p className="text-xs text-gray-600 truncate">{seoData.title.content}</p>
              {seoData.title.issues.map((issue, i) => (
                <p key={i} className="text-xs text-red-600">⚠️ {issue}</p>
              ))}
            </div>
            
            {/* Description Analysis */}
            <div>
              <h4 className="font-semibold text-sm">Description ({seoData.description.length} chars)</h4>
              <p className="text-xs text-gray-600 truncate">{seoData.description.content}</p>
              {seoData.description.issues.map((issue, i) => (
                <p key={i} className="text-xs text-red-600">⚠️ {issue}</p>
              ))}
            </div>
            
            {/* Images Analysis */}
            <div>
              <h4 className="font-semibold text-sm">Images</h4>
              <p className="text-xs text-gray-600">
                {seoData.images.total} total, {seoData.images.withoutAlt} missing alt
              </p>
              {seoData.images.issues.map((issue, i) => (
                <p key={i} className="text-xs text-red-600">⚠️ {issue}</p>
              ))}
            </div>
            
            {/* Structured Data */}
            <div>
              <h4 className="font-semibold text-sm">Structured Data</h4>
              <p className="text-xs text-gray-600">
                {seoData.structuredData.count} schemas: {seoData.structuredData.schemas.join(', ')}
              </p>
              {seoData.structuredData.issues.map((issue, i) => (
                <p key={i} className="text-xs text-red-600">⚠️ {issue}</p>
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600">
              SEO audit for development. Fix issues before production.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOAudit;
