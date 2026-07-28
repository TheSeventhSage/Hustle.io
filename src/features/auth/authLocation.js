/**
 * authLocation.js
 *
 * Detects the user's country ISO2 code for Google sign-in.
 *
 * Detection chain (web):
 *  1. Browser Geolocation API  →  Nominatim reverse-geocode  →  ISO2
 *  2. Intl timezone  →  TIMEZONE_TO_ISO2 lookup  →  ISO2
 *  3. null  (backend falls back on timezone_name, then its default country)
 */

/** Backend URL Google redirects to after user consent. */
export const GOOGLE_REDIRECT_URI = 'https://api-v2.hustleapp.info/auth/callback'

/** Frontend URL the backend redirects to after completing the auth exchange. */
export const GOOGLE_RETURN_TO = 'https://v2.hustleapp.info/auth/callback'

/** Browser timezone string, e.g. "Africa/Lagos" */
export function getTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * All IANA timezone → ISO 3166-1 alpha-2 mappings.
 * Covers every African timezone (primary market) plus major world zones.
 * Used as a synchronous fallback when geolocation is unavailable.
 */
const TIMEZONE_TO_ISO2 = {
  // ── Africa ──────────────────────────────────────────────────────────────────
  'Africa/Abidjan': 'CI',
  'Africa/Accra': 'GH',
  'Africa/Addis_Ababa': 'ET',
  'Africa/Algiers': 'DZ',
  'Africa/Asmara': 'ER',
  'Africa/Asmera': 'ER',
  'Africa/Bamako': 'ML',
  'Africa/Bangui': 'CF',
  'Africa/Banjul': 'GM',
  'Africa/Bissau': 'GW',
  'Africa/Blantyre': 'MW',
  'Africa/Brazzaville': 'CG',
  'Africa/Bujumbura': 'BI',
  'Africa/Cairo': 'EG',
  'Africa/Casablanca': 'MA',
  'Africa/Ceuta': 'ES',
  'Africa/Conakry': 'GN',
  'Africa/Dakar': 'SN',
  'Africa/Dar_es_Salaam': 'TZ',
  'Africa/Djibouti': 'DJ',
  'Africa/Douala': 'CM',
  'Africa/El_Aaiun': 'EH',
  'Africa/Freetown': 'SL',
  'Africa/Gaborone': 'BW',
  'Africa/Harare': 'ZW',
  'Africa/Johannesburg': 'ZA',
  'Africa/Juba': 'SS',
  'Africa/Kampala': 'UG',
  'Africa/Khartoum': 'SD',
  'Africa/Kigali': 'RW',
  'Africa/Kinshasa': 'CD',
  'Africa/Lagos': 'NG',
  'Africa/Libreville': 'GA',
  'Africa/Lome': 'TG',
  'Africa/Luanda': 'AO',
  'Africa/Lubumbashi': 'CD',
  'Africa/Lusaka': 'ZM',
  'Africa/Malabo': 'GQ',
  'Africa/Maputo': 'MZ',
  'Africa/Maseru': 'LS',
  'Africa/Mbabane': 'SZ',
  'Africa/Mogadishu': 'SO',
  'Africa/Monrovia': 'LR',
  'Africa/Nairobi': 'KE',
  'Africa/Ndjamena': 'TD',
  'Africa/Niamey': 'NE',
  'Africa/Nouakchott': 'MR',
  'Africa/Ouagadougou': 'BF',
  'Africa/Porto-Novo': 'BJ',
  'Africa/Sao_Tome': 'ST',
  'Africa/Timbuktu': 'ML',
  'Africa/Tripoli': 'LY',
  'Africa/Tunis': 'TN',
  'Africa/Windhoek': 'NA',
  // ── America ─────────────────────────────────────────────────────────────────
  'America/Adak': 'US',
  'America/Anchorage': 'US',
  'America/Bogota': 'CO',
  'America/Buenos_Aires': 'AR',
  'America/Caracas': 'VE',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Guayaquil': 'EC',
  'America/Halifax': 'CA',
  'America/Lima': 'PE',
  'America/Los_Angeles': 'US',
  'America/Manaus': 'BR',
  'America/Mexico_City': 'MX',
  'America/New_York': 'US',
  'America/Phoenix': 'US',
  'America/Puerto_Rico': 'PR',
  'America/Santiago': 'CL',
  'America/Sao_Paulo': 'BR',
  'America/St_Johns': 'CA',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Winnipeg': 'CA',
  // ── Europe ──────────────────────────────────────────────────────────────────
  'Europe/Amsterdam': 'NL',
  'Europe/Athens': 'GR',
  'Europe/Belgrade': 'RS',
  'Europe/Berlin': 'DE',
  'Europe/Brussels': 'BE',
  'Europe/Bucharest': 'RO',
  'Europe/Budapest': 'HU',
  'Europe/Copenhagen': 'DK',
  'Europe/Dublin': 'IE',
  'Europe/Helsinki': 'FI',
  'Europe/Istanbul': 'TR',
  'Europe/Kiev': 'UA',
  'Europe/Kyiv': 'UA',
  'Europe/Lisbon': 'PT',
  'Europe/London': 'GB',
  'Europe/Madrid': 'ES',
  'Europe/Moscow': 'RU',
  'Europe/Oslo': 'NO',
  'Europe/Paris': 'FR',
  'Europe/Prague': 'CZ',
  'Europe/Rome': 'IT',
  'Europe/Stockholm': 'SE',
  'Europe/Vienna': 'AT',
  'Europe/Warsaw': 'PL',
  'Europe/Zurich': 'CH',
  // ── Asia ────────────────────────────────────────────────────────────────────
  'Asia/Amman': 'JO',
  'Asia/Baghdad': 'IQ',
  'Asia/Bahrain': 'BH',
  'Asia/Bangkok': 'TH',
  'Asia/Beirut': 'LB',
  'Asia/Colombo': 'LK',
  'Asia/Dhaka': 'BD',
  'Asia/Dubai': 'AE',
  'Asia/Hong_Kong': 'HK',
  'Asia/Jakarta': 'ID',
  'Asia/Jerusalem': 'IL',
  'Asia/Karachi': 'PK',
  'Asia/Kathmandu': 'NP',
  'Asia/Kolkata': 'IN',
  'Asia/Kuala_Lumpur': 'MY',
  'Asia/Kuwait': 'KW',
  'Asia/Muscat': 'OM',
  'Asia/Nicosia': 'CY',
  'Asia/Qatar': 'QA',
  'Asia/Riyadh': 'SA',
  'Asia/Seoul': 'KR',
  'Asia/Shanghai': 'CN',
  'Asia/Singapore': 'SG',
  'Asia/Taipei': 'TW',
  'Asia/Tehran': 'IR',
  'Asia/Tokyo': 'JP',
  'Asia/Yangon': 'MM',
  // ── Oceania ─────────────────────────────────────────────────────────────────
  'Australia/Adelaide': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Sydney': 'AU',
  'Pacific/Auckland': 'NZ',
  'Pacific/Fiji': 'FJ',
  'Pacific/Honolulu': 'US',
  // ── UTC / GMT ────────────────────────────────────────────────────────────────
  'UTC': 'GB',
  'GMT': 'GB',
  'Etc/UTC': 'GB',
  'Etc/GMT': 'GB',
}

/**
 * Synchronously maps a timezone string to an ISO2 country code.
 * Returns null when the timezone is not in the map.
 */
export function getCountryIso2FromTimezone(tz) {
  return TIMEZONE_TO_ISO2[tz] ?? null
}

/**
 * Asynchronously resolves the user's country ISO2 code.
 *
 * Detection order:
 *  1. Browser geolocation  →  Nominatim reverse-geocode
 *  2. Intl timezone  →  TIMEZONE_TO_ISO2 lookup
 *  3. null
 *
 * All failures are silent — callers should treat null as "unknown" and omit
 * the param; the backend falls back on timezone_name, then its default country.
 */
export async function getCountryIso2() {
  // ── 1. Geolocation + reverse geocode ────────────────────────────────────────
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 300_000, // re-use a cached fix for up to 5 minutes
          enableHighAccuracy: false,
        })
      })

      const { latitude: lat, longitude: lon } = position.coords
      const controller = new AbortController()
      const tid = setTimeout(() => controller.abort(), 4000)

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
          {
            signal: controller.signal,
            headers: { 'Accept-Language': 'en', 'User-Agent': 'HustleApp/1.0' },
          }
        )
        clearTimeout(tid)

        if (res.ok) {
          const data = await res.json()
          const iso2 = data?.address?.country_code?.toUpperCase()
          if (iso2) return iso2
        }
      } catch {
        clearTimeout(tid)
      }
    } catch {
      // Permission denied, position unavailable, or timeout — fall through
    }
  }

  // ── 2. Timezone-based fallback ───────────────────────────────────────────────
  return getCountryIso2FromTimezone(getTimezone())
}
