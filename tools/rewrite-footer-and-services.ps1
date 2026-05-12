$root = 'C:\Users\user\Documents\Career_journey\SS_2026\Hustle.io'

$homeFooter = Join-Path $root 'src\pages\public\home\components\HustleIOPremiumSections.jsx'
$homeText = Get-Content -Raw $homeFooter
$homePattern = '(?s)export function FooterSection\(\) \{.*\z'
$homeReplacement = @'
export function FooterSection() {
    return (
        <footer className="mt-10 overflow-hidden rounded-t-[3rem] bg-[#07130f] pt-24 pb-12 text-white">
            <div className="absolute top-0 right-0 w-[460px] h-[460px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="grid gap-10 lg:grid-cols-[1.25fr_0.75fr]">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
                            Hustle IO
                        </div>
                        <h2 className="mt-6 max-w-2xl text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
                            Premium work, trusted people, less friction.
                        </h2>
                        <p className="mt-5 max-w-xl text-sm lg:text-[15px] leading-relaxed text-white/68">
                            A clean marketplace for clients who need work done and hustlers who want better opportunities, faster decisions, and safer payments.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold text-white/80">Verified talent</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold text-white/80">Escrow backed</span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold text-white/80">Fast matching</span>
                        </div>
                        <div className="mt-10 space-y-3 text-sm text-white/72">
                            <div className="flex items-start gap-3">
                                <MapPin size={18} className="mt-0.5 text-secondary" />
                                <p>123 Innovation Drive, Tech District<br />Accra, Ghana</p>
                            </div>
                            <a href="mailto:hello@hustle.io" className="flex items-center gap-3 transition-colors hover:text-white">
                                <Mail size={18} className="text-secondary" />
                                hello@hustle.io
                            </a>
                            <a href="tel:+233000000000" className="flex items-center gap-3 transition-colors hover:text-white">
                                <Phone size={18} className="text-secondary" />
                                +233 (0) 000 000 000
                            </a>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">Build with us</p>
                            <p className="mt-3 text-sm leading-relaxed text-white/72">
                                If you are posting work or offering it, the experience should feel clear, premium, and fast.
                            </p>
                            <div className="mt-5 flex items-center gap-3">
                                <button className="h-11 rounded-full bg-secondary px-5 text-sm font-bold text-primary transition-colors hover:bg-white">
                                    Contact Us
                                </button>
                                <span className="text-xs text-white/45">Usually replies within 24 hours</span>
                            </div>
                        </div>

                        <div className="rounded-[28px] border border-white/10 bg-black/20 p-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">Availability</p>
                            <p className="mt-3 text-sm text-white/72">
                                Always on for postings, bookings, and support.
                            </p>
                            <div className="mt-5 flex items-center gap-3">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                <span className="text-sm text-white/72">Open 24/7</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <HustleLogo size='32' direction='row' color='white' fontSize='22px' gap='8px' />
                    </div>
                    <p className="text-sm text-white/50 font-light text-center">
                        &copy; {new Date().getFullYear()} Hustle IO Ecosystem. All rights reserved.
                    </p>
                    <div className="flex gap-3">
                        <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white">
                            <Twitter size={18} />
                        </a>
                        <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white">
                            <Instagram size={18} />
                        </a>
                        <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-all hover:bg-white/10 hover:text-white">
                            <Linkedin size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
'@
$homeText = [regex]::Replace($homeText, $homePattern, $homeReplacement)
Set-Content -Path $homeFooter -Value $homeText

$layoutFile = Join-Path $root 'src\pages\public\components\PublicLayout.jsx'
$layoutText = Get-Content -Raw $layoutFile
$layoutPattern = '(?s)            /\* Footer \*/.*?            </footer>'
$layoutReplacement = @'
            {/* Footer */}
            <footer className="bg-[#07130f] text-white pt-16 pb-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
                        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-10">
                            <div>
                                <HustleLogoText size="140px" color="#FFFFFF" className="mb-4" />
                                <p className="max-w-xl text-sm sm:text-[15px] leading-relaxed text-white/72">
                                    Hustle.io connects clients to trusted talent with a clean booking flow, strong payment handling, and a standard that feels premium at every step.
                                </p>
                                <div className="mt-6 flex flex-wrap items-center gap-3">
                                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold text-white/80">Verified professionals</span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold text-white/80">Secure escrow</span>
                                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[12px] font-semibold text-white/80">Fast matching</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between gap-6 lg:pl-8 lg:border-l lg:border-white/10">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">Reach us</p>
                                    <div className="mt-4 space-y-3 text-sm">
                                        <a href="mailto:hello@hustleapp.com" className="flex items-center gap-3 text-white/75 transition-colors hover:text-white">
                                            <Mail size={16} className="text-secondary" />
                                            hello@hustleapp.com
                                        </a>
                                        <a href="tel:+233000000000" className="flex items-center gap-3 text-white/75 transition-colors hover:text-white">
                                            <Phone size={16} className="text-secondary" />
                                            +233 (0) 000 000 000
                                        </a>
                                        <div className="flex items-center gap-3 text-white/75">
                                            <MapPin size={16} className="text-secondary" />
                                            Accra, Ghana
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">Platform note</p>
                                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                                        Built for people who want to post work, find talent, and move with clarity.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-white/55">
                                &copy; {new Date().getFullYear()} HustleApp. All rights reserved.
                            </p>
                            <div className="flex items-center gap-3">
                                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                                    <span className="sr-only">Instagram</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                                    <span className="sr-only">X</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.474l8.61-9.83L0 1.154h7.594l5.243 6.932 6.064-6.93Zm-1.29 19.49h2.039L6.486 3.239H4.298l13.312 17.404Z" /></svg>
                                </a>
                                <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0H5C2.239 0 0 2.239 0 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5V5c0-2.761-2.238-5-5-5ZM7.12 20.452H3.677V9h3.443v11.452ZM5.398 7.433a2.01 2.01 0 1 1 0-4.02 2.01 2.01 0 0 1 0 4.02Zm15.054 13.019h-3.441v-5.568c0-1.328-.024-3.037-1.852-3.037-1.855 0-2.138 1.448-2.138 2.94v5.665H9.58V9h3.302v1.562h.046c.46-.87 1.587-1.787 3.265-1.787 3.49 0 4.134 2.297 4.134 5.285v6.392Z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
'@
$layoutText = [regex]::Replace($layoutText, $layoutPattern, $layoutReplacement)
Set-Content -Path $layoutFile -Value $layoutText

$servicesFile = Join-Path $root 'src\pages\public\ServicesPage.jsx'
$servicesText = Get-Content -Raw $servicesFile
$servicesText = $servicesText.Replace('<section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/5 py-20">','<section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,rgba(222,183,55,0.16),transparent_42%),linear-gradient(180deg,#081812_0%,#0f1f19_100%)] py-20 text-white">')
$servicesText = $servicesText.Replace('<h1 className="text-4xl sm:text-5xl font-extrabold text-text-1 mb-6">','<h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">')
$servicesText = $servicesText.Replace('<p className="text-lg text-text-3 mb-10 leading-relaxed">','<p className="text-lg text-white/68 mb-10 leading-relaxed">')
$servicesText = $servicesText.Replace('<div className="flex items-center gap-3 bg-white border-2 border-border rounded-full p-2 shadow-md hover:border-primary transition-colors">','<div className="flex items-center gap-3 rounded-full border border-white/12 bg-white/8 p-2 shadow-2xl shadow-black/20 backdrop-blur-md hover:border-secondary/40 transition-colors">')
$servicesText = $servicesText.Replace('<Search size={20} className="text-text-3 ml-4" />','<Search size={20} className="ml-4 text-white/55" />')
$servicesText = $servicesText.Replace('className="flex-1 h-10 px-2 outline-none text-sm"','className="flex-1 h-10 px-2 outline-none text-sm bg-transparent text-white placeholder:text-white/40"')
$servicesText = $servicesText.Replace('<Button variant="solid" className="h-10 px-6 rounded-full font-semibold bg-primary">','<Button variant="solid" className="h-10 px-6 rounded-full font-semibold bg-secondary text-primary hover:bg-white">')
$servicesText = $servicesText.Replace('<p className="text-xs text-text-3 mb-3">Popular searches:</p>','<p className="text-xs text-white/45 mb-3">Popular searches:</p>')
$servicesText = $servicesText.Replace('className="px-4 py-1.5 bg-white border border-border rounded-full text-xs font-medium text-text-2 hover:border-primary hover:text-primary transition-colors"','className="px-4 py-1.5 rounded-full border border-white/10 bg-white/6 text-xs font-medium text-white/78 transition-colors hover:border-secondary/40 hover:text-white"')
$servicesText = $servicesText.Replace('<section className="py-8 bg-white border-y border-border">','<section className="border-y border-white/10 bg-[#08140f] py-8 text-white">')
$servicesText = $servicesText.Replace('<div className="text-2xl font-extrabold text-primary mb-1">2,500+</div>','<div className="text-2xl font-extrabold text-secondary mb-1">2,500+</div>')
$servicesText = $servicesText.Replace('<div className="text-2xl font-extrabold text-primary mb-1">50+</div>','<div className="text-2xl font-extrabold text-secondary mb-1">50+</div>')
$servicesText = $servicesText.Replace('<div className="text-2xl font-extrabold text-primary mb-1">5</div>','<div className="text-2xl font-extrabold text-secondary mb-1">5</div>')
$servicesText = $servicesText.Replace('<div className="text-2xl font-extrabold text-primary mb-1">4.9/5</div>','<div className="text-2xl font-extrabold text-secondary mb-1">4.9/5</div>')
$servicesText = $servicesText.Replace('<div className="w-px h-8 bg-border hidden sm:block" />','<div className="w-px h-8 bg-white/10 hidden sm:block" />')
$servicesText = $servicesText.Replace('<div className="text-xs text-text-3">Verified Providers</div>','<div className="text-xs text-white/45">Verified Providers</div>')
$servicesText = $servicesText.Replace('<div className="text-xs text-text-3">Service Categories</div>','<div className="text-xs text-white/45">Service Categories</div>')
$servicesText = $servicesText.Replace('<div className="text-xs text-text-3">Cities Covered</div>','<div className="text-xs text-white/45">Cities Covered</div>')
$servicesText = $servicesText.Replace('<div className="text-xs text-text-3">Average Rating</div>','<div className="text-xs text-white/45">Average Rating</div>')
$servicesText = $servicesText.Replace('<section className="py-20 bg-bg">','<section className="py-20 bg-[#07130f] text-white">')
$servicesText = $servicesText.Replace('<h2 className="text-3xl font-extrabold text-text-1 mb-2">','<h2 className="text-3xl font-extrabold text-white mb-2">')
$servicesText = $servicesText.Replace('<p className="text-text-3">','<p className="text-white/45">')
$servicesText = $servicesText.Replace('className="h-10 px-4 border border-border rounded-lg outline-none focus:border-primary transition-colors bg-white text-sm"','className="h-10 px-4 rounded-lg border border-white/10 bg-white/6 text-sm text-white outline-none transition-colors focus:border-secondary/50"')
$servicesText = $servicesText.Replace('<p className="text-[15px] font-bold text-text-1 mb-2">No services available</p>','<p className="text-[15px] font-bold text-white mb-2">No services available</p>')
$servicesText = $servicesText.Replace('<p className="text-[13px] text-text-4">Check back soon for new listings.</p>','<p className="text-[13px] text-white/45">Check back soon for new listings.</p>')
Set-Content -Path $servicesFile -Value $servicesText
