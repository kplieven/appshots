import { describe, expect, it } from "vitest";
import { createDeviceInstance } from "./device-instances";
import { getHorizontalCenterUpdates } from "./center-element";
import type { ImageOverlay, Screenshot } from "../types";

const overlayImage = (overrides: Partial<ImageOverlay>): ImageOverlay => ({
  id: "image-1",
  src: "data:image/png;base64,",
  x: 20,
  y: 40,
  width: 30,
  height: 30,
  layer: "front",
  rotation: 0,
  shadow: {
    enabled: false,
    color: "#000000",
    blur: 0,
    offsetX: 0,
    offsetY: 0,
  },
  ...overrides,
});

const createScreenshot = (overrides: Partial<Screenshot> = {}): Screenshot => {
  const device = createDeviceInstance({ id: "device-1", x: 12 });

  return {
    id: "screen-1",
    headline: "",
    subheadline: "",
    backgroundColor: "#000000",
    backgroundMode: "solid",
    gradientPresetId: null,
    gradientFrom: "#ff7e5f",
    gradientTo: "#feb47b",
    gradientStops: [],
    gradientType: "linear",
    gradientAngle: 180,
    backgroundNoise: 0,
    textColor: "#ffffff",
    headlineX: 20,
    headlineY: 10,
    headlineWidth: 80,
    subheadlineX: 80,
    subheadlineY: 20,
    subheadlineWidth: 80,
    fontFamily: "Inter",
    overlayImages: [overlayImage({})],
    devices: [device],
    activeDeviceId: device.id,
    ...overrides,
  };
};

describe("getHorizontalCenterUpdates", () => {
  it("centers the headline", () => {
    expect(
      getHorizontalCenterUpdates(createScreenshot(), {
        type: "headline",
        screenshotId: "screen-1",
      }),
    ).toEqual({ headlineX: 50 });
  });

  it("centers the subheadline", () => {
    expect(
      getHorizontalCenterUpdates(createScreenshot(), {
        type: "subheadline",
        screenshotId: "screen-1",
      }),
    ).toEqual({ subheadlineX: 50 });
  });

  it("centers only the selected overlay image", () => {
    const screenshot = createScreenshot({
      overlayImages: [
        overlayImage({ id: "image-1", x: 20 }),
        overlayImage({ id: "image-2", x: 80 }),
      ],
    });

    const updates = getHorizontalCenterUpdates(screenshot, {
      type: "image",
      screenshotId: "screen-1",
      id: "image-2",
    });

    expect(updates?.overlayImages?.map((image) => image.x)).toEqual([20, 50]);
  });

  it("centers only the selected device", () => {
    const screenshot = createScreenshot({
      devices: [
        createDeviceInstance({ id: "device-1", x: 12 }),
        createDeviceInstance({ id: "device-2", x: 90 }),
      ],
    });

    const updates = getHorizontalCenterUpdates(screenshot, {
      type: "device",
      screenshotId: "screen-1",
      id: "device-1",
    });

    expect(updates?.devices?.map((device) => device.x)).toEqual([50, 90]);
  });

  it("keeps the other axis untouched", () => {
    const screenshot = createScreenshot();

    const updates = getHorizontalCenterUpdates(screenshot, {
      type: "device",
      screenshotId: "screen-1",
      id: "device-1",
    });

    expect(updates?.devices?.[0]).toEqual({
      ...screenshot.devices[0],
      x: 50,
    });
  });

  it("returns null without a selection or for a missing element", () => {
    const screenshot = createScreenshot();

    expect(getHorizontalCenterUpdates(screenshot, null)).toBeNull();
    expect(
      getHorizontalCenterUpdates(screenshot, {
        type: "image",
        screenshotId: "screen-1",
        id: "unknown",
      }),
    ).toBeNull();
    expect(
      getHorizontalCenterUpdates(screenshot, {
        type: "device",
        screenshotId: "screen-1",
      }),
    ).toBeNull();
  });
});
