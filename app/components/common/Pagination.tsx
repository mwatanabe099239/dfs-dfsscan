import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  queryParams?: Record<string, string>
}

export default function Pagination({ currentPage, totalPages, basePath, queryParams = {} }: PaginationProps) {
  // Construct query string from additional params
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  
  const getPageUrl = (page: number) => {
    const pageQuery = `page=${page}`
    const fullQuery = queryString ? `${pageQuery}&${queryString}` : pageQuery
    return `${basePath}?${fullQuery}`
  }

  return (
    <div className="p-4 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        Showing page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Link 
          href={getPageUrl(1)}
          className={`px-3 py-1 border rounded hover:bg-gray-50 ${
            currentPage === 1 ? 'text-gray-400 pointer-events-none' : ''
          }`}
        >
          First
        </Link>
        <Link 
          href={getPageUrl(Math.max(1, currentPage - 1))}
          className={`px-3 py-1 border rounded hover:bg-gray-50 ${
            currentPage === 1 ? 'text-gray-400 pointer-events-none' : ''
          }`}
        >
          ‹
        </Link>
        <span className="px-3 py-1">
          Page {currentPage} of {totalPages}
        </span>
        <Link 
          href={getPageUrl(Math.min(totalPages, currentPage + 1))}
          className={`px-3 py-1 border rounded hover:bg-gray-50 ${
            currentPage === totalPages ? 'text-gray-400 pointer-events-none' : ''
          }`}
        >
          ›
        </Link>
        <Link 
          href={getPageUrl(totalPages)}
          className={`px-3 py-1 border rounded hover:bg-gray-50 ${
            currentPage === totalPages ? 'text-gray-400 pointer-events-none' : ''
          }`}
        >
          Last
        </Link>
      </div>
    </div>
  )
} 