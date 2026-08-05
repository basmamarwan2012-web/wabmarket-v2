export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`ux-skeleton rounded-md bg-gray-200 dark:bg-gray-800 ${className}`}
    />
  )
}
