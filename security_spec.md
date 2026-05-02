# Security Specification - Takwira Partner

## Data Invariants
1. A reservation cannot exist without a valid terrainId and complexId.
2. A match must have an organizerId.
3. Users cannot change their own `role` or `isActive` status (reserved for admins).
4. Managers can only manage complexes they own (managerId matches UID).
5. All IDs must be valid strings and match the regex `^[a-zA-Z0-9_\\-]+$`.

## The Dirty Dozen Payloads (Rejection Tests)

### identity_spoofing_users
- **Payload**: `{ "role": "admin", "isActive": true }` to `/users/{my_uid}`
- **Reason**: Users must not escalate their own privileges.

### id_poisoning_complex
- **Payload**: `{ "id": "A".repeat(2000), ... }` to `/complexes/long_id`
- **Reason**: Document IDs must be within size limits to prevent resource exhaustion.

### shadow_field_terrain
- **Payload**: `{ "name": "Field 1", "is_super_verified": true, ... }`
- **Reason**: Extra keys not in schema must be rejected.

### relational_bypass_reservation
- **Payload**: `{ "terrainId": "some_other_manager_terrain", "managerId": "me", ... }`
- **Reason**: Must verify terrain ownership via parent mapping.

### orphan_write_match
- **Payload**: `{ "reservationId": "invalid_id", ... }`
- **Reason**: reservationId if present must exist.

### timestamp_faking
- **Payload**: `{ "createdAt": "2020-01-01T00:00:00Z" }`
- **Reason**: Must use `request.time` for server timestamps.

### pi_leak_profile
- **Action**: `get /users/{other_user_id}`
- **Reason**: Private info like phone/role should be protected if not public.

### state_shortcut_reservation
- **Payload**: `{ "status": "confirmed" }` (by player)
- **Reason**: Only managers or admins can confirm a pending reservation.

### blanket_read_exploit
- **Action**: `list /reservations`
- **Reason**: Must be filtered by organizerId or managerId.

### size_bomb_message
- **Payload**: `{ "text": "X".repeat(10000) }`
- **Reason**: Messages must be capped in size.

### anonymous_write_academy
- **Action**: `write /academies` as unauthenticated.
- **Reason**: Must be signed in and verified.

### deleted_chat_recovery
- **Action**: `get /matchMessages/{deleted_id}` where `isDeleted: true`
- **Reason**: Soft-deleted messages should be hidden from general reads.
