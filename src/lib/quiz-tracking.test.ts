import { beforeEach, describe, expect, it } from "vitest";
import { initializeQuizTracking } from "./quiz-tracking";

describe("quiz tracking initialization", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    Reflect.deleteProperty(window, "pixelId");
  });

  it("sets the supplied pixel ID before requesting the pixel", () => {
    initializeQuizTracking();
    expect(Reflect.get(window, "pixelId")).toBe("6adec30fd4f7aa8e32c61f37");
    expect(Array.from(document.scripts).map((script) => script.src)).toEqual([
      "https://cdn.utmify.com.br/scripts/utms/latest.js",
      "https://cdn.utmify.com.br/scripts/pixel/pixel.js",
    ]);
  });

  it("does not request either tracker again when the quiz remounts", () => {
    initializeQuizTracking();
    const firstScripts = Array.from(document.scripts);
    initializeQuizTracking();
    expect(Array.from(document.scripts)).toEqual(firstScripts);
    expect(document.scripts.length).toBe(2);
  });
});