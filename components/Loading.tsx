interface LoadingSpinnerProps {
  loadingMessage?: string
}

function LoadingSpinner({ loadingMessage }: LoadingSpinnerProps) {
  // If no loading message is provided, render nothing.
  if (!loadingMessage) {
    return <></>
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <p className="text-white text-lg font-semibold">{loadingMessage}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
