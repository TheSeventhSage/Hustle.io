import { HustleLogoWhite } from '../../../shared/components/HustleLogo'
import Image from '../../../shared/components/Image'

// ─── SPLIT LEFT PANEL ─────────────────────────────────────────────────────────
export const SplitLeftContent = () => (
    <div className="text-white">
        <HustleLogoWhite />
        <div className="mt-[120px]">
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
            src="/src/assets/images/auth_verify.png"
            alt="Hustle Email verification"
            className="w-36 h-auto object-contain"
        />
    </div>
)

// ─── SOCIAL LOGINS ────────────────────────────────────────────────────────────
export const SocialLogins = ({ labelGoogle = 'Google', labelApple = 'Apple' }) => (
    <>
        <div className="flex items-center gap-3 my-8">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[13px] text-text-3">Or continue with</span>
            <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <button
                type="button"
                className="flex items-center justify-center gap-2 h-11 bg-white border border-border rounded-[10px] text-[14px] font-medium text-text-1 cursor-pointer hover:bg-bg transition-colors"
            >
                <img
                    src="https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png"
                    className="w-[18px] h-[18px]"
                    alt="Google"
                />
                {labelGoogle}
            </button>
            <button
                type="button"
                className="flex items-center justify-center gap-2 h-11 bg-white border border-border rounded-[10px] text-[14px] font-medium text-text-1 cursor-pointer hover:bg-bg transition-colors"
            >
                <Image
                    src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                    className="w-[18px] h-[18px]"
                    alt="Apple"
                />
                {labelApple}
            </button>
        </div>
    </>
)

// ─── SHARED STYLE TOKENS (kept for any legacy consumers, values now match tokens) ──
export const authStyles = {
    heading: {},
    sub: {},
    headingWhite: {},
    subWhite: {},
    lightLabel: {},
    error: {},
}
