(function attachCityAccessPaystackDebugger() {
  const DEFAULT_API_BASE_URL = 'https://api-v2.hustleapp.info/api/v1'
  const PAYSTACK_SCRIPT_SRC = 'https://js.paystack.co/v2/inline.js'
  const TOKEN_KEY = 'hustle_token'

  function now() {
    return new Date().toISOString()
  }

  function debugLog(label, payload) {
    console.log(`[city-access-paystack-debug] ${now()} ${label}`, payload ?? '')
  }

  function debugError(label, error) {
    console.error(`[city-access-paystack-debug] ${now()} ${label}`, error)
  }

  function getPayloadData(response) {
    return response?.data?.data ?? response?.data ?? response ?? null
  }

  function getPaymentReferenceFromUrl(search = window.location.search) {
    const params = new URLSearchParams(search)
    return params.get('payment_ref') || params.get('reference') || params.get('trxref') || null
  }

  function buildUrl(baseUrl, path) {
    return `${String(baseUrl).replace(/\/$/, '')}${path}`
  }

  function getIdempotencyKey() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID()
    return `debug-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }

  async function requestJson({ baseUrl, token, path, method = 'GET', body, idempotency = false }) {
    const url = buildUrl(baseUrl, path)
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(idempotency ? { 'X-Idempotency-Key': getIdempotencyKey() } : {}),
    }

    debugLog('request:start', {
      method,
      url,
      body: body ?? null,
      hasToken: Boolean(token),
      idempotency,
    })

    const startedAt = performance.now()
    const response = await fetch(url, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
    const payload = await response.json().catch(() => ({}))
    const durationMs = Math.round(performance.now() - startedAt)

    debugLog('request:finish', {
      method,
      url,
      ok: response.ok,
      status: response.status,
      durationMs,
      payload,
    })

    if (!response.ok) {
      const error = new Error(payload?.message || `Request failed with status ${response.status}`)
      error.payload = payload
      error.status = response.status
      throw error
    }

    return payload
  }

  function loadPaystackScript() {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        debugLog('paystack:script:already-loaded')
        resolve(window.PaystackPop)
        return
      }

      const existing = document.querySelector(`script[src="${PAYSTACK_SCRIPT_SRC}"]`)
      if (existing) {
        debugLog('paystack:script:waiting-existing')
        const startedAt = Date.now()
        const timer = window.setInterval(() => {
          if (window.PaystackPop) {
            window.clearInterval(timer)
            resolve(window.PaystackPop)
          }

          if (Date.now() - startedAt > 10000) {
            window.clearInterval(timer)
            reject(new Error('Paystack script timed out.'))
          }
        }, 100)
        return
      }

      debugLog('paystack:script:loading', { src: PAYSTACK_SCRIPT_SRC })
      const script = document.createElement('script')
      script.src = PAYSTACK_SCRIPT_SRC
      script.async = true
      script.onload = () => {
        if (window.PaystackPop) {
          debugLog('paystack:script:loaded')
          resolve(window.PaystackPop)
          return
        }

        reject(new Error('Paystack script loaded, but window.PaystackPop is missing.'))
      }
      script.onerror = () => reject(new Error('Failed to load Paystack script.'))
      document.head.appendChild(script)
    })
  }

  function extractReturnedReference(transaction, fallbackReference) {
    const reference = transaction?.reference || transaction?.trxref || transaction?.data?.reference || fallbackReference
    return {
      reference,
      usedFallback: Boolean(reference && reference === fallbackReference && transaction?.reference !== fallbackReference),
    }
  }

  async function verifyCityAccessPayment({ baseUrl, token, reference }) {
    if (!reference) throw new Error('Cannot verify city access payment without a reference.')

    debugLog('verification:start', { reference })
    const response = await requestJson({
      baseUrl,
      token,
      path: `/city-access/payments/${encodeURIComponent(reference)}/verify`,
      method: 'POST',
      body: {},
    })
    debugLog('verification:finish', { reference, response })
    return response
  }

  async function runInlinePaystack({ accessCode, initializeReference, verify }) {
    const PaystackPop = await loadPaystackScript()
    const popup = new PaystackPop()

    let settled = false
    const settleOnce = async (label, handler) => {
      if (settled) {
        debugLog(`${label}:ignored-duplicate`)
        return
      }
      settled = true
      await handler()
    }

    const handleSuccess = async (transaction = {}) => settleOnce('paystack:success', async () => {
      debugLog('paystack:success:raw-transaction', transaction)

      const { reference, usedFallback } = extractReturnedReference(transaction, initializeReference)
      debugLog('paystack:success:resolved-reference', {
        reference,
        initializeReference,
        usedInitializeReferenceFallback: usedFallback,
      })

      if (!reference) throw new Error('Paystack returned success without a reference, and no initialize reference was available.')
      await verify(reference)
    })

    const handleCancel = async () => settleOnce('paystack:cancel', async () => {
      debugLog('paystack:cancel')
    })

    const handleError = async (error) => settleOnce('paystack:error', async () => {
      debugError('paystack:error', error)
      throw error || new Error('Paystack returned an error.')
    })

    popup.onSuccess = handleSuccess
    popup.onCancel = handleCancel
    popup.onError = handleError

    debugLog('paystack:resumeTransaction:start', { accessCode })
    const resumeResult = popup.resumeTransaction(accessCode, {
      onSuccess: handleSuccess,
      onCancel: handleCancel,
      onError: handleError,
    })
    debugLog('paystack:resumeTransaction:return-value', resumeResult)
  }

  async function debugCityAccessPayment(options = {}) {
    const baseUrl = options.baseUrl || window.__HUSTLE_DEBUG_API_BASE_URL__ || DEFAULT_API_BASE_URL
    const token = options.token || window.localStorage.getItem(TOKEN_KEY)
    const callbackUrl = options.callbackUrl || `${window.location.origin}/settings?section=my-subscription`

    console.group('[city-access-paystack-debug] city access payment flow')
    debugLog('config', {
      baseUrl,
      hasToken: Boolean(token),
      cityId: options.cityId ?? null,
      cityAccessId: options.cityAccessId ?? null,
      forceNew: Boolean(options.forceNew),
      useHostedRedirect: Boolean(options.useHostedRedirect),
      callbackUrl,
    })

    try {
      if (!token) throw new Error(`Missing auth token in localStorage key "${TOKEN_KEY}". Log in as an artisan first.`)

      let cityAccessId = options.cityAccessId
      let createResponse = null

      if (!cityAccessId) {
        if (!options.cityId) throw new Error('Pass cityId, or pass cityAccessId to skip city access creation.')

        createResponse = await requestJson({
          baseUrl,
          token,
          path: '/my/city-access',
          method: 'POST',
          idempotency: true,
          body: {
            city_id: Number(options.cityId),
            is_default_city: Boolean(options.isDefaultCity),
            ...(options.membershipPlanId ? { membership_plan_id: options.membershipPlanId } : {}),
          },
        })

        const createData = getPayloadData(createResponse)
        cityAccessId = createData?.item?.id
        debugLog('city-access:create:resolved', {
          cityAccessId,
          paymentRequired: Boolean(createData?.payment_required),
          createData,
        })
      } else {
        debugLog('city-access:create:skipped', { cityAccessId })
      }

      if (!cityAccessId) throw new Error('Could not resolve city access id from create response or options.')

      const initializeResponse = await requestJson({
        baseUrl,
        token,
        path: `/my/city-access/${encodeURIComponent(cityAccessId)}/payment/initialize`,
        method: 'POST',
        idempotency: true,
        body: {
          ...(options.forceNew ? { force_new: true } : {}),
          callback_url: callbackUrl,
        },
      })

      const paymentData = getPayloadData(initializeResponse)
      debugLog('payment:initialize:resolved', {
        reference: paymentData?.reference ?? null,
        accessCode: paymentData?.access_code ?? null,
        authorizationUrl: paymentData?.authorization_url ?? null,
        paymentData,
      })

      if (!paymentData?.reference) {
        throw new Error('Payment initialization did not return data.reference.')
      }

      if (!paymentData?.access_code) {
        throw new Error('Payment initialization did not return data.access_code.')
      }

      window.localStorage.setItem('pending_city_access_payment_debug', JSON.stringify({
        reference: paymentData.reference,
        cityAccessId,
        timestamp: Date.now(),
      }))

      if (options.useHostedRedirect) {
        if (!paymentData.authorization_url) throw new Error('Hosted redirect requested, but authorization_url is missing.')
        debugLog('hosted-redirect:start', {
          authorizationUrl: paymentData.authorization_url,
          callbackUrl,
        })
        window.location.href = paymentData.authorization_url
        return { kind: 'redirected', reference: paymentData.reference, cityAccessId }
      }

      await runInlinePaystack({
        accessCode: paymentData.access_code,
        initializeReference: paymentData.reference,
        verify: (reference) => verifyCityAccessPayment({ baseUrl, token, reference }),
      })

      return {
        kind: 'inline_started',
        cityAccessId,
        reference: paymentData.reference,
        createResponse,
        initializeResponse,
      }
    } catch (error) {
      debugError('flow:error', error)
      throw error
    } finally {
      console.groupEnd()
    }
  }

  async function debugCityAccessPaymentVerifyFromUrl(options = {}) {
    const baseUrl = options.baseUrl || window.__HUSTLE_DEBUG_API_BASE_URL__ || DEFAULT_API_BASE_URL
    const token = options.token || window.localStorage.getItem(TOKEN_KEY)
    const reference = options.reference || getPaymentReferenceFromUrl()

    console.group('[city-access-paystack-debug] city access URL verification')
    debugLog('url-verification:config', {
      baseUrl,
      hasToken: Boolean(token),
      reference,
      search: window.location.search,
    })

    try {
      if (!token) throw new Error(`Missing auth token in localStorage key "${TOKEN_KEY}". Log in as an artisan first.`)
      if (!reference) throw new Error('No payment reference found in options or URL params.')

      return await verifyCityAccessPayment({ baseUrl, token, reference })
    } catch (error) {
      debugError('url-verification:error', error)
      throw error
    } finally {
      console.groupEnd()
    }
  }

  window.debugCityAccessPayment = debugCityAccessPayment
  window.debugCityAccessPaymentVerifyFromUrl = debugCityAccessPaymentVerifyFromUrl

  debugLog('ready', {
    runNewCityFlow: 'debugCityAccessPayment({ cityId: 2 })',
    runExistingCityAccessFlow: 'debugCityAccessPayment({ cityAccessId: 10 })',
    verifyReturnedUrl: 'debugCityAccessPaymentVerifyFromUrl()',
  })
})()
