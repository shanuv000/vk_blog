import React, { useState } from "react";

/**
 * RecentUpdates Component
 * Displays AI-generated updates at the top of blog posts with premium UI
 *
 * @param {Array} updates - Array of update objects with { text, timestamp }
 */
const RecentUpdates = ({ updates }) => {
  const [showAll, setShowAll] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't render if no updates
  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return null;
  }

  const latestUpdate = updates[0];
  const previousUpdates = updates.slice(1);

  // Format date as relative time (e.g., "2 hours ago", "3 days ago")
  const formatRelativeTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);

      if (diffInSeconds < 60) {
        return "Just now";
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? "day" : "days"} ago`;
      } else if (diffInSeconds < 2592000) {
        const weeks = Math.floor(diffInSeconds / 604800);
        return `${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
      } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} ${months === 1 ? "month" : "months"} ago`;
      } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years} ${years === 1 ? "year" : "years"} ago`;
      }
    } catch {
      return "Recently";
    }
  };

  // Clean citation brackets from text (e.g., [1], [2], [3])
  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/\[\d+\]/g, "")
      .replace(/\[\d+,\s*\d+\]/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  };

  // Parse markdown formatting and return React elements
  const parseMarkdown = (text) => {
    if (!text) return null;
    
    const elements = [];
    let remaining = text;
    let keyIndex = 0;

    // Process text with regex to find markdown patterns
    while (remaining.length > 0) {
      // Find the first occurrence of any markdown pattern
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
      const codeMatch = remaining.match(/`([^`]+)`/);
      
      // Determine which pattern comes first
      let firstMatch = null;
      let matchType = null;
      
      const patterns = [
        { match: boldMatch, type: 'bold', tag: 'strong' },
        { match: italicMatch, type: 'italic', tag: 'em' },
        { match: codeMatch, type: 'code', tag: 'code' }
      ].filter(p => p.match);
      
      // Find earliest match
      patterns.forEach(p => {
        if (!firstMatch || (p.match && p.match.index < firstMatch.match.index)) {
          firstMatch = p;
          matchType = p.type;
        }
      });

      if (firstMatch && firstMatch.match) {
        // Add text before the match
        if (firstMatch.match.index > 0) {
          elements.push(
            <span key={`text-${keyIndex++}`}>
              {remaining.substring(0, firstMatch.match.index)}
            </span>
          );
        }

        // Add the formatted element with premium styling
        const content = firstMatch.match[1];
        if (matchType === 'bold') {
          elements.push(
            <strong 
              key={`bold-${keyIndex++}`} 
              className="update-highlight-bold"
            >
              {content}
            </strong>
          );
        } else if (matchType === 'italic') {
          elements.push(
            <em 
              key={`italic-${keyIndex++}`} 
              className="update-highlight-italic"
            >
              {content}
            </em>
          );
        } else if (matchType === 'code') {
          elements.push(
            <code 
              key={`code-${keyIndex++}`} 
              className="update-highlight-code"
            >
              {content}
            </code>
          );
        }

        // Continue with the rest of the text
        remaining = remaining.substring(firstMatch.match.index + firstMatch.match[0].length);
      } else {
        // No more matches, add remaining text
        elements.push(
          <span key={`text-${keyIndex++}`}>{remaining}</span>
        );
        remaining = "";
      }
    }

    return elements.length > 0 ? elements : text;
  };

  const updateText = cleanText(latestUpdate.text);
  const shouldTruncate = updateText.length > 200;
  const displayText = shouldTruncate && !isExpanded 
    ? updateText.slice(0, 200) + "..." 
    : updateText;

  return (
    <div className="recent-updates-container">
      {/* Animated Background */}
      <div className="recent-updates-bg" />
      
      {/* Latest Update Card */}
      <div className="recent-update-card">
        <div className="recent-update-header">
          <div className="header-left">
            <span className="live-badge">
              <span className="live-dot" />
              LIVE
            </span>
            <span className="recent-update-label">Latest Update</span>
          </div>
          <span className="recent-update-date">
            <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            {formatRelativeTime(latestUpdate.timestamp)}
          </span>
        </div>
        
        <p className="recent-update-text">{parseMarkdown(displayText)}</p>
        
        {shouldTruncate && (
          <button 
            className="read-more-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show Less" : "Read More"}
            <svg 
              className={`chevron-icon ${isExpanded ? "expanded" : ""}`} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <polyline points="6,9 12,15 18,9" />
            </svg>
          </button>
        )}
      </div>

      {/* Previous Updates Toggle */}
      {previousUpdates.length > 0 && (
        <div className="previous-updates-section">
          <button
            className="previous-updates-toggle"
            onClick={() => setShowAll(!showAll)}
            aria-expanded={showAll}
          >
            <svg className="history-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
              <path d="M4.93 4.93l4.24 4.24" />
            </svg>
            {showAll ? "Hide" : "View"} Update History ({previousUpdates.length})
            <span className={`toggle-arrow ${showAll ? "open" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9" />
              </svg>
            </span>
          </button>

          <div className={`previous-updates-list ${showAll ? "show" : ""}`}>
            {previousUpdates.map((update, index) => (
              <div key={index} className="previous-update-item">
                <div className="timeline-marker">
                  <span className="timeline-dot" />
                  {index < previousUpdates.length - 1 && <span className="timeline-line" />}
                </div>
                <div className="previous-update-content">
                  <span className="previous-update-date">
                    {formatRelativeTime(update.timestamp)}
                  </span>
                  <p className="previous-update-text">{parseMarkdown(cleanText(update.text))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .recent-updates-container {
          position: relative;
          margin-bottom: 2rem;
          border-radius: 16px;
          overflow: hidden;
        }

        .recent-updates-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
          opacity: 0.1;
          z-index: 0;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .recent-update-card {
          position: relative;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 
            0 4px 24px rgba(102, 126, 234, 0.15),
            0 1px 2px rgba(0, 0, 0, 0.05);
          z-index: 1;
        }

        :global(.dark) .recent-update-card {
          background: rgba(30, 41, 59, 0.9);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 
            0 4px 24px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .recent-update-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.3rem 0.6rem;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .recent-update-label {
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: 1rem;
          letter-spacing: -0.01em;
        }

        :global(.dark) .recent-update-label {
          background: linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .recent-update-date {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 500;
        }

        .clock-icon {
          width: 14px;
          height: 14px;
        }

        :global(.dark) .recent-update-date {
          color: #94a3b8;
        }

        .recent-update-text {
          margin: 0;
          color: #1e293b;
          line-height: 1.75;
          font-size: 1rem;
        }

        :global(.dark) .recent-update-text {
          color: #e2e8f0;
        }

        /* Premium Markdown Formatting Styles */
        :global(.update-highlight-bold) {
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          position: relative;
        }

        :global(.dark) :global(.update-highlight-bold) {
          background: linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }

        :global(.update-highlight-italic) {
          font-style: italic;
          color: #7c3aed;
          font-weight: 500;
        }

        :global(.dark) :global(.update-highlight-italic) {
          color: #c4b5fd;
        }

        :global(.update-highlight-code) {
          font-family: 'JetBrains Mono', Menlo, Monaco, Consolas, monospace;
          font-size: 0.875em;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          color: #5b21b6;
          padding: 0.15em 0.4em;
          border-radius: 6px;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        :global(.dark) :global(.update-highlight-code) {
          background: linear-gradient(135deg, rgba(165, 180, 252, 0.15) 0%, rgba(196, 181, 253, 0.15) 100%);
          color: #c4b5fd;
          border-color: rgba(165, 180, 252, 0.2);
        }

        .read-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.75rem;
          background: none;
          border: none;
          color: #667eea;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s ease;
        }

        .read-more-btn:hover {
          color: #764ba2;
        }

        :global(.dark) .read-more-btn {
          color: #a5b4fc;
        }

        :global(.dark) .read-more-btn:hover {
          color: #c4b5fd;
        }

        .chevron-icon {
          width: 16px;
          height: 16px;
          transition: transform 0.3s ease;
        }

        .chevron-icon.expanded {
          transform: rotate(180deg);
        }

        .previous-updates-section {
          position: relative;
          margin-top: 0.75rem;
          z-index: 1;
        }

        .previous-updates-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(102, 126, 234, 0.2);
          border-radius: 12px;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.75rem 1rem;
          transition: all 0.3s ease;
        }

        .previous-updates-toggle:hover {
          background: rgba(102, 126, 234, 0.1);
          border-color: rgba(102, 126, 234, 0.3);
          color: #667eea;
        }

        :global(.dark) .previous-updates-toggle {
          background: rgba(30, 41, 59, 0.6);
          border-color: rgba(255, 255, 255, 0.1);
          color: #94a3b8;
        }

        :global(.dark) .previous-updates-toggle:hover {
          background: rgba(102, 126, 234, 0.15);
          border-color: rgba(165, 180, 252, 0.3);
          color: #a5b4fc;
        }

        .history-icon {
          width: 18px;
          height: 18px;
        }

        .toggle-arrow {
          margin-left: auto;
          transition: transform 0.3s ease;
        }

        .toggle-arrow svg {
          width: 18px;
          height: 18px;
        }

        .toggle-arrow.open {
          transform: rotate(180deg);
        }

        .previous-updates-list {
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .previous-updates-list.show {
          max-height: 1000px;
          opacity: 1;
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          border: 1px solid rgba(102, 126, 234, 0.1);
        }

        :global(.dark) .previous-updates-list.show {
          background: rgba(30, 41, 59, 0.5);
          border-color: rgba(255, 255, 255, 0.05);
        }

        .previous-update-item {
          display: flex;
          gap: 1rem;
          padding: 0.75rem 0;
        }

        .previous-update-item:first-child {
          padding-top: 0;
        }

        .previous-update-item:last-child {
          padding-bottom: 0;
        }

        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
        }

        .timeline-dot {
          width: 10px;
          height: 10px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          min-height: 20px;
          background: linear-gradient(180deg, #667eea 0%, transparent 100%);
          margin-top: 0.5rem;
        }

        .previous-update-content {
          flex: 1;
          min-width: 0;
        }

        .previous-update-date {
          font-size: 0.75rem;
          color: #667eea;
          font-weight: 600;
          display: block;
          margin-bottom: 0.35rem;
        }

        :global(.dark) .previous-update-date {
          color: #a5b4fc;
        }

        .previous-update-text {
          margin: 0;
          color: #475569;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        :global(.dark) .previous-update-text {
          color: #94a3b8;
        }

        /* Mobile Optimizations */
        @media (max-width: 640px) {
          .recent-updates-container {
            margin-bottom: 1.5rem;
            border-radius: 12px;
          }

          .recent-update-card {
            padding: 1.25rem;
            border-radius: 12px;
          }

          .recent-update-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .header-left {
            width: 100%;
          }

          .recent-update-date {
            width: 100%;
          }

          .live-badge {
            font-size: 0.6rem;
            padding: 0.25rem 0.5rem;
          }

          .live-dot {
            width: 5px;
            height: 5px;
          }

          .recent-update-label {
            font-size: 0.9rem;
          }

          .recent-update-text {
            font-size: 0.95rem;
            line-height: 1.7;
          }

          .previous-updates-toggle {
            padding: 0.65rem 0.85rem;
            font-size: 0.8rem;
            border-radius: 10px;
          }

          .history-icon,
          .toggle-arrow svg {
            width: 16px;
            height: 16px;
          }

          .previous-updates-list.show {
            padding: 0.85rem;
            border-radius: 10px;
          }

          .previous-update-item {
            gap: 0.75rem;
          }

          .timeline-dot {
            width: 8px;
            height: 8px;
          }

          .previous-update-date {
            font-size: 0.7rem;
          }

          .previous-update-text {
            font-size: 0.85rem;
          }
        }

        /* Extra small mobile */
        @media (max-width: 380px) {
          .recent-update-card {
            padding: 1rem;
          }

          .live-badge {
            font-size: 0.55rem;
          }

          .recent-update-label {
            font-size: 0.85rem;
          }

          .recent-update-text {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RecentUpdates;
