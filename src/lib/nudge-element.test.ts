/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { createDeviceInstance } from "./device-instances";
import {
  NUDGE_DIRECTIONS,
  getNudgeUpdates,
  isTextEntryTarget,
} from "./nudge-element";
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
  const device = createDeviceInstance({ id: "device-1", x: 12, y: 30 });

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
    headlineColor: "#ffffff",
    subheadlineColor: "#ffffff",
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

describe("getNudgeUpdates", () => {
  it("moves the headline on both axes", () => {
    expect(
      getNudgeUpdates(
        createScreenshot(),
        { type: "headline", screenshotId: "screen-1" },
        -0.5,
        0.5,
      ),
    ).toEqual({ headlineX: 19.5, headlineY: 10.5 });
  });

  it("moves the subheadline", () => {
    expect(
      getNudgeUpdates(
        createScreenshot(),
        { type: "subheadline", screenshotId: "screen-1" },
        0,
        -2.5,
      ),
    ).toEqual({ subheadlineX: 80, subheadlineY: 17.5 });
  });

  it("moves only the selected overlay image", () => {
    const screenshot = createScreenshot({
      overlayImages: [
        overlayImage({ id: "image-1", x: 20, y: 40 }),
        overlayImage({ id: "image-2", x: 80, y: 60 }),
      ],
    });

    const updates = getNudgeUpdates(
      screenshot,
      { type: "image", screenshotId: "screen-1", id: "image-2" },
      0.5,
      0,
    );

    expect(updates?.overlayImages?.map((image) => [image.x, image.y])).toEqual([
      [20, 40],
      [80.5, 60],
    ]);
  });

  it("moves the selected device", () => {
    const updates = getNudgeUpdates(
      createScreenshot(),
      { type: "device", screenshotId: "screen-1", id: "device-1" },
      0,
      0.5,
    );

    expect(updates?.devices?.[0]).toMatchObject({ x: 12, y: 30.5 });
  });

  it("rounds away floating point noise", () => {
    const updates = getNudgeUpdates(
      createScreenshot({ headlineX: 20.1 }),
      { type: "headline", screenshotId: "screen-1" },
      0.2,
      0,
    );

    expect(updates?.headlineX).toBe(20.3);
  });

  it("returns null when there is nothing to move", () => {
    const screenshot = createScreenshot();

    expect(getNudgeUpdates(screenshot, null, 0.5, 0)).toBeNull();
    expect(
      getNudgeUpdates(screenshot, { type: "headline", screenshotId: "s" }, 0, 0),
    ).toBeNull();
    expect(
      getNudgeUpdates(
        screenshot,
        { type: "image", screenshotId: "screen-1", id: "missing" },
        0.5,
        0,
      ),
    ).toBeNull();
    expect(
      getNudgeUpdates(
        screenshot,
        { type: "device", screenshotId: "screen-1", id: "missing" },
        0.5,
        0,
      ),
    ).toBeNull();
  });
});

describe("NUDGE_DIRECTIONS", () => {
  it("maps each arrow key to one axis", () => {
    expect(NUDGE_DIRECTIONS.ArrowUp).toEqual({ dx: 0, dy: -1 });
    expect(NUDGE_DIRECTIONS.ArrowDown).toEqual({ dx: 0, dy: 1 });
    expect(NUDGE_DIRECTIONS.ArrowLeft).toEqual({ dx: -1, dy: 0 });
    expect(NUDGE_DIRECTIONS.ArrowRight).toEqual({ dx: 1, dy: 0 });
    expect(NUDGE_DIRECTIONS.Enter).toBeUndefined();
  });
});

describe("isTextEntryTarget", () => {
  it("detects fields where the arrow keys move the caret", () => {
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const editor = document.createElement("div");
    editor.setAttribute("contenteditable", "true");
    const insideEditor = editor.appendChild(document.createElement("b"));

    expect(isTextEntryTarget(input)).toBe(true);
    expect(isTextEntryTarget(textarea)).toBe(true);
    expect(isTextEntryTarget(editor)).toBe(true);
    expect(isTextEntryTarget(insideEditor)).toBe(true);
  });

  it("ignores the canvas and anything that is not an element", () => {
    expect(isTextEntryTarget(document.createElement("div"))).toBe(false);
    expect(isTextEntryTarget(null)).toBe(false);
    expect(isTextEntryTarget(window)).toBe(false);
  });
});
