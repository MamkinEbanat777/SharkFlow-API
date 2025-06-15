import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';

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
    console.error('Ошибка при рендеринге email:', error.message);
    throw error;
  }
}
