// Standalone transcription of six PR cases; this is not the Vitest suite.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { inspect } from 'node:util';
import path from 'node:path';

const [label, root] = process.argv.slice(2);
if (!['base', 'candidate'].includes(label) || !root || !path.isAbsolute(root)) {
  throw new Error('Expected base|candidate and an absolute source root');
}
if (typeof globalThis.FormData !== 'function') throw new Error('Native FormData unavailable');
const moduleUrl = pathToFileURL(path.join(root, 'lib/helpers/formDataToJSON.js'));
const { default: formDataToJSON } = await import(moduleUrl.href);

const cases = [
  { name: 'metadata[length]', entries: [['metadata[length]', 'long']], expected: { metadata: { length: 'long' } } },
  { name: 'metadata.length', entries: [['metadata.length', 'long']], expected: { metadata: { length: 'long' } } },
  { name: 'repeated length', entries: [['metadata[length]', '10'], ['metadata[length]', '20']], expected: { metadata: { length: ['10', '20'] } } },
  { name: 'nested below length', entries: [['metadata[length][unit]', 'cm']], expected: { metadata: { length: { unit: 'cm' } } } },
  { name: 'numeric siblings, length first', entries: [['items[length]', 'long'], ['items[0]', 'first'], ['items[1]', 'second']], expected: { items: { 0: 'first', 1: 'second', length: 'long' } } },
  { name: 'numeric siblings, length last', entries: [['items[1]', 'second'], ['items[0]', 'first'], ['items[length]', 'long']], expected: { items: { 0: 'first', 1: 'second', length: 'long' } } },
];

let passed = 0;
for (const item of cases) {
  const data = new FormData();
  for (const [key, value] of item.entries) data.append(key, value);
  let actual;
  try {
    actual = formDataToJSON(data);
    assert.deepStrictEqual(actual, item.expected);
    passed++;
    console.log(JSON.stringify({ case: item.name, outcome: 'pass' }));
  } catch (error) {
    if (error?.code === 'AXIOS_DIAGNOSTIC_STUB_USED') throw error;
    console.log(JSON.stringify({
      case: item.name,
      outcome: 'fail',
      errorName: error?.name,
      errorMessage: String(error?.message ?? error).slice(0, 800),
      stack: String(error?.stack ?? '').slice(0, 3000),
      actual: error?.code === 'ERR_ASSERTION'
        ? inspect(actual, { depth: 5, maxArrayLength: 20, maxStringLength: 200, getters: false }).slice(0, 1200)
        : undefined,
    }));
  }
}
console.log(JSON.stringify({ label, passed, failed: cases.length - passed, total: cases.length }));
// A successful diagnostic requires six observed baseline failures and six
// candidate passes. Inspect each failure trace separately after execution.
if (passed !== (label === 'base' ? 0 : cases.length)) process.exitCode = 1;
