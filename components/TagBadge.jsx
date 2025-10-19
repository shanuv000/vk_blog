import React from "react";
import Link from "next/link";

const TagBadge = ({ tag, size = "md", clickable = true }) => {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const colorHex = tag.color?.hex || "#6366F1"; // Default indigo color

  // Calculate if color is light or dark to determine text color
  const getLuminance = (hex) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const isLightColor = getLuminance(colorHex) > 128;
  const textColor = isLightColor ? "#000000" : "#FFFFFF";

  const tagStyle = {
    backgroundColor: `${colorHex}15`, // 15% opacity for background
    borderColor: colorHex,
    color: colorHex,
  };

  const hoverStyle = {
    backgroundColor: colorHex,
    color: textColor,
  };

  const content = (
    <span
      className={`
        ${sizeClasses[size]}
        inline-flex items-center gap-1.5
        rounded-full border
        font-medium
        transition-all duration-200
        ${clickable ? "cursor-pointer hover:shadow-md" : ""}
      `}
      style={tagStyle}
      onMouseEnter={(e) => {
        if (clickable) {
          e.currentTarget.style.backgroundColor = hoverStyle.backgroundColor;
          e.currentTarget.style.color = hoverStyle.color;
        }
      }}
      onMouseLeave={(e) => {
        if (clickable) {
          e.currentTarget.style.backgroundColor = tagStyle.backgroundColor;
          e.currentTarget.style.color = tagStyle.color;
        }
      }}
    >
      <svg
        className={`${
          size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      {tag.name}
    </span>
  );

  if (clickable) {
    return (
      <Link href={`/tag/${tag.slug}`} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
};

export default TagBadge;
