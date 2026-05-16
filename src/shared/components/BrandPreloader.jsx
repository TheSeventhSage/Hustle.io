export default function BrandPreloader({ mode = 'fixed' }) {
  const wrapperClassName = mode === 'fill'
    ? 'absolute inset-0'
    : 'fixed inset-0'

  return (
    <div
      className={`${wrapperClassName} z-[999] flex items-center justify-center overflow-hidden bg-[var(--color-primary-500)] text-white`}
      aria-label="Loading"
      role="status"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(222,183,81,0.18),transparent_30%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:38px_38px]" />

      <div className="relative flex flex-col items-center justify-center">
        <div className="brand-preloader-glow absolute h-40 w-40 rounded-full" />
        <div className="brand-preloader-pulse relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-[var(--color-secondary)]/40 bg-white/5 backdrop-blur-md shadow-[0_0_0_1px_rgba(222,183,81,0.14),0_0_32px_rgba(222,183,81,0.18)]">
          <img
            src="/images/logo.png"
            alt="Hustle"
            loading="eager"
            className="h-16 w-16 object-contain drop-shadow-[0_0_18px_rgba(222,183,81,0.45)]"
          />
        </div>
      </div>
    </div>
  )
}
