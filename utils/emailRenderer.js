import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';

const templatesDir = path.resolve('utils/emailTemplates');

export async function renderEmail(templateName, context) {
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
}
