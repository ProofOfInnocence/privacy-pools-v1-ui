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
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      {/* Overlay */}
      <div onClick={onClose} className="absolute top-0 left-0 w-full h-full bg-black opacity-50 cursor-pointer z-40"></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="bg-white rounded-xl p-8 w-[450px] shadow-[0_7px_50px_0_rgba(0,0,0,0.20)]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold  text-red-500">Error</h3>
            <button onClick={onClose} className="text-red-500 text-2xl hover:text-red-600">
              ×
            </button>
          </div>
          <p className="overflow-hidden overflow-ellipsis text-base font-bold opacity-50">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default ErrorModal
