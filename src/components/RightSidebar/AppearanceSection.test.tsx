/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppearanceSection } from "./AppearanceSection";
import { createDeviceInstance } from "../../lib/device-instances";
import type { Screenshot } from "../../types";

const device = createDeviceInstance({ id: "device-1" });

const screenshot: Screenshot = {
  id: "screen-1",
  headline: "Headline",
  subheadline: "Subheadline",
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
  subheadlineColor: "#cccccc",
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
};

const renderSection = (canCopyToAll: boolean) => {
  const onCopyToAll = vi.fn();
  render(
    <AppearanceSection
      screenshot={screenshot}
      gradientPresets={[]}
      onUpdateScreenshot={vi.fn()}
      onOpenFontPicker={vi.fn()}
      canCopyToAll={canCopyToAll}
      onCopyToAll={onCopyToAll}
    />,
  );
  return {
    onCopyToAll,
    button: screen.getByRole("button", {
      name: /copy to all other screenshots/i,
    }) as HTMLButtonElement,
  };
};

// Queries run against the document, so each render has to be torn down
afterEach(cleanup);

describe("AppearanceSection", () => {
  it("copies the appearance to the other screenshots on click", () => {
    const { onCopyToAll, button } = renderSection(true);

    fireEvent.click(button);
    expect(onCopyToAll).toHaveBeenCalledTimes(1);
  });

  it("disables the button when there is nothing to copy to", () => {
    const { onCopyToAll, button } = renderSection(false);

    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onCopyToAll).not.toHaveBeenCalled();
  });
});
