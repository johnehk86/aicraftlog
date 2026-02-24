import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {currentPage > 1 && (
        <Link
          href={
            currentPage === 2
              ? basePath
              : `${basePath}?page=${currentPage - 1}`
          }
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:border-primary/20 dark:hover:bg-primary/10"
        >
          <span className="material-symbols-outlined text-sm">
            chevron_left
          </span>
          Prev
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={page === 1 ? basePath : `${basePath}?page=${page}`}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            page === currentPage
              ? "bg-primary text-white"
              : "border border-slate-200 hover:bg-slate-100 dark:border-primary/20 dark:hover:bg-primary/10"
          }`}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors hover:bg-slate-100 dark:border-primary/20 dark:hover:bg-primary/10"
        >
          Next
          <span className="material-symbols-outlined text-sm">
            chevron_right
          </span>
        </Link>
      )}
    </nav>
  );
}
