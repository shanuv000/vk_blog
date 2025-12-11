import React, { useState } from "react";

/**
 * RecentUpdates Component
 * Displays AI-generated updates at the top of blog posts
 *
 * @param {Array} updates - Array of update objects with { text, timestamp }
 */
const RecentUpdates = ({ updates }) => {
  const [showAll, setShowAll] = useState(false);

  // Don't render if no updates
  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return null;
  }

  const latestUpdate = updates[0];
  const previousUpdates = updates.slice(1);

  // Format date for display
  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  // Clean citation brackets from text (e.g., [1], [2], [3])
  const cleanText = (text) => {
    if (!text) return "";
    return text
      .replace(/\[\d+\]/g, "")           // Remove [1], [2], etc.
      .replace(/\[\d+,\s*\d+\]/g, "")    // Remove [1, 2] format
      .replace(/\s{2,}/g, " ")           // Clean up extra spaces
      .trim();
  };

  return (
    <div className="recent-updates-container">
      {/* Latest Update */}
      <div className="recent-update-card">
        <div className="recent-update-header">
          <span className="recent-update-icon">📌</span>
          <span className="recent-update-label">Latest Update</span>
          <span className="recent-update-date">
            {formatDate(latestUpdate.timestamp)}
          </span>
        </div>
        <p className="recent-update-text">{cleanText(latestUpdate.text)}</p>
      </div>

      {/* Previous Updates Toggle */}
      {previousUpdates.length > 0 && (
        <div className="previous-updates-section">
          <button
            className="previous-updates-toggle"
            onClick={() => setShowAll(!showAll)}
            aria-expanded={showAll}
          >
            {showAll ? "Hide" : "Show"} previous updates ({previousUpdates.length})
            <span className={`toggle-arrow ${showAll ? "open" : ""}`}>▼</span>
          </button>

          {showAll && (
            <div className="previous-updates-list">
              {previousUpdates.map((update, index) => (
                <div key={index} className="previous-update-item">
                  <span className="previous-update-date">
                    {formatDate(update.timestamp)}
                  </span>
                  <p className="previous-update-text">{cleanText(update.text)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .recent-updates-container {
          margin-bottom: 2rem;
        }

        .recent-update-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-left: 4px solid #0ea5e9;
          border-radius: 0 12px 12px 0;
          padding: 1.25rem;
          margin-bottom: 0.75rem;
        }

        :global(.dark) .recent-update-card {
          background: linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%);
          border-left-color: #38bdf8;
        }

        .recent-update-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .recent-update-icon {
          font-size: 1.1rem;
        }

        .recent-update-label {
          font-weight: 600;
          color: #0369a1;
          font-size: 0.9rem;
        }

        :global(.dark) .recent-update-label {
          color: #7dd3fc;
        }

        .recent-update-date {
          font-size: 0.8rem;
          color: #64748b;
          margin-left: auto;
        }

        :global(.dark) .recent-update-date {
          color: #94a3b8;
        }

        .recent-update-text {
          margin: 0;
          color: #334155;
          line-height: 1.7;
          font-size: 0.95rem;
        }

        :global(.dark) .recent-update-text {
          color: #e2e8f0;
        }

        .previous-updates-section {
          margin-top: 0.5rem;
        }

        .previous-updates-toggle {
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
          transition: color 0.2s ease;
        }

        .previous-updates-toggle:hover {
          color: #0ea5e9;
        }

        :global(.dark) .previous-updates-toggle {
          color: #94a3b8;
        }

        :global(.dark) .previous-updates-toggle:hover {
          color: #38bdf8;
        }

        .toggle-arrow {
          font-size: 0.7rem;
          transition: transform 0.2s ease;
        }

        .toggle-arrow.open {
          transform: rotate(180deg);
        }

        .previous-updates-list {
          margin-top: 0.75rem;
          padding-left: 1rem;
          border-left: 2px solid #e2e8f0;
        }

        :global(.dark) .previous-updates-list {
          border-left-color: #334155;
        }

        .previous-update-item {
          padding: 0.75rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        :global(.dark) .previous-update-item {
          border-bottom-color: #1e293b;
        }

        .previous-update-item:last-child {
          border-bottom: none;
        }

        .previous-update-date {
          font-size: 0.75rem;
          color: #94a3b8;
          display: block;
          margin-bottom: 0.25rem;
        }

        .previous-update-text {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        :global(.dark) .previous-update-text {
          color: #94a3b8;
        }

        @media (max-width: 640px) {
          .recent-update-card {
            padding: 1rem;
          }

          .recent-update-header {
            gap: 0.4rem;
          }

          .recent-update-date {
            width: 100%;
            margin-left: 1.6rem;
            margin-top: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default RecentUpdates;
