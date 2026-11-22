import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { computeResult } from "@/lib/funil";
import { parseLeadInput } from "@/lib/lead-input";

/**
 * Public write path for the quiz: validates the number and the answers on the
 * server, then stores one lead. The table only grants INSERT to anonymous
 * visitors, so nothing here can read or change an existing lead.
 */
export const saveLead = createServerFn({ method: "POST" })
  .validator((input: unknown) => parseLeadInput(input))
  .handler(async ({ data }) => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const supabase = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        // Opaque sb_ keys are not JWTs: send apikey only, never a bearer.
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const r = computeResult(data.answers);
    const { error } = await supabase.from("leads").insert({
      whatsapp: data.whatsapp,
      answers: data.answers,
      result: {
        headline: r.headline,
        priority: r.priority,
        actions: r.actions,
        solo: r.solo,
        lowInterest: r.lowInterest,
      },
    });

    if (error) {
      console.error("[leads] insert failed:", error.message);
      return { ok: false } as const;
    }
    return { ok: true } as const;
  });
