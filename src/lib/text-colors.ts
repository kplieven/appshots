/**
 * Text colour resolution.
 *
 * Headline and subheadline carry their own colours. Screenshots saved before
 * that split only have a single `textColor`, which seeds both so existing work
 * keeps rendering the way it was designed.
 */

/** Colour used when a screenshot carries no text colour at all */
export const DEFAULT_SCREENSHOT_TEXT_COLOR = "#ffffff";

interface TextColorSource {
  headlineColor?: string;
  subheadlineColor?: string;
  /** Legacy single colour, applied to both texts */
  textColor?: string;
}

/**
 * Resolves the headline and subheadline colours of a stored screenshot.
 *
 * @param screenshot - Screenshot data from localStorage or an imported file
 * @param fallback - Colour to use when neither the new nor the legacy field is set
 * @returns Both text colours
 */
export const resolveTextColors = (
  screenshot: TextColorSource,
  fallback: string = DEFAULT_SCREENSHOT_TEXT_COLOR,
): { headlineColor: string; subheadlineColor: string } => ({
  headlineColor: screenshot.headlineColor ?? screenshot.textColor ?? fallback,
  subheadlineColor:
    screenshot.subheadlineColor ?? screenshot.textColor ?? fallback,
});
