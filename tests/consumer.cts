import pagination = require('@lp-labs/document-pagination');
const result = pagination.paginateBlocks([{ id: 'one' }], { width: 500, height: 700 }, () => 20);
const page: pagination.Placement | undefined = result.pages[0]?.[0];
console.log(page?.y);
