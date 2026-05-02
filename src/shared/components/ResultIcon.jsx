import { X, Check } from 'lucide-react'

/**
 * ResultIcon
 * Renders the animated dotted-ring icon used in success / failure / pending states.
 * type: 'success' | 'error' | 'pending'
 */
export function ResultIcon({ type = 'success', size = 72 }) {
    const config = {
        success: { bg: '#22c55e', dotColor: '#22c55e', Icon: Check },
        error: { bg: '#ef4444', dotColor: '#ef4444', Icon: X },
        pending: {
            bg: '#f59e0b', dotColor: '#f59e0b', Icon: () => (
                // Hourglass SVG inline
                <svg width={size * 0.38} height={size * 0.38} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 1 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                </svg>
            )
        },
    }

    const { bg, dotColor, Icon } = config[type]
    const DOT_COUNT = 12
    const RING_RADIUS = size * 0.46
    const DOT_R = size * 0.045

    return (
        <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Dotted ring */}
            <svg
                width={size} height={size}
                viewBox={`0 0 ${size} ${size}`}
                style={{ position: 'absolute', inset: 0, animation: 'spinSlow 8s linear infinite' }}
            >
                {[...Array(DOT_COUNT)].map((_, i) => {
                    const angle = (i / DOT_COUNT) * 2 * Math.PI - Math.PI / 2
                    const cx = size / 2 + RING_RADIUS * Math.cos(angle)
                    const cy = size / 2 + RING_RADIUS * Math.sin(angle)
                    const opacity = 0.25 + (i / DOT_COUNT) * 0.75
                    return <circle key={i} cx={cx} cy={cy} r={DOT_R} fill={dotColor} opacity={opacity} />
                })}
            </svg>

            {/* Inner circle */}
            <div style={{
                width: size * 0.65, height: size * 0.65,
                borderRadius: '50%',
                background: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 1,
                boxShadow: `0 4px 20px ${bg}55`,
            }}>
                <Icon size={size * 0.32} color="white" strokeWidth={2.5} />
            </div>

            <style>{`
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </div>
    )
}
