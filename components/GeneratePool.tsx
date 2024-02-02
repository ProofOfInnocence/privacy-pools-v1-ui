'use client'
import Image from 'next/image'
import poolKeyIcon from 'public/images/pool-key-icon.webp'
import { useState } from 'react'

type GeneratePoolProps = {
  initializeKeypair: () => void
}

function GeneratePool({ initializeKeypair }: GeneratePoolProps) {
  return (
    <div className="mx-10">
      <Image className="mx-auto mb-4 mt-2" src={poolKeyIcon} width={386} height={278} alt="pool key generate icon" />
      <button
        onClick={initializeKeypair}
        className="block bg-[#1A73E8] text-white rounded-[40px] w-full py-4 text-xl text-center font-bold transition-all ease-out hover:bg-[#1a73e8c4] hover:cursor-pointer"
      >
        Generate Pool Keys to Start
      </button>
    </div>
  )
}

export default GeneratePool
