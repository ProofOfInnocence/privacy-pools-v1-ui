import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
import arrowIcon from 'public/images/select-arrow-light.svg'
import openEye from 'public/images/open-eye.svg'
import closeEye from 'public/images/close-eye.svg'
import { generateColorFromAddress } from 'utilities/generateColorFromAddress'
import { useEffect, useState } from 'react'
import { fromWei } from 'web3-utils'

function CustomConnectButton({ shieldedBalance, isKeyGenerated }: { shieldedBalance: number; isKeyGenerated: boolean }) {
  const [showPrivateBalance, setShowPrivateBalance] = useState(false)

  const privateBalance = () => {
    return (
      <div className="absolute bg-black hidden sm:flex items-center justify-normal  ml-[-18rem] pr-20 py-[1px] text-base font-bold text-black rounded-full z-[60]">
        <Image
          className="mr-4 ml-2 p-2 z-50 w-auto rounded-full transition duration-150 hover:cursor-pointer hover:bg-gray-200 hover:bg-opacity-10 active:bg-opacity-25"
          onClick={() => setShowPrivateBalance(false)}
          src={closeEye}
          alt="hide private balance"
          width={22}
          height={16}
        />

        <p className="font-normal text-white py-2">
          Private Balance: <span className="font-bold">{parseFloat(fromWei(shieldedBalance.toString()))} ETH</span>
        </p>
      </div>
    )
  }

  const privateBalanceMobile = () => {
    return (
      <div className="absolute bg-black top-44 right-4 mt-1 flex items-center justify-normal sm:hidden pr-4 py-[1px] text-base font-bold text-black rounded-full z-[80]">
        <Image
          className="mr-4 ml-2 p-2 z-50 w-auto rounded-full transition duration-150 hover:cursor-pointer hover:bg-gray-200 hover:bg-opacity-10 active:bg-opacity-25"
          onClick={() => setShowPrivateBalance(false)}
          src={closeEye}
          alt="hide private balance"
          width={22}
          height={16}
        />

        <p className="font-normal text-white py-2">
          Private Balance: <span className="font-bold">{parseFloat(fromWei(shieldedBalance.toString()))} ETH</span>
        </p>
      </div>
    )
  }

  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal }) => {
        const connected = account && chain
        let userColor

        if (connected) {
          userColor = generateColorFromAddress(account.address)
        }

        return (
          <div>
            {(() => {
              if (!connected) {
                return (
                  <button
                    className="bg-[#1A73E8] px-4 py-3 font-bold text-white rounded-full transition duration-150 hover:bg-[#1a73e8d8] active:bg-[#1a73e8b7]"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Connect Wallet
                  </button>
                )
              }

              return (
                <>
                  {isKeyGenerated && showPrivateBalance && privateBalance()}

                  <div className="flex items-center">
                    <Image
                      className="absolute mr-4 ml-2 p-2 w-auto rounded-full transition duration-150 hover:cursor-pointer hover:bg-gray-200 hover:bg-opacity-10 active:bg-opacity-25 z-[80]"
                      onClick={() => setShowPrivateBalance(true)}
                      src={openEye}
                      alt="show private balance"
                      width={22}
                      height={16}
                    />

                    <button
                      onClick={openAccountModal}
                      type="button"
                      className="flex items-center justify-normal bg-[#1A73E8] pl-16 pr-1 py-1 text-base font-bold text-white rounded-full z-[70] hover:bg-[#2e7ce2] active:bg-[#4588e0]"
                    >
                      {account.displayBalance ? ` ${account.displayBalance}` : ''}
                      <span className="flex items-center ml-6 pl-2 pr-3 py-1 bg-white bg-opacity-30 rounded-full box-border leading-none">
                        <div className={`w-7 h-7 rounded-full mr-2`} style={{ background: userColor }}></div>
                        {account.displayName}
                        <Image className="ml-2" src={arrowIcon} alt="arrow icon" width={16} height={9} />
                      </span>
                    </button>
                    {isKeyGenerated && showPrivateBalance && privateBalanceMobile()}
                  </div>
                </>
              )
            })()}
          </div>
        )
      }}
    </ConnectButton.Custom>
  )
}

export default CustomConnectButton
