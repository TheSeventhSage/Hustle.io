import Image from '../../../shared/components/Image'

export function AuthLayout({ children, variant = 'centered', leftPanelContent, splitImage }) {

    // ─── SPLIT LAYOUT ──────────────────────────────────────────────────────────
    if (variant === 'split') {
        return (
            <div className="flex min-h-screen w-screen overflow-hidden">

                {/* Left: image panel */}
                <div className="relative flex-1 flex flex-col justify-center p-12 min-w-80 overflow-hidden hidden lg:flex">
                    <Image
                        src={splitImage}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                    <div className="relative z-10 h-full flex flex-col justify-center">
                        {leftPanelContent}
                    </div>
                </div>

                {/* Right: white form panel */}
                <div className="flex-1 flex items-center justify-center p-6 min-w-80 bg-white dark:bg-surface">
                    <div className="w-full max-w-[480px]">
                        {children}
                    </div>
                </div>

            </div>
        )
    }

    // ─── CENTERED LAYOUT ───────────────────────────────────────────────────────
    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">

            {/* Dark green base */}
            <div className="fixed inset-0 bg-primary z-0" />

            {/* Background image */}
            <Image
                src="/src/assets/images/workers.png"
                alt=""
                aria-hidden="true"
                className="fixed inset-0 w-full h-full object-cover z-[1] opacity-45"
            />

            {/* Overlay */}
            <div className="fixed inset-0 z-[2]" />

            {/* Content */}
            <div className="relative z-[3] w-full flex justify-center">
                {children}
            </div>
        </div>
    )
}
