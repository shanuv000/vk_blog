/**
 * Accessibility Audit Component
 * Runs accessibility checks and reports issues in development
 */

import { useEffect, useState } from 'react';

const AccessibilityAudit = () => {
  const [issues, setIssues] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const runAccessibilityAudit = () => {
      const foundIssues = [];

      // Check for images without alt text
      const images = document.querySelectorAll('img');
      images.forEach((img, index) => {
        if (!img.alt || img.alt.trim() === '') {
          foundIssues.push({
            type: 'Missing Alt Text',
            element: `Image ${index + 1}`,
            description: 'Image is missing alt text for screen readers',
            severity: 'high',
            src: img.src?.substring(0, 50) + '...',
          });
        }
      });

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button, index) => {
        const hasText = button.textContent?.trim();
        const hasAriaLabel = button.getAttribute('aria-label');
        const hasAriaLabelledBy = button.getAttribute('aria-labelledby');
        
        if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
          foundIssues.push({
            type: 'Button Missing Label',
            element: `Button ${index + 1}`,
            description: 'Button has no accessible name',
            severity: 'high',
            innerHTML: button.innerHTML?.substring(0, 50) + '...',
          });
        }
      });

      // Check for links without accessible names
      const links = document.querySelectorAll('a');
      links.forEach((link, index) => {
        const hasText = link.textContent?.trim();
        const hasAriaLabel = link.getAttribute('aria-label');
        const hasTitle = link.getAttribute('title');
        
        if (!hasText && !hasAriaLabel && !hasTitle) {
          foundIssues.push({
            type: 'Link Missing Label',
            element: `Link ${index + 1}`,
            description: 'Link has no accessible name',
            severity: 'medium',
            href: link.href?.substring(0, 50) + '...',
          });
        }
      });

      // Check for form inputs without labels
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input, index) => {
        const hasLabel = document.querySelector(`label[for="${input.id}"]`);
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
        const hasPlaceholder = input.getAttribute('placeholder');
        
        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !hasPlaceholder) {
          foundIssues.push({
            type: 'Input Missing Label',
            element: `${input.tagName} ${index + 1}`,
            description: 'Form input has no associated label',
            severity: 'high',
            type_attr: input.type || 'text',
          });
        }
      });

      // Check for headings hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      headings.forEach((heading, index) => {
        const currentLevel = parseInt(heading.tagName.charAt(1));
        
        if (currentLevel > previousLevel + 1) {
          foundIssues.push({
            type: 'Heading Hierarchy',
            element: `${heading.tagName} ${index + 1}`,
            description: `Heading level skipped from h${previousLevel} to h${currentLevel}`,
            severity: 'medium',
            text: heading.textContent?.substring(0, 50) + '...',
          });
        }
        
        previousLevel = currentLevel;
      });

      // Check for color contrast (basic check)
      const elementsWithText = document.querySelectorAll('p, span, div, a, button, h1, h2, h3, h4, h5, h6');
      elementsWithText.forEach((element, index) => {
        if (element.textContent?.trim()) {
          const styles = window.getComputedStyle(element);
          const backgroundColor = styles.backgroundColor;
          const color = styles.color;
          
          // Basic check for very light text on light background
          if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
            foundIssues.push({
              type: 'Color Contrast',
              element: `${element.tagName} ${index + 1}`,
              description: 'Potential color contrast issue detected',
              severity: 'medium',
              text: element.textContent?.substring(0, 30) + '...',
            });
          }
        }
      });

      // Check for focus indicators
      const focusableElements = document.querySelectorAll('a, button, input, textarea, select, [tabindex]');
      focusableElements.forEach((element, index) => {
        const styles = window.getComputedStyle(element, ':focus');
        const outline = styles.outline;
        const boxShadow = styles.boxShadow;
        
        if (outline === 'none' && boxShadow === 'none') {
          foundIssues.push({
            type: 'Missing Focus Indicator',
            element: `${element.tagName} ${index + 1}`,
            description: 'Element may not have visible focus indicator',
            severity: 'medium',
            tagName: element.tagName,
          });
        }
      });

      setIssues(foundIssues);
    };

    // Run audit after page loads
    const timer = setTimeout(runAccessibilityAudit, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Don't render in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return '🚨';
      case 'medium': return '⚠️';
      case 'low': return 'ℹ️';
      default: return '📝';
    }
  };

  if (issues.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors"
      >
        A11y Issues ({issues.length})
      </button>
      
      {isVisible && (
        <div className="absolute bottom-12 left-0 w-96 max-h-96 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-lg">Accessibility Issues</h3>
            <p className="text-sm text-gray-600">Found {issues.length} potential issues</p>
          </div>
          
          <div className="p-4 space-y-3">
            {issues.map((issue, index) => (
              <div key={index} className={`p-3 rounded-lg ${getSeverityColor(issue.severity)}`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{issue.type}</h4>
                    <p className="text-xs mt-1">{issue.description}</p>
                    <p className="text-xs mt-1 font-mono">
                      Element: {issue.element}
                    </p>
                    {issue.src && (
                      <p className="text-xs mt-1 font-mono">
                        Src: {issue.src}
                      </p>
                    )}
                    {issue.text && (
                      <p className="text-xs mt-1 font-mono">
                        Text: {issue.text}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-600">
              This audit runs only in development. Fix these issues before production deployment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityAudit;
