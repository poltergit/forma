# FORMA — Authentication & Environment Specification

**Version:** 0.1  
**Phase:** 05 — Technical Architecture  
**Status:** Proposed implementation specification; collaboration invitation flow added for review  
**Approved foundation:** Next.js App Router, TypeScript, Supabase, Vercel

## 1. Authentication scope

The MVP requires account registration, sign-in, sign-out, email confirmation where enabled, password recovery/update, basic account settings, and authenticated Scene Studio access. Public pages, Playground, Motion Lab, Archive, and About remain accessible without authentication.

Social login and organization identity are deferred. Invite-only Scene Studio collaboration is approved for the MVP (D-017); its invitation lifecycle is specified below.

## 2. Session architecture

Use the maintained Supabase server-side rendering integration compatible with the selected Next.js version. Confirm the package and current integration instructions at implementation time.

Create narrowly scoped clients:
- Browser client for browser-required auth interactions and permitted client-side data access.
- Server client per request using the request cookie context for server components, route handlers, and server actions.
- Avoid an admin client for normal product flows. If the approved invitation flow requires a privileged provider invitation API, isolate that single operation behind a server-only module or Edge Function, validate the caller's owner role first, and never expose the service-role key to the browser. Prefer a token-based flow that does not require broad admin access where practical.

Requirements:
- Use the provider's supported secure cookie/session refresh pattern for the selected Next.js release.
- Validate the authenticated user on the server before returning private account or scene data.
- Treat browser session state as a UI convenience, not proof of authorization.
- RLS remains the final database ownership boundary.
- Never manually store access tokens in localStorage or sessionStorage.
- Sign-out clears the provider session and resets private editor state.
- Use the supported Next.js request interception convention for the actual framework version; do not freeze a filename prematurely.

## 3. Route access matrix

| Route | Signed-out behavior | Signed-in behavior |
|---|---|---|
| Public routes | Allow | Allow |
| Sign-in | Show form | Redirect to safe intended route or account |
| Sign-up | Show form | Redirect to account or intended route |
| Password recovery | Show recovery flow | Allow password update when recovery session is valid |
| Scene Studio | Show introduction; request sign-in before private editing | Allow owner-scoped scene workflow |
| Account | Redirect to sign-in with safe return path | Allow account settings |

Authentication redirects must use an allowlisted local destination. Reject external URLs, protocol-relative paths, malformed values, and unexpected schemes.

## 4. Auth flows

### Registration
1. Validate input on the server.
2. Submit registration through Supabase Auth.
3. Show a truthful pending/confirmation state based on provider response and project email settings.
4. Create no scene record until the user is authenticated and requests one.
5. Handle duplicate-account and rate-limit responses without unnecessary account enumeration.

### Sign-in
1. Validate form shape and normalize email input.
2. Submit credentials through the supported Auth flow.
3. Establish the provider-managed session.
4. Validate the intended destination.
5. Redirect to Scene Studio or the requested local destination.
6. Show useful errors without leaking sensitive authentication details.

### Password recovery
1. Accept an email and submit the provider recovery request.
2. Display a neutral confirmation that does not reveal whether the account exists.
3. Configure allowed redirect URLs in Supabase.
4. Validate the recovery token/code through the provider flow.
5. Permit password update only after the recovery session is valid.
6. Show explicit success/failure; never claim an email was sent without provider confirmation.

### Sign-out
1. Call provider sign-out.
2. Clear local user and scene state.
3. Navigate to a public destination.
4. Ensure back navigation cannot reveal stale private data.

## 5. Scene Studio invitation acceptance

The approved MVP includes owner-issued, invite-only scene access. Invitation creation and acceptance must run through trusted server-side operations:

1. The owner submits a recipient email and the editor/viewer role.
2. The server validates the session, scene ownership, role, email format, rate limit, and pending-invitation limits.
3. The server creates a short-lived, single-use random token and stores only its cryptographic hash with the intended normalized email and scene/role metadata.
4. The recipient follows the invitation link, signs in or registers, and proves control of the intended email through the configured Supabase Auth confirmation/session flow.
5. The server validates token hash, expiry, unused/revoked state, scene status, and identity match, then atomically creates the membership and marks the invitation accepted.
6. The server redirects to the scene only after membership is confirmed.

Do not expose whether an email already has a FORMA account. Do not grant membership merely because a link was opened. Do not display a successful invitation state until the server confirms it. Revocation must invalidate pending invitations and remove existing membership as requested by the owner.

The precise email delivery mechanism, confirmation requirements, token hashing method, and atomic acceptance transaction must be verified in an isolated project before release.

## 6. Environment variables

Commit placeholders only.

| Variable | Exposure | Purpose |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Public | Supabase project endpoint |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Public | Browser-safe publishable key, if provided by project |
| SUPABASE_SERVICE_ROLE_KEY | Server only; avoid in MVP | Privileged administration only |
| NEXT_PUBLIC_SITE_URL | Public | Canonical origin for auth redirects where needed |

If the project provides a legacy anon key instead of a publishable key, follow current Supabase documentation and use one consistent variable name across environments. Never commit actual values.

Secret handling:
- Local secrets belong in an ignored local environment file.
- Configure Vercel variables separately for Development, Preview, and Production.
- Preview deployments use non-production backend resources and redirect allowlists.
- Production credentials must not be copied into preview.
- Never print secrets in logs, tests, screenshots, issues, or commits.
- Normal user-owned scene CRUD should not require a service-role key when RLS is correct.
- If a provider admin API is required for invitation delivery, its service-role key is server-only and scoped to the invitation operation; it must never be available to client components or browser requests.

## 7. Environment separation

| Environment | Web | Backend | Data |
|---|---|---|---|
| Local | Local Next.js server | Local Supabase or dedicated development project | Disposable data |
| Preview | Vercel preview deployment | Dedicated staging/preview Supabase project | Synthetic test accounts/scenes |
| Production | Protected Vercel deployment | Production Supabase project | Real user data |

Do not point untrusted preview builds at production data. Keep schema migrations version-controlled and apply them to development, preview, and production in a controlled sequence.

## 8. Supabase configuration checklist

Before enabling auth:
- Configure canonical local, preview, and production site URLs.
- Configure exact redirect URL allowlists for confirmation and recovery.
- Review email confirmation behavior and sender limits.
- Configure password policy and provider rate limits.
- Confirm session expiry and refresh behavior.
- Verify RLS on every private table.
- Document database backup/export capability.
- Review region, data residency, plan quotas, and inactivity policy.

Actual email deliverability depends on project configuration and provider limits.

## 9. Vercel deployment checklist

Before production:
- Connect the intended GitHub repository and production branch.
- Configure variables separately by environment.
- Set the production domain and HTTPS.
- Add exact Supabase callback and redirect URLs.
- Ensure preview environments cannot access production secrets.
- Confirm build settings and framework detection.
- Verify server-only secrets are unavailable to client bundles.
- Test sign-in, sign-out, confirmation, recovery, and private route behavior in preview.
- Verify current plan limits before relying on free-tier service.

## 10. Security and privacy checks

- No secrets in Git history or public browser bundles.
- No service-role key in client components.
- Server-side user validation before private data reads.
- RLS on every private database table.
- Safe local-only redirect destinations.
- Neutral recovery responses to reduce account enumeration.
- Ownership derived from trusted session context.
- Clear private editor state on sign-out and account changes.
- No private scene content in analytics or routine logs.
- Test expired sessions and revoked access.

## 11. Acceptance criteria

- Local, preview, and production environments are separated.
- Auth redirects are allowlisted and tested.
- Registration, sign-in, sign-out, confirmation, and recovery have clear success/error states.
- Server-side session validation protects private routes.
- RLS protects private scene records, memberships, and invitation metadata independently of route guards.
- Invitation acceptance binds a single-use expiring token to the intended verified identity.
- Owner/editor/viewer permissions are enforced on server mutations and private Realtime access.
- Preview deployments cannot access production data.
- No secret is committed or exposed to client code.
