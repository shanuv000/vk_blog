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

const NestedTable = ({ data }) => {
  const [ref, inView] = useInView({ threshold: 0.1 });
  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  // Check if the table has a table_body
  const tableBody = data.children.find((child) => child.type === "table_body");

  // Extract rows data
  const rows = tableBody ? tableBody.children : data.children;

  return (
    <div className="relative w-full my-4 sm:my-6">
      <div className="overflow-x-auto max-w-full rounded-lg shadow-sm border border-gray-200">
        <motion.table
          ref={ref}
          className="border-collapse w-full mb-0 text-sm sm:text-base"
          initial="hidden"
          animate={controls}
        >
          <tbody>
            {rows.map((rowData, rowIndex) => (
              <motion.tr
                key={rowIndex}
                className={`border border-gray-300 font-medium ${
                  rowIndex === 0 ? "text-center bg-gray-50" : "bg-white"
                }`}
                variants={rowVariants}
                transition={{ duration: 0.5, delay: rowIndex * 0.1 }}
              >
                {rowData.children.map((cellData, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`border border-gray-300 p-1.5 sm:p-2 ${
                      cellIndex === 0 ? "font-medium" : ""
                    }`}
                  >
                    {cellData.children[0].children.map(
                      (paragraphChild, pIndex) => (
                        <p
                          key={pIndex}
                          className={`${
                            rowIndex === 0
                              ? "text-primary font-semibold text-xs sm:text-sm"
                              : "text-gray-700 font-normal text-xs sm:text-sm"
                          } break-words`}
                        >
                          {paragraphChild.text}
                        </p>
                      )
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </motion.table>
      </div>
      <div className="text-xs text-gray-500 mt-1 italic text-center sm:hidden">
        Scroll horizontally to view full table
      </div>
    </div>
  );
};

export default NestedTable;
