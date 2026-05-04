import { MapPin, FileText } from 'lucide-react'
import { ImageGallery } from './ImageGallery.jsx'

export function JobDescriptionTab({ hustle }) {
    return (
        <div className="px-5 sm:px-7 py-6">
            {/* Description */}
            <div className="mb-5">
                <p className="text-[13px] font-bold text-text-1 mb-1.5">Description:</p>
                <p className="text-[13px] text-text-3 leading-relaxed">{hustle.description}</p>
            </div>

            {/* Location */}
            <div className="mb-5">
                <p className="text-[12px] text-text-4 mb-0.5">Location</p>
                <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-primary flex-shrink-0" />
                    <p className="text-[14px] font-semibold text-primary">{hustle.location}</p>
                </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5 text-[12px]">
                <div>
                    <p className="text-text-4 mb-0.5">Experience level</p>
                    <p className="font-bold text-primary">{hustle.experienceLevel}</p>
                </div>
                <div>
                    <p className="text-text-4 mb-0.5">Hustle Duration</p>
                    <p className="font-semibold text-text-1">{hustle.duration}</p>
                </div>
                <div>
                    <p className="text-text-4 mb-0.5">Amount:</p>
                    <p className="font-semibold text-text-1">₦ {Number(hustle.amount).toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-text-4 mb-0.5">Preferred time</p>
                    <p className="font-semibold text-primary">{hustle.preferredTime}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                    <p className="text-text-4 mb-0.5">Preferred date</p>
                    <p className="font-semibold text-primary">{hustle.preferredDate}</p>
                </div>
            </div>

            {/* Skills */}
            {hustle.skills?.length > 0 && (
                <div className="mb-5">
                    <p className="text-[13px] font-bold text-text-1 mb-2.5">Skills &amp; expertise</p>
                    <div className="flex flex-wrap gap-2">
                        {hustle.skills.map(s => (
                            <span key={s} className="px-3 py-1.5 bg-bg border border-border rounded-full text-[12px] font-semibold text-text-2">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Attachments */}
            {hustle.attachments?.length > 0 && (
                <div className="mb-6">
                    {hustle.attachments.map((a, i) => (
                        <div key={i} className="flex items-center gap-3 p-3.5 border border-border rounded-xl bg-white">
                            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                <FileText size={16} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-[13px] font-semibold text-text-1">{a.name}</p>
                                <p className="text-[11px] text-text-4">{a.size}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Image gallery */}
            <ImageGallery images={hustle.images} hasVideoAtIdx={hustle.hasVideoAtIdx} />
        </div>
    )
}
