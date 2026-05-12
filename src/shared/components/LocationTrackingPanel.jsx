import { useState, useEffect, useCallback } from 'react'
import { MapPin, Navigation, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { LocationPermissionModal } from './LocationPermissionModal'
import { useUpdateLocation, useBookingLocation } from '../../features/booking/booking.hooks'
import { checkLocationPermission, requestLocation, watchLocation, clearLocationWatch, formatLocationForAPI } from '../utils/location'
import useAuthStore from '../../features/auth/auth.store'

/**
 * LocationTrackingPanel
 * Real-time location tracking for paid/active bookings
 * - Artisan: Updates location periodically
 * - Client: Views artisan's live location and destination
 */
export function LocationTrackingPanel({ bookingId, bookingStatus }) {
    const user = useAuthStore((s) => s.user)
    const isArtisan = user?.role === 'artisan'
    const isClient = user?.role === 'client' || user?.role === 'company'

    const [permissionState, setPermissionState] = useState('prompt')
    const [showPermissionModal, setShowPermissionModal] = useState(false)
    const [isTracking, setIsTracking] = useState(false)
    const [watchId, setWatchId] = useState(null)
    const [lastUpdate, setLastUpdate] = useState(null)

    const updateLocationMutation = useUpdateLocation()
    const { data: locationData, isLoading, refetch } = useBookingLocation(bookingId, {
        enabled: isClient && (bookingStatus === 'paid' || bookingStatus === 'in_progress'),
    })

    // Check if booking is eligible for tracking
    const isEligibleForTracking = bookingStatus === 'paid' || bookingStatus === 'in_progress'

    // Check permission on mount
    useEffect(() => {
        if (isArtisan && isEligibleForTracking) {
            checkLocationPermission().then(setPermissionState)
        }
    }, [isArtisan, isEligibleForTracking])

    // Handle location update for artisan
    const handleLocationUpdate = useCallback(
        (location) => {
            const formattedLocation = formatLocationForAPI(location)
            updateLocationMutation.mutate(
                { id: bookingId, locationData: formattedLocation },
                {
                    onSuccess: () => {
                        setLastUpdate(new Date())
                    },
                }
            )
        },
        [bookingId, updateLocationMutation]
    )

    // Start tracking
    const startTracking = async () => {
        try {
            const permission = await checkLocationPermission()
            setPermissionState(permission)

            if (permission === 'denied') {
                setShowPermissionModal(true)
                return
            }

            if (permission === 'prompt' || permission === 'granted') {
                // Request initial location
                const location = await requestLocation()
                handleLocationUpdate(location)

                // Start watching location
                const id = watchLocation(
                    handleLocationUpdate,
                    (error) => {
                        console.error('Location watch error:', error)
                    },
                    { maximumAge: 5000 } // Update every 5 seconds
                )

                setWatchId(id)
                setIsTracking(true)
                setPermissionState('granted')
            }
        } catch (error) {
            console.error('Failed to start tracking:', error)
            if (error.message.includes('denied')) {
                setPermissionState('denied')
                setShowPermissionModal(true)
            }
        }
    }

    // Stop tracking
    const stopTracking = () => {
        if (watchId !== null) {
            clearLocationWatch(watchId)
            setWatchId(null)
        }
        setIsTracking(false)
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchId !== null) {
                clearLocationWatch(watchId)
            }
        }
    }, [watchId])

    // Auto-stop tracking when booking is no longer eligible
    useEffect(() => {
        if (!isEligibleForTracking && isTracking) {
            stopTracking()
        }
    }, [isEligibleForTracking, isTracking])

    if (!isEligibleForTracking) {
        return (
            <div className="bg-mist border border-border rounded-xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-text-3 mx-auto mb-3" />
                <p className="text-[14px] text-text-3">
                    Location tracking is only available for paid and active bookings.
                </p>
            </div>
        )
    }

    // Artisan View - Location Sharing
    if (isArtisan) {
        return (
            <>
                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Navigation className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-[16px] font-bold text-text-1">Location Sharing</h3>
                                <p className="text-[12px] text-text-3">
                                    {isTracking ? 'Sharing your location' : 'Start sharing your location'}
                                </p>
                            </div>
                        </div>
                        {isTracking && (
                            <div className="flex items-center gap-2 text-[12px] text-green-600">
                                <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                                Active
                            </div>
                        )}
                    </div>

                    {lastUpdate && (
                        <div className="bg-mist rounded-lg p-3 mb-4">
                            <p className="text-[12px] text-text-3">
                                Last updated: {lastUpdate.toLocaleTimeString()}
                            </p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {!isTracking ? (
                            <Button
                                variant="solid"
                                onClick={startTracking}
                                className="w-full h-11 text-[14px] font-semibold"
                                disabled={updateLocationMutation.isPending}
                            >
                                <MapPin className="w-4 h-4 mr-2" />
                                Start Location Sharing
                            </Button>
                        ) : (
                            <Button
                                variant="outline"
                                onClick={stopTracking}
                                className="w-full h-11 text-[14px] font-semibold"
                            >
                                Stop Sharing
                            </Button>
                        )}
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-[12px] text-blue-700 leading-relaxed">
                            <strong>Privacy:</strong> Your location is only shared with the client during this
                            active booking and is not stored permanently.
                        </p>
                    </div>
                </div>

                <LocationPermissionModal
                    isOpen={showPermissionModal}
                    onRequestPermission={startTracking}
                    permissionState={permissionState}
                />
            </>
        )
    }

    // Client View - Location Tracking
    if (isClient) {
        return (
            <div className="bg-surface border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-[16px] font-bold text-text-1">Live Tracking</h3>
                            <p className="text-[12px] text-text-3">Artisan location updates</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => refetch()}
                        className="w-9 h-9 p-0 rounded-lg"
                        disabled={isLoading}
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Map Placeholder */}
                <div className="w-full h-[300px] bg-mist rounded-xl mb-4 relative overflow-hidden border border-border flex items-center justify-center">
                    <div className="text-center">
                        <MapPin className="w-12 h-12 text-text-3 mx-auto mb-2" />
                        <p className="text-[14px] text-text-3 font-medium">Map View</p>
                        <p className="text-[12px] text-text-4 mt-1">
                            Map library integration pending
                        </p>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    </div>
                )}

                {!isLoading && locationData && (
                    <div className="space-y-3">
                        {/* Destination */}
                        {locationData.booking?.client_destination && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[12px] font-semibold text-blue-900 mb-1">Destination</p>
                                        <p className="text-[13px] text-blue-700">
                                            {locationData.booking.client_destination.address}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Artisan Location */}
                        {locationData.latest_location && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Navigation className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-[12px] font-semibold text-green-900 mb-1">
                                            Artisan Location
                                        </p>
                                        <p className="text-[13px] text-green-700 mb-2">
                                            Last updated: {new Date(locationData.latest_location.captured_at).toLocaleTimeString()}
                                        </p>
                                        <div className="grid grid-cols-2 gap-2 text-[11px] text-green-600">
                                            <div>
                                                <span className="font-medium">Lat:</span> {locationData.latest_location.latitude}
                                            </div>
                                            <div>
                                                <span className="font-medium">Lng:</span> {locationData.latest_location.longitude}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!locationData.latest_location && (
                            <div className="bg-mist rounded-lg p-4 text-center">
                                <p className="text-[13px] text-text-3">
                                    Waiting for artisan to share location...
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return null
}
