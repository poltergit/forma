# FORMA Scene Studio — Cloud Sync Setup

**Status:** Client integration and migration committed; cloud sync is not live until the migration and Supabase project configuration below are applied.

## What is implemented

- Supabase Auth email/password sign-in and account creation at `/sign-in`.
- Email confirmation callback at `/auth/callback`.
- Owner-scoped composition storage in `public.scene_studio_compositions`.
- RLS-protected reads and deletes; all creates/updates go through the revision-checked `save_scene_studio_composition` RPC.
- Debounced autosave to local storage and, for authenticated users, Supabase.
- First sign-in on a device loads that account's cloud library. Account-local caches are namespaced by Supabase user ID.
- Existing anonymous local compositions remain in the anonymous local library; they are not silently copied into an account.
- A stale revision is rejected rather than silently overwriting another device's newer save. The local edit is preserved as a separate conflict-copy composition and can sync independently.

## 1. Configure Supabase

Create or select the intended Supabase project. Keep development/preview and production projects separate.

Set these values in local `.env.local` and in the matching Vercel environment:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project publishable key |

Do not use a service-role key in the browser. Scene Studio cloud sync does not need one.

## 2. Apply the migration

Review and apply:

`supabase/migrations/20261124000100_scene_studio_cloud_library.sql`

It is self-contained and creates the Scene Studio composition table, validation functions, owner-only RLS policies, and revision-checked save RPC. It is separate from the earlier collaboration-oriented `public.scenes` draft.

Apply it to a development Supabase project first using the Supabase SQL Editor or the project's established migration workflow. Verify the table, policies, function grants, and a signed-in user's create/read/update/delete behavior before applying it to production.

This repository change does not apply SQL to your Supabase project automatically.

## 3. Configure Auth redirects

In Supabase Authentication URL Configuration, add the exact callback URLs used by your deployments:

- Local: `http://localhost:3000/auth/callback`
- Preview: the specific preview origin(s) you intend to support, followed by `/auth/callback`
- Production: `https://YOUR_PRODUCTION_DOMAIN/auth/callback`

Enable email/password authentication. If email confirmation is enabled, configure the confirmation email redirect to the callback above and verify the sender/provider settings. The callback only exchanges a Supabase-issued code and allows a safe local destination.

## 4. Verify the workflow

1. Start the app with the Supabase environment variables set.
2. Open `/sign-in`, create an account, and confirm the email if required.
3. Sign in and open Scene Studio.
4. Create a composition and wait for the status to read **CLOUD SYNCED**.
5. Open the same account on another browser/device. The cloud library should load there.
6. Change the same composition from two devices. The older revision must receive a conflict status rather than overwrite the newer revision.
7. Sign out and confirm the account's cloud scenes are no longer shown in the anonymous local workspace.

## Current synchronization boundary

Cloud persistence synchronizes when the editor opens and when it autosaves. It is not yet live collaborative editing: no Realtime subscription, presence, or automatic conflict merge is enabled. On a revision conflict, the editor preserves the in-progress local edit as a separate conflict-copy composition instead of overwriting the newer cloud revision. Open the original to work from the latest cloud version, or continue from the conflict copy. Local autosave remains available when Supabase is unavailable or the user is signed out.
