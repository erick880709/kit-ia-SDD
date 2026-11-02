import path from 'node:path';
import { require, resolveReal, within } from './rules.mjs';

export function validateResultsRoot(contract) {
  const root = contract?.resultsRoot;
  require(typeof root === 'string' && root.length > 0 && root.trim() === root, 'El contrato debe declarar resultsRoot');
  require(!path.posix.isAbsolute(root) && !path.win32.isAbsolute(root) && !/[\\:\x00-\x1f]/.test(root) && root.split('/').every(part => part !== '' && part !== '.' && part !== '..'), 'resultsRoot debe ser una carpeta relativa dentro del proyecto');
  return root;
}
export function resolveResultsFolder(contract, runId, projectRoot) {
  const resultsRoot = validateResultsRoot(contract);
  require(typeof runId === 'string' && runId.trim().length > 0 && !/[\\/:\x00-\x1f]/.test(runId) && runId !== '.' && runId !== '..', 'runId debe identificar una carpeta de corrida');
  const project = resolveReal(projectRoot), folder = resolveReal(path.join(project, resultsRoot, runId));
  require(within(folder, project), 'Carpeta contractual fuera del proyecto');
  return folder;
}
