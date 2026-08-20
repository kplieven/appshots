/**
 * ReorderControls Component
 *
 * Controls for moving a screenshot within the set: arrow buttons for a single
 * step, and a grip that drags the card onto another position.
 */

import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";

interface ReorderControlsProps {
  /** Position of the screenshot in the set */
  index: number;
  /** Total number of screenshots */
  screenshotCount: number;
  /** Move the screenshot to another position */
  onMove: (targetIndex: number) => void;
  /** Start dragging the screenshot to another position */
  onDragStart: (e: React.DragEvent) => void;
  /** Finish dragging, whether or not the card was dropped somewhere */
  onDragEnd: () => void;
}

const BUTTON_CLASS =
  "w-6 h-6 bg-black/50 hover:bg-black/70 disabled:opacity-30 disabled:hover:bg-black/50 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white";

/**
 * ReorderControls - Move a screenshot left or right
 *
 * Sits in the top-left corner of a screenshot card, mirroring the remove
 * button. Only rendered when there is more than one screenshot.
 *
 * @param props - Component props
 */
export const ReorderControls = ({
  index,
  screenshotCount,
  onMove,
  onDragStart,
  onDragEnd,
}: ReorderControlsProps) => (
  <div className="absolute top-2 left-2 flex items-center gap-1 z-10">
    <button
      onClick={(e) => {
        e.stopPropagation();
        onMove(index - 1);
      }}
      disabled={index === 0}
      title="Move screenshot left"
      aria-label="Move screenshot left"
      className={BUTTON_CLASS}
    >
      <ChevronLeft className="w-3 h-3" />
    </button>

    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(e) => e.stopPropagation()}
      title="Drag to reorder"
      aria-label="Drag to reorder screenshot"
      className="w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white cursor-grab active:cursor-grabbing"
    >
      <GripVertical className="w-3 h-3" />
    </div>

    <button
      onClick={(e) => {
        e.stopPropagation();
        onMove(index + 1);
      }}
      disabled={index === screenshotCount - 1}
      title="Move screenshot right"
      aria-label="Move screenshot right"
      className={BUTTON_CLASS}
    >
      <ChevronRight className="w-3 h-3" />
    </button>
  </div>
);
