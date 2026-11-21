# FORMA — Invitation & Membership Engine

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Review draft; no provider or database execution claimed

## 1. Scope

This contract defines invite-only Scene Studio collaboration membership: owner-issued editor/viewer invitations, verified-recipient acceptance, invitation revocation, and owner removal of an existing collaborator.

It excludes public sharing, open collaboration links, role delegation, ownership transfer, guest access, and email-provider selection.

## 2. Security invariants

1. Only the scene owner can create/revoke invitations or remove members.
2. Invitation tokens contain at least 256 bits of cryptographically secure randomness.
3. A trusted Next.js server action generates and temporarily holds the raw token. PostgreSQL receives only a lowercase 64-character SHA-256 hex digest.
4. The raw token is never stored in the database, logs, analytics, or client-side persistent storage. The recipient necessarily receives it in the invitation link.
5. Each invitation is bound to one normalized recipient email and one fixed role: editor or viewer.
6. Acceptance requires an authenticated account whose authoritative auth.users.email matches the recipient and whose email_confirmed_at is non-null. Client-supplied email text is not trusted.
7. An invitation is accepted once. A retry by the same accepting account is idempotent; another account cannot reuse it.
8. Membership creation and the accepted timestamp/actor are committed in one PostgreSQL transaction.
9. The owner cannot invite their own account, and an existing member cannot be re-added through an invitation.
10. The owner cannot be removed. Only owner-issued member removal is supported in this MVP.
11. Scene row locking is the common serialization boundary. The command RPC locks the scene before checking editor membership; removal locks the same scene before deleting membership.
12. Realtime authorization must re-check current membership on join/rejoin. Removal prevents subsequent database access and channel reauthorization; information already delivered cannot be recalled.

## 3. Token lifecycle

### Creation (trusted server action)

1. Authenticate the caller on the server; the RPC independently verifies ownership.
2. Generate 32 random bytes with Node.js crypto.randomBytes(32).
3. Encode as unpadded base64url.
4. Compute SHA-256 over the exact token string using Node.js crypto.createHash('sha256').
5. Submit only the digest, normalized recipient email, role, scene ID, and expiry to create_scene_invitation.
6. Construct the recipient link using the configured canonical site origin. Never accept an arbitrary origin or redirect from the request.
7. Deliver through the selected transactional email provider. Provider remains undecided pending plan, quota, deliverability, and cost review.
8. If delivery fails, attempt to revoke the pending invitation and surface a retryable failure. Never claim the email was sent.
9. Do not log the token, full invitation URL, email body, or token hash.

### Acceptance

1. Recipient opens the invitation URL and authenticates.
2. The server action hashes the submitted token using the same SHA-256 procedure; raw token is never sent to SQL.
3. accept_scene_invitation locks the scene and invitation, validates status/expiry, reads the authenticated account's confirmed email from auth.users, and compares normalized email.
4. In the same transaction, it inserts membership and records accepted_at plus accepted_by.
5. Refresh scene access state only after the RPC confirms success.

### Revocation and removal

- Pending invitation: owner calls revoke_scene_invitation; the row records revoked_at and revoked_by.
- Accepted collaborator: owner calls remove_scene_member; deletion is serialized against scene commands by the scene row lock.
- Revoking an accepted invitation is rejected; it does not silently remove membership.
- Expired invitations cannot be accepted. A later create operation retires stale pending invitations before creating a replacement.

## 4. RPC contract

| RPC | Caller | Effect |
|---|---|---|
| create_scene_invitation | Owner | Stores hash-only invitation with role and expiry |
| accept_scene_invitation | Authenticated, verified recipient | Atomically adds membership and marks invitation accepted |
| revoke_scene_invitation | Owner | Revokes a pending invitation |
| remove_scene_member | Owner | Removes an existing editor/viewer |

Functions use SECURITY DEFINER with an empty search path, schema-qualified relations, explicit actor derivation via auth.uid(), and execute permission limited to authenticated. Review against actual Supabase grants before use.

## 5. Application boundary

- Token generation and hashing live in a server-only module; never import it into Client Components.
- The browser never receives the token hash as a reusable credential.
- The raw token appears only in the recipient-facing link and should be removed from visible app state after successful exchange.
- Use a fixed configured site origin; validate post-acceptance return paths against a local allowlist.
- Email delivery is a separate side effect from the database transaction. The application must handle delivery failure explicitly; atomicity across PostgreSQL and an email provider is not possible.
- Provider choice and delivery configuration remain open pending current limits and pricing.

## 6. Error and retry semantics

Distinguish unauthenticated, forbidden, not found, malformed token, expired/revoked/used invitation, unverified email, email mismatch, already-member, and delivery failure. Avoid exposing whether an arbitrary email address has an account.

- Same-account acceptance retry is a successful idempotent read; another account is rejected.
- Repeated revocation of a revoked/expired invitation returns an idempotent duplicate result.
- Removing an already absent member returns removed=false.
- A failed email send must not be represented as a delivered invitation. The server should revoke the pending row when possible and report cleanup failure separately.

## 7. Required validation

- Verify 32-byte CSPRNG generation and base64url handling.
- Confirm raw tokens never appear in SQL arguments, rows, logs, analytics, or errors.
- Only owner can create, revoke, or remove.
- Viewer/editor cannot create or alter membership.
- Unverified, mismatched, and unrelated accounts cannot accept.
- Expiry boundary, revoked token, unknown token, and replay are rejected.
- Same-account acceptance retry is idempotent; cross-account replay is rejected.
- Concurrent accept attempts produce one membership and one accepted actor.
- Concurrent invite attempts for one scene/email produce one pending invitation.
- Owner self-invite and existing-member invite are rejected.
- Member removal racing an editor command is serialized by the scene lock; no command may commit after removal completes.
- Realtime rejoin after removal is denied; verify revocation propagation.
- Email delivery failure does not show success and leaves no usable pending invite after successful cleanup.
- Test RLS/direct table access as anonymous, owner, editor, viewer, removed member, and unrelated authenticated user.

## 8. Open decisions

- Transactional email provider, free-tier limits, sender-domain verification, and deliverability.
- Invitation-link UX and canonical production/preview origins.
- Whether owners need role changes after MVP; currently remove and re-invite.
- Invitation retention and audit cleanup policy.

This is a technical contract and SQL review draft, not an implementation or security certification. No migration, email send, provider configuration, or integration test is claimed as completed.
