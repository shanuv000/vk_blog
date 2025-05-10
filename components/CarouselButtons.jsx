import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const usePrevNextButtons = (emblaApi) => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled
  };
};

export const PrevButton = ({ onClick, disabled }) => {
  return (
    <motion.button
      className="embla__button embla__button--prev absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10"
      onClick={onClick}
      disabled={disabled}
      whileHover={{
        scale: 1.15,
        boxShadow: "0 15px 25px -5px rgba(229, 9, 20, 0.6)",
        border: "2px solid rgba(255, 255, 255, 0.8)"
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        backdropFilter: "blur(4px)",
        border: "2px solid rgba(255, 255, 255, 0.4)",
        background: "linear-gradient(to right, #E50914, #FF5722)",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: "0 4px 12px rgba(229, 9, 20, 0.3)",
        padding: "0",
        outline: "none"
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
    </motion.button>
  );
};

export const NextButton = ({ onClick, disabled }) => {
  return (
    <motion.button
      className="embla__button embla__button--next absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10"
      onClick={onClick}
      disabled={disabled}
      whileHover={{
        scale: 1.15,
        boxShadow: "0 15px 25px -5px rgba(229, 9, 20, 0.6)",
        border: "2px solid rgba(255, 255, 255, 0.8)"
      }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
      style={{
        backdropFilter: "blur(4px)",
        border: "2px solid rgba(255, 255, 255, 0.4)",
        background: "linear-gradient(to right, #FF5722, #E50914)",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: "0 4px 12px rgba(229, 9, 20, 0.3)",
        padding: "0",
        outline: "none"
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    </motion.button>
  );
};

export const DotButton = ({ selected, onClick }) => {
  return (
    <button
      className={`embla__dot ${selected ? 'embla__dot--selected' : ''}`}
      type="button"
      onClick={onClick}
      style={{
        border: "none",
        outline: "none"
      }}
    />
  );
};
