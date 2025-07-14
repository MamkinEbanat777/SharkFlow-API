#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const configs = [
  'clean-theme.json',
  'better-docs.json', 
  'docdash.json',
  'tui.json',
  'baseline.json',
  'simple.json',
  'default.json'
];

console.log('🎨 Генерация документации для всех тем...\n');

configs.forEach((config, index) => {
  try {
    console.log(`📝 ${index + 1}/${configs.length}: Генерация ${config.replace('.json', '')}...`);
    execSync(`npx jsdoc -c jsdoc-configs/${config}`, { stdio: 'inherit' });
    console.log(`✅ ${config} - готово!\n`);
  } catch (error) {
    console.log(`❌ Ошибка в ${config}: ${error.message}\n`);
  }
});

console.log('🎉 Все темы сгенерированы!');
console.log('\n📁 Доступные темы:');
console.log('- docs/jsdoc-clean/     (clean-jsdoc-theme)');
console.log('- docs/jsdoc-better/    (better-docs)');
console.log('- docs/jsdoc-docdash/   (docdash)');
console.log('- docs/jsdoc-tui/       (tui-jsdoc-template)');
console.log('- docs/jsdoc-baseline/  (jsdoc-baseline)');
console.log('- docs/jsdoc-simple/    (jsdoc-simple-theme)');
console.log('- docs/jsdoc-default/   (стандартная JSDoc)'); 