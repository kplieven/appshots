/**
 * AppearanceSection Component
 *
 * Visual appearance controls including background, text colors, font, and screenshot image.
 */

import { ChevronDown } from "lucide-react";
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
    </div>
  </SidebarSection>
);
