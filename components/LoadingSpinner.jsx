import React from "react";

/**
 * Modern Loading Spinner Component
 * Professional loading states with smooth animations and accessibility
 */

const LoadingSpinner = ({
  size = "medium",
  type = "spinner",
  message = "Loading...",
  fullScreen = false,
  overlay = false,
  className = "",
}) => {
  // Size configurations with modern scaling
  const sizeClasses = {
    small: "w-5 h-5",
    medium: "w-8 h-8",
    large: "w-12 h-12",
    xlarge: "w-16 h-16",
  };

  // Message size classes
  const messageSizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
    xlarge: "text-xl",
  };

  // Modern Spinner with smooth animation
  const Spinner = ({ className }) => (
    <div className={`${className} relative`} role="status" aria-label="Loading">
      {/* Outer ring */}
      <div className="absolute inset-0 border-3 border-gray-200/30 rounded-full"></div>
      {/* Animated ring */}
      <div
        className="border-3 border-transparent border-t-primary rounded-full animate-spin"
        style={{
          animation: "spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite",
        }}
      ></div>
    </div>
  );

  // Modern Dots loader with staggered animation
  const DotsLoader = () => (
    <div
      className="flex items-center space-x-1.5"
      role="status"
      aria-label="Loading"
    >
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-2.5 h-2.5 bg-primary rounded-full"
          style={{
            animation: `modernBounce 1.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite`,
            animationDelay: `${index * 0.16}s`,
          }}
        />
      ))}
    </div>
  );

  // Modern Pulse loader with breathing effect
  const PulseLoader = ({ className }) => (
    <div
      className={`${className} bg-primary rounded-full relative overflow-hidden`}
      role="status"
      aria-label="Loading"
    >
      <div
        className="absolute inset-0 bg-primary rounded-full"
        style={{
          animation: "modernPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />
    </div>
  );

  // Ripple loader for modern effect
  const RippleLoader = ({ className }) => (
    <div
      className={`${className} relative flex items-center justify-center`}
      role="status"
      aria-label="Loading"
    >
      {[0, 1].map((index) => (
        <div
          key={index}
          className="absolute border-2 border-primary rounded-full opacity-75"
          style={{
            animation: `ripple 2s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
            animationDelay: `${index * 1}s`,
          }}
        />
      ))}
    </div>
  );

  // Content based on type
  const renderLoader = () => {
    switch (type) {
      case "dots":
        return <DotsLoader />;
      case "pulse":
        return <PulseLoader className={sizeClasses[size]} />;
      case "ripple":
        return <RippleLoader className={sizeClasses[size]} />;
      case "spinner":
      default:
        return <Spinner className={sizeClasses[size]} />;
    }
  };

  // Full screen overlay with modern backdrop
  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-dark/80 backdrop-blur-md"
        style={{ backdropFilter: "blur(8px)" }}
      >
        <div
          className="text-center p-8 bg-secondary/90 rounded-2xl shadow-2xl border border-gray-700/50"
          style={{
            animation: "fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="mb-6">{renderLoader()}</div>
          {message && (
            <p
              className={`text-text-primary font-medium ${messageSizeClasses[size]} opacity-90`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Overlay version with modern styling
  if (overlay) {
    return (
      <div
        className="absolute inset-0 z-10 flex items-center justify-center bg-secondary-dark/60 backdrop-blur-sm rounded-xl"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <div
          className="text-center p-6 bg-secondary/80 rounded-xl shadow-lg border border-gray-700/30"
          style={{
            animation: "fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="mb-4">{renderLoader()}</div>
          {message && (
            <p
              className={`text-text-primary font-medium ${messageSizeClasses[size]} opacity-90`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Inline version with modern spacing
  return (
    <div
      className={`flex items-center justify-center space-x-4 py-6 ${className}`}
    >
      <div className="flex-shrink-0">{renderLoader()}</div>
      {message && (
        <span
          className={`text-text-secondary font-medium ${messageSizeClasses[size]} opacity-80`}
        >
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
