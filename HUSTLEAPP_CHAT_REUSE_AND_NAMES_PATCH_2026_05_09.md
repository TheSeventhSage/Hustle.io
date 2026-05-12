# HustleApp Chat Reuse + Participant Names Patch

## Problem fixed

The frontend/mobile app was calling `POST /conversations/initiate` each time a user pressed the chat button. In some cases the backend created a new conversation instead of returning the existing one. This happened because the old lookup was too strict: it matched `conversation_type`, `booking_id`, `hustle_post_id`, and `job_id`. If the frontend sent a different context on a later click, the backend treated it as a new chat.

## New behavior

By default, `POST /conversations/initiate` now reuses one person-to-person conversation for the same two accounts.

That means this flow is now safe:

```http
POST /api/v1/conversations/initiate
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "participant_account_id": 15
}
```

If the same logged-in user calls it again with the same `participant_account_id`, the API returns the existing conversation instead of creating another one.

## Response when reused

```json
{
  "success": true,
  "message": "Conversation already exists.",
  "data": {
    "conversation": {
      "id": 27,
      "conversation_type": "direct",
      "other_participant_account_id": 15,
      "other_participant_name": "Ama Mensah",
      "other_participant_first_name": "Ama",
      "other_participant_last_name": "Mensah",
      "other_participant_profile_image_url": "/media/44/file",
      "participants": [],
      "other_participants": []
    },
    "reused": true
  }
}
```

## Response when newly created

```json
{
  "success": true,
  "message": "Conversation initiated.",
  "data": {
    "conversation": {
      "id": 28,
      "other_participant_account_id": 15,
      "other_participant_name": "Ama Mensah"
    },
    "reused": false
  }
}
```

## If frontend needs a separate context-specific chat

Default behavior should be reused person-to-person chat. Only use this if you intentionally want separate chats per booking/job/hustle:

```json
{
  "participant_account_id": 15,
  "conversation_type": "job",
  "job_id": 8,
  "reuse_scope": "context"
}
```

For normal user-to-user chat buttons, do not send `reuse_scope: context`.

## Updated `GET /conversations`

`GET /api/v1/conversations` now returns names for the person the logged-in user is chatting with.

Important frontend fields:

```json
{
  "id": 27,
  "other_participant_account_id": 15,
  "other_participant_name": "Ama Mensah",
  "other_participant_first_name": "Ama",
  "other_participant_last_name": "Mensah",
  "other_participant_company_name": null,
  "other_participant_account_type": "client",
  "other_participant_profile_image_url": "/media/44/file",
  "last_message": "Hello",
  "last_message_at": "2026-05-09 13:30:00",
  "unread_count": 2
}
```

Frontend should display `other_participant_name` instead of only showing account IDs.

## Updated `GET /conversations/{id}`

Conversation details now include:

- `participants`
- `other_participants`
- `other_participant_name`
- `messages[].sender_name`
- `messages[].sender_first_name`
- `messages[].sender_last_name`
- `messages[].sender_company_name`

Example message:

```json
{
  "id": 100,
  "sender_account_id": 15,
  "sender_name": "Ama Mensah",
  "sender_first_name": "Ama",
  "sender_last_name": "Mensah",
  "message_body": "Good afternoon",
  "sent_at": "2026-05-09 13:30:00"
}
```

## Duplicate cleanup note

This patch stops new duplicate conversations from being created. Old duplicate conversations are not deleted automatically because they may contain messages. `GET /conversations` now hides accidental duplicate threads by default and shows the best active conversation per person.

To show all raw conversations for debugging only:

```http
GET /api/v1/conversations?group_by_participant=0
```

## Files changed

```text
src/Controllers/ConversationController.php
database/migrations/2026_05_09_conversation_reuse_names_safe.sql
```

## Database migration

Run this migration before testing:

```text
database/migrations/2026_05_09_conversation_reuse_names_safe.sql
```

It is safe/update-only. It does not delete messages or conversations.

## Test simulations to run

### Simulation 1: same two users, normal direct chat

1. Login as client.
2. Call `POST /conversations/initiate` with artisan ID.
3. Save `conversation.id`.
4. Call the same endpoint again with the same artisan ID.
5. The second response should return the same `conversation.id` and `reused: true`.

### Simulation 2: same two users, frontend sends booking/job context later

1. Existing direct chat already exists.
2. Call `POST /conversations/initiate` with same participant plus `booking_id` or `job_id`.
3. Do not send `reuse_scope: context`.
4. API should return the existing chat.

### Simulation 3: intentional separate job chat

1. Call `POST /conversations/initiate` with `reuse_scope: context` and `job_id`.
2. Backend may create or reuse a context-specific job conversation.

### Simulation 4: conversation list names

1. Call `GET /conversations`.
2. Confirm every item includes `other_participant_name`.
3. Confirm frontend displays the name, not only the account ID.
