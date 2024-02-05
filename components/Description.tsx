'use client'
import Image from 'next/image'
import arrowIcon from 'public/images/arrow.svg'
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
    <div className="bg-black w-full text-center py-2 z-20">
      <div className="flex flex-col lg:flex-row justify-center items-center px-3 text-white text-sm md:text-base font-normal">
        <p>With Privacy Pools, you can send assets anonymously with full compliance: AML, CTF, KYC, CDD, & more.</p>
        <div className="relative flex items-center justify-center hover:underline ">
          <a href="https://0xbow.io/" target="_blank" rel="noopener noreferrer" className="ml-2 font-bold">
            Click to learn more
          </a>
          <Image
            // onMouseEnter={() => setIsOpen(true)}
            className="ml-1 z-40 w-auto h-auto p-1"
            src={arrowIcon}
            alt="arrow icon"
            width={15}
            height={15}
          />
        </div>
      </div>
    </div>
  )
}

export default Description
