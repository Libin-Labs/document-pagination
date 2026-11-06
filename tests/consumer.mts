import { paginateBlocks, type PaginationResult } from '@lp-labs/document-pagination';
const result: PaginationResult = paginateBlocks(
  [{ id: 'one' }],
  { width: 500, height: 700 },
  () => 20,
);
console.log(result.pages.length, result.overflowBlockIds);
