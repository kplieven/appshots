/**
 * Alignment snapping helpers.
 *
 * While a text element is dragged vertically, its center snaps to the centers of
 * the text boxes in the other screenshots so headlines and subheadlines line up
 * across the whole set.
 */

/** Snap radius, in percent of the screenshot height. */
export const TEXT_SNAP_THRESHOLD_PERCENT = 1.5;

/**
 * Finds the closest snap target for a dragged element's vertical center.
 *
 * @param centerY - Vertical center of the dragged element, in percent of the screenshot height
 * @param targets - Candidate centers, in percent of the screenshot height
 * @param threshold - Maximum distance at which a target attracts the element
 * @returns The target center to snap to, or null when none is close enough
 */
export const findSnapCenterY = (
  centerY: number,
  targets: number[],
  threshold: number = TEXT_SNAP_THRESHOLD_PERCENT,
): number | null => {
  let closest: number | null = null;
  let closestDistance = threshold;

  for (const target of targets) {
    const distance = Math.abs(target - centerY);
    if (distance <= closestDistance) {
      closest = target;
      closestDistance = distance;
    }
  }

  return closest;
};

/**
 * Measures the vertical centers of the text boxes rendered in every screenshot
 * other than the one being dragged in.
 *
 * Centers are relative to their own screenshot card, so they stay comparable
 * even though the cards are laid out side by side.
 *
 * @param excludedScreenshotId - Screenshot whose own text boxes are not snap targets
 * @returns Vertical centers, in percent of the screenshot height
 */
export const collectTextCenterYTargets = (
  excludedScreenshotId: string,
): number[] => {
  if (typeof document === "undefined") return [];

  const targets: number[] = [];

  for (const card of document.querySelectorAll<HTMLElement>(
    "[data-screenshot-card='true']",
  )) {
    if (card.dataset.screenshotId === excludedScreenshotId) continue;

    const cardRect = card.getBoundingClientRect();
    if (cardRect.height === 0) continue;

    for (const text of card.querySelectorAll<HTMLElement>(
      "[data-draggable-element='headline'],[data-draggable-element='subheadline']",
    )) {
      const rect = text.getBoundingClientRect();
      const centerY =
        ((rect.top - cardRect.top + rect.height / 2) / cardRect.height) * 100;
      targets.push(centerY);
    }
  }

  return targets;
};
