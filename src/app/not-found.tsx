import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <span className="material-symbols-outlined text-[48px] text-primary">
          explore_off
        </span>
      </div>
      <h1 className="mb-2 text-5xl font-bold text-primary">404</h1>
      <h2 className="mb-4 text-xl font-bold">Page Not Found</h2>
      <p className="mb-8 text-slate-500 dark:text-slate-400">
        The page you requested does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
      >
        <span className="material-symbols-outlined text-sm">home</span>
        Back to Home
      </Link>
    </div>
  );
}
