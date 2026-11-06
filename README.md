# @lp-labs/document-pagination

Deterministic greedy pagination for ordered blocks when an application supplies the measurement
function. The package does not render, measure fonts, open document formats, or print.

```js
import { paginateBlocks } from '@lp-labs/document-pagination';

const result = paginateBlocks(
  [{ id: 'intro' }, { id: 'body' }, { id: 'footer' }],
  { width: 600, height: 400 },
  (block, width) => (block.id === 'body' && width > 0 ? 240 : 80),
  { margin: 20, gap: 12 },
);
console.log(result.pages.length, result.overflowBlockIds); // 1, []
```

## API

- `paginateBlocks(blocks, pageSize, measureHeight, options?)` packs blocks in input order. The
  callback receives each block and the usable width, and must return its measured height.
- `MeasurableBlock`, `PageSize`, `PaginationOptions`, `Placement`, and `PaginationResult` define
  the input and result types.
- The result contains immutable `pages` of `{ blockId, y, height }` placements and
  `overflowBlockIds`. An over-height block is kept whole on its own page and marked as overflow;
  it is not clipped or split.

## Customize

```js
import { paginateBlocks } from '@lp-labs/document-pagination';

const pages = paginateBlocks(
  [
    { id: 'title', lines: 2 },
    { id: 'paragraph', lines: 8 },
  ],
  { width: 720, height: 500 },
  (block, width) => block.lines * (width > 650 ? 22 : 30),
  { margin: 32, gap: 16, maxPages: 50 },
);
console.log(pages.pages[0]); // [{ blockId: 'title', y: 32, height: 44 }, ...]
```

The caller owns measurement policy, fonts, wrapping, widows/orphans, keep-together grouping,
rendering, and subsequent output. Heights and page dimensions use the caller's consistent units.
The helper performs only ordered first-fit-to-current-page packing; it does not invent print or
PDF support.

## Errors and limits

Invalid dimensions, heights, margins, duplicate/invalid block ids, or capacities throw
`TypeError` or `RangeError`. Defaults allow 10,000 blocks and pages; each can be configured from
1 to 100,000. Measurements must be finite and nonnegative. Page dimensions must be finite and
positive; margin and gap must be finite and nonnegative, with margins leaving usable page area.
There is no partial result if a capacity limit is exceeded.

## Package

- ESM, CommonJS, and TypeScript declarations are provided through conditional exports.
- Runtime and peer dependencies: none.
- TypeScript and Prettier are development-only dependencies.

MIT licensed: [MIT](./LICENSE)

Author: [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/)

[Support this work](https://www.paypal.me/LibinPrasanth)

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
