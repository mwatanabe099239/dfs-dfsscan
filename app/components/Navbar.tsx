'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()

  const getMenuStyle = (path: string) => {
    const isActive = pathname === path
    return `inline-flex items-center px-4 text-[15px] ${
      isActive 
        ? 'text-[#3498db]' 
        : 'text-black hover:text-[#3498db]'
    }`
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-[0_2px_4px_0_rgba(0,0,0,0.05)]">
      <div className="container mx-auto">
        <div className="flex justify-between h-[60px] px-8">
          {/* Left section with Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-[#3498db]">
              DWC Scan
            </Link>
          </div>

          {/* Right section with navigation links */}
          <div className="flex h-full -mr-4">
            <Link 
              href="/" 
              className={getMenuStyle('/')}
            >
              Home
            </Link>
            <Link 
              href="/txs" 
              className={getMenuStyle('/txs')}
            >
              Transactions
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 