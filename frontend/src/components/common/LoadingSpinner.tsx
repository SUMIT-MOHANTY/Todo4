import React from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  message?: string;
}

/**
 * Loading spinner component for indicating async operations
 * Can be used inline or as a full-screen overlay
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  fullScreen = false,
  message = "Loading..."
}) => {
  return (
    <div className={`spinner-container ${fullScreen ? 'fullscreen' : ''}`}
         role="alert"
         aria-busy="true"
         aria-live="polite">
      <div className="spinner"></div>
      {message && <p className="mt-3">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
