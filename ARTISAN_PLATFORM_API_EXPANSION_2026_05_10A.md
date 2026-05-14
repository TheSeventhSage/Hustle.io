# HustleApp Artisan Platform API Expansion Patch

This patch adds the requested artisan-client marketplace endpoints without restructuring the current PHP/PDO application.

## Files added/updated

Upload these files to the same paths on the server:

```text
src/Bootstrap/Application.php
src/Controllers/ConversationController.php
src/Controllers/MarketplaceExpansionController.php
src/Middleware/CertificationAccessMiddleware.php
database/migrations/2026_05_10_artisan_platform_api_expansion_safe.sql
```

Run the SQL migration first or immediately after upload. It only adds indexes if missing and does not delete data.

---

## 1. Artisan application tracking

### `GET /api/v1/apply`

Auth: `Bearer` artisan token only.

Purpose: return all hustle/job applications created by the authenticated artisan.

Query params:

| Param | Description |
|---|---|
| `page` | Default `1` |
| `per_page` | Default `20`, max `50` |
| `status` | Optional: `pending`, `accepted`, `rejected`, `withdrawn`, `completed` |
| `q` | Optional search across hustle title, description, and timeline notes |

Example:

```http
GET /api/v1/apply?status=pending&page=1&per_page=20
Authorization: Bearer ARTISAN_TOKEN
```

Response:

```json
{
  "success": true,
  "message": "Applications loaded.",
  "data": {
    "items": [
      {
        "app_id": 18,
        "job_details": {
          "id": 7,
          "title": "AC repair at East Legon",
          "job_id": null,
          "job_status": null
        },
        "status": "pending",
        "raw_status": "under_review",
        "offered_amount": 500,
        "currency_code": "GHS",
        "expected_completion_at": "2026-05-12 17:00:00",
        "applied_at": "2026-05-10 09:30:00"
      }
    ]
  },
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 20,
    "total_pages": 1,
    "has_next_page": false,
    "has_previous_page": false
  }
}
```

Status mapping:

```text
under_review / shortlisted => pending
accepted => accepted
rejected => rejected
withdrawn => withdrawn
completed job => completed
```

---

## 2. Certification API

### `GET /api/v1/certification`

Auth: `Bearer` token.

Access rules:

- Artisan owner can view their own certifications without passing `artisan_id`.
- Admin can view any artisan certification list by passing `artisan_id`.
- Client/company can view an artisan certification list only when that artisan has applied to one of their hustle posts.

Examples:

```http
GET /api/v1/certification
Authorization: Bearer ARTISAN_TOKEN
```

```http
GET /api/v1/certification?artisan_id=12
Authorization: Bearer CLIENT_OR_COMPANY_TOKEN
```

Response:

```json
{
  "success": true,
  "message": "Certifications loaded.",
  "data": {
    "artisan_id": 12,
    "docs": [
      {
        "id": 4,
        "name": "Electrical License",
        "certification_number": "EL-2026-001",
        "url": "https://example.com/api/v1/media/55/file",
        "media_asset_id": 55,
        "mime_type": "image/jpeg",
        "verified": true,
        "status": "approved",
        "issued_at": "2025-01-01",
        "expires_at": "2027-01-01",
        "uploaded_at": "2026-05-10 09:30:00"
      }
    ]
  }
}
```

### `POST /api/v1/certification`

Auth: artisan only.

Purpose: owner upload alias. The file should be uploaded first through `/media/upload`, then its `media_asset_id` is submitted here.

Request:

```json
{
  "certification_type_id": 1,
  "certification_number": "EL-2026-001",
  "media_asset_id": 55,
  "issued_at": "2025-01-01",
  "expires_at": "2027-01-01"
}
```

### `DELETE /api/v1/certification/{id}`

Auth: artisan owner only.

Deletes the certification row owned by the artisan. It does not delete the underlying media asset.

---

## 3. Conversations enrichment fix

### `GET /api/v1/conversations`

The conversation list now returns other participant metadata in one optimized query, avoiding N+1 calls.

Response item includes both legacy flat fields and the new nested `participant` object:

```json
{
  "id": 22,
  "conversation_id": 22,
  "conversation_type": "direct",
  "participant": {
    "account_id": 15,
    "name": "Ama Mensah",
    "avatar": "https://example.com/api/v1/media/44/file",
    "role": "client"
  },
  "other_participant_account_id": 15,
  "other_participant_name": "Ama Mensah",
  "other_participant_account_type": "client",
  "last_message": "Hello",
  "unread_count": 2
}
```

The existing chat reuse behavior remains: by default, one direct chat is reused for the same two users.

---

## 4. Universal public profile

### `GET /api/v1/profile/{id}`

Auth: any logged-in account.

Purpose: view the public-facing profile of another account without exposing private contact information.

Response:

```json
{
  "success": true,
  "message": "Profile loaded.",
  "data": {
    "profile": {
      "user_id": 12,
      "role": "artisan",
      "name": "Kojo Mensah",
      "first_name": "Kojo",
      "last_name": "Mensah",
      "company_name": null,
      "bio": "Experienced electrician",
      "avatar_url": "https://example.com/api/v1/media/44/file",
      "country": {
        "id": 1,
        "name": "Ghana",
        "iso2_code": "GH"
      },
      "city": {
        "id": 3,
        "name": "Accra"
      },
      "stats": {
        "rating": 4.8,
        "reviews_count": 25,
        "jobs_done": 41
      },
      "certifications_endpoint": "/certification?artisan_id=12",
      "is_public": true,
      "private_visible": false
    }
  }
}
```

Private fields such as email and phone are hidden unless the viewer is the owner or has an accepted/active/completed job relationship with the profile owner.

When private visibility is allowed, the response includes:

```json
{
  "contact": {
    "email": "user@example.com",
    "phone_number": "+233000000000",
    "location_text": null
  }
}
```

---

## Frontend usage notes

1. Artisan dashboard applications screen should call `GET /apply`.
2. Certification button on a selected artisan should call `GET /certification?artisan_id={artisan_id}`.
3. Conversation cards should display `participant.name` and `participant.avatar`.
4. Public profile screens should call `GET /profile/{id}` and not use private `/profile` for other users.
5. Keep using `/media/{id}/file` URLs for images/documents.

