'use client'

import Image from 'next/image'

export default function TopBar() {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto">
        <div className="flex justify-between px-8 py-2">
          {/* Left section */}
          <div className="flex items-center">
            <button className="text-xs text-black hover:text-blue-500 border border-gray-300 rounded-md p-1.5" >
              DFS WEBNET
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center">
            <button className="flex items-center justify-center bg-white border border-gray-200 rounded-md p-1.5 hover:border-gray-300">
              <Image 
                src="/icons/bnb.svg" 
                alt="BNB" 
                width={16} 
                height={16} 
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 