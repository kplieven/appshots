import { describe, expect, it } from "vitest";
import {
  TEXT_SNAP_THRESHOLD_PERCENT,
  findSnapCenterY,
} from "./snap-alignment";

describe("findSnapCenterY", () => {
  it("snaps to a target within the threshold", () => {
    expect(findSnapCenterY(20.8, [20, 60])).toBe(20);
  });

  it("ignores targets outside the threshold", () => {
    expect(findSnapCenterY(20 + TEXT_SNAP_THRESHOLD_PERCENT + 0.1, [20])).toBeNull();
    expect(findSnapCenterY(50, [])).toBeNull();
  });

  it("picks the closest of several nearby targets", () => {
    expect(findSnapCenterY(20.6, [20, 21])).toBe(21);
  });

  it("honours a custom threshold", () => {
    expect(findSnapCenterY(25, [20], 6)).toBe(20);
    expect(findSnapCenterY(25, [20], 4)).toBeNull();
  });
});
