type Operation = {
  ButtonName: string
  Function: () => void
}

export interface ModalProps {
  title: string
  text: string
  operations: Operation[]
  isVisible: boolean
  onClose: () => void
}

function Modal({ title, text, operations, isVisible, onClose }: ModalProps) {
  if (!isVisible) {
    return null
  }

  const createMarkup = (html: string) => {
    return { __html: html }
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
      {/* Overlay */}
      <div onClick={onClose} className="absolute top-0 left-0 w-full h-full bg-black opacity-50 cursor-pointer z-40"></div>

      {/* Modal */}
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 z-50">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="mb-4 overflow-hidden overflow-ellipsis" dangerouslySetInnerHTML={createMarkup(text)}></p>

        <div className="flex justify-end space-x-4">
          {operations.map((op, index) => (
            <button
              key={index}
              onClick={op.Function}
              className="py-2 px-4 border border-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors duration-200"
            >
              {op.ButtonName}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Modal
