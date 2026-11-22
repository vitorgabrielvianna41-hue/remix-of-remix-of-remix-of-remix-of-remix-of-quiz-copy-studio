import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResultScreen } from "./quiz-result";

const answers = { equipe: 0, preco: 1, resposta: 0, custo: 1, retomada: 1, dificuldade: 2, execucao: 1, crescimento: 0, interesse: 0 };
let notify: IntersectionObserverCallback;
const disconnect = vi.fn();

beforeEach(() => {
  vi.stubGlobal("IntersectionObserver", class {
    constructor(callback: IntersectionObserverCallback) { notify = callback; }
    observe = vi.fn();
    disconnect = disconnect;
  });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

function visibility(ratio: number) {
  act(() => notify([{ intersectionRatio: ratio } as IntersectionObserverEntry], {} as IntersectionObserver));
}

describe("diagnosis fixed CTA", () => {
  it("keeps the fixed action until the original is fully visible and restores it when scrolling away", () => {
    render(<ResultScreen answers={answers} onEdit={vi.fn()} onVsl={vi.fn()} />);
    expect(screen.getAllByRole("button", { name: /Quero retomar meus orçamentos/ })).toHaveLength(2);
    visibility(0.5);
    expect(screen.getAllByRole("button", { name: /Quero retomar meus orçamentos/ })).toHaveLength(2);
    visibility(1);
    expect(screen.getAllByRole("button", { name: /Quero retomar meus orçamentos/ })).toHaveLength(1);
    visibility(0);
    expect(screen.getAllByRole("button", { name: /Quero retomar meus orçamentos/ })).toHaveLength(2);
  });

  it("opens the same VSL from either action", () => {
    const onVsl = vi.fn();
    render(<ResultScreen answers={answers} onEdit={vi.fn()} onVsl={onVsl} />);
    for (const button of screen.getAllByRole("button", { name: /Quero retomar meus orçamentos/ })) fireEvent.click(button);
    expect(onVsl).toHaveBeenCalledTimes(2);
  });
});