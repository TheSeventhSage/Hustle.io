import { useEffect, useMemo, useState } from 'react'
import { Calendar, Clock, ChevronLeft, ChevronRight, Loader2, Info } from 'lucide-react'
import { useServiceAvailability } from '../../features/booking/availability.hooks'
import {
    calculateSelectedSlotDurationMinutes,
    getSlotKey,
    getSlotStartValue,
    resolveNextSelectedSlots,
    sortSlotsByStart,
} from '../utils/availabilitySlots.js'

/**
 * AvailabilitySlotsPicker
 * Shows artisan's available time slots for a service
 * Supports multi-slot selection across any available consecutive range
 * Each slot = 1 hour, user can select one or more consecutive slots
 */
export function AvailabilitySlotsPicker({ serviceId, selectedSlots = [], onSelectSlots, className = '' }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos'

    // Calculate date range (7 days from current date)
    const dateRange = useMemo(() => {
        const start = new Date(currentDate)
        start.setHours(0, 0, 0, 0)
        const end = new Date(start)
        end.setDate(end.getDate() + 6)

        return {
            start_date: start.toISOString().split('T')[0],
            end_date: end.toISOString().split('T')[0],
            timezone_name: timezone,
            slot_minutes: 60,
        }
    }, [currentDate, timezone])

    // Fetch availability
    const { data: slots = [], isLoading, error } = useServiceAvailability(serviceId, dateRange)

    // Group slots by date
    const slotsByDate = useMemo(() => {
        const grouped = {}
        slots.forEach((slot) => {
            const date = getSlotStartValue(slot)?.split('T')[0]
            if (!grouped[date]) {
                grouped[date] = []
            }
            grouped[date].push(slot)
        })
        Object.keys(grouped).forEach((date) => {
            grouped[date] = sortSlotsByStart(grouped[date])
        })
        return grouped
    }, [slots])

    // Generate dates for the week
    const weekDates = useMemo(() => {
        const dates = []
        const start = new Date(currentDate)
        start.setHours(0, 0, 0, 0)

        for (let i = 0; i < 7; i++) {
            const date = new Date(start)
            date.setDate(date.getDate() + i)
            dates.push(date)
        }
        return dates
    }, [currentDate])

    const [selectedDate, setSelectedDate] = useState(weekDates[0])

    useEffect(() => {
        const visibleDateKeys = weekDates.map((date) => date.toISOString().split('T')[0])
        const currentSelectedKey = selectedDate.toISOString().split('T')[0]

        if (!visibleDateKeys.includes(currentSelectedKey)) {
            setSelectedDate(weekDates[0])
        }
    }, [selectedDate, weekDates])

    const handlePreviousWeek = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() - 7)
        setCurrentDate(newDate)
    }

    const handleNextWeek = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + 7)
        setCurrentDate(newDate)
    }

    const formatTime = (isoString) => {
        const date = new Date(isoString)
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
    }

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        })
    }

    const isSlotSelected = (slot) => {
        const slotKey = getSlotKey(slot)
        return selectedSlots.some((selectedSlot) => getSlotKey(selectedSlot) === slotKey)
    }

    // Handle slot selection with multi-select logic
    const handleSlotClick = (slot) => {
        onSelectSlots(resolveNextSelectedSlots({
            availableSlots,
            selectedSlots,
            clickedSlot: slot,
        }))
    }

    // Calculate total duration in minutes
    const totalDuration = useMemo(() => {
        if (selectedSlots.length === 0) return 0
        return calculateSelectedSlotDurationMinutes(selectedSlots)
    }, [selectedSlots])

    const selectedDateKey = selectedDate.toISOString().split('T')[0]
    const availableSlots = slotsByDate[selectedDateKey] || []
    const orderedSelectedSlots = useMemo(() => sortSlotsByStart(selectedSlots), [selectedSlots])
    const selectedRangeEnd = orderedSelectedSlots.length > 1
        ? getSlotStartValue(orderedSelectedSlots[orderedSelectedSlots.length - 1])
        : orderedSelectedSlots.length === 1
            ? orderedSelectedSlots[0]?.display_end || orderedSelectedSlots[0]?.end
            : null

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Week Navigator */}
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={handlePreviousWeek}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-mist transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 text-text-2" />
                </button>

                <div className="flex items-center gap-2 text-[14px] font-semibold text-text-1">
                    <Calendar className="w-4 h-4 text-text-3" />
                    {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                </div>

                <button
                    type="button"
                    onClick={handleNextWeek}
                    className="w-9 h-9 flex items-center justify-center rounded-xl border border-border hover:bg-mist transition-colors"
                >
                    <ChevronRight className="w-4 h-4 text-text-2" />
                </button>
            </div>

            {/* Date Selector */}
            <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                    const dateKey = date.toISOString().split('T')[0]
                    const hasSlots = slotsByDate[dateKey]?.length > 0
                    const isSelected = selectedDate.toISOString().split('T')[0] === dateKey
                    const isToday = new Date().toDateString() === date.toDateString()

                    return (
                        <button
                            key={dateKey}
                            type="button"
                            onClick={() => setSelectedDate(date)}
                            disabled={!hasSlots}
                            className={`
                relative p-2 rounded-xl border text-center transition-all
                ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-surface'}
                ${hasSlots ? 'hover:border-primary/50 cursor-pointer' : 'opacity-40 cursor-not-allowed'}
              `}
                        >
                            <div className={`text-[11px] font-medium ${isSelected ? 'text-primary' : 'text-text-3'}`}>
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className={`text-[16px] font-bold ${isSelected ? 'text-primary' : 'text-text-1'}`}>
                                {date.getDate()}
                            </div>
                            {isToday && (
                                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                            )}
                            {hasSlots && (
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Time Slots */}
            <div className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-text-3" />
                        <h4 className="text-[13px] font-semibold text-text-2">
                            Available Times - {formatDate(selectedDate)}
                        </h4>
                    </div>
                    {selectedSlots.length > 0 && (
                        <span className="text-[11px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                            {orderedSelectedSlots.length} selected
                        </span>
                    )}
                </div>

                {/* Info banner */}
                <div className="bg-primary-sat/10 border border-primary-sat/30 rounded-lg p-3 flex gap-2 mb-3">
                    <Info size={14} className="text-primary-sat flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-primary-sat">
                        Select one or more consecutive time slots. The duration grows with every connected slot you add.
                    </p>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                )}

                {error && (
                    <div className="text-center py-8">
                        <p className="text-[13px] text-red-500">Failed to load availability</p>
                    </div>
                )}

                {!isLoading && !error && availableSlots.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-[13px] text-text-3">No available slots for this date</p>
                    </div>
                )}

                {!isLoading && !error && availableSlots.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 max-h-[240px] overflow-y-auto custom-scrollbar">
                        {availableSlots.map((slot, index) => {
                            const isSelected = isSlotSelected(slot)

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSlotClick(slot)}
                                    className={`
                    px-3 py-2.5 rounded-lg border text-[13px] font-semibold transition-all
                    ${isSelected
                                            ? 'border-primary bg-primary text-white'
                                            : 'border-border bg-surface text-text-1 hover:border-primary/50 hover:bg-primary/5'
                                        }
                  `}
                                >
                                    {formatTime(slot.display_start || slot.start)}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {orderedSelectedSlots.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[12px] text-text-3 font-medium">Selected Time Range</p>
                            <p className="text-[14px] font-bold text-text-1">
                                {formatTime(getSlotStartValue(orderedSelectedSlots[0]))} -{' '}
                                {formatTime(selectedRangeEnd)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[12px] text-text-3 font-medium">Duration</p>
                            <p className="text-[14px] font-bold text-primary">{totalDuration} min</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
