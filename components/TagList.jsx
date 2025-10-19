import React from "react";
import TagBadge from "./TagBadge";

const TagList = ({ tags, title = "Tags", size = "md", maxDisplay = null }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayTags = maxDisplay ? tags.slice(0, maxDisplay) : tags;
  const remainingCount = tags.length - (maxDisplay || tags.length);

  return (
    <div className="tag-list">
      {title && (
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {title}
        </h3>
      )}
      <div className="flex flex-wrap gap-2">
        {displayTags.map((tag) => (
          <TagBadge key={tag.id} tag={tag} size={size} />
        ))}
        {remainingCount > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400 px-3 py-1.5">
            +{remainingCount} more
          </span>
        )}
      </div>
    </div>
  );
};

export default TagList;
