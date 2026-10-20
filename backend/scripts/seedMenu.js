// Backwards-compatible command name. The old food menu seed has been retired.
if (!process.argv.includes('--replace')) process.argv.push('--replace');
require('./seedZrcartCatalog');
