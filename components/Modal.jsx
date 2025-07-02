import React from "react";

import ShowCricket from "./Cricket/ShowCricket";

const Modal = ({ show, onClose }) => {
  if (!show) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 w-full max-w-4xl mx-2 sm:mx-4 md:mx-6 lg:mx-auto relative max-h-screen overflow-y-auto">
        <button
          className="absolute top-2 right-2 bg-red-500 text-white py-1 px-2 rounded-full hover:bg-red-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-300"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <div id="modal-title" className="sr-only">
          Cricket Live Scores
        </div>
        <ShowCricket />
      </div>
    </div>
  );
};

export default Modal;
