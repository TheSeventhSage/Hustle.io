import { storage } from './storage.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api-v2.hustleapp.info/api/v1'

/**
 * POST /media/upload
 * Raw fetch (not apiClient) — FormData needs the browser to set its own
 * Content-Type boundary, so no Content-Type header is set here.
 */
export const mediaService = {
  async upload(file, assetType) {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('asset_type', assetType)

    const token = storage.getToken()

    const response = await fetch(`${BASE_URL}/media/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })

    const result = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(result?.message || 'Upload failed')
    }

    const asset = result?.data?.asset
    if (!asset?.id || !asset?.url) {
      throw new Error('No URL or ID returned from upload')
    }

    return asset
  },
}
