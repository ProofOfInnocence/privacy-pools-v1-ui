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
  feeData?: string
}

function Modal({ title, text, operations, isVisible, onClose, feeData }: ModalProps) {
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
      <div className="bg-white rounded-lg shadow-[0_7px_50px_0_rgba(0,0,0,0.20)] py-8 px-6 w-96 z-50 ">
        <h3 className="text-xl font-bold mb-8">{title}</h3>
        <p
          className="overflow-hidden overflow-ellipsis text-base font-bold opacity-50 mb-4"
          dangerouslySetInnerHTML={createMarkup(text)}
        ></p>
        {feeData && (
          <p className="overflow-hidden overflow-ellipsis text-base font-bold mb-6">
            Withdrawal Fee: <span className="opacity-50">{feeData} ETH</span>
          </p>
        )}
        {feeData && <p className="overflow-hidden overflow-ellipsis text-base font-bold opacity-50 mb-8">Do you want to proceed?</p>}

        <div className="flex justify-end space-x-4">
          {operations.map((op, index) => (
            <button
              key={index}
              onClick={op.Function}
              className="block bg-[#1A73E8] text-white rounded-3xl w-full py-2 text-base text-center font-bold transition-all ease-out hover:bg-[#1a73e8c4] hover:cursor-pointer"
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
