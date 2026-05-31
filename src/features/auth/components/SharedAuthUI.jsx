import { HustleLogoWhite } from '../../../shared/components/HustleLogo'

// ─── SPLIT LEFT PANEL ─────────────────────────────────────────────────────────
export const SplitLeftContent = () => (
    <div className="text-white">
        <HustleLogoWhite />
        <div className="mt-36">
            <h1 className="text-[36px] font-bold leading-tight mb-4">
                A community where you can <br />
                <span className="text-primary-light">Hustle & Grow</span>
            </h1>
            <p className="text-lg opacity-80 max-w-[80%]">
                Find exactly what you need to get your projects done, or offer your skills to those who need them.
            </p>
        </div>
    </div>
)

// ─── PAPER PLANE ICON ─────────────────────────────────────────────────────────
export const PaperPlaneIcon = () => (
    <div className="flex justify-center my-2 mb-6">
        <img
            src="/images/auth_verify.png"
            alt="Hustle Email verification"
            className="w-36 h-auto object-contain"
        />
    </div>
)

// ─── SOCIAL LOGINS ────────────────────────────────────────────────────────────
// ─── SHARED STYLE TOKENS (kept for any legacy consumers, values now match tokens) ──
export const authStyles = {
    heading: {},
    sub: {},
    headingWhite: {},
    subWhite: {},
    lightLabel: {},
    error: {},
}
