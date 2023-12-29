interface ErrorModalProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

function ErrorModal({ message, isVisible, onClose }: ErrorModalProps) {
  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border-red-500 border-2 rounded-lg shadow-lg p-4 w-72">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-red-500">Error</h3>
          <button onClick={onClose} className="text-red-500 hover:text-red-600">
            ×
          </button>
        </div>
        <p>{message}</p>
      </div>
    </div>
  )
}

export default ErrorModal
