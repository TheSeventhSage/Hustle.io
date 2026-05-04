/**
 * Paystack payment utility
 * Handles loading Paystack script and creating payment transactions
 */

const PAYSTACK_PUBLIC_KEY = 'pk_test_897373d5e56f9fdca4a553416558bb4b8730b1d8'
const PAYSTACK_SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js'

/**
 * Load Paystack script dynamically
 * @returns {Promise<PaystackPop>}
 */
export function loadPaystackScript() {
    return new Promise((resolve, reject) => {
        // Check if PaystackPop is already available
        if (window.PaystackPop) {
            resolve(window.PaystackPop)
            return
        }

        // Check if script is already in DOM
        const existingScript = document.querySelector(`script[src="${PAYSTACK_SCRIPT_SRC}"]`)
        if (existingScript) {
            // Wait for it to load
            const checkPaystack = setInterval(() => {
                if (window.PaystackPop) {
                    clearInterval(checkPaystack)
                    resolve(window.PaystackPop)
                }
            }, 100)

            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkPaystack)
                if (!window.PaystackPop) {
                    reject(new Error('Paystack script timeout'))
                }
            }, 10000)
            return
        }

        // Create and load new script
        const script = document.createElement('script')
        script.src = PAYSTACK_SCRIPT_SRC
        script.async = true
        script.onload = () => {
            if (window.PaystackPop) {
                resolve(window.PaystackPop)
            } else {
                reject(new Error('Paystack script loaded but PaystackPop not available'))
            }
        }
        script.onerror = () => reject(new Error('Failed to load Paystack script'))
        document.head.appendChild(script)
    })
}

/**
 * Create a payment reference
 * @param {string} prefix - Payment reference prefix
 * @param {string|number} id - Entity ID
 * @returns {string}
 */
export function makePaymentReference(prefix, id) {
    const timestamp = Date.now()
    return `${prefix}_${id}_${timestamp}`
}

/**
 * Initialize Paystack payment popup (inline)
 * @param {Object} config - Payment configuration
 * @param {string} config.email - Customer email
 * @param {number} config.amount - Amount in kobo (multiply by 100)
 * @param {string} config.currency - Currency code (default: NGN)
 * @param {string} config.reference - Payment reference
 * @param {Object} config.metadata - Additional metadata
 * @param {Function} config.onSuccess - Success callback
 * @param {Function} config.onCancel - Cancel callback
 * @returns {Promise<void>}
 */
export async function initializePaystackPayment(config) {
    const {
        email,
        amount,
        currency = 'NGN',
        reference,
        metadata = {},
        onSuccess,
        onCancel,
    } = config

    try {
        const PaystackPop = await loadPaystackScript()

        if (!PaystackPop) {
            throw new Error('Paystack did not initialize correctly.')
        }

        // Create new popup instance
        const popup = new PaystackPop()

        // Initialize inline transaction
        popup.newTransaction({
            key: PAYSTACK_PUBLIC_KEY,
            email,
            amount,
            currency,
            ref: reference,
            metadata,
            onSuccess: (transaction) => {
                console.log('Paystack payment successful:', transaction)
                if (onSuccess) onSuccess(transaction)
            },
            onCancel: () => {
                console.log('Paystack payment cancelled')
                if (onCancel) onCancel()
            },
        })
    } catch (error) {
        console.error('Paystack initialization error:', error)
        throw error
    }
}
