import { useState } from 'react'
import { Dropdown, DropdownItem } from '../../../shared/components/Dropdown.jsx'
import { Share2, Check } from 'lucide-react'
import useUIStore from '../../../shared/store/ui.store.js'

export function ShareDropdown({ hustlerId, hustlerName }) {
    const { toastSuccess } = useUIStore()
    const [copied, setCopied] = useState(false)

    const shareUrl = `${window.location.origin}/hustle/job/${hustlerId}/product-designer-ground-mountum_source=dashboard_recommended`

    const handleCopyLink = () => {
        navigator.clipboard?.writeText(shareUrl).then(() => {
            setCopied(true)
            toastSuccess('Link copied!')
            setTimeout(() => setCopied(false), 2000)
        })
    }

    const handleSocialShare = (platform, close) => {
        const encodedUrl = encodeURIComponent(shareUrl)
        const encodedText = encodeURIComponent(`Check out ${hustlerName || 'this hustler'} on Hustle.io`)

        const urls = {
            whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
            instagram: shareUrl,
        }

        if (platform === 'instagram') {
            handleCopyLink()
            toastSuccess('Link copied! Open Instagram to share.')
        } else {
            window.open(urls[platform], '_blank', 'width=600,height=400')
        }
        close()
    }

    return (
        <Dropdown
            className='mt-1'
            align="right"
            val='3'
            trigger={
                <button
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4
            hover:bg-mist hover:text-text-1 transition-all"
                    aria-label="Share"
                >
                    <Share2 size={15} />
                </button>
            }
        >
            {(close) => (
                <div className="py-2 w-[300px]">
                    <div className="px-4 py-2 border-b border-mist">
                        <p className="text-[13px] font-bold text-text-1">Share</p>
                    </div>

                    <div className="py-1">
                        <DropdownItem
                            icon={<i className="fa-brands fa-whatsapp text-[18px] text-[#25D366]" />}
                            label="Whatsapp"
                            onClick={() => handleSocialShare('whatsapp', close)}
                        />
                        <DropdownItem
                            icon={<i className="fa-brands fa-facebook text-[18px] text-[#1877F2]" />}
                            label="Facebook"
                            onClick={() => handleSocialShare('facebook', close)}
                        />
                        <DropdownItem
                            icon={<i className="fa-brands fa-linkedin text-[18px] text-[#0A66C2]" />}
                            label="Linkedin"
                            onClick={() => handleSocialShare('linkedin', close)}
                        />
                        <DropdownItem
                            icon={<i className="fa-brands fa-x-twitter text-[18px] text-[#000000]" />}
                            label="X (twitter)"
                            onClick={() => handleSocialShare('twitter', close)}
                        />
                        <DropdownItem
                            icon={<i className="fa-brands fa-instagram text-[18px] text-[#E4405F]" />}
                            label="Instagram"
                            onClick={() => handleSocialShare('instagram', close)}
                        />
                    </div>

                    <div className="px-4 py-3 border-t border-mist">
                        <div className="bg-mist rounded-lg p-2.5 mb-2">
                            <p className="text-[11px] text-text-3 truncate font-mono mb-2">
                                {shareUrl}
                            </p>
                        </div>
                        <button
                            onClick={handleCopyLink}
                            className="w-full py-2 bg-white border border-border rounded-lg
                text-[12px] font-semibold text-primary hover:bg-mist transition-colors
                flex items-center justify-center gap-1.5"
                        >
                            {copied ? (
                                <>
                                    <Check size={14} className="text-green-600" />
                                    <span>Copied</span>
                                </>
                            ) : (
                                <span>Copy Link</span>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </Dropdown>
    )
}
