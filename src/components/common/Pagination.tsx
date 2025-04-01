import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  queryParams?: Record<string, string>;
}

interface PaginationButtonProps {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}

const baseButtonStyles =
  "px-3 py-1 border border-gray-200 rounded transition-colors duration-200";
const activeButtonStyles = "text-[#0784c3] hover:bg-[#0784c3] hover:text-white";
const disabledButtonStyles = "text-gray-400 pointer-events-none bg-gray-100";

const PaginationButton = ({
  href,
  disabled,
  children,
}: PaginationButtonProps) => (
  <Link
    href={href}
    className={`${baseButtonStyles} ${
      disabled ? disabledButtonStyles : activeButtonStyles
    }`}
  >
    {children}
  </Link>
);

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  queryParams = {},
}: PaginationProps) {
  const getPageUrl = (page: number) => {
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");
    const pageQuery = `page=${page}`;
    return `${basePath}?${pageQuery}${queryString ? `&${queryString}` : ""}`;
  };

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex items-center justify-end gap-1 text-xs p-4">
      <PaginationButton href={getPageUrl(1)} disabled={isFirstPage}>
        First
      </PaginationButton>

      <PaginationButton
        href={getPageUrl(Math.max(1, currentPage - 1))}
        disabled={isFirstPage}
      >
        ‹
      </PaginationButton>

      <div className="px-3 py-1 text-gray-500 bg-gray-100 border border-gray-200 rounded transition-colors duration-200">
        Page {currentPage} of {totalPages}
      </div>

      <PaginationButton
        href={getPageUrl(Math.min(totalPages, currentPage + 1))}
        disabled={isLastPage}
      >
        ›
      </PaginationButton>

      <PaginationButton href={getPageUrl(totalPages)} disabled={isLastPage}>
        Last
      </PaginationButton>
    </div>
  );
}
