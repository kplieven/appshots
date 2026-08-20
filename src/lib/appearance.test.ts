import { describe, expect, it } from "vitest";
import { createDeviceInstance } from "./device-instances";
import { copyAppearanceToAll, getAppearance } from "./appearance";
import type { Screenshot } from "../types";

const createScreenshot = (overrides: Partial<Screenshot> = {}): Screenshot => {
  const device = createDeviceInstance({ id: "device-1" });

  return {
    id: "screen-1",
    headline: "Headline",
    subheadline: "Subheadline",
    backgroundColor: "#000000",
    backgroundMode: "solid",
    gradientPresetId: null,
    gradientFrom: "#ff7e5f",
    gradientTo: "#feb47b",
    gradientStops: [{ id: "s1", color: "#ff7e5f", position: 0 }],
    gradientType: "linear",
    gradientAngle: 180,
    backgroundNoise: 0,
    headlineColor: "#ffffff",
    subheadlineColor: "#ffffff",
    headlineX: 50,
    headlineY: 10,
    headlineWidth: 80,
    subheadlineX: 50,
    subheadlineY: 20,
    subheadlineWidth: 80,
    fontFamily: "Inter",
    overlayImages: [],
    devices: [device],
    activeDeviceId: device.id,
    ...overrides,
  };
};

describe("getAppearance", () => {
  it("picks only the fields the Appearance panel controls", () => {
    expect(Object.keys(getAppearance(createScreenshot())).sort()).toEqual(
      [
        "backgroundColor",
        "backgroundMode",
        "backgroundNoise",
        "fontFamily",
        "gradientAngle",
        "gradientFrom",
        "gradientPresetId",
        "gradientStops",
        "gradientTo",
        "gradientType",
        "headlineColor",
        "subheadlineColor",
      ].sort(),
    );
  });

  it("copies gradient stops instead of sharing them", () => {
    const source = createScreenshot();
    const appearance = getAppearance(source);

    expect(appearance.gradientStops).toEqual(source.gradientStops);
    expect(appearance.gradientStops).not.toBe(source.gradientStops);
    expect(appearance.gradientStops?.[0]).not.toBe(source.gradientStops[0]);
  });
});

describe("copyAppearanceToAll", () => {
  const source = createScreenshot({
    id: "source",
    backgroundColor: "#112233",
    headlineColor: "#ff0000",
    subheadlineColor: "#00ff00",
    fontFamily: "Figtree",
  });
  const other = createScreenshot({
    id: "other",
    headline: "Other headline",
    headlineX: 12,
    backgroundColor: "#ffffff",
    headlineColor: "#000000",
    fontFamily: "Inter",
  });

  it("applies the appearance of the source to the other screenshots", () => {
    const [, updated] = copyAppearanceToAll([source, other], "source");

    expect(updated).toMatchObject({
      backgroundColor: "#112233",
      headlineColor: "#ff0000",
      subheadlineColor: "#00ff00",
      fontFamily: "Figtree",
    });
  });

  it("leaves content, layout and devices alone", () => {
    const [, updated] = copyAppearanceToAll([source, other], "source");

    expect(updated).toMatchObject({
      id: "other",
      headline: "Other headline",
      headlineX: 12,
    });
    expect(updated.devices).toBe(other.devices);
  });

  it("keeps the source screenshot as it is", () => {
    const [unchanged] = copyAppearanceToAll([source, other], "source");
    expect(unchanged).toBe(source);
  });

  it("does nothing for a single screenshot or an unknown source", () => {
    const single = [source];
    expect(copyAppearanceToAll(single, "source")).toBe(single);

    const set = [source, other];
    expect(copyAppearanceToAll(set, "missing")).toBe(set);
  });
});
