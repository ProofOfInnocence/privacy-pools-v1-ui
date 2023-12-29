'use client'

function SignMessageComponent({ signMessage }: { signMessage: () => Promise<void> }) {
  return (
    <div className="flex justify-center pt-8">
      <div className="bg-white rounded-lg shadow-md p-0 w-96">
        {/* Information */}
        <div className="p-4">
          <p className="mb-4">If you want to use privacy pools, you need to create your private key by signing a message.</p>

          {/* Button */}
          <button
            onClick={signMessage}
            className="py-2 px-4 border border-blue-500 rounded hover:bg-blue-500 hover:text-white transition-colors duration-200"
          >
            Sign Message
          </button>
        </div>
      </div>
    </div>
  )
}

export default SignMessageComponent
