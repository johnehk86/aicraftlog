interface CalloutProps {
  type?: "info" | "warning" | "error" | "tip";
  children: React.ReactNode;
}

const styles = {
  info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200",
  warning:
    "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-200",
  error:
    "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200",
  tip: "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950/50 dark:text-green-200",
};

const icons = {
  info: "ℹ️",
  warning: "⚠️",
  error: "❌",
  tip: "💡",
};

export default function Callout({ type = "info", children }: CalloutProps) {
  return (
    <div
      className={`my-4 rounded-lg border-l-4 p-4 ${styles[type]}`}
      role="note"
    >
      <div className="flex gap-2">
        <span className="shrink-0">{icons[type]}</span>
        <div className="prose-sm">{children}</div>
      </div>
    </div>
  );
}
