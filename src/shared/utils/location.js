/**
 * location.js
 * Browser geolocation utilities with permission handling
 */

/**
 * Check if geolocation is supported
 */
export function isGeolocationSupported() {
    return 'geolocation' in navigator
}

/**
 * Check current permission status
 * @returns {Promise<'granted'|'denied'|'prompt'|'unsupported'>}
 */
export async function checkLocationPermission() {
    if (!isGeolocationSupported()) {
        return 'unsupported'
    }

    try {
        const result = await navigator.permissions.query({ name: 'geolocation' })
        return result.state // 'granted', 'denied', or 'prompt'
    } catch (error) {
        // Fallback for browsers that don't support permissions API
        return 'prompt'
    }
}

/**
 * Request location permission and get current position
 * @param {object} options - Geolocation options
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number, heading: number|null, speed: number|null}>}
 */
export async function requestLocation(options = {}) {
    if (!isGeolocationSupported()) {
        throw new Error('Geolocation is not supported by your browser')
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: position.timestamp,
                })
            },
            (error) => {
                let message = 'Failed to get location'
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location permission denied. Please enable location access in your browser settings.'
                        break
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information is unavailable.'
                        break
                    case error.TIMEOUT:
                        message = 'Location request timed out.'
                        break
                }
                reject(new Error(message))
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
                ...options,
            }
        )
    })
}

/**
 * Watch location changes
 * @param {function} onSuccess - Callback for location updates
 * @param {function} onError - Callback for errors
 * @param {object} options - Geolocation options
 * @returns {number} - Watch ID for clearing
 */
export function watchLocation(onSuccess, onError, options = {}) {
    if (!isGeolocationSupported()) {
        onError?.(new Error('Geolocation is not supported by your browser'))
        return null
    }

    return navigator.geolocation.watchPosition(
        (position) => {
            onSuccess({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
                timestamp: position.timestamp,
            })
        },
        (error) => {
            let message = 'Failed to watch location'
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Location permission denied'
                    break
                case error.POSITION_UNAVAILABLE:
                    message = 'Location information is unavailable'
                    break
                case error.TIMEOUT:
                    message = 'Location request timed out'
                    break
            }
            onError?.(new Error(message))
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
            ...options,
        }
    )
}

/**
 * Clear location watch
 * @param {number} watchId
 */
export function clearLocationWatch(watchId) {
    if (watchId !== null && isGeolocationSupported()) {
        navigator.geolocation.clearWatch(watchId)
    }
}

/**
 * Format location data for API
 * @param {object} location
 * @returns {object}
 */
export function formatLocationForAPI(location) {
    return {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy_meters: location.accuracy,
        heading_degrees: location.heading,
        speed_mps: location.speed,
        captured_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        timezone_name: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Lagos',
    }
}
