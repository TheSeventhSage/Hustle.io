import Image from './Image';

export function HustleLogo({ size = 48, color = 'var(--color-primary)', fontSize = '16px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      {/* S mark — gold gradient square with cutout */}
      <Image
        src='/images/logo.png'
        alt='Hustle Logo'
        style={{ width: size, height: size, borderRadius: '12px' }}
      />

      {/* HUSTLE wordmark */}
      <span style={{
        fontFamily: 'var(--ff-display)',
        fontSize: fontSize,
        fontWeight: 700,
        letterSpacing: '0.18em',
        color: color,
      }}>
        HUSTLE
      </span>
    </div>
  )
}

/**
 * HustleLogoWhite — same but for use on dark/glass backgrounds
 */
export function HustleLogoWhite({ size = 48 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <Image
        src='/images/logo.png'
        alt='Hustle Logo'
        style={{ width: size, borderRadius: '32px' }}
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
export function HustleLogoText({ size = 48, className }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} className={className}>
      <Image
        src='/images/logo-text.png'
        alt='Hustle Logo'
        style={{ width: size, }}
      />
    </div>
  )
}
