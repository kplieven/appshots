/**
 * List reordering helper.
 *
 * Screenshots are reordered by moving one card to another position, either
 * with the arrow buttons on the card or by dragging it onto a neighbour.
 */

/**
 * Moves an item to another position, shifting the items in between.
 *
 * Out-of-range indices leave the list untouched, so callers can pass a raw
 * "one step left" index without clamping it first.
 *
 * @param items - List to reorder
 * @param from - Index of the item being moved
 * @param to - Index the item should end up at
 * @returns A new list, or the original one when nothing moves
 *
 * @example
 * moveItem(["a", "b", "c"], 2, 0); // ["c", "a", "b"]
 */
export const moveItem = <T>(items: T[], from: number, to: number): T[] => {
  if (from === to) return items;
  if (from < 0 || from >= items.length) return items;
  if (to < 0 || to >= items.length) return items;

  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};
