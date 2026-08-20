/**
 * Toolbar Component
 *
 * Top toolbar for the canvas preview area with screenshot management controls.
 */

import { AlignCenterVertical, Plus } from "lucide-react";

interface ToolbarProps {
  /** Callback to add a new screenshot */
  onAddScreenshot: () => void;
  /** Total number of screenshots */
  screenshotCount: number;
  /** Whether the selected element can be centered */
  canCenterSelectedElement: boolean;
  /** Callback to horizontally center the selected element */
  onCenterSelectedElement: () => void;
}

/**
 * Toolbar - Canvas top toolbar with controls
 *
 * Displays the "Add Screenshot" button and screenshot count.
 *
 * @param props - Component props
 * @param props.onAddScreenshot - Handler for adding new screenshot
 * @param props.screenshotCount - Current number of screenshots
 * @param props.canCenterSelectedElement - Whether an element is selected and centerable
 * @param props.onCenterSelectedElement - Handler for centering the selected element
 *
 * @example
 * <Toolbar
 *   onAddScreenshot={addScreenshot}
 *   screenshotCount={3}
 *   canCenterSelectedElement={true}
 *   onCenterSelectedElement={centerSelectedElementHorizontally}
 * />
 */
export const Toolbar = ({
  onAddScreenshot,
  screenshotCount,
  canCenterSelectedElement,
  onCenterSelectedElement,
}: ToolbarProps) => (
  <div className="h-14 border-b border-white/10 bg-[#141414] flex items-center px-4 gap-4">
    <div className="flex items-center gap-2">
      <button
        onClick={onAddScreenshot}
        className="flex items-center gap-1.5 bg-white hover:bg-neutral-200 text-black text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Screenshot
      </button>

      <button
        onClick={onCenterSelectedElement}
        disabled={!canCenterSelectedElement}
        title="Center selected element horizontally"
        aria-label="Center selected element horizontally"
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 disabled:cursor-not-allowed text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
      >
        <AlignCenterVertical className="w-4 h-4" />
        Center
      </button>
    </div>
    <div className="flex-1" />
    <span className="text-xs text-gray-400">
      {screenshotCount} screenshot{screenshotCount !== 1 ? "s" : ""}
    </span>
  </div>
);
