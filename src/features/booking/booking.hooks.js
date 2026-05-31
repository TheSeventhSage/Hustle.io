import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingService } from './booking.service.js'
import useUIStore from '../../shared/store/ui.store.js'

const BOOKINGS_KEY = ['bookings', 'mine']

/**
 * Fetch all bookings for the current artisan.
 * GET /bookings
 */
export function useMyBookings(paramsOrOptions = {}, maybeOptions = {}) {
    const hasQueryParams = Object.prototype.hasOwnProperty.call(paramsOrOptions, 'q')
      || Object.prototype.hasOwnProperty.call(paramsOrOptions, 'status')
      || Object.prototype.hasOwnProperty.call(paramsOrOptions, 'booking_mode')
      || Object.prototype.hasOwnProperty.call(paramsOrOptions, 'date_from')
      || Object.prototype.hasOwnProperty.call(paramsOrOptions, 'date_to')
      || Object.prototype.hasOwnProperty.call(paramsOrOptions, 'page')
      || Object.prototype.hasOwnProperty.call(paramsOrOptions, 'per_page')
    const params = hasQueryParams ? paramsOrOptions : {}
    const options = hasQueryParams ? maybeOptions : paramsOrOptions

    return useQuery({
        queryKey: [...BOOKINGS_KEY, params],
        queryFn: () => bookingService.getMyBookings(params),
        staleTime: 60 * 1000,
        select: (res) => {
            const items = res?.data?.data?.items ?? res?.data?.items ?? []
            return {
                pending: items.filter(b => b.status === 'pending'),
                // Show all non-pending bookings in accepted tab
                accepted: items.filter(b => b.status !== 'pending'),
                all: items,
                meta: res?.meta ?? res?.data?.meta ?? null,
                raw: res,
            }
        },
        ...options,
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

/**
 * Reject a booking (artisan-specific).
 * POST /bookings/{id}/reject
 */
export function useRejectBooking() {
    const queryClient = useQueryClient()
    const { toastSuccess, toastError } = useUIStore()

    return useMutation({
        mutationFn: (id) => bookingService.rejectBooking(id),
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
            toastSuccess('Booking rejected.')
        },
        onError(err) {
            toastError(err?.message ?? 'Failed to reject booking.')
        },
    })
}

/**
 * Initialize payment for a booking.
 * POST /bookings/{id}/payment/initialize
 */
export function useInitializePayment() {
    const { toastError } = useUIStore()

    return useMutation({
        mutationFn: (vars) => bookingService.initializePayment(vars?.id ?? vars, vars?.data ?? vars?.payload ?? {}),
        onError(err) {
            toastError(err?.message ?? 'Failed to initialize payment.')
        },
    })
}

/**
 * Verify payment.
 * POST /payments/{reference}/verify
 */
export function useVerifyPayment() {
    const queryClient = useQueryClient()
    const { toastSuccess, toastError } = useUIStore()

    return useMutation({
        mutationFn: (reference) => bookingService.verifyPayment(reference),
        onSuccess() {
            queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
            toastSuccess('Payment verified successfully!')
        },
        onError(err) {
            toastError(err?.message ?? 'Payment verification failed.')
        },
    })
}

/**
 * Update artisan location for a booking.
 * POST /bookings/{id}/location
 */
export function useUpdateLocation() {
    const { toastError } = useUIStore()

    return useMutation({
        mutationFn: ({ id, locationData }) => bookingService.updateLocation(id, locationData),
        onError(err) {
            toastError(err?.message ?? 'Failed to update location.')
        },
    })
}

/**
 * Get booking location (client destination + artisan live location).
 * GET /bookings/{id}/location
 */
export function useBookingLocation(id, options = {}) {
    return useQuery({
        queryKey: ['bookings', 'location', id],
        queryFn: () => bookingService.getBookingLocation(id),
        enabled: Boolean(id) && (options.enabled !== false),
        refetchInterval: options.refetchInterval || 10000, // Poll every 10 seconds by default
        select: (res) => res?.data?.data ?? res?.data ?? null,
    })
}
