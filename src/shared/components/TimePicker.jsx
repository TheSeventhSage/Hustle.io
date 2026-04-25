import { Clock } from 'lucide-react'

export function TimePicker({ label, value, onChange, placeholder = "Select time", required }) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            {label && (
                <label className="text-[14px] font-medium text-text-1">
                    {label}
                    {required && <span className="text-error ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    type="time"
                    value={value}
                    onChange={onChange}
                    required={required}
                    className="hide-native-icon w-full h-[48px] px-4 bg-bg border border-border rounded-xl text-[14px] text-text-1 focus:outline-none focus:border-primary-sat transition-colors appearance-none relative z-10 bg-transparent"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-0 text-text-3">
                    <Clock size={20} />
                </div>
                <style>{`
          .hide-native-icon::-webkit-calendar-picker-indicator {
            background: transparent;
            bottom: 0;
            color: transparent;
            cursor: pointer;
            height: auto;
            left: 0;
            position: absolute;
            right: 0;
            top: 0;
            width: auto;
          }
        `}</style>
            </div>
        </div>
    )
}
