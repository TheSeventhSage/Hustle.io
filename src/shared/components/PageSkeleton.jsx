export default function PageSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-[var(--color-mist)] mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-[var(--color-mist)] h-52" />
        ))}
      </div>
    </div>
  )
}
