import { createServerFn } from "@tanstack/react-start";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type LeadRow = {
  id: string;
  whatsapp: string;
  createdAt: string;
  headline: string;
  priority: string;
  solo: boolean;
  lowInterest: boolean;
  answers: Record<string, number>;
};

export type LeadList =
  | { ok: true; leads: LeadRow[] }
  | { ok: false; error: "no-access" | "read-failed"; leads: never[] };

/**
 * Admin-only read of the quiz submissions. The route guard around /leads is UX:
 * this endpoint is callable directly, so the bearer check (middleware) and the
 * role check (has_role, a security-definer function) are the real boundary.
 * The table itself only grants SELECT to accounts holding the admin role.
 */
export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LeadList> => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });

    if (roleError || !isAdmin) return { ok: false, error: "no-access", leads: [] };

    const { data, error } = await context.supabase
      .from("leads")
      .select("id, whatsapp, answers, result, created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[leads] read failed:", error.message);
      return { ok: false, error: "read-failed", leads: [] };
    }

    return {
      ok: true,
      leads: (data ?? []).map((row) => {
        const result = (row.result ?? {}) as Record<string, unknown>;
        return {
          id: row.id,
          whatsapp: row.whatsapp,
          createdAt: row.created_at,
          headline: typeof result["headline"] === "string" ? result["headline"] : "",
          priority: typeof result["priority"] === "string" ? result["priority"] : "",
          solo: result["solo"] === true,
          lowInterest: result["lowInterest"] === true,
          answers: (row.answers ?? {}) as Record<string, number>,
        };
      }),
    };
  });
