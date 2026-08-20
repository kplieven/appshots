/** @vitest-environment jsdom */

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SnapGuide } from "./SnapGuide";

describe("SnapGuide", () => {
  it("draws the guide at the snapped height without capturing clicks", () => {
    const { container } = render(<SnapGuide y={42.5} />);

    const guide = container.querySelector<HTMLElement>(
      "[data-snap-guide='true']",
    );
    expect(guide).not.toBeNull();
    expect(guide?.style.top).toBe("42.5%");
    expect(guide?.className).toContain("pointer-events-none");
  });
});
