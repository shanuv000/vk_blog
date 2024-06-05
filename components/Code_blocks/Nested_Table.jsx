// Intersection Observer Hook
"use client";
const useInView = (options) => {
  const ref = useRef(null);
  const [inView, setInView] = React.useState(false);

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

import React, { useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
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
    <div className="overflow-x-auto">
      <motion.table
        ref={ref}
        className="border-collapse w-full mb-4"
        initial="hidden"
        animate={controls}
      >
        <tbody>
          {rows.map((rowData, rowIndex) => (
            <motion.tr
              key={rowIndex}
              className={`border border-black font-medium ${
                rowIndex === 0 ? "text-center" : ""
              }`}
              variants={rowVariants}
              transition={{ duration: 0.5, delay: rowIndex * 0.1 }}
            >
              {rowData.children.map((cellData, cellIndex) => (
                <td key={cellIndex} className="border border-black p-2">
                  {cellData.children[0].children.map(
                    (paragraphChild, pIndex) => (
                      <p
                        key={pIndex}
                        className={`${
                          rowIndex === 0
                            ? "text-red-400 font-semibold"
                            : "text-gray-600 font-medium"
                        }`}
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
  );
};

export default NestedTable;
