import { describe, expect, it } from "vitest";
import {
  PROJECT_FILE_FORMAT,
  PROJECT_FILE_VERSION,
  ProjectImportError,
  buildProjectFile,
  parseProjectFile,
  projectFileName,
  serializeProjects,
  uniqueProjectName,
} from "./project-io";
import type { Project } from "../types";

let idCounter = 0;
const makeId = () => `id-${++idCounter}`;

const makeProject = (overrides: Partial<Project> = {}): Project =>
  ({
    id: "original-id",
    name: "My Project",
    createdAt: 1000,
    updatedAt: 2000,
    screenshots: [{ id: "screenshot-1", headline: "Hello" }],
    selectedDeviceId: "iphone-15-pro",
    selectedColorId: "black",
    exportSizeId: "6.7",
    activeScreenshotId: "screenshot-1",
    headlineFontSize: 72,
    subheadlineFontSize: 42,
    ...overrides,
  }) as Project;

describe("buildProjectFile", () => {
  it("wraps projects with a format marker and version", () => {
    const file = buildProjectFile([makeProject()]);

    expect(file.format).toBe(PROJECT_FILE_FORMAT);
    expect(file.version).toBe(PROJECT_FILE_VERSION);
    expect(file.projects).toHaveLength(1);
  });
});

describe("parseProjectFile", () => {
  it("round-trips exported projects", () => {
    const project = makeProject();
    const imported = parseProjectFile(serializeProjects([project]), makeId);

    expect(imported).toHaveLength(1);
    expect(imported[0].name).toBe("My Project");
    expect(imported[0].screenshots).toEqual(project.screenshots);
    expect(imported[0].selectedDeviceId).toBe("iphone-15-pro");
    expect(imported[0].createdAt).toBe(1000);
  });

  it("assigns fresh project ids so imports never overwrite existing work", () => {
    const project = makeProject();
    const imported = parseProjectFile(serializeProjects([project]), makeId);

    expect(imported[0].id).not.toBe(project.id);
  });

  it("keeps existing screenshot ids and fills in missing ones", () => {
    const json = JSON.stringify({
      format: PROJECT_FILE_FORMAT,
      version: PROJECT_FILE_VERSION,
      projects: [
        makeProject({
          screenshots: [{ id: "keep-me" }, {}] as Project["screenshots"],
        }),
      ],
    });

    const [imported] = parseProjectFile(json, makeId);

    expect(imported.screenshots[0].id).toBe("keep-me");
    expect(imported.screenshots[1].id).toBeTruthy();
  });

  it("accepts a bare project object", () => {
    const imported = parseProjectFile(JSON.stringify(makeProject()), makeId);

    expect(imported).toHaveLength(1);
    expect(imported[0].name).toBe("My Project");
  });

  it("accepts a bare array of projects", () => {
    const imported = parseProjectFile(
      JSON.stringify([makeProject(), makeProject({ name: "Second" })]),
      makeId,
    );

    expect(imported.map((p) => p.name)).toEqual(["My Project", "Second"]);
  });

  it("names projects that carry none", () => {
    const imported = parseProjectFile(
      JSON.stringify({ projects: [makeProject({ name: "" })] }),
      makeId,
    );

    expect(imported[0].name).toBe("Imported Project");
  });

  it("rejects malformed JSON", () => {
    expect(() => parseProjectFile("{not json", makeId)).toThrow(
      ProjectImportError,
    );
  });

  it("rejects files from another app", () => {
    const json = JSON.stringify({ format: "something-else", projects: [] });

    expect(() => parseProjectFile(json, makeId)).toThrow(/isn't an appshots/);
  });

  it("rejects files from a newer schema version", () => {
    const json = JSON.stringify({
      format: PROJECT_FILE_FORMAT,
      version: PROJECT_FILE_VERSION + 1,
      projects: [makeProject()],
    });

    expect(() => parseProjectFile(json, makeId)).toThrow(/newer version/);
  });

  it("rejects projects without screenshots", () => {
    const json = JSON.stringify({ projects: [makeProject({ screenshots: [] })] });

    expect(() => parseProjectFile(json, makeId)).toThrow(/No projects found/);
  });

  it("rejects unrelated JSON documents", () => {
    expect(() => parseProjectFile(JSON.stringify({ hello: 1 }), makeId)).toThrow(
      /No projects found/,
    );
  });
});

describe("uniqueProjectName", () => {
  it("keeps a name that is not taken", () => {
    expect(uniqueProjectName("Alpha", ["Beta"])).toBe("Alpha");
  });

  it("suffixes a name that collides", () => {
    expect(uniqueProjectName("Alpha", ["Alpha"])).toBe("Alpha (2)");
    expect(uniqueProjectName("Alpha", ["Alpha", "Alpha (2)"])).toBe("Alpha (3)");
  });
});

describe("projectFileName", () => {
  it("slugifies the project name", () => {
    expect(projectFileName(makeProject({ name: "My Cool App!" }))).toBe(
      "my-cool-app.json",
    );
  });

  it("falls back when the name has no usable characters", () => {
    expect(projectFileName(makeProject({ name: "***" }))).toBe("project.json");
  });
});
