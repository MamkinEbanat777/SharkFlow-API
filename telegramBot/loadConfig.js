/**
 * @module telegramBot/loadConfig
 * @description Загрузчик конфигурации для Telegram бота.
 */
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { logTelegramCommandError } from '../utils/loggers/telegramLoggers.js';

export async function loadConfig(bot, folderPath) {
  const fullPath = path.resolve(folderPath);

  if (!fs.existsSync(fullPath)) {
    logTelegramCommandError('loadConfig', 'system', new Error(`Папка не найдена: ${fullPath}`));
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
          logTelegramCommandError('loadConfig', 'system', new Error(`Файл ${entry.name} не экспортирует функцию по умолчанию`));
        }
      } catch (error) {
        logTelegramCommandError('loadConfig', 'system', new Error(`Ошибка при загрузке конфигурации из ${fullPath}: ${error.message}`));
      }
    }
  }
}
