<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Maluki Viagens
- All trip data is family-scoped: every app table carries `family_id` and RLS uses `public.is_family_member(family_id)`; a signup trigger creates the profile + first family. Why: whole family shares and edits trips.
- Trip sub-tables (activities, reservations, expenses, checklist_items, emergency_contacts, documents) are read/written from the browser via `src/lib/trip-data.ts` generic hooks. Why: one CRUD path, RLS is the security boundary.
- Documents live in the private `documents` bucket under `<family_id>/...`; open via short-lived signed URLs. Why: storage policies check the first folder against family membership.
- AI assistant runs only in `src/lib/ai.functions.ts` (auth-protected server fn via the gateway-backed DeepSeek connector). Why: keeps prompts and credentials server-side while preserving family-scoped trip context.
- Reservation field applicability and itinerary eligibility are centralized in `src/lib/reservation-fields.ts`. Why: rendering and submission sanitization must share the same reservation-type rules.
- Email signup resolves optional family invites inside the auth lifecycle trigger; Google invites use authenticated join_family after the public OAuth callback. Why: invite membership is validated by the database, never by client storage or user-supplied roles.
- Shared dialogs use dynamic viewport height with internal scrolling and mobile margins. Why: long forms must keep their first and last controls reachable on phones.
- Trip covers are user-uploaded images stored under `<family_id>/covers/` in the private `documents` bucket and shown through signed URLs via `useTripCover` in `src/lib/album-cover.ts`. Why: one private, family-scoped source of cover imagery that works for every trip.
