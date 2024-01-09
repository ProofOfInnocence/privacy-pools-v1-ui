'use client'
import Image from 'next/image'
import infoIcon from 'public/images/info-icon.svg'
import { useState } from 'react'

function Description() {
  const [isOpen, setIsOpen] = useState(false)

  const descriptionModal = () => {
    return (
      <div onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)} className="absolute top-8 z-50">
        <div
          className="relative mx-auto shadow-[0_7px_50px_0_rgba(0,0,0,0.20)] w-0 h-0 
                border-l-[15px] border-l-transparent
                border-b-[15px] border-b-white
                border-r-[15px] border-r-transparent"
        ></div>
        <div className="bg-white rounded-xl p-8 shadow-[0_7px_50px_0_rgba(0,0,0,0.20)] w-96 text-start">
          <h3 className="text-xl font-bold mb-8">Privacy Pools Compliance:</h3>
          <p className="text-sm font-normal opacity-50 mb-8">
            By implementing the <span className="font-bold underline">0xbow</span> ASP (Association Set Provider) to screen deposits,
            Privacy Pools are fully compliant with the following regulatory guidelines:{' '}
            <span className="font-bold">
              Anti-Money Laundering (AML), Counter-Terrorism Financing (CTF), Know Your Customer (KYC) and Customer Due Diligence (CDD), &
              more.
            </span>
          </p>
          <a
            className="block bg-[#1A73E8] text-white rounded-3xl w-full py-2 text-xl text-center font-bold transition-all ease-out hover:bg-[#1a73e8c4] hover:cursor-pointer"
            href="#"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn More
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full text-center my-12">
      <div className="font-bold text-3xl flex justify-center items-center">
        Send assets anonymously with
        <span className="underline flex ml-2">full compliance. </span>
        <div className="relative flex items-center justify-center">
          <Image
            onMouseEnter={() => setIsOpen(true)}
            className="mb-3 z-40 w-auto h-auto p-1"
            src={infoIcon}
            alt="info icon"
            width={13}
            height={13}
          />
          {isOpen && descriptionModal()}
        </div>
      </div>
    </div>
  )
}

export default Description
