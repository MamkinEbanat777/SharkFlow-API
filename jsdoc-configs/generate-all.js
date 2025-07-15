#!/usr/bin/env node

import { execSync } from 'child_process';

const configs = [
  'jsdoc-clean.json',
  'jsdoc-docdash.json',
  'jsdoc-docolatte.json',
  'jsdoc-default.json'
];

console.log('🎨 Генерация документации для всех тем JSDoc...\n');

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
console.log('- docs/jsdoc-clean/      (clean-jsdoc-theme)');
console.log('- docs/jsdoc-docdash/    (docdash)');
console.log('- docs/jsdoc-docolatte/  (docolatte)');
console.log('- docs/jsdoc-default/    (стандартная тема JSDoc)'); 