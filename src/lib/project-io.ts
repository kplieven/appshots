/**
 * Project Import / Export
 *
 * Serializes projects to a portable JSON document that can be downloaded and
 * later uploaded again — for backups, or for moving work between browsers.
 *
 * The document embeds a format marker and a version so future schema changes
 * can be detected (and rejected) instead of silently corrupting the editor.
 */

import type { Project, Screenshot } from "../types";

/** Marker identifying a file as an appshots project export */
export const PROJECT_FILE_FORMAT = "appshots-project";

/** Current project file schema version */
export const PROJECT_FILE_VERSION = 1;

/** Shape of an exported `.json` project file */
export interface ProjectFile {
  /** Format marker, always {@link PROJECT_FILE_FORMAT} */
  format: typeof PROJECT_FILE_FORMAT;
  /** Schema version, see {@link PROJECT_FILE_VERSION} */
  version: number;
  /** Export timestamp (ms since epoch) */
  exportedAt: number;
  /** Exported projects */
  projects: Project[];
}

/**
 * Error thrown when a file cannot be read as a project export.
 *
 * The message is written for end users — components can surface it directly.
 */
export class ProjectImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectImportError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Checks whether a value is usable as a project.
 *
 * Only the invariants the editor relies on are enforced here; missing optional
 * fields are filled in by {@link coerceProject} and by the editor's own
 * normalization step.
 */
const looksLikeProject = (value: unknown): value is Partial<Project> => {
  if (!isRecord(value)) return false;
  const screenshots = value.screenshots;
  if (!Array.isArray(screenshots) || screenshots.length === 0) return false;
  return screenshots.every((screenshot) => isRecord(screenshot));
};

/**
 * Fills in missing project metadata so imported data is safe to render.
 *
 * @param value - A project-shaped value from a parsed file
 * @param makeId - Id factory, used for the project and any screenshot missing one
 * @param fallbackName - Name used when the file carries none
 */
const coerceProject = (
  value: Partial<Project>,
  makeId: () => string,
  fallbackName: string,
): Project => {
  const now = Date.now();
  const screenshots = (value.screenshots ?? []).map(
    (screenshot) =>
      ({
        ...screenshot,
        id: typeof screenshot.id === "string" ? screenshot.id : makeId(),
      }) as Screenshot,
  );

  return {
    ...(value as Project),
    id: makeId(),
    name:
      typeof value.name === "string" && value.name.trim()
        ? value.name.trim()
        : fallbackName,
    createdAt: typeof value.createdAt === "number" ? value.createdAt : now,
    updatedAt: now,
    screenshots,
  };
};

/**
 * Wraps projects in the exportable file envelope.
 *
 * @param projects - Projects to export
 * @returns The document that gets written to disk
 */
export const buildProjectFile = (projects: Project[]): ProjectFile => ({
  format: PROJECT_FILE_FORMAT,
  version: PROJECT_FILE_VERSION,
  exportedAt: Date.now(),
  projects,
});

/**
 * Serializes projects to pretty-printed JSON.
 *
 * @param projects - Projects to export
 * @returns JSON text ready to download
 */
export const serializeProjects = (projects: Project[]): string =>
  JSON.stringify(buildProjectFile(projects), null, 2);

/**
 * Parses the text content of an uploaded project file.
 *
 * Accepts the canonical envelope, a bare project object, or an array of
 * projects, so hand-edited or older exports still import cleanly. Every
 * imported project receives a fresh id, meaning an import always adds projects
 * and never overwrites existing work.
 *
 * @param text - Raw file contents
 * @param makeId - Id factory for the imported projects
 * @returns The imported projects
 * @throws {ProjectImportError} When the file is not valid project JSON
 *
 * @example
 * const projects = parseProjectFile(await file.text(), generateId);
 */
export const parseProjectFile = (
  text: string,
  makeId: () => string,
): Project[] => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new ProjectImportError("That file isn't valid JSON.");
  }

  let candidates: unknown[];

  if (Array.isArray(parsed)) {
    candidates = parsed;
  } else if (isRecord(parsed) && Array.isArray(parsed.projects)) {
    if (
      typeof parsed.format === "string" &&
      parsed.format !== PROJECT_FILE_FORMAT
    ) {
      throw new ProjectImportError("That file isn't an appshots project.");
    }
    if (
      typeof parsed.version === "number" &&
      parsed.version > PROJECT_FILE_VERSION
    ) {
      throw new ProjectImportError(
        "That project file was created by a newer version of appshots.",
      );
    }
    candidates = parsed.projects;
  } else {
    candidates = [parsed];
  }

  const projects = candidates.filter(looksLikeProject);

  if (projects.length === 0) {
    throw new ProjectImportError(
      "No projects found in that file — it may be empty or from another app.",
    );
  }

  return projects.map((project, index) =>
    coerceProject(
      project,
      makeId,
      projects.length > 1 ? `Imported Project ${index + 1}` : "Imported Project",
    ),
  );
};

/**
 * Makes an imported project name unique against the names already in use.
 *
 * @param name - Desired project name
 * @param existingNames - Names already taken
 * @returns `name`, or `name (2)`, `name (3)`, ... when it collides
 */
export const uniqueProjectName = (
  name: string,
  existingNames: string[],
): string => {
  const taken = new Set(existingNames);
  if (!taken.has(name)) return name;

  let suffix = 2;
  while (taken.has(`${name} (${suffix})`)) suffix += 1;
  return `${name} (${suffix})`;
};

/**
 * Builds a filesystem-friendly filename for a project export.
 *
 * @param project - Project being exported
 * @returns A slugified `.json` filename
 */
export const projectFileName = (project: Project): string => {
  const slug = project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "project"}.json`;
};

/**
 * Triggers a browser download of JSON text.
 *
 * @param filename - Name of the downloaded file
 * @param json - File contents
 */
export const downloadJson = (filename: string, json: string): void => {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Reads an uploaded file as text.
 *
 * @param file - File from a file input
 * @returns The file contents
 * @throws {ProjectImportError} When the file cannot be read
 */
export const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(new ProjectImportError("That file couldn't be read."));
    reader.readAsText(file);
  });
