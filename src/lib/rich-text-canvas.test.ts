/** @vitest-environment jsdom */

import { describe, expect, it } from "vitest";
import { parseRichText, renderRichText } from "./rich-text-canvas";
import {
  RICH_TEXT_HIGHLIGHT_HEIGHT_EM,
  RICH_TEXT_HIGHLIGHT_RADIUS_EM,
  RICH_TEXT_HIGHLIGHT_SPREAD_EM,
  RICH_TEXT_HIGHLIGHT_TOP_OFFSET_EM,
} from "./rich-text-highlight";

describe("parseRichText", () => {
  it("preserves inline background colors", () => {
    const segments = parseRichText(
      '<span style="color: rgb(255, 0, 0); background-color: rgb(255, 255, 0);">Hello</span>',
      "#ffffff",
    );

    expect(segments).toEqual([
      {
        text: "Hello",
        bold: false,
        italic: false,
        underline: false,
        color: "rgb(255, 0, 0)",
        backgroundColor: "rgb(255, 255, 0)",
      },
    ]);
  });

  it("maps mark elements to a default highlight color", () => {
    const [segment] = parseRichText("<mark>Highlighted</mark>", "#ffffff");

    expect(segment.backgroundColor).toBe("yellow");
  });

  const textOf = (html: string) =>
    parseRichText(html, "#ffffff")
      .map((segment) => segment.text)
      .join("");

  it("breaks lines on br elements", () => {
    expect(textOf("First<br>Second")).toBe("First\nSecond");
  });

  it("breaks lines on block elements produced by contenteditable", () => {
    expect(textOf("First<div>Second</div><div>Third</div>")).toBe(
      "First\nSecond\nThird",
    );
    expect(textOf("<div>First</div><div>Second</div>")).toBe("First\nSecond");
    expect(textOf("<p>First</p><p>Second</p>")).toBe("First\nSecond");
  });

  it("keeps blank lines created by empty blocks", () => {
    expect(textOf("First<div><br></div><div>Third</div>")).toBe(
      "First\n\nThird",
    );
  });

  it("ignores the trailing break that closes the last block", () => {
    expect(textOf("<div>Only</div>")).toBe("Only");
    expect(textOf("Only<br>")).toBe("Only");
    expect(textOf("<div>Only<br></div>")).toBe("Only");
  });

  it("breaks on literal newlines in text, matching the pre-wrap preview", () => {
    expect(textOf("First\nSecond")).toBe("First\nSecond");
  });

  it("keeps styling across block boundaries", () => {
    const segments = parseRichText("<div><b>Bold</b></div><div>Plain</div>", "#ffffff");

    expect(segments.map((segment) => [segment.text, segment.bold])).toEqual([
      ["Bold", true],
      ["\n", false],
      ["Plain", false],
    ]);
  });
});

describe("renderRichText", () => {
  it("draws one rounded highlight run before highlighted text", () => {
    const calls: Array<{
      type: "roundRect" | "fill" | "fillText";
      fillStyle?: string;
      args?: number[];
    }> = [];
    const ctx = {
      font: "",
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      textBaseline: "alphabetic",
      measureText: (text: string) => ({ width: text.length * 10 }) as TextMetrics,
      beginPath: () => {},
      roundRect: (...args: number[]) => {
        calls.push({ type: "roundRect", args });
      },
      fill: () => {
        calls.push({ type: "fill", fillStyle: String(ctx.fillStyle) });
      },
      fillText: () => {
        calls.push({ type: "fillText", fillStyle: String(ctx.fillStyle) });
      },
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
    } as unknown as CanvasRenderingContext2D;

    const fontSize = 24;
    const highlightSpread = fontSize * RICH_TEXT_HIGHLIGHT_SPREAD_EM;

    renderRichText(
      ctx,
      [
        {
          text: "Hello world",
          bold: false,
          italic: false,
          underline: false,
          color: "#111111",
          backgroundColor: "#ffff00",
        },
      ],
      {
        x: 100,
        y: 20,
        maxWidth: 200,
        fontSize,
        fontFamily: "Inter",
        defaultColor: "#ffffff",
        lineHeight: 1.1,
        textAlign: "center",
      },
    );

    expect(calls.filter((call) => call.type === "roundRect")).toEqual([
      {
        type: "roundRect",
        args: [
          45 - highlightSpread,
          20 + fontSize * RICH_TEXT_HIGHLIGHT_TOP_OFFSET_EM - highlightSpread,
          110 + highlightSpread * 2,
          fontSize * RICH_TEXT_HIGHLIGHT_HEIGHT_EM + highlightSpread * 2,
          fontSize * RICH_TEXT_HIGHLIGHT_RADIUS_EM,
        ],
      },
    ]);
    expect(calls.filter((call) => call.type === "fill")).toEqual([
      { type: "fill", fillStyle: "#ffff00" },
    ]);
    expect(calls.filter((call) => call.type === "fillText")).toHaveLength(3);
  });
});
