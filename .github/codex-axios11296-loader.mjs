import path from 'node:path';
import { fileURLToPath } from 'node:url';

const roots = [process.env.DIAG_BASE, process.env.DIAG_CANDIDATE];
if (roots.some((root) => !root || !path.isAbsolute(root))) {
  throw new Error('Diagnostic source roots must be absolute');
}
const allowedParents = new Set(roots.map((root) => path.join(root, 'lib/platform/node/classes/FormData.js')));

export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'form-data') {
    const parent = context.parentURL && fileURLToPath(context.parentURL);
    if (!allowedParents.has(parent)) throw new Error('Unexpected form-data import');
    return { url: new URL('./blocked-form-data.mjs', import.meta.url).href, shortCircuit: true };
  }
  // Fail on unexpected third-party imports instead of silently finding a
  // package installed on the runner. Project-relative and Node imports remain.
  if (!specifier.startsWith('.') && !specifier.startsWith('/') && !specifier.startsWith('file:') && !specifier.startsWith('node:')) {
    throw new Error(`Unexpected bare import: ${specifier}`);
  }
  return nextResolve(specifier, context);
}
