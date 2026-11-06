export interface MeasurableBlock {
  readonly id: string;
}

export interface PageSize {
  readonly width: number;
  readonly height: number;
}

export interface PaginationOptions {
  margin?: number;
  gap?: number;
  maxBlocks?: number;
  maxPages?: number;
}

export interface Placement {
  readonly blockId: string;
  readonly y: number;
  readonly height: number;
}

export interface PaginationResult {
  readonly pageSize: PageSize;
  readonly pages: readonly (readonly Placement[])[];
  readonly overflowBlockIds: readonly string[];
}

/** Paginates supplied block heights; this does not measure, render, or print documents. */
export function paginateBlocks<T extends MeasurableBlock>(
  blocks: readonly T[],
  pageSize: PageSize,
  measureHeight: (block: T, contentWidth: number) => number,
  options: PaginationOptions = {},
): PaginationResult {
  if (!Array.isArray(blocks) || typeof measureHeight !== 'function')
    throw new TypeError('Expected a block array and a measurement function.');
  const maxBlocks = options.maxBlocks ?? 10_000;
  const maxPages = options.maxPages ?? 10_000;
  const margin = options.margin ?? 0;
  const gap = options.gap ?? 0;
  if (!Number.isSafeInteger(maxBlocks) || maxBlocks < 1 || maxBlocks > 100_000)
    throw new RangeError('maxBlocks must be an integer from 1 to 100000.');
  if (!Number.isSafeInteger(maxPages) || maxPages < 1 || maxPages > 100_000)
    throw new RangeError('maxPages must be an integer from 1 to 100000.');
  if (
    !Number.isFinite(pageSize.width) ||
    pageSize.width <= 0 ||
    !Number.isFinite(pageSize.height) ||
    pageSize.height <= 0
  )
    throw new RangeError('Page dimensions must be finite and positive.');
  if (
    !Number.isFinite(margin) ||
    margin < 0 ||
    !Number.isFinite(gap) ||
    gap < 0 ||
    margin * 2 >= pageSize.height ||
    margin * 2 >= pageSize.width
  )
    throw new RangeError('Margins and gaps must be finite, nonnegative, and leave usable space.');
  if (blocks.length > maxBlocks) throw new RangeError('Block capacity exceeded.');

  const ids = new Set<string>();
  const pages: Placement[][] = [];
  const overflowBlockIds: string[] = [];
  const contentWidth = pageSize.width - 2 * margin;
  const contentBottom = pageSize.height - margin;
  let current: Placement[] = [];
  let cursor = margin;
  const pushPage = () => {
    if (pages.length >= maxPages) throw new RangeError('Page capacity exceeded.');
    pages.push(current);
  };

  for (const block of blocks) {
    if (!block || typeof block.id !== 'string' || block.id.length === 0 || block.id.length > 256)
      throw new TypeError('Each block needs a nonempty id of at most 256 characters.');
    if (ids.has(block.id)) throw new TypeError(`Duplicate block id: ${block.id}.`);
    ids.add(block.id);
    const height = measureHeight(block, contentWidth);
    if (!Number.isFinite(height) || height < 0)
      throw new RangeError(`Block "${block.id}" has an invalid measured height.`);
    const y = cursor + (current.length === 0 ? 0 : gap);
    if (current.length > 0 && y + height > contentBottom) {
      pushPage();
      current = [];
      cursor = margin;
    }
    const placementY = cursor + (current.length === 0 ? 0 : gap);
    current.push(Object.freeze({ blockId: block.id, y: placementY, height }));
    cursor = placementY + height;
    if (placementY + height > contentBottom) {
      overflowBlockIds.push(block.id);
      pushPage();
      current = [];
      cursor = margin;
    }
  }
  if (current.length > 0) pushPage();
  return Object.freeze({
    pageSize: Object.freeze({ width: pageSize.width, height: pageSize.height }),
    pages: Object.freeze(pages.map((page) => Object.freeze(page))),
    overflowBlockIds: Object.freeze(overflowBlockIds),
  });
}
