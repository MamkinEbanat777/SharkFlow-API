import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export async function loadConfig(bot, folderPath) {
  const fullPath = path.resolve(folderPath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`Папка не найдена: ${fullPath}`);
    return;
  }

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(fullPath, entry.name);

    if (entry.isDirectory()) {
      await loadConfig(bot, entryPath);
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.js') &&
      !entry.name.endsWith('.test.js')
    ) {
      try {
        const fileUrl = pathToFileURL(entryPath).href;
        const module = await import(fileUrl);
        const Handler = module.default;

        if (typeof Handler === 'function') {
          await Handler(bot);
        } else {
          console.warn(
            `Файл ${entry.name} не экспортирует функцию по умолчанию`,
          );
        }
      } catch (error) {
        console.error(
          `Ошибка при загрузке файла ${entry.name}:`,
          error.message,
        );
      }
    }
  }
}
