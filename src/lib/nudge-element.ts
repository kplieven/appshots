/**
 * Arrow-key nudging helpers.
 *
 * The selected element (text, overlay image, or device) can be moved with the
 * arrow keys, which is easier than dragging when a position only needs a small
 * correction. Steps are in percent of the screenshot, the same unit every
 * element position uses.
 */

import type { Screenshot, SelectedElement } from "../types";

/** Distance a single arrow key press moves the element, in percent. */
export const NUDGE_STEP_PERCENT = 0.5;

/** Multiplier applied to the step while Shift is held. */
export const NUDGE_COARSE_MULTIPLIER = 5;

/** Direction each arrow key nudges in, as a fraction of the step. */
export const NUDGE_DIRECTIONS: Record<string, { dx: number; dy: number }> = {
  ArrowLeft: { dx: -1, dy: 0 },
  ArrowRight: { dx: 1, dy: 0 },
  ArrowUp: { dx: 0, dy: -1 },
  ArrowDown: { dx: 0, dy: 1 },
};

/** Keeps positions readable instead of accumulating floating point noise. */
const round = (value: number): number => Math.round(value * 100) / 100;

/**
 * Computes the screenshot updates that move the selected element by a step.
 *
 * Positions are not clamped to the screenshot, matching dragging, where an
 * element may be moved partly out of frame on purpose.
 *
 * @param screenshot - Screenshot owning the selected element
 * @param selectedElement - Currently selected element, if any
 * @param dx - Horizontal distance, in percent of the screenshot width
 * @param dy - Vertical distance, in percent of the screenshot height
 * @returns Partial screenshot updates, or null when there is nothing to move
 */
export const getNudgeUpdates = (
  screenshot: Screenshot,
  selectedElement: SelectedElement | null,
  dx: number,
  dy: number,
): Partial<Screenshot> | null => {
  if (!selectedElement) return null;
  if (dx === 0 && dy === 0) return null;

  switch (selectedElement.type) {
    case "headline":
      return {
        headlineX: round(screenshot.headlineX + dx),
        headlineY: round(screenshot.headlineY + dy),
      };
    case "subheadline":
      return {
        subheadlineX: round(screenshot.subheadlineX + dx),
        subheadlineY: round(screenshot.subheadlineY + dy),
      };
    case "image": {
      const { id } = selectedElement;
      if (!id) return null;
      if (!screenshot.overlayImages.some((image) => image.id === id)) return null;

      return {
        overlayImages: screenshot.overlayImages.map((image) =>
          image.id === id
            ? { ...image, x: round(image.x + dx), y: round(image.y + dy) }
            : image,
        ),
      };
    }
    case "device": {
      const { id } = selectedElement;
      if (!id) return null;
      if (!screenshot.devices.some((device) => device.id === id)) return null;

      return {
        devices: screenshot.devices.map((device) =>
          device.id === id
            ? { ...device, x: round(device.x + dx), y: round(device.y + dy) }
            : device,
        ),
      };
    }
    default:
      return null;
  }
};

/**
 * Checks whether a key event is being typed into a field, where the arrow keys
 * belong to the caret rather than to the selected element.
 *
 * @param target - Event target of the key press
 */
export const isTextEntryTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return true;

  // The attribute is checked as well as the property, so a key press inside a
  // rich text editor counts even where the property is unimplemented
  if (target.isContentEditable) return true;

  return target.closest("[contenteditable='true'],[contenteditable='']") !== null;
};
