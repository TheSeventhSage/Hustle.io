import { Briefcase } from 'lucide-react'
import { ApplicantTile } from './ApplicantTile.jsx'

export function ApplicantsTab({ applicants, onSelectApplicant }) {
    if (!applicants?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-3 px-5">
                <div className="w-16 h-16 rounded-2xl bg-mist flex items-center justify-center">
                    <Briefcase size={28} className="text-text-4" />
                </div>
                <p className="text-[14px] font-semibold text-text-3">No applicant yet</p>
            </div>
        )
    }

    return (
        <div className="px-5 sm:px-7 py-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {applicants.map(a => (
                <ApplicantTile key={a.id} applicant={a} onClick={() => onSelectApplicant(a)} />
            ))}
        </div>
    )
}
