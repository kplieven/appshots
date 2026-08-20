/**
 * CanvasPreview Constants
 *
 * Style constants and configuration values used across CanvasPreview components.
 */

/**
 * Z-index layers for proper element stacking order
 */
export const Z_INDEX = {
  /** Overlay images behind device */
  behindDevice: 10,
  /** Device frame */
  device: 50,
  /** Text elements (headline, subheadline) */
  text: 60,
  /** Overlay images in front of device */
  frontDevice: 100,
  /** Alignment guide shown while snapping */
  snapGuide: 200,
} as const;

/**
 * Selection highlight colors (purple theme)
 */
export const SELECTION_COLORS = {
  outline: "rgba(139, 92, 246, 0.8)",
  background: "rgba(139, 92, 246, 0.15)",
  shadow: "rgba(139, 92, 246, 0.4)",
  imageOutline: "rgba(255, 255, 255, 0.8)",
} as const;

/**
 * Colour of the alignment guide shown while a text element snaps
 */
export const SNAP_GUIDE_COLOR = "rgba(139, 92, 246, 0.9)";

/**
 * dataTransfer type carrying the id of a screenshot dragged to a new position
 */
export const SCREENSHOT_DRAG_TYPE = "application/x-appshots-screenshot";
