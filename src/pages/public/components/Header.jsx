/* ─────────────────────────────────────────────
   BRAND TOKENS (Sourced precisely from your system)
───────────────────────────────────────────── */
const T = {
    p300: "var(--color-primary-300)",
    p400: "var(--color-primary-400)",
    surface: "var(--color-surface)",
    border: "var(--color-border)",
    t1: "var(--color-text-1)",
    t3: "var(--color-text-3)",
};

const G = {
    heroOverlay: `radial-gradient(ellipse 80% 60% at 50% -10%, ${T.p300}15 0%, transparent 70%)`,
};

/**
 * SimplePageHeader Component
 * @param {string} title - The main heading text for the view.
 * @param {string} description - Brief summary context describing what is on the page.
 * @param {string} [badge] - Optional upper category/context label.
 */
export default function SimplePageHeader({ title, description, badge }) {
    return (
        <header style={{
            background: T.surface,
            position: "relative",
            overflow: "hidden",
            paddingTop: "54px",
            paddingBottom: "48px",
            textAlign: "center",
            borderBottom: `1px solid ${T.border}`
        }}>
            {/* Structural Ambient Background Glow Layer */}
            <div style={{
                position: "absolute",
                top: "-60px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "760px",
                height: "360px",
                background: G.heroOverlay,
                pointerEvents: "none"
            }} />

            <div style={{ position: "relative", maxWidth: "680px", margin: "0 auto", padding: "0 24px" }}>

                {/* Optional Context Badge */}
                {badge && (
                    <span style={{
                        display: "inline-block",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        color: T.p400,
                        background: `${T.p400}12`,
                        padding: "4px 10px",
                        borderRadius: "6px",
                        marginBottom: "12px"
                    }}>
                        {badge}
                    </span>
                )}

                {/* Responsive Page Title */}
                <h1 style={{
                    fontSize: "clamp(1.75rem, 3.5vw, 2.3rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    color: T.t1,
                    margin: "0 0 10px",
                    lineHeight: 1.25
                }}>
                    {title}
                </h1>

                {/* Descriptive Summary Context */}
                {description && (
                    <p style={{
                        fontSize: "14px",
                        color: T.t3,
                        lineHeight: 1.6,
                        maxWidth: "520px",
                        margin: "0 auto"
                    }}>
                        {description}
                    </p>
                )}

            </div>
        </header>
    );
}