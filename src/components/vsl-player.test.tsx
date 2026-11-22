import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { VslPlayer } from "./vsl-player";

afterEach(cleanup);

describe("VSL completion gate", () => {
  it("only releases the CTA after the video ends", () => {
    render(<VslPlayer mediaId="85xuu9y7rj" actions={<a href="/planos">Planos</a>} />);
    const video = screen.getByLabelText("Demonstração do FunilaBot");
    expect(screen.queryByRole("link", { name: "Planos" })).toBeNull();
    fireEvent.play(video);
    fireEvent.timeUpdate(video);
    fireEvent.pause(video);
    expect(screen.queryByRole("link", { name: "Planos" })).toBeNull();
    fireEvent.ended(video);
    expect(screen.getByRole("link", { name: "Planos" }).getAttribute("href")).toBe("/planos");
  });

  it("does not release the CTA when the video is absent or fails", () => {
    const { rerender } = render(<VslPlayer mediaId="" actions={<a href="/planos">Planos</a>} />);
    expect(screen.queryByRole("link", { name: "Planos" })).toBeNull();
    rerender(<VslPlayer mediaId="85xuu9y7rj" actions={<a href="/planos">Planos</a>} />);
    fireEvent.error(screen.getByLabelText("Demonstração do FunilaBot"));
    expect(screen.queryByRole("link", { name: "Planos" })).toBeNull();
  });
});