import test from 'node:test';
import assert from 'node:assert/strict';
import { paginateBlocks } from '../dist/esm/index.js';

const measure = (block) => block.height;

test('packs blocks in order and includes gaps and margins', () => {
  const result = paginateBlocks(
    [
      { id: 'a', height: 30 },
      { id: 'b', height: 30 },
      { id: 'c', height: 25 },
    ],
    { width: 200, height: 100 },
    measure,
    { margin: 10, gap: 10 },
  );
  assert.deepEqual(result.pages, [
    [
      { blockId: 'a', y: 10, height: 30 },
      { blockId: 'b', y: 50, height: 30 },
    ],
    [{ blockId: 'c', y: 10, height: 25 }],
  ]);
});

test('supplies usable content width to the measurement callback', () => {
  let observed;
  paginateBlocks(
    [{ id: 'a' }],
    { width: 100, height: 50 },
    (_block, width) => {
      observed = width;
      return 10;
    },
    { margin: 5 },
  );
  assert.equal(observed, 90);
});

test('keeps an oversized block whole and reports overflow', () => {
  const result = paginateBlocks(
    [{ id: 'large', height: 100 }],
    { width: 100, height: 50 },
    measure,
  );
  assert.equal(result.pages.length, 1);
  assert.deepEqual(result.overflowBlockIds, ['large']);
  assert.deepEqual(result.pages[0][0], { blockId: 'large', y: 0, height: 100 });
});

test('creates no pages for an empty document', () => {
  assert.deepEqual(paginateBlocks([], { width: 100, height: 100 }, () => 1).pages, []);
});

test('starts a new page instead of splitting a block', () => {
  const result = paginateBlocks(
    [
      { id: 'a', height: 60 },
      { id: 'b', height: 60 },
    ],
    { width: 100, height: 100 },
    measure,
  );
  assert.equal(result.pages.length, 2);
  assert.equal(result.pages[1][0].blockId, 'b');
});

test('rejects duplicate or invalid block identifiers', () => {
  assert.throws(
    () => paginateBlocks([{ id: 'a' }, { id: 'a' }], { width: 10, height: 10 }, () => 1),
    TypeError,
  );
  assert.throws(() => paginateBlocks([{ id: '' }], { width: 10, height: 10 }, () => 1), TypeError);
});

test('rejects invalid dimensions, measurements, and gaps', () => {
  assert.throws(() => paginateBlocks([], { width: 0, height: 10 }, () => 1), RangeError);
  assert.throws(
    () => paginateBlocks([{ id: 'a' }], { width: 10, height: 10 }, () => NaN),
    RangeError,
  );
  assert.throws(
    () => paginateBlocks([], { width: 10, height: 10 }, () => 1, { gap: -1 }),
    RangeError,
  );
});

test('enforces block and page capacities', () => {
  assert.throws(
    () =>
      paginateBlocks([{ id: 'a' }, { id: 'b' }], { width: 10, height: 10 }, () => 1, {
        maxBlocks: 1,
      }),
    RangeError,
  );
  assert.throws(
    () =>
      paginateBlocks([{ id: 'a' }, { id: 'b' }], { width: 10, height: 10 }, () => 9, {
        maxPages: 1,
      }),
    RangeError,
  );
});

test('returns immutable results', () => {
  const result = paginateBlocks([{ id: 'a' }], { width: 10, height: 10 }, () => 1);
  assert.equal(Object.isFrozen(result.pages[0][0]), true);
  assert.throws(() => result.pages.push([]), TypeError);
});

test('validates function and option capacities', () => {
  assert.throws(() => paginateBlocks([], { width: 10, height: 10 }, null), TypeError);
  assert.throws(
    () => paginateBlocks([], { width: 10, height: 10 }, () => 1, { maxPages: 0 }),
    RangeError,
  );
});
