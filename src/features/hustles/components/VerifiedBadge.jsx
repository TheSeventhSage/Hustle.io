/**
 * VerifiedBadge
 * Green checkmark badge for verified hustlers
 */
export function VerifiedBadge({ size = 16 }) {
    return (
        <img
            src="/images/verify.png"
            alt="Email verification"
            className={`w-[${size}] h-auto object-contain`}
        />
    )
}
