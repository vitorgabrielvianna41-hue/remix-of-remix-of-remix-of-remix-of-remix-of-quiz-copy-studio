import { describe, it, expect } from "vitest";
import { computeResult, MARGIN_EXAMPLE, serviceRemainder } from "./funil";

const base = { equipe: 0, preco: 1, resposta: 0, custo: 1, retomada: 1, dificuldade: 0, execucao: 1, crescimento: 0, interesse: 0 };

describe("resultado FunilaBot", () => {
  it("a dificuldade declarada vira a primeira recomendação", () => {
    expect(computeResult({ ...base, dificuldade: 2 }).actions[0]).toBe("acompanhamento");
  });
  it("custos anotados não são tratados como custos desconhecidos", () => {
    const r = computeResult({ ...base, custo: 0, dificuldade: 0 });
    expect(r.priorityOrganized).toBe(true);
    expect(r.routine.find((row) => row.axis === "custo")?.label).toBe("Custos anotados");
  });
  it("'não sei' no preço omite a apresentação", () => {
    expect(computeResult({ ...base, preco: 3 }).shown).not.toContain("apresentacao");
  });
  it("um processo organizado mantém a prioridade escolhida", () => {
    const r = computeResult({ ...base, preco: 2, custo: 0, retomada: 0, execucao: 0, crescimento: 3 });
    expect(r.priority).toBe("custo");
    expect(r.allOrganized).toBe(true);
  });
  it("pouco interesse ainda dá resultado", () => {
    expect(computeResult({ ...base, interesse: 3 }).lowInterest).toBe(true);
  });
  it.each([[0, "custo"], [1, "apresentacao"], [2, "acompanhamento"], [3, "execucao"]] as const)(
    "a prioridade %i governa o caminho mesmo ao comparar ou ter pouco interesse", (dificuldade, priority) => {
      for (const interesse of [0, 1, 2, 3]) {
        expect(computeResult({ ...base, dificuldade, interesse }).priority).toBe(priority);
      }
    },
  );
  it("o primeiro contato por áudio não altera a avaliação dos custos e do orçamento final", () => {
    const audio = computeResult({ ...base, resposta: 0 });
    const evaluation = computeResult({ ...base, resposta: 3 });
    expect(audio.weights).toEqual(evaluation.weights);
    expect(audio.routine).toEqual(evaluation.routine);
  });
  it("usa apenas perguntas 4, 5 e 7 para resumir a rotina", () => {
    const original = computeResult(base).routine;
    expect(computeResult({ ...base, preco: 3, resposta: 2, dificuldade: 3, crescimento: 3, interesse: 2 }).routine).toEqual(original);
    expect(computeResult({ ...base, custo: 0 }).routine[0]).not.toEqual(original[0]);
    expect(computeResult({ ...base, retomada: 0 }).routine[1]).not.toEqual(original[1]);
    expect(computeResult({ ...base, execucao: 0 }).routine[2]).not.toEqual(original[2]);
  });
  it("a troca da pergunta 6 recalcula a prioridade", () => {
    expect(computeResult(base).priority).toBe("custo");
    expect(computeResult({ ...base, dificuldade: 3 }).priority).toBe("execucao");
  });
  it("o exemplo desconta 230 de material e 300 de mão de obra dos 850 cobrados", () => {
    expect(MARGIN_EXAMPLE).toEqual({ service: 850, materials: 230, labor: 300 });
    expect(serviceRemainder(850, 230, 300)).toBe(320);
  });
});
