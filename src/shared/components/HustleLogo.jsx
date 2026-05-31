import Image from './Image';

export function HustleLogo({ size = '48', color = 'var(--color-primary)', fontSize = '16px', direction = 'column', gap = '6px', text = 'HUSTLE' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${gap}` }} className={`flex-${direction}`} >
      {/* S mark — gold gradient square with cutout */}
      <Image
        size={size}
        src='/images/logo.png'
        alt='Hustle Logo'
      // style={{ borderRadius: '12px' }}
      />

      {/* HUSTLE wordmark */}
      <span style={{
        fontFamily: 'var(--ff-display)',
        fontSize: fontSize,
        fontWeight: 700,
        letterSpacing: '0.18em',
        color: color,
      }}>
        {text}
      </span>
    </div>
  )
}

/**
 * HustleLogoWhite — same but for use on dark/glass backgrounds
 */
export function HustleLogoWhite({ size = 48, radius = '12px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <img
        src='/images/logo.png'
        alt='Hustle Logo'
        style={{ width: size, borderRadius: radius }}
      />
      <span style={{
        fontFamily: 'var(--ff-display)',
        fontSize: '16px',
        fontWeight: 700,
        letterSpacing: '0.18em',
        color: '#fff',
      }}>
        HUSTLE
      </span>
    </div>
  )
}

/**
 * HustleLogoWhite — same but for use on dark/glass backgrounds
 */
export function HustleLogoText({ size = 48, className, }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }} className={className}>
      <img
        src='/images/logo-text.png'
        alt='Hustle Logo'
        style={{ width: size, }}
      />
    </div>
  )
}
