import React from 'react';

interface LoadingSpinnerProps {
  loadingMessage?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ loadingMessage }) => {
  if (!loadingMessage) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg shadow-md flex flex-col items-center">
        <div className="w-10 h-10 border-t-4 border-black border-solid border-t-2 border-r-2 rounded-full animate-spin"></div>
        <p className="mt-3">{loadingMessage}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
