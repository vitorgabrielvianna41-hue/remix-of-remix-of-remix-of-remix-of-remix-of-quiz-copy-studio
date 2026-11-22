import { describe, expect, it } from "vitest";

import { normalizeWhats, parseLeadInput, whatsValid } from "@/lib/lead-input";

describe("lead capture rules", () => {
  it("keeps only the digits of a mobile with DDD", () => {
    const r = parseLeadInput({ whatsapp: "(11) 98765-4321", answers: { equipe: 0 } });
    expect(r.whatsapp).toBe("11987654321");
    expect(r.answers).toEqual({ equipe: 0 });
  });

  it("rejects a number without DDD", () => {
    expect(() => parseLeadInput({ whatsapp: "98765-4321", answers: {} })).toThrow();
  });

  it("drops answers that are not a real option of a real question", () => {
    const r = parseLeadInput({
      whatsapp: "11987654321",
      answers: { equipe: 99, nao_existe: 0, preco: 1 },
    });
    expect(r.answers).toEqual({ preco: 1 });
  });

  it("accepts a 10-digit landline", () => {
    expect(whatsValid("11 3232-1212")).toBe(true);
    expect(normalizeWhats("11 3232-1212")).toBe("1132321212");
  });
});
