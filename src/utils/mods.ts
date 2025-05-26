import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { dirroot } from '..';

export function setupFolder() {
  const path = resolve(dirroot, 'mods');
  console.log(`>> Mods folder: ${path}`);
  if (!existsSync(path)) mkdirSync(path);
}

export function getModPath(filename: string) {
  return resolve(dirroot, 'mods', filename);
}
