'use client'
import Image from 'next/image'
import privacyPoolsLogo from 'public/images/privacy-pools-logo.svg'

function Logo() {
  return (
    <div className="flex items-center relative z-20">
      <Image src={privacyPoolsLogo} alt="privacy pools logo" width={45} height={40} />
      <span className="text-2xl hidden sm:block font-bold ml-4 mr-8">Privacy Pools</span>
      <span
        className="absolute hidden sm:block bg-[#1A73E8] rounded-2xl text-white font-bold text-xs py-1 px-3"
        style={{ top: 0, right: '-30px' }}
      >
        beta
      </span>
    </div>
  )
}

export default Logo
