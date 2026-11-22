import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { VslPlayer } from "./vsl-player";

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("VSL completion gate", () => {
  it("releases the CTA only when about 5 seconds remain or the video ends", () => {
    render(<VslPlayer mediaId="85xuu9y7rj" actions={<a href="/planos">Planos</a>} />);
    const video = screen.getByLabelText("Demonstração do FunilaBot") as HTMLElement & { duration: number; currentTime: number };
    expect(screen.queryByRole("link", { name: "Planos" })).toBeNull();
    fireEvent.play(video);
    video.duration = 100;
    video.currentTime = 50;
    fireEvent.timeUpdate(video);
    expect(screen.queryByRole("link", { name: "Planos" })).toBeNull();
    video.currentTime = 96;
    fireEvent.timeUpdate(video);
    expect(screen.getByRole("link", { name: "Planos" }).getAttribute("href")).toBe("/planos");
    fireEvent.ended(video);
    expect(screen.getByRole("link", { name: "Planos" })).toBeTruthy();
  });

  it("does not release the CTA when the video is absent or fails", () => {
    const { rerender } = render(<VslPlayer mediaId="" actions={<a href="/planos">Planos</a>} />);
    expect(screen.queryByRole("link", { name: "Planos" })).toBeNull();
    rerender(<VslPlayer mediaId="85xuu9y7rj" actions={<a href="/planos">Planos</a>} />);
    fireEvent.error(screen.getByLabelText("Demonstração do FunilaBot"));
    expect(screen.queryByRole("link", { name: "Planos" })).toBeNull();
  });
});

describe("fake progress bar", () => {
  it("advances while playing but never completes before the video ends", () => {
    vi.useFakeTimers();
    render(<VslPlayer mediaId="85xuu9y7rj" actions={<a href="/planos">Planos</a>} />);
    const video = screen.getByLabelText("Demonstração do FunilaBot");
    const bar = screen.getByRole("progressbar", { name: "Progresso do vídeo" });
    expect(bar.getAttribute("aria-valuenow")).toBe("0");
    fireEvent.play(video);
    act(() => { vi.advanceTimersByTime(60_000); });
    const mid = Number(bar.getAttribute("aria-valuenow"));
    expect(mid).toBeGreaterThan(50);
    expect(mid).toBeLessThanOrEqual(93);
    fireEvent.pause(video);
    const paused = bar.getAttribute("aria-valuenow");
    act(() => { vi.advanceTimersByTime(10_000); });
    expect(bar.getAttribute("aria-valuenow")).toBe(paused);
    fireEvent.ended(video);
    expect(bar.getAttribute("aria-valuenow")).toBe("100");
  });
});