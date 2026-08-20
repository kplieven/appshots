/**
 * Appearance sharing helpers.
 *
 * The appearance of a screenshot — its background, text colours and font — can
 * be copied to the rest of the set so a whole series stays consistent without
 * editing every screenshot by hand. Content, positions, devices and overlay
 * images stay untouched.
 */

import type { Screenshot } from "../types";

/** Fields the Appearance panel controls, and so the ones that get copied. */
export const APPEARANCE_KEYS = [
  "backgroundColor",
  "backgroundMode",
  "gradientPresetId",
  "gradientFrom",
  "gradientTo",
  "gradientStops",
  "gradientType",
  "gradientAngle",
  "backgroundNoise",
  "headlineColor",
  "subheadlineColor",
  "fontFamily",
] as const satisfies readonly (keyof Screenshot)[];

/**
 * Picks the appearance of a screenshot.
 *
 * Gradient stops are copied, not shared, so later edits to one screenshot's
 * gradient cannot reach into another.
 *
 * @param screenshot - Screenshot to read the appearance from
 * @returns The appearance fields, ready to merge into another screenshot
 */
export const getAppearance = (screenshot: Screenshot): Partial<Screenshot> => {
  const appearance: Partial<Screenshot> = {};

  for (const key of APPEARANCE_KEYS) {
    Object.assign(appearance, { [key]: screenshot[key] });
  }

  return {
    ...appearance,
    gradientStops: screenshot.gradientStops.map((stop) => ({ ...stop })),
  };
};

/**
 * Applies one screenshot's appearance to every other screenshot.
 *
 * @param screenshots - The whole set
 * @param sourceId - Screenshot whose appearance is copied
 * @returns A new set, or the original one when there is nothing to copy to
 *
 * @example
 * copyAppearanceToAll(screenshots, activeScreenshotId);
 */
export const copyAppearanceToAll = (
  screenshots: Screenshot[],
  sourceId: string,
): Screenshot[] => {
  const source = screenshots.find((screenshot) => screenshot.id === sourceId);
  if (!source || screenshots.length < 2) return screenshots;

  return screenshots.map((screenshot) =>
    screenshot.id === sourceId
      ? screenshot
      : { ...screenshot, ...getAppearance(source) },
  );
};
