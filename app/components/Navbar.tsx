'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 pl-8">
        <div className="flex h-16">
          {/* Navigation Links with Logo */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold text-blue-500 mr-6">
              DFS Scan
            </Link>

            {/* Navigation Links */}
            <div className="flex space-x-8">
              <Link 
                href="/blocks" 
                className="border-transparent text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Blockchain
              </Link>
              <Link 
                href="/txs" 
                className="border-transparent text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Transactions
              </Link>
              <Link 
                href="/tokens" 
                className="border-transparent text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Tokens
              </Link>
              <Link 
                href="/resources" 
                className="border-transparent text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Resources
              </Link>
              <Link 
                href="/more" 
                className="border-transparent text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 