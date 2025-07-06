import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

export async function registerHandlers(bot, folderPath) {
  const fullPath = path.resolve(folderPath);

  if (!fs.existsSync(fullPath)) {
    console.warn(`Папка не найдена: ${fullPath}`);
    return;
  }

  const files = fs.readdirSync(fullPath);

  for (const file of files) {
    if (file.endsWith('.js') && !file.endsWith('.test.js')) {
      const filePath = path.join(fullPath, file);

      const fileUrl = pathToFileURL(filePath).href;

      try {
        const module = await import(fileUrl);
        const Handler = module.default;

        if (typeof Handler === 'function') {
          Handler(bot);
        } else {
          console.warn(`Файл ${file} не экспортирует функцию по умолчанию`);
        }
      } catch (error) {
        console.error(`Ошибка при загрузке файла ${file}:`, error.message);
      }
    }
  }
}
