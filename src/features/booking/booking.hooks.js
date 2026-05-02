import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from './booking.service.js'
import useUIStore from '../../shared/store/ui.store.js'

const BOOKINGS_KEY = ['bookings', 'mine']

/**
 * Fetch all bookings for the current artisan.
 * GET /bookings
 */
export function useMyBookings() {
    return useQuery({
        queryKey: BOOKINGS_KEY,
        queryFn: bookingService.getMyBookings,
        staleTime: 60 * 1000,
        select: (res) => {
            const items = res?.data?.data?.items ?? res?.data?.items ?? []
            return {
                pending: items.filter(b => b.status === 'pending'),
                accepted: items.filter(b => ['confirmed', 'accepted', 'in_progress'].includes(b.status)),
                all: items,
            }
        },
    })
}

/**
 * Fetch a single booking by id.
 * GET /bookings/{id}
 */
export function useBooking(id) {
    return useQuery({
        queryKey: ['bookings', 'detail', id],
        queryFn: () => bookingService.getBookingById(id),
        enabled: Boolean(id),
        staleTime: 60 * 1000,
        select: (res) => res?.data?.data?.item ?? res?.data?.data ?? res?.data?.item ?? null,
    })
}

/**
 * Confirm (accept) a booking.
 * POST /bookings/{id}/confirm
 */
export function useConfirmBooking() {
    const queryClient = useQueryClient()
    const { toastSuccess, toastError } = useUIStore()

    return useMutation({
        mutationFn: (id) => bookingService.confirmBooking(id),
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
            toastSuccess('Booking accepted!')
        },
        onError(err) {
            toastError(err?.message ?? 'Failed to accept booking.')
        },
    })
}

/**
 * Cancel (reject) a booking.
 * POST /bookings/{id}/cancel
 */
export function useCancelBooking() {
    const queryClient = useQueryClient()
    const { toastSuccess, toastError } = useUIStore()

    return useMutation({
        mutationFn: ({ id, reason }) => bookingService.cancelBooking(id, { reason }),
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
            toastSuccess('Booking rejected.')
        },
        onError(err) {
            toastError(err?.message ?? 'Failed to reject booking.')
        },
    })
}
