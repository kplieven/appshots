import { describe, expect, it } from "vitest";
import { DEFAULT_SCREENSHOT_TEXT_COLOR, resolveTextColors } from "./text-colors";

describe("resolveTextColors", () => {
  it("keeps colours that are already set apart", () => {
    expect(
      resolveTextColors({ headlineColor: "#000000", subheadlineColor: "#ff0000" }),
    ).toEqual({ headlineColor: "#000000", subheadlineColor: "#ff0000" });
  });

  it("seeds both colours from the legacy single text colour", () => {
    expect(resolveTextColors({ textColor: "#123456" })).toEqual({
      headlineColor: "#123456",
      subheadlineColor: "#123456",
    });
  });

  it("only fills in the colour that is missing", () => {
    expect(
      resolveTextColors({ headlineColor: "#000000", textColor: "#123456" }),
    ).toEqual({ headlineColor: "#000000", subheadlineColor: "#123456" });
  });

  it("falls back when no colour is stored", () => {
    expect(resolveTextColors({})).toEqual({
      headlineColor: DEFAULT_SCREENSHOT_TEXT_COLOR,
      subheadlineColor: DEFAULT_SCREENSHOT_TEXT_COLOR,
    });
    expect(resolveTextColors({}, "#abcdef").headlineColor).toBe("#abcdef");
  });
});
