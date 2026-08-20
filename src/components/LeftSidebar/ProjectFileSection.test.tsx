/** @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EditorProvider, useEditor } from "../../context/EditorContext";
import { ProjectFileSection } from "./ProjectFileSection";

/**
 * Renders the import/export controls wired to the real editor, plus a readout
 * of the resulting project list so imports can be asserted end to end.
 */
const Harness = () => {
  const {
    projects,
    activeProject,
    exportActiveProject,
    exportAllProjects,
    importProjectsFromFile,
    renameProject,
    activeProjectId,
  } = useEditor();

  return (
    <>
      <button onClick={() => renameProject(activeProjectId, "Renamed")}>
        rename
      </button>
      <p data-testid="active">{activeProject.name}</p>
      <ul data-testid="projects">
        {projects.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      <ProjectFileSection
        activeProjectName={activeProject.name}
        projectCount={projects.length}
        onExportProject={exportActiveProject}
        onExportAll={exportAllProjects}
        onImport={importProjectsFromFile}
      />
    </>
  );
};

/** Captures the JSON text passed to the most recent download */
let downloaded: string | null = null;

beforeEach(() => {
  localStorage.clear();
  downloaded = null;

  // jsdom implements neither object URLs nor anchor-triggered downloads.
  vi.stubGlobal("URL", Object.assign(URL, {
    createObjectURL: () => "blob:mock",
    revokeObjectURL: () => {},
  }));
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

  const RealBlob = globalThis.Blob;
  vi.stubGlobal(
    "Blob",
    class extends RealBlob {
      constructor(parts: BlobPart[], options?: BlobPropertyBag) {
        super(parts, options);
        if (options?.type === "application/json") {
          downloaded = String(parts[0]);
        }
      }
    },
  );
});

afterEach(() => {
  // Vitest runs without `globals`, so RTL's automatic cleanup is not installed.
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const uploadFile = (contents: string) => {
  const input = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (!input) throw new Error("file input not found");
  const file = new File([contents], "project.json", {
    type: "application/json",
  });
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
};

describe("ProjectFileSection", () => {
  it("downloads the active project and imports it back as a new project", async () => {
    render(
      <EditorProvider>
        <Harness />
      </EditorProvider>,
    );

    fireEvent.click(screen.getByText("rename"));
    await waitFor(() =>
      expect(screen.getByTestId("active").textContent).toBe("Renamed"),
    );

    fireEvent.click(screen.getByRole("button", { name: /download project/i }));

    expect(downloaded).toBeTruthy();
    const parsed = JSON.parse(downloaded as string);
    expect(parsed.format).toBe("appshots-project");
    expect(parsed.projects).toHaveLength(1);
    expect(parsed.projects[0].screenshots.length).toBeGreaterThan(0);

    uploadFile(downloaded as string);

    await screen.findByText(/imported 1 project/i);

    const names = Array.from(
      screen.getByTestId("projects").querySelectorAll("li"),
    ).map((li) => li.textContent);

    // The import is added alongside the original, with a de-duplicated name.
    expect(names).toHaveLength(2);
    expect(names).toEqual(["Renamed", "Renamed (2)"]);
    // ...and the editor switches to it.
    expect(screen.getByTestId("active").textContent).toBe("Renamed (2)");
  });

  it("surfaces a readable error for a file that is not a project", async () => {
    render(
      <EditorProvider>
        <Harness />
      </EditorProvider>,
    );

    uploadFile("not json at all");

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/isn't valid JSON/i);
    expect(
      screen.getByTestId("projects").querySelectorAll("li"),
    ).toHaveLength(1);
  });
});
