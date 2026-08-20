/**
 * AppearanceSection Component
 *
 * Visual appearance controls including background, text colors, font, and screenshot image.
 */

import { ChevronDown, Copy } from "lucide-react";
import type { Screenshot, GradientPreset } from "../../types";
import { SidebarSection } from "./SidebarSection";
import { BackgroundPicker } from "./BackgroundPicker";
import { HexColorInput } from "./HexColorInput";
import { STYLES } from "./constants";

interface AppearanceSectionProps {
  /** Active screenshot data */
  screenshot: Screenshot;
  /** Available gradient presets */
  gradientPresets: GradientPreset[];
  /** Update screenshot handler */
  onUpdateScreenshot: (updates: Partial<Screenshot>) => void;
  /** Open font picker handler */
  onOpenFontPicker: () => void;
  /** Whether there is another screenshot to copy this appearance to */
  canCopyToAll: boolean;
  /** Copy this appearance to every other screenshot */
  onCopyToAll: () => void;
}

/**
 * AppearanceSection - Visual appearance controls
 *
 * Background, headline and subheadline colors, font, and screenshot image settings.
 *
 * @param props - Component props
 */
export const AppearanceSection = ({
  screenshot,
  gradientPresets,
  onUpdateScreenshot,
  onOpenFontPicker,
  canCopyToAll,
  onCopyToAll,
}: AppearanceSectionProps) => (
  <SidebarSection title="Appearance">
    <div className="space-y-4">
      {/* Background */}
      <BackgroundPicker
        screenshot={screenshot}
        gradientPresets={gradientPresets}
        onUpdateScreenshot={onUpdateScreenshot}
      />

      {/* Headline Color */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Headline Color
        </label>
        <HexColorInput
          value={screenshot.headlineColor}
          onChange={(color) => onUpdateScreenshot({ headlineColor: color })}
        />
      </div>

      {/* Subheadline Color */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">
          Subheadline Color
        </label>
        <HexColorInput
          value={screenshot.subheadlineColor}
          onChange={(color) => onUpdateScreenshot({ subheadlineColor: color })}
        />
      </div>

      {/* Font Style */}
      <div>
        <label className="block text-xs text-gray-400 mb-1">Font Style</label>
        <button onClick={onOpenFontPicker} className={STYLES.dropdownButton}>
          <span style={{ fontFamily: `'${screenshot.fontFamily}', sans-serif` }}>
            {screenshot.fontFamily}
          </span>
          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Share this appearance with the rest of the set */}
      <button
        onClick={onCopyToAll}
        disabled={!canCopyToAll}
        title="Copy background, text colors and font to every other screenshot"
        className="w-full flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-white/10 disabled:cursor-not-allowed text-white text-xs font-medium px-3 py-2 rounded-md transition-colors"
      >
        <Copy size={14} />
        Copy to all other screenshots
      </button>
    </div>
  </SidebarSection>
);
