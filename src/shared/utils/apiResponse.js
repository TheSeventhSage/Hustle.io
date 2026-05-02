export function getApiEnvelopeData(response) {
  return response?.data?.data ?? response?.data ?? response ?? null
}

export function getApiMessage(response, fallback = '') {
  return response?.message
    ?? response?.data?.message
    ?? response?.data?.data?.message
    ?? fallback
}
