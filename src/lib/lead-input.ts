import { z } from "zod";

import { QUESTIONS, type Answers } from "@/lib/funil";

export type LeadInput = { whatsapp: string; answers: Answers };

const rawLead = z.object({
  whatsapp: z.string(),
  answers: z.record(z.string(), z.number()),
});

/** Digits only: "(11) 98765-4321" -> "11987654321". */
export function normalizeWhats(v: string): string {
  return v.replace(/\D/g, "");
}

/** Brazilian mobile (11 digits) or landline (10 digits), DDD included. */
export function whatsValid(v: string): boolean {
  const d = normalizeWhats(v);
  return d.length === 10 || d.length === 11;
}

/**
 * Server-side gate for the public lead form: keeps only digits in the number,
 * rejects a number without DDD, and drops answers that are not a real option of
 * a real question. Throws when the number is unusable.
 */
export function parseLeadInput(raw: unknown): LeadInput {
  const parsed = rawLead.parse(raw);
  const digits = normalizeWhats(parsed.whatsapp);
  if (digits.length !== 10 && digits.length !== 11) {
    throw new Error("WhatsApp precisa de DDD + telefone.");
  }
  const answers: Answers = {};
  for (const q of QUESTIONS) {
    const chosen = parsed.answers[q.id];
    if (typeof chosen === "number" && Number.isInteger(chosen) && chosen >= 0 && chosen < q.options.length) {
      answers[q.id] = chosen;
    }
  }
  return { whatsapp: digits, answers };
}
