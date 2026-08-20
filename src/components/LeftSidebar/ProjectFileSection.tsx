/**
 * ProjectFileSection Component
 *
 * Import and export of projects as JSON files, for backups or for moving
 * work between browsers.
 */

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { SidebarSection } from "./SidebarSection";
import { STYLES } from "./constants";

interface ProjectFileSectionProps {
  /** Name of the project that "Download Project" will export */
  activeProjectName: string;
  /** Total number of projects, used to offer the "download all" option */
  projectCount: number;
  /** Handler for downloading the active project */
  onExportProject: () => void;
  /** Handler for downloading every project */
  onExportAll: () => void;
  /** Handler for importing a file, resolving with the number of projects imported */
  onImport: (file: File) => Promise<number>;
}

/**
 * ProjectFileSection - Project JSON import/export controls
 *
 * Downloads the current project (or all projects) as JSON, and uploads a
 * previously exported file. Imports are added as new projects, so an upload
 * never overwrites existing work.
 *
 * @param props - Component props
 *
 * @example
 * <ProjectFileSection
 *   activeProjectName={activeProject.name}
 *   projectCount={projects.length}
 *   onExportProject={exportActiveProject}
 *   onExportAll={exportAllProjects}
 *   onImport={importProjectsFromFile}
 * />
 */
export const ProjectFileSection = ({
  activeProjectName,
  projectCount,
  onExportProject,
  onExportAll,
  onImport,
}: ProjectFileSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    // Allow re-importing the same file back to back.
    event.target.value = "";
    if (!file) return;

    setIsImporting(true);
    setError(null);
    setStatus(null);

    try {
      const count = await onImport(file);
      setStatus(
        count === 1 ? "Imported 1 project" : `Imported ${count} projects`,
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "That file couldn't be imported.",
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <SidebarSection title="Import / Export">
      <div className="space-y-2">
        <button
          onClick={onExportProject}
          className={STYLES.secondaryButton}
          title={`Download "${activeProjectName}" as JSON`}
        >
          <Download className="w-4 h-4" />
          Download Project
        </button>

        {projectCount > 1 && (
          <button onClick={onExportAll} className={STYLES.secondaryButton}>
            <Download className="w-4 h-4" />
            Download All ({projectCount})
          </button>
        )}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={isImporting}
          className={STYLES.secondaryButton}
        >
          <Upload className="w-4 h-4" />
          {isImporting ? "Importing…" : "Import JSON"}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error ? (
        <p className={STYLES.errorText} role="alert">
          {error}
        </p>
      ) : status ? (
        <p className={STYLES.successText}>{status}</p>
      ) : (
        <p className={STYLES.helpText}>
          Imported files are added as new projects.
        </p>
      )}
    </SidebarSection>
  );
};
