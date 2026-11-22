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

## Project rules

- Quiz leads go through the `saveLead` server function into `public.leads`; the table grants anonymous visitors INSERT only, so no page or visitor can read a lead back. Keep the number validation in `src/lib/lead-input.ts` so the same rule runs on the form and on the server.
- Keep diagnosis paths and response-derived habits in the isomorphic quiz module, with presentation in a dedicated result component, so screen and saved diagnosis use the same priority without inferring final-budget practices from first-contact answers.
- Keep VSL playback and completion gating in a dedicated player; reveal its actions only from the video's ended event so missing or failed media cannot unlock them.
- Load the Wistia custom-element scripts after hydration and listen to its native ended event in the dedicated player, so SSR stays browser-safe and CTA gating follows actual playback.
- Observe the diagnosis's original CTA in the result component to hide its fixed counterpart when fully visible, keeping both actions on the same VSL callback.

