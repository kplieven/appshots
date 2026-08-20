/**
 * ScreenshotCard Component
 *
 * Individual screenshot preview card with all interactive elements.
 */

import { useState, type RefObject } from "react";
import type { Screenshot, ExportSize, SelectedElement } from "../../types";
import type { RenderableDevice } from "../../lib/device-overflow";
import { RemoveButton } from "./RemoveButton";
import { OverlayImage } from "./OverlayImage";
import { TextElement } from "./TextElement";
import { DeviceContainer } from "./DeviceContainer";
import { SnapGuide } from "./SnapGuide";
import { ReorderControls } from "./ReorderControls";
import { isElementSelected } from "./utils";
import {
  SCREENSHOT_DRAG_TYPE,
  SELECTION_COLORS,
  Z_INDEX,
} from "./constants";

interface ScreenshotCardProps {
  /** Screenshot data */
  screenshot: Screenshot;
  /** Devices visible in this screenshot, including overflow from neighbors */
  renderableDevices: RenderableDevice[];
  /** Whether this screenshot is currently active */
  isActive: boolean;
  /** Whether this screenshot can be removed */
  canRemove: boolean;
  /** Position of this screenshot in the set */
  index: number;
  /** Total number of screenshots */
  screenshotCount: number;
  /** Currently selected element */
  selectedElement: SelectedElement | null;
  /** Height of the alignment guide to draw, in percent, or null when not snapping */
  snapGuideY: number | null;
  /** Export size for aspect ratio */
  exportSize: ExportSize;
  /** Headline font size in pixels */
  headlineFontSize: number;
  /** Subheadline font size in pixels */
  subheadlineFontSize: number;
  /** Ref for preview element (only attached to active screenshot) */
  previewRef: RefObject<HTMLDivElement | null>;
  /** Background style getter */
  getBackgroundStyle: (screenshot: Screenshot) => string;
  /** Handler for selecting this screenshot */
  onSelect: () => void;
  /** Handler for removing this screenshot */
  onRemove: () => void;
  /** Handler for moving this screenshot to another position */
  onMove: (targetIndex: number) => void;
  /** Handler for another screenshot being dropped on this position */
  onDropAt: (draggedScreenshotId: string) => void;
  /** Handler for deselecting elements */
  onDeselect: () => void;
  /** Handler for element mouse down */
  onElementMouseDown: (
    e: React.MouseEvent,
    type: "headline" | "subheadline" | "image" | "device",
    screenshotId: string,
    id?: string,
  ) => void;
  /** Handler for element mouse up */
  onElementMouseUp: () => void;
}

/**
 * ScreenshotCard - Complete screenshot preview with all elements
 *
 * Renders a screenshot canvas with device frame, text elements,
 * and overlay images. Handles selection and drag interactions.
 *
 * @param props - Component props
 */
export const ScreenshotCard = ({
  screenshot,
  renderableDevices,
  isActive,
  canRemove,
  index,
  screenshotCount,
  selectedElement,
  snapGuideY,
  exportSize,
  headlineFontSize,
  subheadlineFontSize,
  previewRef,
  getBackgroundStyle,
  onSelect,
  onRemove,
  onMove,
  onDropAt,
  onDeselect,
  onElementMouseDown,
  onElementMouseUp,
}: ScreenshotCardProps) => {
  /** Whether a dragged screenshot is hovering over this card */
  const [isDropTarget, setIsDropTarget] = useState(false);
  /** Whether this card is the one being dragged */
  const [isReordering, setIsReordering] = useState(false);

  // Split overlay images by layer
  const behindImages = screenshot.overlayImages.filter(
    (img) => img.layer === "behind",
  );
  const frontImages = screenshot.overlayImages.filter(
    (img) => img.layer !== "behind",
  );

  const isScreenshotDrag = (e: React.DragEvent) =>
    e.dataTransfer.types.includes(SCREENSHOT_DRAG_TYPE);

  const handleReorderDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData(SCREENSHOT_DRAG_TYPE, screenshot.id);
    e.dataTransfer.effectAllowed = "move";
    setIsReordering(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isScreenshotDrag(e)) return;
    // Marks this card as a valid drop target
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDropTarget(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isScreenshotDrag(e)) return;
    e.preventDefault();
    setIsDropTarget(false);

    const draggedId = e.dataTransfer.getData(SCREENSHOT_DRAG_TYPE);
    if (draggedId && draggedId !== screenshot.id) onDropAt(draggedId);
  };

  // A dragged card fades out; the others keep the usual active/inactive look
  const opacityClass = isReordering
    ? "opacity-40"
    : isActive
      ? "opacity-100"
      : "opacity-70 hover:opacity-100";

  // Handle background click to deselect
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (isActive && !target.closest("[data-draggable-element]")) {
      onDeselect();
    }
  };

  return (
    <div
      ref={isActive ? previewRef : undefined}
      data-screenshot-card="true"
      data-screenshot-id={screenshot.id}
      onClick={onSelect}
      onMouseUp={onElementMouseUp}
      onMouseDown={handleBackgroundMouseDown}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDropTarget(false)}
      onDrop={handleDrop}
      className={`relative h-full rounded-xl overflow-hidden cursor-pointer transition-all ${opacityClass}`}
      style={{
        background: getBackgroundStyle(screenshot),
        aspectRatio: `${exportSize.width}/${exportSize.height}`,
        boxShadow: isDropTarget
          ? `inset 0 0 0 3px ${SELECTION_COLORS.outline}`
          : isActive
            ? "inset 0 0 0 2px rgba(255, 255, 255, 0.95)"
            : undefined,
      }}
    >
      {/* Noise overlay */}
      {(screenshot.backgroundNoise ?? 0) > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            opacity: screenshot.backgroundNoise / 100,
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Reorder controls */}
      {screenshotCount > 1 && (
        <ReorderControls
          index={index}
          screenshotCount={screenshotCount}
          onMove={onMove}
          onDragStart={handleReorderDragStart}
          onDragEnd={() => setIsReordering(false)}
        />
      )}

      {/* Remove button */}
      {canRemove && <RemoveButton onRemove={onRemove} />}

      {/* Alignment guide shown while a text element snaps */}
      {snapGuideY !== null && <SnapGuide y={snapGuideY} />}

      {/* Content layer */}
      <div className="absolute inset-0 select-none">
        {/* Overlay images behind device */}
        {behindImages.map((image, index) => (
          <OverlayImage
            key={image.id}
            image={image}
            zIndex={Z_INDEX.behindDevice + index}
            isSelected={isElementSelected(
              isActive ? selectedElement : null,
              "image",
              screenshot.id,
              image.id,
            )}
            isInteractive={isActive}
            onMouseDown={(e) =>
              onElementMouseDown(e, "image", screenshot.id, image.id)
            }
          />
        ))}

        {/* Headline */}
        <TextElement
          type="headline"
          content={screenshot.headline}
          x={screenshot.headlineX}
          y={screenshot.headlineY}
          width={screenshot.headlineWidth}
          fontSize={headlineFontSize / 3}
          color={screenshot.headlineColor}
          fontFamily={screenshot.fontFamily}
          isSelected={
            isActive &&
            isElementSelected(selectedElement, "headline", screenshot.id)
          }
          isInteractive={isActive}
          onMouseDown={(e) => onElementMouseDown(e, "headline", screenshot.id)}
        />

        {/* Subheadline */}
        <TextElement
          type="subheadline"
          content={screenshot.subheadline}
          x={screenshot.subheadlineX}
          y={screenshot.subheadlineY}
          width={screenshot.subheadlineWidth}
          fontSize={subheadlineFontSize / 3}
          color={screenshot.subheadlineColor}
          fontFamily={screenshot.fontFamily}
          isSelected={
            isActive &&
            isElementSelected(selectedElement, "subheadline", screenshot.id)
          }
          isInteractive={isActive}
          onMouseDown={(e) =>
            onElementMouseDown(e, "subheadline", screenshot.id)
          }
        />

        {/* Devices, including visible overflow from neighboring screenshots */}
        {renderableDevices.map(({ device, localX, ownerScreenshotId }, index) => (
          <DeviceContainer
            key={`${ownerScreenshotId}-${device.id}`}
            device={device}
            renderX={localX}
            zIndex={Z_INDEX.device + index}
            isSelected={isElementSelected(
              selectedElement,
              "device",
              ownerScreenshotId,
              device.id,
            )}
            isInteractive
            onMouseDown={(e) =>
              onElementMouseDown(e, "device", ownerScreenshotId, device.id)
            }
          />
        ))}

        {/* Overlay images in front of device */}
        {frontImages.map((image, index) => (
          <OverlayImage
            key={image.id}
            image={image}
            zIndex={Z_INDEX.frontDevice + index}
            isSelected={isElementSelected(
              isActive ? selectedElement : null,
              "image",
              screenshot.id,
              image.id,
            )}
            isInteractive={isActive}
            onMouseDown={(e) =>
              onElementMouseDown(e, "image", screenshot.id, image.id)
            }
          />
        ))}
      </div>
    </div>
  );
};
