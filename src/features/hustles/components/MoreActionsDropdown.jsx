import { Dropdown, DropdownItem } from '../../../shared/components/Dropdown.jsx'
import { MoreVertical } from 'lucide-react'

export function MoreActionsDropdown({ onShare, onHide, onReport }) {
    return (
        <Dropdown
            className='mt-1 mr-3'
            align="right"
            trigger={
                <button
                    className="w-8 h-8 flex items-center justify-center rounded-xl text-text-4
            hover:bg-mist hover:text-text-1 transition-all"
                    aria-label="More actions"
                >
                    <MoreVertical size={18} />
                </button>
            }
        >
            {(close) => (
                <div className="py-2 w-[220px]">
                    <div className="px-4 py-2 border-b border-mist">
                        <p className="text-[13px] font-bold text-text-1">More</p>
                    </div>

                    <div className="py-1">
                        <DropdownItem
                            icon={<i className="fa-solid fa-share-nodes text-[14px]" />}
                            label="Share this hustler's profile"
                            onClick={() => {
                                onShare?.()
                                close()
                            }}
                        />
                        <DropdownItem
                            icon={<i className="fa-solid fa-eye-slash text-[14px]" />}
                            label="Hide this hustler"
                            onClick={() => {
                                onHide?.()
                                close()
                            }}
                        />
                        <DropdownItem
                            icon={<i className="fa-solid fa-flag text-[14px] text-[#EF4444]" />}
                            label="Report this hustler"
                            labelClassName="text-[#EF4444]"
                            onClick={() => {
                                onReport?.()
                                close()
                            }}
                        />
                    </div>
                </div>
            )}
        </Dropdown>
    )
}
