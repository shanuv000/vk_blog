import React from "react";

/**
 * Enhanced Loading Spinner Component
 * Provides different loading states for various scenarios
 */

const LoadingSpinner = ({ 
  size = "medium", 
  type = "spinner", 
  message = "Loading...", 
  fullScreen = false,
  overlay = false 
}) => {
  // Size configurations
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8", 
    large: "w-12 h-12",
    xlarge: "w-16 h-16"
  };

  // Spinner component
  const Spinner = ({ className }) => (
    <div className={`${className} border-4 border-gray-300 border-t-primary rounded-full animate-spin`} />
  );

  // Dots loader component
  const DotsLoader = () => (
    <div className="flex space-x-2">
      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );

  // Pulse loader component
  const PulseLoader = ({ className }) => (
    <div className={`${className} bg-primary rounded-full animate-pulse`} />
  );

  // Content based on type
  const renderLoader = () => {
    switch (type) {
      case "dots":
        return <DotsLoader />;
      case "pulse":
        return <PulseLoader className={sizeClasses[size]} />;
      case "spinner":
      default:
        return <Spinner className={sizeClasses[size]} />;
    }
  };

  // Full screen overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary bg-opacity-90 backdrop-blur-sm">
        <div className="text-center">
          {renderLoader()}
          {message && (
            <p className="mt-4 text-text-primary font-medium animate-pulse">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Overlay version
  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-secondary bg-opacity-75 backdrop-blur-sm rounded-lg">
        <div className="text-center">
          {renderLoader()}
          {message && (
            <p className="mt-2 text-text-primary text-sm font-medium">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Inline version
  return (
    <div className="flex items-center justify-center space-x-3 py-4">
      {renderLoader()}
      {message && (
        <span className="text-text-secondary font-medium">
          {message}
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
