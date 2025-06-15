import fs from 'fs/promises';
import path from 'path';
import { pathToFileURL } from 'url';

async function loadRoutes(dir = 'routes') {
  const items = await fs.readdir(dir, { withFileTypes: true });
  const loaded = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);

    if (item.isDirectory()) {
      loaded.push(...(await loadRoutes(fullPath)));
    } else if (item.isFile() && item.name.endsWith('.js')) {
      const fileUrl = pathToFileURL(fullPath).href;
      const mod = await import(fileUrl);
      const { default: routeDef } = mod;

      if (routeDef && routeDef.router && routeDef.path) {
        loaded.push(routeDef);
      } else {
        console.warn(`Файл ${fullPath} не экспортирует { path, router }`);
      }
    }
  }

  return loaded;
}

export default loadRoutes;
