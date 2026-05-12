import { MapPin, AlertCircle } from 'lucide-react'
import { Button } from './Button'

/**
 * LocationPermissionModal
 * Non-negotiable modal for requesting location permission
 * Matches project design system
 */
export function LocationPermissionModal({ isOpen, onRequestPermission, permissionState }) {
    if (!isOpen) return null

    const isDenied = permissionState === 'denied'

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />

            {/* Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
                <div className="bg-surface rounded-3xl border border-border shadow-2xl w-full max-w-md p-8 text-center">
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                        {isDenied ? (
                            <AlertCircle className="w-10 h-10 text-red-500" />
                        ) : (
                            <MapPin className="w-10 h-10 text-primary" />
                        )}
                    </div>

                    {/* Title */}
                    <h2 className="text-[22px] font-bold text-text-1 mb-3">
                        {isDenied ? 'Location Access Required' : 'Enable Location Services'}
                    </h2>

                    {/* Description */}
                    <p className="text-[14px] text-text-3 mb-6 leading-relaxed">
                        {isDenied ? (
                            <>
                                Location access was denied. To use tracking features, please enable location
                                permissions in your browser settings and refresh the page.
                            </>
                        ) : (
                            <>
                                This feature requires access to your device location to provide real-time tracking
                                and ensure accurate service delivery.
                            </>
                        )}
                    </p>

                    {/* Action Button */}
                    {!isDenied && (
                        <Button
                            variant="solid"
                            onClick={onRequestPermission}
                            className="w-full h-12 text-[15px] font-semibold"
                        >
                            Enable Location
                        </Button>
                    )}

                    {isDenied && (
                        <div className="space-y-3">
                            <Button
                                variant="solid"
                                onClick={() => window.location.reload()}
                                className="w-full h-12 text-[15px] font-semibold"
                            >
                                Refresh Page
                            </Button>
                            <p className="text-[12px] text-text-4">
                                After enabling location in browser settings
                            </p>
                        </div>
                    )}

                    {/* Info Note */}
                    <div className="mt-6 p-4 bg-mist rounded-xl">
                        <p className="text-[12px] text-text-3 leading-relaxed">
                            <strong className="text-text-2">Privacy Note:</strong> Your location is only shared
                            during active bookings and is not stored permanently.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
