/**
 * SnapGuide Component
 *
 * Horizontal alignment guide shown while a text element snaps to the text
 * boxes of the other screenshots. Rendered in every screenshot card at the
 * same relative height so the alignment across the set is visible.
 */

import { SNAP_GUIDE_COLOR, Z_INDEX } from "./constants";

interface SnapGuideProps {
  /** Vertical position of the guide, in percent of the screenshot height */
  y: number;
}

/**
 * SnapGuide - Dashed line marking the height an element is snapped to
 *
 * @param props - Component props
 */
export const SnapGuide = ({ y }: SnapGuideProps) => (
  <div
    data-snap-guide="true"
    className="absolute left-0 right-0 pointer-events-none"
    style={{
      top: `${y}%`,
      height: 0,
      borderTop: `1px dashed ${SNAP_GUIDE_COLOR}`,
      zIndex: Z_INDEX.snapGuide,
    }}
  />
);
