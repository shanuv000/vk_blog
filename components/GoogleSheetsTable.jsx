"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

// Intersection Observer Hook
const useInView = (options) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      options
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);

  return [ref, inView];
};

const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Extract Google Sheets ID from various URL formats
 */
const extractSheetId = (url) => {
  if (!url) return null;
  
  // Decode HTML entities (e.g., &amp; -> &)
  const decodedUrl = url.replace(/&amp;/g, '&');
  
  // Handle pubhtml format: /d/e/XXXX/pubhtml
  const pubhtmlMatch = decodedUrl.match(/\/d\/e\/([^/?]+)/);
  if (pubhtmlMatch) {
    return { id: pubhtmlMatch[1], isPublished: true };
  }
  
  // Handle regular format: /d/XXXX/edit or /d/XXXX/
  const regularMatch = decodedUrl.match(/\/d\/([^/?]+)/);
  if (regularMatch) {
    return { id: regularMatch[1], isPublished: false };
  }
  
  return null;
};

/**
 * Parse CSV text into array of arrays
 */
const parseCSV = (csvText) => {
  const rows = [];
  let currentRow = [];
  let currentCell = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // Skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\n" || (char === "\r" && nextChar === "\n")) && !inQuotes) {
      currentRow.push(currentCell.trim());
      if (currentRow.some((cell) => cell !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = "";
      if (char === "\r") i++; // Skip \n in \r\n
    } else {
      currentCell += char;
    }
  }

  // Handle last row
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((cell) => cell !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
};

const GoogleSheetsTable = ({ url }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ref, inView] = useInView({ threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use our proxy API to bypass CORS
        const proxyUrl = `/api/google-sheets-proxy?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(proxyUrl);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch spreadsheet data");
        }

        const csvText = await response.text();
        const parsedData = parseCSV(csvText);

        if (parsedData.length === 0) {
          throw new Error("No data found in spreadsheet");
        }

        setData(parsedData);
      } catch (err) {
        console.error("Error fetching Google Sheets data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchData();
    }
  }, [url]);

  // Loading state - Mobile optimized skeleton
  if (loading) {
    return (
      <div className="relative w-full my-4 sm:my-8">
        <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200/50 bg-gradient-to-br from-white to-gray-50/50 shadow-lg sm:shadow-xl backdrop-blur-sm">
          <div className="animate-pulse">
            {/* Header skeleton */}
            <div className="h-12 sm:h-14 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-gray-200/50" />
            {/* Row skeletons - fewer on mobile */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 sm:h-14 border-b border-gray-100/50 flex items-center px-3 sm:px-4 gap-2 sm:gap-4">
                <div className="flex-1 h-3 sm:h-4 bg-gray-200/60 rounded-full" />
                <div className="flex-1 h-3 sm:h-4 bg-gray-200/40 rounded-full hidden sm:block" />
                <div className="flex-1 h-3 sm:h-4 bg-gray-200/50 rounded-full" />
                <div className="flex-1 h-3 sm:h-4 bg-gray-200/30 rounded-full hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  // Error state - Mobile optimized
  if (error) {
    return (
      <div className="relative w-full my-4 sm:my-8">
        <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-red-200/50 bg-gradient-to-br from-red-50 to-rose-50/50 shadow-md sm:shadow-lg p-4 sm:p-6">
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="text-base sm:text-xl">⚠️</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-red-700 font-medium text-sm sm:text-base">Unable to load spreadsheet</p>
              <p className="text-red-500/80 text-xs sm:text-sm mt-0.5 sm:mt-1 break-words">{error}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-red-600 active:text-red-700 text-xs sm:text-sm mt-2 sm:mt-3 font-medium transition-colors touch-manipulation"
              >
                View spreadsheet
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data
  if (data.length === 0) {
    return null;
  }

  const headers = data[0];
  const rows = data.slice(1);

  return (
    <div className="relative w-full my-4 sm:my-8 group">
      {/* Mobile swipe indicator - animated gradient edges */}
      <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-r from-white via-white/80 to-transparent z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity sm:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-8 bg-gradient-to-l from-white via-white/80 to-transparent z-20 pointer-events-none sm:hidden" />
      
      {/* Premium container with glassmorphism */}
      <div className="overflow-hidden rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl shadow-emerald-500/10 border border-gray-200/60 bg-white/80 backdrop-blur-sm">
        {/* Scrollable wrapper with touch momentum */}
        <div 
          className="overflow-x-auto max-w-full overscroll-x-contain"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin',
          }}
        >
          <motion.table
            ref={ref}
            className="w-full border-collapse min-w-[500px]"
            initial="hidden"
            animate={controls}
          >
            {/* Premium Header - Mobile optimized */}
            <thead className="sticky top-0 z-10">
              <motion.tr
                className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 text-white"
                variants={rowVariants}
                transition={{ duration: 0.5 }}
              >
                {headers.map((header, index) => (
                  <th
                    key={index}
                    className="px-2.5 sm:px-4 py-3 sm:py-4 text-left font-semibold text-xs sm:text-sm tracking-wide whitespace-nowrap border-r border-emerald-400/30 last:border-r-0"
                    style={{
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {index === 0 && (
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white/60" />
                      )}
                      <span className="truncate max-w-[120px] sm:max-w-none">{header}</span>
                    </div>
                  </th>
                ))}
              </motion.tr>
            </thead>

            {/* Table Body - Mobile optimized */}
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  className={`
                    ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
                    active:bg-emerald-50 sm:hover:bg-gradient-to-r sm:hover:from-emerald-50 sm:hover:to-teal-50/50
                    transition-colors duration-200 sm:duration-300
                    cursor-default touch-manipulation
                  `}
                  variants={rowVariants}
                  transition={{ duration: 0.3, delay: Math.min((rowIndex + 1) * 0.02, 0.3) }}
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`
                        px-2.5 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm
                        ${cellIndex === 0 
                          ? 'font-semibold text-gray-800' 
                          : 'text-gray-600'
                        }
                        border-r border-gray-100/80 last:border-r-0
                      `}
                    >
                      <span 
                        className="block truncate max-w-[120px] sm:max-w-xs" 
                        title={cell}
                      >
                        {cell || '—'}
                      </span>
                    </td>
                  ))}
                  {/* Handle rows with fewer cells than headers */}
                  {row.length < headers.length &&
                    [...Array(headers.length - row.length)].map((_, i) => (
                      <td
                        key={`empty-${i}`}
                        className="px-2.5 sm:px-4 py-2.5 sm:py-3.5 text-gray-400 text-xs sm:text-sm border-r border-gray-100/80 last:border-r-0"
                      >
                        —
                      </td>
                    ))}
                </motion.tr>
              ))}
            </tbody>
          </motion.table>
        </div>
      </div>
      
      {/* Premium footer info - Mobile optimized */}
      <div className="flex items-center justify-between mt-2 sm:mt-3 px-0.5 sm:px-1">
        <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 sm:gap-1.5">
          <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>{rows.length} rows • {headers.length} cols</span>
        </p>
        {/* Mobile swipe hint with animation */}
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-400 sm:hidden">
          <span className="animate-pulse">👆</span>
          <span>Swipe</span>
          <svg className="w-3 h-3 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
      
      {/* Custom animation for bounce-x */}
      <style jsx>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default GoogleSheetsTable;
