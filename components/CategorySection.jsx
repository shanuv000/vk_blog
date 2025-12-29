/**
 * CategorySection - Reusable section wrapper with category header
 * Features section title with icon, "View All" link, and flexible content area
 */

import React from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

const CategorySection = ({
  title,
  icon,
  viewAllLink,
  viewAllText = "View All",
  children,
  className = "",
  headerClassName = "",
  variant = "default", // "default", "compact", "featured"
}) => {
  return (
    <section className={`mb-10 ${className}`}>
      {/* Section Header */}
      <div
        className={`flex items-center justify-between mb-6 pb-3 border-b border-border ${headerClassName}`}
      >
        <h2 className="flex items-center gap-2 text-xl lg:text-2xl font-heading font-bold text-text-primary">
          {icon && <span className="text-2xl">{icon}</span>}
          {title}
        </h2>

        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="group flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-light transition-colors"
          >
            <span>{viewAllText}</span>
            <FaArrowRight
              size={12}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        )}
      </div>

      {/* Content */}
      <div
        className={
          variant === "compact"
            ? "space-y-2"
            : variant === "featured"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : ""
        }
      >
        {children}
      </div>
    </section>
  );
};

export default CategorySection;
