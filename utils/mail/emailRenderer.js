import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import { logMailRenderError } from '../loggers/mailLoggers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(
  __dirname,
  '..',
  '..',
  'utils',
  'mail',
  'emailTemplates',
);

/**
 * Рендерит HTML email из шаблона Handlebars
 * @param {string} templateName - Название шаблона (без расширения)
 * @param {Object} context - Контекст для шаблона
 * @returns {Promise<string>} HTML содержимое email
 * @throws {Error} При ошибке рендеринга шаблона
 */
export async function renderEmail(templateName, context) {
  try {
    const baseTemplateStr = await fs.readFile(
      path.join(templatesDir, 'base.html'),
      'utf-8',
    );

    const bodyTemplateStr = await fs.readFile(
      path.join(templatesDir, `${templateName}.html`),
      'utf-8',
    );

    const bodyTemplate = Handlebars.compile(bodyTemplateStr);
    const bodyHtml = bodyTemplate(context);

    const baseTemplate = Handlebars.compile(baseTemplateStr);
    return baseTemplate({ ...context, body: bodyHtml });
  } catch (error) {
    logMailRenderError(error);
    throw new Error(`Failed to render email template: ${error.message}`);
  }
}
