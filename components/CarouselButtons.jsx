import React, { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

export const usePrevNextButtons = (emblaApi) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) {return;}

    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
  };
};

export const PrevButton = ({ onClick, disabled }) => {
  return (
    <motion.button
      className="embla__button embla__button--prev absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20"
      onClick={onClick}
      disabled={disabled}
      whileHover={{
        scale: 1.1,
        boxShadow:
          "0 20px 40px -10px rgba(229, 9, 20, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)",
        y: -2,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background:
          "linear-gradient(135deg, rgba(229, 9, 20, 0.9), rgba(184, 29, 36, 0.9))",
        borderRadius: "16px",
        width: "48px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        boxShadow:
          "0 8px 25px -5px rgba(229, 9, 20, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        padding: "0",
        outline: "none",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-white drop-shadow-sm"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </motion.button>
  );
};

export const NextButton = ({ onClick, disabled }) => {
  return (
    <motion.button
      className="embla__button embla__button--next absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20"
      onClick={onClick}
      disabled={disabled}
      whileHover={{
        scale: 1.1,
        boxShadow:
          "0 20px 40px -10px rgba(229, 9, 20, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)",
        y: -2,
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background:
          "linear-gradient(135deg, rgba(229, 9, 20, 0.9), rgba(184, 29, 36, 0.9))",
        borderRadius: "16px",
        width: "48px",
        height: "48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        boxShadow:
          "0 8px 25px -5px rgba(229, 9, 20, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        padding: "0",
        outline: "none",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-white drop-shadow-sm"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </motion.button>
  );
};

export const DotButton = ({ selected, onClick }) => {
  return (
    <button
      className={`embla__dot ${selected ? "embla__dot--selected" : ""}`}
      type="button"
      onClick={onClick}
      style={{
        border: "none",
        outline: "none",
      }}
    />
  );
};
