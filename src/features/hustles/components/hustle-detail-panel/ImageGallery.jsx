import { useState } from 'react'
import { Play } from 'lucide-react'

export function ImageGallery({ images, hasVideoAtIdx }) {
    const [playingIdx, setPlayingIdx] = useState(null)

    if (!images?.length) return null

    return (
        <div className="grid grid-cols-2 gap-2.5">
            {images.map((src, idx) => {
                const isVideo = idx === hasVideoAtIdx
                return (
                    <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-mist">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        {isVideo && playingIdx !== idx && (
                            <button
                                onClick={() => setPlayingIdx(idx)}
                                className="absolute inset-0 flex items-center justify-center bg-black/20"
                                aria-label="Play video"
                            >
                                <span className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                                    <Play size={18} className="text-primary ml-0.5" fill="currentColor" />
                                </span>
                            </button>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
