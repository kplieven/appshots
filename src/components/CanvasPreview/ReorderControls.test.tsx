/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReorderControls } from "./ReorderControls";

const renderControls = (index: number, screenshotCount: number) => {
  const onMove = vi.fn();
  render(
    <ReorderControls
      index={index}
      screenshotCount={screenshotCount}
      onMove={onMove}
      onDragStart={vi.fn()}
      onDragEnd={vi.fn()}
    />,
  );
  return {
    onMove,
    left: screen.getByRole("button", { name: "Move screenshot left" }),
    right: screen.getByRole("button", { name: "Move screenshot right" }),
  };
};

// Queries run against the document, so each render has to be torn down
afterEach(cleanup);

describe("ReorderControls", () => {
  it("moves the screenshot one position at a time", () => {
    const { onMove, left, right } = renderControls(1, 3);

    fireEvent.click(left);
    expect(onMove).toHaveBeenCalledWith(0);

    fireEvent.click(right);
    expect(onMove).toHaveBeenCalledWith(2);
  });

  it("disables the arrow that would move past an end", () => {
    const first = renderControls(0, 3);
    expect((first.left as HTMLButtonElement).disabled).toBe(true);
    expect((first.right as HTMLButtonElement).disabled).toBe(false);
  });

  it("disables the right arrow on the last screenshot", () => {
    const last = renderControls(2, 3);
    expect((last.right as HTMLButtonElement).disabled).toBe(true);
    expect((last.left as HTMLButtonElement).disabled).toBe(false);
  });
});
