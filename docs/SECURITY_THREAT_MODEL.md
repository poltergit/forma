# FORMA — Security Threat Model

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Proposed review artifact; not a completed security audit  
**Scope:** Public experience, accounts, generative artifacts, private Scene Studio, invitations, and real-time collaboration

---

## 1. Security objectives

1. A user can access only scenes and artifacts they own or have been explicitly granted access to.
2. Editors can mutate scenes but cannot manage membership or delete scenes; viewers cannot mutate.
3. Realtime presence and updates reveal no private scene data to non-members.
4. Invitation links cannot be replayed, transferred to another identity, or used after expiry/revocation.
5. Untrusted scene documents, commands, generator parameters, and metadata cannot execute code or exhaust server/browser resources.
6. A failed or malicious client cannot silently overwrite newer durable scene state.
7. Secrets and private data do not leak through browser bundles, logs, analytics, previews, or error messages.
8. Public experiences remain usable without WebGL and do not create avoidable denial-of-service conditions.

## 2. Assets and trust boundaries

### Assets
- User identity, email, session cookies, and recovery tokens.
- Private scene documents, titles, object metadata, and collaboration membership.
- Invitation token hashes, recipient identity, role, and expiry.
- Generative artifact recipes, parameters, and ownership.
- Realtime presence metadata and selection state.
- Supabase publishable configuration and privileged server credentials.
- Source code, deployment secrets, and environment-specific data.

### Trust boundaries
- Browser and WebGL runtime: untrusted.
- Next.js server actions/route handlers: trusted application boundary, but all input remains untrusted.
- Supabase Auth: identity/session authority.
- PostgreSQL and RLS: durable data authorization boundary.
- PostgreSQL mutation RPC: atomic command and revision boundary.
- Supabase Realtime: delivery/presence transport, not durable source of truth.
- Vercel preview deployments: less trusted than production; must use isolated backend resources.

## 3. Threat analysis

| Threat | Example | Primary controls | Verification |
|---|---|---|---|
| Broken object-level authorization | User guesses another scene UUID | RLS, membership checks, server authorization | Alice/Bob/anonymous access matrix |
| Privilege escalation | Viewer changes role or edits through direct API | Owner-only membership mutation, role checks in database command RPC | Attempt direct REST/RPC/Realtime operations |
| Realtime channel leakage | Non-member subscribes to a scene topic | Private channels, authorization tied to membership, no sensitive broadcast payloads | Anonymous/non-member subscribe tests |
| Revoked session/member retains access | Open tab remains connected after removal | Re-check membership, revoke channel access, terminate subscriptions, clear local state | Revoke while connected and test immediately + after reconnect |
| Invitation replay/theft | Link is reused or forwarded | High-entropy single-use token, store hash only, bind to verified recipient identity, short expiry | Reuse, wrong identity, expiry, revoke tests |
| Account enumeration | Invite/recovery response reveals account existence | Neutral response and consistent external behavior | Compare responses for existing/non-existing emails |
| CSRF / cross-origin mutation | Malicious site triggers a state-changing request | Framework protections, same-origin checks where appropriate, secure cookie/session handling, no permissive credentialed CORS | Cross-origin mutation test |
| XSS through metadata | Scene title or object name contains markup | Render as text, validate length/characters, avoid unsafe HTML, sanitize any intentionally rich content | Stored/reflected payload tests |
| Resource exhaustion | Huge scene JSON or extreme generator parameters | Schema and byte limits, object caps, rate limits, generator budgets, bounded DPR/geometry | Oversize and stress tests |
| Arbitrary code execution | Database record selects a dynamic generator module | Compile-time allowlisted registry; never eval user content or load arbitrary module paths | Malicious generator ID/payload tests |
| Data race / lost update | Two stale clients replace complete documents | Typed commands, DB transaction, row lock/revision check, idempotency | Concurrent same/different property tests |
| Secret exposure | Service role key bundled into client | Server-only environment variables and modules; bundle/log review | Build artifact and repository secret scan |
| Environment crossover | Preview build reads production records | Separate projects/keys/redirects and deployment scopes | Preview credential and access tests |
| Data exfiltration via logs | Error logger captures invite URL or scene document | Structured redaction; no token/document logging | Log review with synthetic secrets |
| Abuse/spam | Repeated invitations or expensive experiment requests | Per-user/IP rate limits, caps, abuse monitoring | Rate-limit and quota tests |
| Dependency compromise | Vulnerable transitive package | Lockfile review, minimal dependencies, automated audit, updates | CI dependency scan |

## 4. Critical implementation rules

### Scene mutation boundary
- Do not permit ordinary browser clients to update the full `scenes.document` or `scenes.revision` columns directly.
- Route edits through a narrow PostgreSQL function/RPC that validates `auth.uid()`, membership, role, command schema, command idempotency, and current revision inside one database transaction.
- Prefer a security-invoker function where feasible. If security-definer is necessary, pin `search_path`, schema-qualify objects, revoke broad execute privileges, grant only required roles, and independently enforce actor identity and authorization inside the function.
- Keep the Next.js server action as input/session boundary, not as a substitute for database atomicity.
- Database constraints and RLS must prevent alternate direct-write paths.

### Realtime authorization
- Use private channels and the provider's documented authorization mechanism.
- Do not assume a channel authorization decision remains valid forever after a membership change.
- Test authorization refresh/revocation semantics. On removal, force client unsubscribe/clear and reject subsequent database reads/commands even if an already-open socket lingers.
- Never broadcast complete scene documents, invite details, or secrets in presence metadata.

### Invitation security
- Generate cryptographically random tokens with sufficient entropy.
- Store only a cryptographic hash; compare safely.
- Bind acceptance to the intended verified email/account identity.
- Consume the token and create membership atomically.
- Enforce expiry, revocation, single use, per-scene/per-recipient limits, and rate limits.
- Avoid revealing whether an account exists.
- Do not put raw tokens into logs, analytics, referrers, or third-party tracking URLs.

### Generative security
- Generator IDs map to a compile-time allowlist.
- Validate parameter schemas and numeric bounds on both save and load.
- Enforce per-generator geometry, iteration, memory, texture, and execution-time budgets.
- Never execute user-supplied JavaScript, shader source, HTML, or dynamic imports in the MVP.
- Treat imported/exported recipes and scene metadata as untrusted data.

## 5. Data classification

| Class | Examples | Handling |
|---|---|---|
| Public | Published landing content, public experiment metadata | May be cached and indexed |
| Private user data | Email, account settings, private artifact recipe | Authenticated owner access |
| Private shared data | Scene document, member list, presence | Authorized scene members only |
| Secret | Session/recovery tokens, invitation raw token, service-role key | Never log or expose to browser |
| Operational | Error IDs, latency, aggregate counts | Minimize and redact identifiers |

## 6. Security release blockers

Do not release collaborative Scene Studio until:
- RLS tests prove owner/editor/viewer/non-member/revoked boundaries.
- Direct table writes cannot bypass the command authorization/revision protocol.
- Invitation acceptance is verified, identity-bound, expiring, single-use, and atomic.
- Private Realtime authorization is tested for join, reconnect, and revocation.
- Secrets are absent from client bundles, logs, and repository history.
- Malformed/oversized documents and commands are rejected.
- Concurrent commands cannot silently lose committed edits.
- Preview and production data are isolated.

## 7. Residual risks and explicit non-goals

- A compromised owner account can share or destroy scenes within its authority; account security and recovery controls remain important.
- Realtime disconnect/revocation propagation may not be instantaneous; every durable read/mutation must still enforce current authorization.
- Server-authoritative last-commit ordering does not provide CRDT semantics or offline multi-user merge.
- Free-tier quotas and abuse thresholds may constrain collaboration; measure before launch.
- This document is a threat-model starting point, not a penetration test, compliance assessment, or security certification.
