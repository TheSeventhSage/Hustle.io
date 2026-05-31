import { cn } from '../utils/cn.js'

/**
 * GlassCard
 * The frosted green card used across all centered auth screens.
 * Matches the design: semi-transparent dark green, blurred, rounded-2xl.
 */
export function GlassCard({ children, className, style = {}, ...props }) {
  return (
    <div
      className={cn('w-full max-w-[580px] px-5 py-8 lg:px-[25px] lg:py-10', className)}
      style={{
        background: 'rgba(15, 74, 58, 0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        boxShadow: '0 12px 35px rgba(0,0,0,0.35)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
