#!/usr/bin/env bash
BASE_URL="https://your-domain.com/api/v1"

curl -s "$BASE_URL/health"

CLIENT_TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"client@example.com","password":"Password123!"}' | php -r '$d=json_decode(stream_get_contents(STDIN), true); echo $d["data"]["access_token"] ?? "";')

echo "$CLIENT_TOKEN"

curl -s "$BASE_URL/auth/me" -H "Authorization: Bearer $CLIENT_TOKEN"

curl -s -X POST "$BASE_URL/bookings" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $CLIENT_TOKEN" \
  -H 'X-Idempotency-Key: booking-001' \
  -d '{"provider_service_id":1,"booking_mode":"scheduled","scheduled_start_at":"2026-04-30 10:00:00","expected_duration_minutes":120,"service_location_text":"Lekki, Lagos"}'
