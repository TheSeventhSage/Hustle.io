import { useState, useRef, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import 'react-day-picker/style.css'
import '../../styles/DateTimePicker.css'

// ── Base Dropdown Wrapper ─────────────────────────────────────────────────────
function DropdownWrapper({ isOpen, onClose, title, children, anchorRef }) {
    const dropdownRef = useRef(null)

    useEffect(() => {
        if (!isOpen) return
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                anchorRef?.current && !anchorRef.current.contains(event.target)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose, anchorRef])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface rounded-2xl shadow-2xl border border-border z-[60] overflow-hidden"
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[15px] font-bold text-text-2">{title}</h3>
                        <button
                            onClick={onClose}
                            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-mist transition-all"
                        >
                            <X size={14} className="text-text-3" />
                        </button>
                    </div>
                </div>
                {children}
            </motion.div>
        </AnimatePresence>
    )
}

// ── Date Picker Dropdown ──────────────────────────────────────────────────────
export function DatePickerDropdown({ isOpen, onClose, onSelect, selectedDate, title = 'Select date', anchorRef, minDate }) {
    const [selected, setSelected] = useState(selectedDate)

    useEffect(() => {
        if (isOpen) {
            setSelected(selectedDate)
        }
    }, [isOpen, selectedDate])

    const handleSelect = (date) => {
        setSelected(date)
    }

    const handleConfirm = () => {
        onSelect(selected)
        onClose()
    }

    return (
        <DropdownWrapper isOpen={isOpen} onClose={onClose} title={title} anchorRef={anchorRef}>
            <div className="p-4">
                <DayPicker
                    mode="single"
                    selected={selected}
                    onSelect={handleSelect}
                    disabled={{ before: minDate || new Date() }}
                    classNames={{
                        root: 'hustle-day-picker',
                        months: 'flex flex-col',
                        month: 'space-y-4',
                        month_caption: 'flex justify-center items-center h-10 relative mb-2',
                        caption_label: 'text-[15px] font-semibold text-text-2',
                        nav: 'flex items-center gap-1',
                        button_previous: 'absolute left-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-mist transition-all',
                        button_next: 'absolute right-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-mist transition-all',
                        month_grid: 'w-full border-collapse',
                        weekdays: 'flex',
                        weekday: 'text-text-4 font-medium text-[12px] w-[14.28%] text-center pb-2',
                        week: 'flex w-full',
                        day: 'w-[14.28%] p-0',
                        day_button: 'w-full h-10 flex items-center justify-center text-[14px] font-medium text-text-2 hover:bg-mist rounded-xl transition-all',
                        selected: 'bg-primary-light text-white hover:bg-primary-light rounded-full',
                        today: 'font-bold text-primary',
                        disabled: 'text-text-4 opacity-40 cursor-not-allowed hover:bg-transparent',
                        outside: 'text-text-4 opacity-30',
                    }}
                    components={{
                        Chevron: ({ orientation }) => (
                            orientation === 'left' ? <ChevronLeft size={16} className="text-text-3" /> : <ChevronRight size={16} className="text-text-3" />
                        ),
                    }}
                />

                <button
                    onClick={handleConfirm}
                    disabled={!selected}
                    className="w-full h-12 mt-4 bg-primary hover:bg-primary-sat text-white font-bold text-[14px] rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Select
                </button>
            </div>
        </DropdownWrapper>
    )
}

// ── Time Picker Dropdown ──────────────────────────────────────────────────────
export function TimePickerDropdown({ isOpen, onClose, onSelect, selectedTime, title = 'Select time', anchorRef }) {
    const [hour, setHour] = useState(() => {
        if (selectedTime) {
            const [h] = selectedTime.split(':')
            return parseInt(h) % 12 || 12
        }
        return 8
    })

    const [minute, setMinute] = useState(() => {
        if (selectedTime) {
            const [, m] = selectedTime.split(':')
            return parseInt(m)
        }
        return 0
    })

    const [period, setPeriod] = useState(() => {
        if (selectedTime) {
            const [h] = selectedTime.split(':')
            return parseInt(h) >= 12 ? 'PM' : 'AM'
        }
        return 'PM'
    })

    const hourRef = useRef(null)
    const minuteRef = useRef(null)
    const periodRef = useRef(null)

    // Scroll to selected values when dropdown opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                if (hourRef.current) {
                    const selectedHour = hourRef.current.querySelector(`[data-value="${hour}"]`)
                    if (selectedHour) {
                        selectedHour.scrollIntoView({ block: 'center', behavior: 'instant' })
                    }
                }
                if (minuteRef.current) {
                    const selectedMinute = minuteRef.current.querySelector(`[data-value="${minute}"]`)
                    if (selectedMinute) {
                        selectedMinute.scrollIntoView({ block: 'center', behavior: 'instant' })
                    }
                }
                if (periodRef.current) {
                    const selectedPeriod = periodRef.current.querySelector(`[data-value="${period}"]`)
                    if (selectedPeriod) {
                        selectedPeriod.scrollIntoView({ block: 'center', behavior: 'instant' })
                    }
                }
            }, 50)
        }
    }, [isOpen, hour, minute, period])

    const hours = Array.from({ length: 12 }, (_, i) => i + 1)
    const minutes = Array.from({ length: 60 }, (_, i) => i)

    const handleConfirm = () => {
        const hour24 = period === 'PM' ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour)
        const timeString = `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        onSelect(timeString)
        onClose()
    }

    const ScrollPicker = ({ items, selected, onChange, format = (v) => v, scrollRef }) => (
        <div className="relative h-[180px] overflow-hidden">
            <div className="absolute inset-x-0 top-[70px] h-[40px] bg-mist/50 rounded-xl pointer-events-none z-10" />
            <div
                ref={scrollRef}
                className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
                style={{
                    paddingTop: '70px',
                    paddingBottom: '70px',
                }}
            >
                {items.map((item) => (
                    <button
                        key={item}
                        data-value={item}
                        onClick={() => onChange(item)}
                        className={`w-full h-[40px] flex items-center justify-center text-[18px] font-semibold transition-all snap-center ${selected === item
                            ? 'text-text-1 scale-110'
                            : 'text-text-4 scale-90'
                            }`}
                    >
                        {format(item)}
                    </button>
                ))}
            </div>
        </div>
    )

    return (
        <DropdownWrapper isOpen={isOpen} onClose={onClose} title={title} anchorRef={anchorRef}>
            <div className="p-4">
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <ScrollPicker
                        scrollRef={hourRef}
                        items={hours}
                        selected={hour}
                        onChange={setHour}
                        format={(v) => String(v).padStart(2, '0')}
                    />
                    <ScrollPicker
                        scrollRef={minuteRef}
                        items={minutes}
                        selected={minute}
                        onChange={setMinute}
                        format={(v) => String(v).padStart(2, '0')}
                    />
                    <ScrollPicker
                        scrollRef={periodRef}
                        items={['AM', 'PM']}
                        selected={period}
                        onChange={setPeriod}
                    />
                </div>

                <Button
                    onClick={handleConfirm}
                    className="w-full h-12 bg-primary hover:bg-primary-sat text-white font-bold text-[14px] rounded-full transition-all"
                >
                    Select
                </Button>
            </div>
        </DropdownWrapper>
    )
}
