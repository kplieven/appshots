/**
 * Horizontal centering helpers.
 *
 * Every draggable element (text, overlay image, device) is positioned by its own
 * center on the horizontal axis, so centering an element only means putting its
 * x position at the middle of the screenshot.
 */

import type { Screenshot, SelectedElement } from "../types";

/** Horizontal center of a screenshot, in percent of its width. */
export const CENTER_X_PERCENT = 50;

/**
 * Computes the screenshot updates that horizontally center the selected element.
 *
 * @param screenshot - Screenshot owning the selected element
 * @param selectedElement - Currently selected element, if any
 * @returns Partial screenshot updates, or null when there is nothing to center
 */
export const getHorizontalCenterUpdates = (
  screenshot: Screenshot,
  selectedElement: SelectedElement | null,
): Partial<Screenshot> | null => {
  if (!selectedElement) return null;

  switch (selectedElement.type) {
    case "headline":
      return { headlineX: CENTER_X_PERCENT };
    case "subheadline":
      return { subheadlineX: CENTER_X_PERCENT };
    case "image": {
      const { id } = selectedElement;
      if (!id) return null;
      if (!screenshot.overlayImages.some((image) => image.id === id)) return null;

      return {
        overlayImages: screenshot.overlayImages.map((image) =>
          image.id === id ? { ...image, x: CENTER_X_PERCENT } : image,
        ),
      };
    }
    case "device": {
      const { id } = selectedElement;
      if (!id) return null;
      if (!screenshot.devices.some((device) => device.id === id)) return null;

      return {
        devices: screenshot.devices.map((device) =>
          device.id === id ? { ...device, x: CENTER_X_PERCENT } : device,
        ),
      };
    }
    default:
      return null;
  }
};
