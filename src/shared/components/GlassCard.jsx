/**
 * GlassCard
 * The frosted green card used across all centered auth screens.
 * Matches the design: semi-transparent dark green, blurred, rounded-2xl.
 */
export function GlassCard({ children, style = {} }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: '580px',
      // minHeight: '450px',
      background: 'rgba(15, 74, 58, 0.5)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(30px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
      padding: '40px 25px',
      boxShadow: '0 12px 35px rgba(0,0,0,0.35)',
      ...style,
    }}>
      {children}
    </div>
  )
}
