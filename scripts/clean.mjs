import fs from 'fs-extra';
import { join } from 'path';

const rootDir = new URL('../', import.meta.url);
const packagesDir = new URL('packages/', rootDir);

async function* getSubdirectories(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield fullPath;
      yield* getSubdirectories(fullPath);
    }
  }
}

async function deleteFolders() {
  const options = { recursive: true, force: true };
  const subdirectories = [...getSubdirectories(packagesDir), 'node_modules'];


  for await (const dir of subdirectories) {
    if (dir.endsWith('dist') || dir.endsWith('.turbo')) {
      try {
        await fs.remove(dir, options);
        console.log(`Deleted: ${dir}`);
      } catch (error) {
        console.error(`Failed to delete: ${dir}`, error);
      }
    }
  }
}

deleteFolders();
